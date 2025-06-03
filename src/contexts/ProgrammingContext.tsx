import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Programming } from "@/core/model/programming";
import { ClientProgrammingService } from "@/services/clientProgramming";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { authService } from "@/services/authService";
import { formatDateToISO } from "@/lib/utils/formatDate";

// Interfaz para el contexto
interface ProgrammingContextType {
  programming: Programming[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  createProgramming: (data: Omit<Programming, "id">) => Promise<boolean>;
  createBulkProgramming: (data: Omit<Programming, "id">[]) => Promise<boolean>;
  refreshProgramming: (
    searchTerm?: string,
    dateFilter?: string,
    status?: string
  ) => Promise<Programming[]>;
  deleteProgramming: (id: number) => Promise<boolean>;
  updateProgramming?: (id: number, data: Programming) => Promise<boolean>;
}

// Crear el contexto
const ProgrammingContext = createContext<ProgrammingContextType | undefined>(
  undefined
);

// Crear instancia SEPARADA del servicio para este contexto
const programmingService = new ClientProgrammingService();

// Provider component
export function ProgrammingProvider({ children }: { children: ReactNode }) {
  // Estados
  const [programming, setProgramming] = useState<Programming[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Estado para controlar si ya se inicializó
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // NO cargar datos automáticamente al iniciar
  // Solo cuando se llame explícitamente desde el componente
  useEffect(() => {
    if (authService.isLocallyAuthenticated() && !isInitialized) {
      // Marcar como inicializado pero NO cargar datos automáticamente
      setIsInitialized(true);
    }

    // Manejar eventos de autenticación
    const handleLogin = () => {
      setIsInitialized(true);
      // NO llamar refreshProgramming automáticamente
    };
    const handleLogout = () => {
      setProgramming([]);
      setIsInitialized(false);
    };

    window.addEventListener("auth:login_success", handleLogin);
    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:login_success", handleLogin);
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  // Función para refrescar datos de programación con filtros
  const refreshProgramming = async (
    searchTerm?: string,
    dateFilter?: string,
    status?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Context - Llamando API con filtros:", {
        searchTerm,
        dateFilter,
      });

      let response: Programming[] = [];

      // Determinar qué filtros aplicar
      const filters: any = {};

      if (dateFilter && dateFilter.trim() !== "") {
        filters.dateStart = dateFilter;
      }

      if (searchTerm && searchTerm.trim() !== "") {
        filters.search = searchTerm;
      }

      if (status && status.trim() !== "") {
        filters.status = status; // Asegurarse de que sea del tipo correcto
      }

      // Hacer llamada directa al API sin caché
      response = await programmingService.getProgramation(
        Object.keys(filters).length > 0 ? filters : undefined
      );

      console.log(
        "✅ Context - Respuesta recibida:",
        response.length,
        "registros"
      );

      setProgramming(response);
      setLastUpdated(new Date());

      return response;
    } catch (err) {
      console.error("❌ Context - Error al cargar programación:", err);
      setError("Error al cargar programación");
      setProgramming([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear una programación
  const createProgramming = async (
    data: Omit<Programming, "id">
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Convertir fecha de formato DD/MM/YYYY a YYYY-MM-DD
      const formattedData = {
        ...data,
        dateStart: formatDateToISO(data.dateStart),
      };

      const results = await Promise.allSettled([
        programmingService.createProgramation(formattedData),
      ]);
      const result = results[0];

      if (result.status === "fulfilled") {
        setProgramming((prev) => [...prev, result.value]);
        setLastUpdated(new Date());

        // Mostrar alerta de éxito
        StatusSuccessAlert("Éxito", "Programación creada correctamente");
        return true;
      } else {
        // ❌ ERROR - Falló la creación (datos duplicados u otro error)
        console.error("❌ Error al crear programación:", result.reason);

        // Verificar si es error de datos duplicados
        const errorMessage =
          result.reason?.response?.data?.message ||
          result.reason?.message ||
          "Error desconocido";

        if (
          errorMessage.toLowerCase().includes("duplicate") ||
          errorMessage.toLowerCase().includes("duplicado") ||
          errorMessage.toLowerCase().includes("service alredy exists")
        ) {
          // Error específico por datos duplicados
          StatusSuccessAlert(
            "Datos Duplicados",
            "Ya existe una programación con estos datos. Por favor, verifica la información."
          );
        } else {
          // Otro tipo de error
          StatusSuccessAlert(
            "Error",
            `No se pudo crear la programación: ${errorMessage}`
          );
        }

        setError("Error al crear programación");
        return false;
      }
    } catch (err) {
      console.error(
        "❌ Context - Error inesperado al crear programación:",
        err
      );
      StatusSuccessAlert("Error", "Error inesperado al crear la programación");
      setError("Error al crear programación");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Crear programaciones en lote desde un archivo Excel
  const createBulkProgramming = async (
    data: Omit<Programming, "id">[]
  ): Promise<boolean> => {
    if (!data.length) return false;

    setIsLoading(true);
    try {
      // Formatear fechas antes de enviar
      const formattedData = data.map((item) => ({
        ...item,
        dateStart: formatDateToISO(item.dateStart),
      }));

      // Procesar cada item de programación
      const results = await Promise.allSettled(
        formattedData.map((item) => programmingService.createProgramation(item))
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      // Actualizar estado con las nuevas programaciones exitosas
      const successfulProgramming = results
        .filter(
          (r): r is PromiseFulfilledResult<Programming> =>
            r.status === "fulfilled"
        )
        .map((r) => r.value);

      setProgramming((prev) => [...prev, ...successfulProgramming]);
      setLastUpdated(new Date());

      // Mostrar mensaje de éxito/error
      if (failed > 0) {
        StatusSuccessAlert(
          "Importación parcial",
          `${successful} registros importados correctamente, ${failed} fallaron`
        );
      } else {
        StatusSuccessAlert(
          "Éxito",
          `${successful} registros importados correctamente`
        );
      }

      return failed === 0;
    } catch (err) {
      console.error("Error al crear programaciones en lote:", err);
      setError("Error al crear programaciones en lote");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  //función para eliminar programación
  const deleteProgramming = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      await programmingService.deleteProgramation(id);

      // Actualizar el estado local removiendo el item eliminado
      setProgramming((prev) => prev.filter((item) => item.id !== id));
      setLastUpdated(new Date());

      StatusSuccessAlert("Éxito", "Programación eliminada correctamente");
      return true;
    } catch (err) {
      console.error("❌ Error al eliminar programación:", err);
      setError("Error al eliminar programación");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgramming = async (
    id: number,
    data: Programming
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Convertir fecha de formato DD/MM/YYYY a YYYY-MM-DD
      const formattedData = {
        ...data,
        dateStart: formatDateToISO(data.dateStart),
      };

      const updatedProgramming = await programmingService.updateProgramation(
        formattedData
      );

      // Actualizar el estado local con la programación actualizada
      setProgramming((prev) =>
        prev.map((item) => (item.id === id ? updatedProgramming : item))
      );
      setLastUpdated(new Date());

      StatusSuccessAlert("Éxito", "Programación actualizada correctamente");
      return true;
    } catch (err) {
      console.error("❌ Error al actualizar programación:", err);
      setError("Error al actualizar programación");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Valor del contexto
  const value: ProgrammingContextType = {
    programming,
    isLoading,
    error,
    lastUpdated,
    createProgramming,
    createBulkProgramming,
    refreshProgramming,
    deleteProgramming,
    updateProgramming,
  };

  return (
    <ProgrammingContext.Provider value={value}>
      {children}
    </ProgrammingContext.Provider>
  );
}

// Custom hook para usar este contexto
export function useProgramming() {
  const context = useContext(ProgrammingContext);
  if (!context) {
    throw new Error(
      "useProgramming debe ser usado dentro de un ProgrammingProvider"
    );
  }
  return context;
}

// Exportar el contexto para uso directo si es necesario
export { ProgrammingContext };
