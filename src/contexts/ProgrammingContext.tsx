import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Programming } from "@/core/model/programming";
import { ClientProgrammingService } from "@/services/clientProgramming";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { authService } from "@/services/authService";
import { formatDate } from "@/lib/utils/formatDate";

// Interfaz para el contexto
interface ProgrammingContextType {
  programming: Programming[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  createProgramming: (data: Omit<Programming, "id">) => Promise<Programming | null>;
  createBulkProgramming: (data: Omit<Programming, "id">[]) => Promise<boolean>;
  refreshProgramming: () => Promise<void>;
}

// Crear el contexto
const ProgrammingContext = createContext<ProgrammingContextType | undefined>(undefined);

// Servicio de programación
const programmingService = new ClientProgrammingService();

// Provider component
export function ProgrammingProvider({ children }: { children: ReactNode }) {
  // Estados
  const [programming, setProgramming] = useState<Programming[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cargar programación al iniciar
  useEffect(() => {
    if (authService.isLocallyAuthenticated()) {
      refreshProgramming();
    }

    // Manejar eventos de autenticación
    const handleLogin = () => refreshProgramming();
    const handleLogout = () => setProgramming([]);

    window.addEventListener("auth:login_success", handleLogin);
    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:login_success", handleLogin);
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

    // Función para refrescar datos de programación
  const refreshProgramming = async () => {
    setIsLoading(true);
    try {
      // Obtener la fecha actual en formato YYYY-MM-DD para la consulta
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      // Realizar la petición al servicio
      const response = await programmingService.getProgramation(formattedDate);
      
      // Importante: actualizar el estado con los datos recibidos
      setProgramming(response);
      setLastUpdated(new Date());
      
      return response; // Opcional: devolver los datos para uso directo
    } catch (err) {
      console.error("Error al cargar programación:", err);
      setError("Error al cargar programación");
      return []; // Devolver array vacío en caso de error
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
    
    // Resto del código igual...
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
    
    return dateStr; // Si no se puede convertir, devolver el original
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