import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { feedingService, Feeding, FeedingFilterParams } from '@/services/feedingService';
import Swal from 'sweetalert2';

interface FeedingContextProps {
  feedings: Feeding[];
  isLoading: boolean;
  error: string | null;
  refreshFeedings: () => Promise<void>;
  deleteFeeding: (id: number) => Promise<boolean>;
  filters: FeedingFilterParams;
  setFilters: (filters: FeedingFilterParams) => void;
  lastUpdated: Date | null;
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
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FeedingFilterParams>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cargar alimentaciones cuando cambian los filtros
  useEffect(() => {
    fetchFeedings();
  }, [filters]);

  // Función para cargar alimentaciones
  const fetchFeedings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await feedingService.getAllFeedings(filters);
      setFeedings(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error al cargar alimentaciones:', err);
      setError('No se pudieron cargar las alimentaciones. Intente nuevamente.');
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las alimentaciones. Intente nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar alimentación
  const handleDeleteFeeding = async (id: number): Promise<boolean> => {
    try {
      await feedingService.deleteFeeding(id);
      await fetchFeedings();
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

  return (
    <FeedingContext.Provider
      value={{
        feedings,
        isLoading,
        error,
        refreshFeedings: fetchFeedings,
        deleteFeeding: handleDeleteFeeding,
        filters,
        setFilters,
        lastUpdated
      }}
    >
      {children}
    </FeedingContext.Provider>
  );
};