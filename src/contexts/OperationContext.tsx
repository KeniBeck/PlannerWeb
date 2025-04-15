import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { operationService } from '@/services/operationService';
import { isLoadingAlert } from '@/components/dialog/AlertsLogin';
import { authService } from '@/services/authService';
import { OperationFilterDto } from '@/services/interfaces/operationDTO';
import { Operation } from '@/core/model/operation';

// Definir la interfaz para respuestas paginadas con nextPages
interface PaginatedResponse {
  items: Operation[];
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
  nextPages?: Array<{pageNumber: number, items: Operation[]}>;
}

// Definir la interfaz del contexto
interface OperationContextType {
  operations: Operation[];
  totalItems: number;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  filters: OperationFilterDto;
  setFilters: (filters: OperationFilterDto) => void;
  refreshOperations: () => Promise<void>;
  createOperation: (data: any) => Promise<Operation | null>;
  updateOperation: (id: number, data: any) => Promise<Operation | null>;
  lastUpdated: Date | null;
  preloadNextPages: () => void;
}

// Crear el contexto
const OperationContext = createContext<OperationContextType | undefined>(undefined);

// Props para el proveedor
interface OperationProviderProps {
  children: ReactNode;
}

// Proveedor del contexto
export function OperationProvider({ children }: OperationProviderProps) {
  // Estados principales
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de paginación
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Estado de filtros
  const [filters, setFilters] = useState<OperationFilterDto>({});
  
  // Estado para caché y actualización
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cachedPages, setCachedPages] = useState<Map<number, Operation[]>>(new Map());
  
  // Referencia para controlar solicitudes iniciales y repetidas
  const initialLoadRef = useRef(false);
  const activeRequestsRef = useRef(new Map<string, Promise<any>>());
  
  // Generar una clave única para el request basada en parámetros
  const getRequestKey = (page: number, limit: number, filterStr: string) => {
    return `${page}-${limit}-${filterStr}`;
  };
  
  // Función para cargar operaciones
  const fetchOperations = async (
    page = currentPage,
    limit = itemsPerPage,
    force = false,
    currentFilters = filters,
    silent = false
  ) => {
    // No intentar cargar sin autenticación
    if (!authService.isLocallyAuthenticated()) {
      return;
    }

    // Convertir filtros a string para caché y comparación
    const filterStr = JSON.stringify(currentFilters);
    
    // Determinar si podemos usar la caché
    const filterKeys = Object.keys(currentFilters);
    const hasActiveFilters = filterKeys.length > 0 && 
      filterKeys.some(key => {
        const value = currentFilters[key as keyof OperationFilterDto];
        return value !== undefined && value !== null && value !== '';
      });
    
    // Si la página está en caché, no hay filtros activos y no es forzado, usar la caché
    const cacheKey = page;
    const isCacheUsable = !force && cachedPages.has(cacheKey) && !hasActiveFilters;
    
    if (isCacheUsable) {
      console.log(`[OperationContext] Usando caché para página ${page}`);
      if (page === currentPage) {
        setOperations(cachedPages.get(cacheKey) || []);
      }
      return;
    }
    
    // Verificar si ya hay una solicitud activa para los mismos parámetros
    const requestKey = getRequestKey(page, limit, filterStr);
    if (activeRequestsRef.current.has(requestKey)) {
      console.log(`[OperationContext] Reutilizando solicitud en curso para página ${page}`);
      return activeRequestsRef.current.get(requestKey);
    }
    
    // Iniciar carga solo si no es silenciosa
    if (!silent) {
      setIsLoading(true);
      setError(null);
      isLoadingAlert(true);
    } else {
      console.log(`[OperationContext] Precargando silenciosamente página ${page}`);
    }
    
    // Crear una nueva solicitud y guardarla en el registro de solicitudes activas
    const request = (async () => {
      try {
        // Obtener los datos paginados con filtros
        const data = await operationService.getPaginatedOperations(
          page,
          limit,
          currentFilters
        ) as PaginatedResponse;

        console.log(`[OperationContext] Datos obtenidos para página ${page}:`, 
          { totalItems: data.pagination.totalItems, itemCount: data.items.length }
        );
        
        // Actualizar los estados solo si no es una carga silenciosa o es la página actual
        if (!silent || page === currentPage) {
          setOperations(data.items);
          setTotalItems(data.pagination.totalItems);
          setCurrentPage(data.pagination.currentPage);
          setItemsPerPage(data.pagination.itemsPerPage);
          setTotalPages(data.pagination.totalPages);
          setLastUpdated(new Date());
        }
        
        // Siempre guardar en caché si no hay filtros activos
        if (!hasActiveFilters) {
          const newCachedPages = new Map(cachedPages);
          newCachedPages.set(page, data.items);
          
          // Guardar también las nextPages si existen en la respuesta
          if (data.nextPages && Array.isArray(data.nextPages)) {
            data.nextPages.forEach(nextPage => {
              if (nextPage.pageNumber && nextPage.items) {
                console.log(`[OperationContext] Guardando nextPage ${nextPage.pageNumber} en caché`);
                newCachedPages.set(nextPage.pageNumber, nextPage.items);
              }
            });
          }
          
          setCachedPages(newCachedPages);
        }
        
        return data;
      } catch (err) {
        console.error("[OperationContext] Error fetching operations:", err);
        if (!silent) {
          setError("No se pudieron cargar las operaciones. Intente nuevamente.");
        }
        throw err;
      } finally {
        if (!silent) {
          setIsLoading(false);
          isLoadingAlert(false);
        }
        // Eliminar la solicitud del registro una vez completada
        activeRequestsRef.current.delete(requestKey);
      }
    })();
    
    // Registrar la solicitud
    activeRequestsRef.current.set(requestKey, request);
    return request;
  };
  
  // Método para precargar páginas siguientes
  const preloadNextPages = useCallback(() => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      
      // Solo precargar si la página no está ya en caché
      if (!cachedPages.has(nextPage)) {
        console.log(`[OperationContext] Precargando página ${nextPage}`);
        fetchOperations(nextPage, itemsPerPage, false, filters, true);
      } else {
        console.log(`[OperationContext] La página ${nextPage} ya está en caché`);
      }
    }
  }, [currentPage, totalPages, cachedPages, itemsPerPage, filters]);
  
  // Cargar inicialmente las operaciones UNA SOLA VEZ
  useEffect(() => {
    if (!initialLoadRef.current && authService.isLocallyAuthenticated()) {
      console.log("[OperationContext] Realizando carga inicial");
      initialLoadRef.current = true;
      fetchOperations(1, itemsPerPage, true);
    }
  }, [itemsPerPage]);
  
  // Efecto para recargar cuando cambian los filtros
  useEffect(() => {
    if (initialLoadRef.current && authService.isLocallyAuthenticated()) {
      console.log("[OperationContext] Recargando debido a cambios en filtros");
      setCachedPages(new Map()); // Limpiar caché al cambiar filtros
      fetchOperations(1, itemsPerPage, true, filters);
    }
  }, [filters, itemsPerPage]);
  
  // Método para cambiar la página
  const setPage = (page: number) => {
    if (page !== currentPage && page > 0 && page <= totalPages) {
      // Verificar si hay filtros activos
      const hasActiveFilters = Object.values(filters).some(
        value => value !== undefined && value !== null && value !== ''
      );
      
      // Verificar si la página está en caché y podemos usarla
      const cacheKey = page;
      const isCacheUsable = cachedPages.has(cacheKey) && !hasActiveFilters;
      
      if (isCacheUsable) {
        console.log(`[OperationContext] Usando caché para página ${page}`);
        setOperations(cachedPages.get(cacheKey) || []);
        setCurrentPage(page);
        
        // Precargar siguiente página si no está en caché, con un pequeño retraso
        setTimeout(() => {
          preloadNextPages();
        }, 100);
      } else {
        // Si no está en caché o hay filtros, cargar del servidor
        console.log(`[OperationContext] Cambiando a página ${page} (carga desde servidor)`);
        fetchOperations(page, itemsPerPage, false, filters);
      }
    }
  };
  
  // Método para cambiar items por página
  const changeItemsPerPage = (items: number) => {
    if (items !== itemsPerPage) {
      console.log(`[OperationContext] Cambiando a ${items} elementos por página`);
      setItemsPerPage(items);
      // Resetear caché y volver a primera página
      setCachedPages(new Map());
      setCurrentPage(1);
      fetchOperations(1, items, true, filters);
    }
  };
  
  // Método para actualizar filtros
  const updateFilters = (newFilters: OperationFilterDto) => {
    console.log("[OperationContext] Actualizando filtros");
    setFilters(newFilters);
    // Al cambiar filtros, volvemos a la primera página
    setCurrentPage(1);
  };
  
  // Método para refrescar operaciones
  const refreshOperations = async () => {
    // Limpiar caché al refrescar
    console.log("[OperationContext] Refrescando operaciones");
    setCachedPages(new Map());
    await fetchOperations(currentPage, itemsPerPage, true, filters);
  };
  
  // Método para crear una operación
  const createOperation = async (data: any): Promise<Operation | null> => {
    setIsLoading(true);
    isLoadingAlert(true);
    try {
      const newOperation = await operationService.createOperation(data);
      // Refrescar la lista después de crear
      await refreshOperations();
      return newOperation;
    } catch (err) {
      console.error("[OperationContext] Error creating operation:", err);
      return null;
    } finally {
      setIsLoading(false);
      isLoadingAlert(false);
    }
  };
  
  // Método para actualizar una operación
  const updateOperation = async (id: number, data: any): Promise<Operation | null> => {
    setIsLoading(true);
    isLoadingAlert(true);
    try {
      const updatedOperation = await operationService.updateOperation(id, data);
      // Refrescar la lista después de actualizar
      await refreshOperations();
      return updatedOperation;
    } catch (err) {
      console.error("[OperationContext] Error updating operation:", err);
      return null;
    } finally {
      setIsLoading(false);
      isLoadingAlert(false);
    }
  };
  
  // Escuchar eventos de autenticación
  useEffect(() => {
    // Función para manejar logout
    const handleLogout = () => {
      setOperations([]);
      setTotalItems(0);
      setCurrentPage(1);
      setTotalPages(0);
      setLastUpdated(null);
      setCachedPages(new Map());
      setFilters({});
      initialLoadRef.current = false;
    };
    
    // Función para manejar login
    const handleLogin = () => {
      if (!initialLoadRef.current) {
        initialLoadRef.current = true;
        fetchOperations(1, itemsPerPage, true);
      }
    };
    
    // Registrar eventos globales
    window.addEventListener("auth:logout", handleLogout);
    window.addEventListener("auth:login_success", handleLogin);
    
    // Limpiar evento al desmontar
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("auth:login_success", handleLogin);
    };
  }, [itemsPerPage]);
  
  // Valor del contexto
  const value: OperationContextType = {
    operations,
    totalItems,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalPages,
    setPage,
    setItemsPerPage: changeItemsPerPage,
    filters,
    setFilters: updateFilters,
    refreshOperations,
    createOperation,
    updateOperation,
    lastUpdated,
    preloadNextPages
  };
  
  return (
    <OperationContext.Provider value={value}>
      {children}
    </OperationContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useOperations() {
  const context = useContext(OperationContext);
  if (context === undefined) {
    throw new Error("useOperations must be used within an OperationProvider");
  }
  return context;
}