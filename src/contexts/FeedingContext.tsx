import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { feedingService, PaginatedFeedingResponse } from '@/services/feedingService';
import Swal from 'sweetalert2';
import { Feeding, FeedingFilterParams } from '@/services/interfaces/feedingDTO';
import { isLoadingAlert } from '@/components/dialog/AlertsLogin';
import { authService } from '@/services/authService';

// Definir la interfaz para respuestas paginadas específica para Feeding

interface FeedingContextProps {
  feedings: Feeding[];
  isLoading: boolean;
  error: string | null;
  refreshFeedings: () => Promise<void>;
  deleteFeeding: (id: number) => Promise<boolean>;
  filters: FeedingFilterParams;
  setFilters: (filters: FeedingFilterParams) => void;
  lastUpdated: Date | null;
  // Nuevas propiedades para paginación
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  preloadNextPages: () => void;
}

const FeedingContext = createContext<FeedingContextProps | undefined>(undefined);

export const useFeedings = () => {
  const context = useContext(FeedingContext);
  if (!context) {
    throw new Error('useFeedings debe ser usado dentro de un FeedingProvider');
  }
  return context;
};

export const FeedingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estados para datos y carga
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FeedingFilterParams>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Estados para paginación
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  
  // Estado para caché de páginas
  const [cachedPages, setCachedPages] = useState<Map<string, Feeding[]>>(new Map());
  
  // Referencias para controlar solicitudes
  const initialLoadRef = useRef(false);
  const activeRequestsRef = useRef(new Map<string, Promise<any>>());
  
  // Generar una clave única para el request basada en parámetros
  const getRequestKey = (page: number, limit: number, filterStr: string) => {
    return `${page}-${limit}-${filterStr}`;
  };

  // Generar clave de caché que incluye filtros
  const getCacheKey = (page: number, currentFilters: FeedingFilterParams = {}) => {
    const filterStr = JSON.stringify(currentFilters);
    return `${page}-${filterStr}`;
  };

  // Función para cargar alimentaciones paginadas
  const fetchFeedings = async (
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
      console.log(`[FeedingContext] Usando caché para página ${page} con filtros: ${filterStr}`);
      if (page === currentPage) {
        setFeedings(cachedPages.get(cacheKey) || []);
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
        const data = (await feedingService.getPaginatedFeeding(page, limit, currentFilters)) as PaginatedFeedingResponse;

        // Actualizar los estados si no es silencioso o es la página actual
        if (!silent || page === currentPage) {
          setFeedings(data.items);
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
              const nextPageCacheKey = getCacheKey(nextPage.pageNumber, currentFilters);
              newCachedPages.set(nextPageCacheKey, nextPage.items);
            }
          });
        }

        setCachedPages(newCachedPages);
        return data;
      } catch (err) {
        console.error('[FeedingContext] Error fetching feedings:', err);
        if (!silent) {
          setError('No se pudieron cargar las alimentaciones. Intente nuevamente.');
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
        console.log(`[FeedingContext] Precargando página ${nextPage} con filtros actuales`);
        fetchFeedings(nextPage, itemsPerPage, false, filters, true);
      }
    }
  };

  // Cargar inicialmente las alimentaciones
  useEffect(() => {
    if (!initialLoadRef.current && authService.isLocallyAuthenticated()) {
      initialLoadRef.current = true;
      fetchFeedings(1, itemsPerPage, true);
    }
  }, [itemsPerPage]);

  // Efecto para recargar cuando cambian los filtros
  useEffect(() => {
    if (initialLoadRef.current && authService.isLocallyAuthenticated()) {
      fetchFeedings(1, itemsPerPage, true, filters);
      setCurrentPage(1);
    }
  }, [filters, itemsPerPage]);

  // Método para cambiar la página
  const setPage = (page: number) => {
    if (page !== currentPage && page > 0 && page <= totalPages) {
      const cacheKey = getCacheKey(page, filters);

      if (cachedPages.has(cacheKey)) {
        setFeedings(cachedPages.get(cacheKey) || []);
        setCurrentPage(page);

        // Precargar siguiente página si hay
        setTimeout(() => {
          preloadNextPages();
        }, 100);
      } else {
        fetchFeedings(page, itemsPerPage, false, filters);
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
      fetchFeedings(1, items, true, filters);
    }
  };

  // Método para actualizar filtros
  const updateFilters = (newFilters: FeedingFilterParams) => {
    console.log('[FeedingContext] Actualizando filtros:', newFilters);
    setFilters(newFilters);
    // Al cambiar filtros, volvemos a la primera página
    setCurrentPage(1);
  };

  // Función para refrescar alimentaciones (compatible con la versión anterior)
  const refreshFeedings = async () => {
    console.log('[FeedingContext] Refrescando alimentaciones con filtros:', filters);
    setCachedPages(new Map());
    await fetchFeedings(currentPage, itemsPerPage, true);
  };

  // Eliminar alimentación
  const handleDeleteFeeding = async (id: number): Promise<boolean> => {
    try {
      await feedingService.deleteFeeding(id);
      await refreshFeedings();
      return true;
    } catch (err) {
      console.error('Error al eliminar alimentación:', err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar la alimentación. Intente nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return false;
    }
  };

  // Escuchar eventos de autenticación
  useEffect(() => {
    // Función para manejar logout
    const handleLogout = () => {
      setFeedings([]);
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
        fetchFeedings(1, itemsPerPage, true);
      }
    };

    // Registrar eventos globales
    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:login_success', handleLogin);

    // Limpiar evento al desmontar
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:login_success', handleLogin);
    };
  }, [itemsPerPage]);

  return (
    <FeedingContext.Provider
      value={{
        feedings,
        isLoading,
        error,
        refreshFeedings,
        deleteFeeding: handleDeleteFeeding,
        filters,
        setFilters: updateFilters,
        lastUpdated,
        // Nuevas propiedades para paginación
        totalItems,
        currentPage,
        itemsPerPage,
        totalPages,
        setPage,
        setItemsPerPage: changeItemsPerPage,
        preloadNextPages
      }}
    >
      {children}
    </FeedingContext.Provider>
  );
};