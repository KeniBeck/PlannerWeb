import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { faultService } from "@/services/faultService";
import { isLoadingAlert } from "@/components/dialog/AlertsLogin";
import { authService } from "@/services/authService";
import { FaultFilterDTO } from "@/services/interfaces/faultDTo";
import { Fault } from "@/core/model/fault";

// Definir la interfaz para respuestas paginadas
interface PaginatedResponse {
  items: Fault[];
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
  nextPages?: Array<{ pageNumber: number; items: Fault[] }>;
}

// Definir la interfaz del contexto
interface FaultContextType {
  faults: Fault[];
  totalItems: number;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  filters: FaultFilterDTO;
  setFilters: (filters: FaultFilterDTO) => void;
  refreshFaults: () => Promise<void>;
  createFault: (data: any) => Promise<Fault | null>;
  updateFault: (id: number, data: any) => Promise<Fault | null>;
  lastUpdated: Date | null;
  preloadNextPages: () => void;
}

// Crear el contexto
const FaultContext = createContext<FaultContextType | undefined>(undefined);

// Props para el proveedor
interface FaultProviderProps {
  children: ReactNode;
}

export function FaultProvider({ children }: FaultProviderProps) {
  // Estados principales
  const [faults, setFaults] = useState<Fault[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de paginación
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Estado de filtros
  const [filters, setFilters] = useState<FaultFilterDTO>({});

  // Estado para caché y actualización
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cachedPages, setCachedPages] = useState<Map<string, Fault[]>>(
    new Map()
  );

  // Referencia para controlar solicitudes iniciales
  const initialLoadRef = useRef(false);
  const activeRequestsRef = useRef(new Map<string, Promise<any>>());

  // Generar una clave única para el request basada en parámetros
  const getRequestKey = (page: number, limit: number, filterStr: string) => {
    return `${page}-${limit}-${filterStr}`;
  };

  // Generar clave de caché que incluye filtros
  const getCacheKey = (page: number, currentFilters: FaultFilterDTO = {}) => {
    const filterStr = JSON.stringify(currentFilters);
    return `${page}-${filterStr}`;
  };

  // Función para cargar faltas
  const fetchFaults = async (
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

    // Determinar la clave de caché que incluye los filtros
    const cacheKey = getCacheKey(page, currentFilters);

    // Si la página está en caché y no es forzado, usar la caché
    const isCacheUsable = !force && cachedPages.has(cacheKey);

    if (isCacheUsable) {
      console.log(
        `[FaultContext] Usando caché para página ${page} con filtros: ${filterStr}`
      );
      if (page === currentPage) {
        setFaults(cachedPages.get(cacheKey) || []);
      }
      return;
    }

    // Verificar si ya hay una solicitud activa para los mismos parámetros
    const requestKey = getRequestKey(page, limit, filterStr);
    if (activeRequestsRef.current.has(requestKey)) {
      return activeRequestsRef.current.get(requestKey);
    }

    // Iniciar carga solo si no es silenciosa
    if (!silent) {
      setIsLoading(true);
      setError(null);
      isLoadingAlert(true);
    }

    // Crear una nueva solicitud y guardarla en el registro de solicitudes activas
    const request = (async () => {
      try {
        // Obtener los datos paginados con filtros
        const data = (await faultService.getPaginatedFaults(
          page,
          limit,
          currentFilters
        )) as PaginatedResponse;

        // Actualizar los estados si no es silencioso o es la página actual
        if (!silent || page === currentPage) {
          setFaults(data.items);
          setTotalItems(data.pagination.totalItems);
          setCurrentPage(data.pagination.currentPage);
          setItemsPerPage(data.pagination.itemsPerPage);
          setTotalPages(data.pagination.totalPages);
          setLastUpdated(new Date());
        }

        // Siempre guardar en caché
        const newCachedPages = new Map(cachedPages);
        newCachedPages.set(cacheKey, data.items);

        // Guardar también las nextPages si existen
        if (data.nextPages && Array.isArray(data.nextPages)) {
          data.nextPages.forEach((nextPage) => {
            if (nextPage.pageNumber && nextPage.items) {
              const nextPageCacheKey = getCacheKey(
                nextPage.pageNumber,
                currentFilters
              );
              newCachedPages.set(nextPageCacheKey, nextPage.items);
            }
          });
        }

        setCachedPages(newCachedPages);
        return data;
      } catch (err) {
        console.error("[FaultContext] Error fetching faults:", err);
        if (!silent) {
          setError("No se pudieron cargar las faltas. Intente nuevamente.");
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
  const preloadNextPages = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      const nextPageCacheKey = getCacheKey(nextPage, filters);

      if (!cachedPages.has(nextPageCacheKey)) {
        console.log(
          `[FaultContext] Precargando página ${nextPage} con filtros actuales`
        );
        fetchFaults(nextPage, itemsPerPage, false, filters, true);
      }
    }
  };

  // Cargar inicialmente las faltas
  useEffect(() => {
    if (!initialLoadRef.current && authService.isLocallyAuthenticated()) {
      initialLoadRef.current = true;
      fetchFaults(1, itemsPerPage, true);
    }
  }, [itemsPerPage]);

  // Efecto para recargar cuando cambian los filtros
  useEffect(() => {
    if (initialLoadRef.current && authService.isLocallyAuthenticated()) {
      fetchFaults(1, itemsPerPage, true, filters);
      setCurrentPage(1);
    }
  }, [filters, itemsPerPage]);

  // Método para cambiar la página
  const setPage = (page: number) => {
    if (page !== currentPage && page > 0 && page <= totalPages) {
      const cacheKey = getCacheKey(page, filters);

      if (cachedPages.has(cacheKey)) {
        setFaults(cachedPages.get(cacheKey) || []);
        setCurrentPage(page);

        // Precargar siguiente página si hay
        setTimeout(() => {
          preloadNextPages();
        }, 100);
      } else {
        fetchFaults(page, itemsPerPage, false, filters);
      }
    }
  };

  // Método para cambiar items por página
  const changeItemsPerPage = (items: number) => {
    if (items !== itemsPerPage) {
      setItemsPerPage(items);
      // Resetear caché al cambiar la cantidad de elementos por página
      setCachedPages(new Map());
      setCurrentPage(1);
      fetchFaults(1, items, true, filters);
    }
  };

  // Método para actualizar filtros
  const updateFilters = (newFilters: FaultFilterDTO) => {
    console.log("[FaultContext] Actualizando filtros:", newFilters);
    setFilters(newFilters);
    // Al cambiar filtros, volvemos a la primera página
    setCurrentPage(1);
  };

  // Método para refrescar faltas
  const refreshFaults = async (customFilters = filters) => {
    // Limpiar caché al refrescar
    console.log(
      "[FaultContext] Refrescando faltas con filtros:",
      customFilters
    );
    setCachedPages(new Map());
    await fetchFaults(currentPage, itemsPerPage, true, customFilters);
  };
  // Método para crear una falta
  const createFault = async (data: any): Promise<Fault | null> => {
    setIsLoading(true);
    isLoadingAlert(true);

    try {
      const newFault = await faultService.createFault(data);
      // Refrescar la lista después de crear
      await refreshFaults();
      return newFault;
    } catch (err) {
      console.error("[FaultContext] Error creating fault:", err);
      return null;
    } finally {
      setIsLoading(false);
      isLoadingAlert(false);
    }
  };

  // Método para actualizar una falta
  const updateFault = async (id: number, data: any): Promise<Fault | null> => {
    setIsLoading(true);
    isLoadingAlert(true);
    try {
      const updatedFault = await faultService.updateFault(id, data);
      // Refrescar la lista después de actualizar
      await refreshFaults();
      return updatedFault;
    } catch (err) {
      console.error("[FaultContext] Error updating fault:", err);
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
      setFaults([]);
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
        fetchFaults(1, itemsPerPage, true);
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
  const value: FaultContextType = {
    faults,
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
    refreshFaults,
    createFault,
    updateFault,
    lastUpdated,
    preloadNextPages,
  };

  return (
    <FaultContext.Provider value={value}>{children}</FaultContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useFaults() {
  const context = useContext(FaultContext);
  if (context === undefined) {
    throw new Error("useFaults must be used within a FaultProvider");
  }
  return context;
}
