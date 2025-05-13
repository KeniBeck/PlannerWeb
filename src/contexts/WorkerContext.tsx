import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { workerService } from '@/services/workerService';
import { authService } from '@/services/authService';
import { isLoadingAlert } from '@/components/dialog/AlertsLogin';
import { workersState } from './WorkerState';
import { WorkerStatus,Worker } from '@/core/model/worker';

interface WorkerContextType {
  workers: Worker[];
  availableWorkers: Worker[];
  assignedWorkers: Worker[];
  deactivatedWorkers: Worker[];
  incapacitatedWorkers: Worker[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshWorkers: () => Promise<void>;
}

// Crea el contexto
const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

// Provider component
export function WorkerProvider({ children }: { children: ReactNode }) {
  // Inicializa el estado usando el singleton
  const [workers, setWorkers] = useState<Worker[]>(workersState.getState().workers);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(workersState.getState().lastUpdated);
  const [dataFetched, setDataFetched] = useState<boolean>(workersState.getState().dataFetched);

  // Filtra los trabajadores por estado
  const availableWorkers = workers?.filter(worker => worker.status === WorkerStatus.AVAILABLE) || [];
  const assignedWorkers = workers?.filter(worker => worker.status === WorkerStatus.ASSIGNED) || [];
  const deactivatedWorkers = workers?.filter(worker => worker.status === WorkerStatus.DEACTIVATED) || [];
  const incapacitatedWorkers = workers?.filter(worker => worker.status === WorkerStatus.INCAPACITATED) || [];

  // Función para actualizar el estado local y el singleton
  const updateWorkers = (newWorkers: Worker[]) => {
    setWorkers(newWorkers);
    workersState.setState({ workers: newWorkers });
  };

  // Función para cargar los trabajadores
  const fetchWorkers = async (force: boolean = false) => {
    if(!force && dataFetched && workers.length > 0) {
        console.log('Usando datos en caché del singleton');
        return;
    }

    if (!authService.isLocallyAuthenticated()) {
      return; // No intentar cargar datos si no hay autenticación
    }

    setIsLoading(true);
    setError(null);
    isLoadingAlert(true);

    try {
      const data = await workerService.getWorkers();
      
      // Actualizar estado local y singleton
      updateWorkers(data);
      
      const now = new Date();
      setLastUpdated(now);
      setDataFetched(true);
      
      // Actualizar otras propiedades en el singleton
      workersState.setState({ 
        lastUpdated: now, 
        dataFetched: true 
      });
      
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError('No se pudieron cargar los datos de los trabajadores. Intente nuevamente.');
    } finally {
      setIsLoading(false);
      isLoadingAlert(false);
    }
  };

  // Escuchar eventos de autenticación
  useEffect(() => {
    // Función para manejar logout
    const handleLogout = () => {
      updateWorkers([]);
      setLastUpdated(null);
      setDataFetched(false);
      workersState.reset();
    };
    
    // Registrar eventos globales para logout
    window.addEventListener('auth:logout', handleLogout);
    
    // Limpiar evento al desmontar
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // Cargar trabajadores al iniciar solo si es necesario
  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (authService.isLocallyAuthenticated()) {
      fetchWorkers();
    } else {
      // Limpiar datos si no hay autenticación
      updateWorkers([]);
      setLastUpdated(null);
      setDataFetched(false);
      workersState.reset();
    }
  }, []);

  // Función pública para refrescar los datos (con forzado)
  const refreshWorkers = async () => {
    await fetchWorkers(true);
  };

  const value = {
    workers,
    availableWorkers,
    assignedWorkers,
    deactivatedWorkers,
    incapacitatedWorkers,
    isLoading,
    error,
    lastUpdated,
    refreshWorkers
  };

  return (
    <WorkerContext.Provider value={value}>
      {children}
    </WorkerContext.Provider>
  );
}

// Hook personalizado para usar este contexto
export function useWorkers() {
  const context = useContext(WorkerContext);
  if (context === undefined) {
    throw new Error('useWorkers must be used within a WorkerProvider');
  }
  return context;
}