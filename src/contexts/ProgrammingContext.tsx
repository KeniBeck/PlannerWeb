import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Programming } from "@/core/model/programming";
import { ClientProgrammingService } from "@/services/clientProgramming";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { authService } from "@/services/authService";
import { StatusFilter } from "@/components/custom/filter/StatusFilterProps";

// Interfaz para el contexto
interface ProgrammingContextType {
  programming: Programming[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  createProgramming: (data: Omit<Programming, "id">) => Promise<Programming | null>;
  createBulkProgramming: (data: Omit<Programming, "id">[]) => Promise<boolean>;
  refreshProgramming: (searchTerm?: string, dateFilter?: string,status?: string) => Promise<Programming[]>;
}

// Crear el contexto
const ProgrammingContext = createContext<ProgrammingContextType | undefined>(undefined);

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
  const refreshProgramming = async (searchTerm?: string, dateFilter?: string, status?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("🔍 Context - Llamando API con filtros:", { searchTerm, dateFilter });
      
      let response: Programming[] = [];
      
      // Determinar qué filtros aplicar
      const filters: any = {};
      
      if (dateFilter && dateFilter.trim() !== "") {
        filters.dateStart = dateFilter;
      }
      
      if (searchTerm && searchTerm.trim() !== "") {
        filters.search = searchTerm;
      }

      if (status && status.trim() !== ""){
        filters.status = status; // Asegurarse de que sea del tipo correcto
      }
      
      // Hacer llamada directa al API sin caché
      response = await programmingService.getProgramation(Object.keys(filters).length > 0 ? filters : undefined);
      
      console.log("✅ Context - Respuesta recibida:", response.length, "registros");
      
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
const createProgramming = async (data: Omit<Programming, "id">): Promise<Programming | null> => {
  setIsLoading(true);
  try {
    // Convertir fecha de formato DD/MM/YYYY a YYYY-MM-DD
    const formattedData = {
      ...data,
      dateStart: formatDateToISO(data.dateStart)
    };
    
    const response = await programmingService.createProgramation(formattedData);
    setProgramming((prev) => [...prev, response]);
    setLastUpdated(new Date());
    StatusSuccessAlert("Éxito", "Programación guardada correctamente");
    return response;
  } catch (err) {
    console.error("Error al crear programación:", err);
    setError("Error al crear programación");
    return null;
  } finally {
    setIsLoading(false);
  }
};

// Crear programaciones en lote desde un archivo Excel
const createBulkProgramming = async (data: Omit<Programming, "id">[]): Promise<boolean> => {
  if (!data.length) return false;
  
  setIsLoading(true);
  try {
    // Formatear fechas antes de enviar
    const formattedData = data.map(item => ({
      ...item,
      dateStart: formatDateToISO(item.dateStart)
    }));
    
    // Procesar cada item de programación
    const results = await Promise.allSettled(
      formattedData.map(item => programmingService.createProgramation(item))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    // Actualizar estado con las nuevas programaciones exitosas
    const successfulProgramming = results
      .filter((r): r is PromiseFulfilledResult<Programming> => r.status === 'fulfilled')
      .map(r => r.value);
    
    setProgramming(prev => [...prev, ...successfulProgramming]);
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

// Función utilitaria para convertir formato de fecha
function formatDateToISO(dateStr: string): string {
  if (!dateStr) return dateStr;
  
  // Si ya está en formato ISO (YYYY-MM-DD), devolverlo tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  try {
    // Convertir de DD/MM/YYYY a YYYY-MM-DD
    const [day, month, year] = dateStr.split('/');
    if (day && month && year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Intentar parsearlo como Date si no se pudo dividir
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return dateStr;
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return dateStr;
  }
}

  // Valor del contexto
  const value: ProgrammingContextType = {
    programming,
    isLoading,
    error,
    lastUpdated,
    createProgramming,
    createBulkProgramming,
    refreshProgramming
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
    throw new Error("useProgramming debe ser usado dentro de un ProgrammingProvider");
  }
  return context;
}

// Exportar el contexto para uso directo si es necesario
export { ProgrammingContext };