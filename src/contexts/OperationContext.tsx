import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { operationService } from '@/services/operationService';
import { isLoadingAlert } from '@/components/dialog/AlertsLogin';
import { authService } from '@/services/authService';
import { OperationCreateData, OperationFilterDto } from '@/services/interfaces/operationDTO';
import { Operation } from '@/core/model/operation';
import { date, number } from 'zod';

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
  // Cambiar la estructura de la caché para incluir filtros
  const [cachedPages, setCachedPages] = useState<Map<string, Operation[]>>(new Map());
  
  // Referencia para controlar solicitudes iniciales y repetidas
  const initialLoadRef = useRef(false);
  const activeRequestsRef = useRef(new Map<string, Promise<any>>());
  
  // Generar una clave única para el request basada en parámetros
  const getRequestKey = (page: number, limit: number, filterStr: string) => {
    return `${page}-${limit}-${filterStr}`;
  };

  // Nueva función para generar clave de caché que incluye filtros
  const getCacheKey = (page: number, currentFilters: OperationFilterDto = {}) => {
    const filterStr = JSON.stringify(currentFilters);
    return `${page}-${filterStr}`;
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
    
    // Determinar la clave de caché que ahora incluye los filtros
    const cacheKey = getCacheKey(page, currentFilters);
    
    // Si la página está en caché y no es forzado, usar la caché
    const isCacheUsable = !force && cachedPages.has(cacheKey);
    
    if (isCacheUsable) {
      console.log(`[OperationContext] Usando caché para página ${page} con filtros: ${filterStr}`);
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
      console.log(`[OperationContext] Precargando silenciosamente página ${page} con filtros: ${filterStr}`);
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
          { totalItems: data.pagination.totalItems, itemCount: data.items.length, filters: filterStr }
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
        
        // Siempre guardar en caché, incluso con filtros
        const newCachedPages = new Map(cachedPages);
        // Usar la clave que incluye los filtros
        newCachedPages.set(cacheKey, data.items);
        
        // Guardar también las nextPages si existen en la respuesta
        if (data.nextPages && Array.isArray(data.nextPages)) {
          data.nextPages.forEach(nextPage => {
            if (nextPage.pageNumber && nextPage.items) {
              // La clave de caché para nextPages también incluye los filtros actuales
              const nextPageCacheKey = getCacheKey(nextPage.pageNumber, currentFilters);
              console.log(`[OperationContext] Guardando nextPage ${nextPage.pageNumber} en caché con filtros: ${filterStr}`);
              newCachedPages.set(nextPageCacheKey, nextPage.items);
            }
          });
        }
        
        setCachedPages(newCachedPages);
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
      
      // Clave de caché que incluye filtros actuales
      const nextPageCacheKey = getCacheKey(nextPage, filters);
      
      // Solo precargar si la página no está ya en caché
      if (!cachedPages.has(nextPageCacheKey)) {
        console.log(`[OperationContext] Precargando página ${nextPage} con filtros actuales`);
        fetchOperations(nextPage, itemsPerPage, false, filters, true);
      } else {
        console.log(`[OperationContext] La página ${nextPage} con filtros actuales ya está en caché`);
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
      // No limpiamos toda la caché, solo cargamos con nuevos filtros
      fetchOperations(1, itemsPerPage, true, filters);
    }
  }, [filters, itemsPerPage]);
  
  // Método para cambiar la página
  const setPage = (page: number) => {
    if (page !== currentPage && page > 0 && page <= totalPages) {
      // Clave de caché que incluye filtros actuales
      const cacheKey = getCacheKey(page, filters);
      
      // Verificar si la página está en caché
      const isCacheUsable = cachedPages.has(cacheKey);
      
      if (isCacheUsable) {
        console.log(`[OperationContext] Usando caché para página ${page} con filtros actuales`);
        setOperations(cachedPages.get(cacheKey) || []);
        setCurrentPage(page);
        
        // Precargar siguiente página si no está en caché, con un pequeño retraso
        setTimeout(() => {
          preloadNextPages();
        }, 100);
      } else {
        // Si no está en caché, cargar del servidor
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
      // Resetear caché al cambiar la cantidad de elementos por página
      setCachedPages(new Map());
      setCurrentPage(1);
      fetchOperations(1, items, true, filters);
    }
  };
  
  // Método para actualizar filtros
  const updateFilters = (newFilters: OperationFilterDto) => {
    console.log("[OperationContext] Actualizando filtros:", newFilters);
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

    console.log("PASA POR AQUI*****************")



    try {


      const groupsFmt = data.groups.map((group: any) => {
        return {
          dateStart: group.dateStart,
          timeStart: group.timeStart,
          dateEnd: group.dateEnd,
          timeEnd: group.timeEnd,
          workerIds: group.workers || group.workerIds,
        };
      });



      const dataFmt = {
        status: data.status,
        zone: parseInt(data.zone),
        dateStart: data.dateStart,
        timeStrat: data.timeStart,
        id_task: data.id_task,
        id_area: data.id_area,
        id_client: data.id_client,
        workerIds: data.workerIds,
        groups: groupsFmt,
        inChargedIds: data.inChargedIds,
        motorShip: undefined as string | undefined,
        dateEnd: undefined as string | undefined,
        timeEnd: undefined as string | undefined
      }


      if (data.motorShip) {
        dataFmt.motorShip = data.motorShip;
      }

      if (data.dateEnd) {
        dataFmt.dateEnd = data.dateEnd;
      }
      if (data.timeEnd) {
        dataFmt.timeEnd = data.timeEnd;
      }



      const newOperation = await operationService.createOperation(dataFmt as OperationCreateData);
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