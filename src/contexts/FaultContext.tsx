import { isLoadingAlert } from "@/components/dialog/AlertsLogin";
import { Fault, FaultContextType, PaginatedResponse } from "@/core/model/fault";
import { authService } from "@/services/authService";
import { faultService } from "@/services/faultService";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// Crear el contexto
const FaultContext = createContext<FaultContextType | undefined>(undefined);

// Provider component
export function FaultProvider({ children }: { children: ReactNode }) {
  // Estado para datos y controles de paginación
  const [faults, setFaults] = useState<Fault[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Almacén de páginas en caché
  const [cachedPages, setCachedPages] = useState<Map<number, Fault[]>>(
    new Map()
  );

  // Función para cargar las faltas paginadas
  const fetchFaults = async (
    page = currentPage,
    limit = itemsPerPage,
    force = false
  ) => {
    // No intentar cargar si no hay autenticación
    if (!authService.isLocallyAuthenticated()) {
      return;
    }

    // Si la página ya está en caché y no es una recarga forzada, usarla
    if (!force && cachedPages.has(page)) {
      setFaults(cachedPages.get(page) || []);
      setCurrentPage(page);
      return;
    }

    setIsLoading(true);
    setError(null);
    isLoadingAlert(true);

    try {
      const data = await faultService.getPaginatedFaults(page, limit);

      // Actualizamos los datos actuales
      setFaults(data.items);
      setTotalItems(data.pagination.totalItems);
      setCurrentPage(data.pagination.currentPage);
      setItemsPerPage(data.pagination.itemsPerPage);
      setTotalPages(data.pagination.totalPages);
      setLastUpdated(new Date());

      // Guardamos en caché la página actual
      const newCachedPages = new Map(cachedPages);
      newCachedPages.set(page, data.items);

      // Guardamos también las páginas siguientes que vinieron en la respuesta
      const dataWithNextPages = data as PaginatedResponse & {
        nextPages?: Array<{ pageNumber: number; items: Fault[] }>;
      };
      if (
        dataWithNextPages.nextPages &&
        Array.isArray(dataWithNextPages.nextPages)
      ) {
        dataWithNextPages.nextPages.forEach((nextPage) => {
          if (nextPage.pageNumber && nextPage.items) {
            newCachedPages.set(nextPage.pageNumber, nextPage.items);
          }
        });
      }

      setCachedPages(newCachedPages);
    } catch (err) {
      console.error("Error fetching faults:", err);
      setError(
        "No se pudieron cargar los datos de las faltas. Intente nuevamente."
      );
    } finally {
      setIsLoading(false);
      isLoadingAlert(false);
    }
  };

  // Cargar las faltas inicialmente
  useEffect(() => {
    if (authService.isLocallyAuthenticated()) {
      fetchFaults();
    }
  }, []);

  // Métodos públicos
  const setPage = (page: number) => {
    if (page !== currentPage && page > 0 && page <= totalPages) {
      // Verificar si la página solicitada está en caché
      if (cachedPages.has(page)) {
        setFaults(cachedPages.get(page) || []);
        setCurrentPage(page);
      } else {
        // Si no está en caché, la solicitamos al servidor
        fetchFaults(page, itemsPerPage);
      }
    }
  };

  const changeItemsPerPage = (items: number) => {
    if (items !== itemsPerPage) {
      setItemsPerPage(items);
      // Resetear caché y volver a la primera página
      setCachedPages(new Map());
      setCurrentPage(1);
      fetchFaults(1, items);
    }
  };

  const refreshFaults = async () => {
    // Limpiar la caché al refrescar
    setCachedPages(new Map());
    await fetchFaults(currentPage, itemsPerPage, true);
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
    };

    // Función para manejar login
    const handleLogin = () => {
      fetchFaults(1, itemsPerPage, true);
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
    isLoading,
    error,
    totalItems,
    currentPage,
    itemsPerPage,
    totalPages,
    setPage,
    setItemsPerPage: changeItemsPerPage,
    refreshFaults,
    lastUpdated,
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
