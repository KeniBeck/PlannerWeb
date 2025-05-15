import { useState, useMemo, useEffect } from "react";
import { useFeedings } from "@/contexts/FeedingContext";
import { useWorkers } from "@/contexts/WorkerContext";
import { operationService } from "@/services/operationService";
import type { Feeding, FeedingFilterParams } from "@/services/feedingService";

export function useFeeding() {
  const {
    feedings,
    isLoading,
    refreshFeedings,
    deleteFeeding,
    filters,
    setFilters,
    lastUpdated
  } = useFeedings();

  // Obtener la lista de trabajadores del contexto
  const { workers } = useWorkers();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeeding, setSelectedFeeding] = useState<Feeding | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [operationsData, setOperationsData] = useState<Record<number, any>>({});
  const [loadingOperations, setLoadingOperations] = useState<boolean>(false);
  const [workersData, setWorkersData] = useState<Record<number, any>>({});


  
  // Cargar datos de operaciones
  useEffect(() => {
    async function loadOperationsData() {
      if (!feedings || feedings.length === 0) return;
  
      setLoadingOperations(true);
  
      // Obtener IDs únicos de operaciones
      const operationIds = [...new Set(feedings.map(f => f.id_operation))];
      console.log("IDs de operaciones a cargar:", operationIds);
      
      const operationsMap: Record<number, any> = {};
  
      try {
        // Cargar datos para cada operación
        const operations = await Promise.all(
          operationIds.map(async (opId) => {
            try {
              console.log(`Intentando cargar operación ID ${opId}...`);
              const opData = await operationService.getOperationById(opId);
              console.log(`Operación ID ${opId} cargada:`, opData ? "Éxito" : "Sin datos");
              return { id: opId, data: opData };
            } catch (error) {
              console.error(`Error cargando operación ID ${opId}:`, error);
              return { id: opId, data: null };
            }
          })
        );
  
        // Convertir a un objeto para fácil acceso
        operations.forEach(op => {
          if (op.data) {
            operationsMap[op.id] = op.data;
          } else {
            console.warn(`No se pudieron obtener datos para operación ID ${op.id}`);
          }
        });
  
        console.log("Mapa de operaciones cargadas:", Object.keys(operationsMap).length);
        setOperationsData(operationsMap);
      } catch (error) {
        console.error("Error al cargar datos de operaciones:", error);
      } finally {
        setLoadingOperations(false);
      }
    }
  
    loadOperationsData();
  }, [feedings]);

// Agregar este efecto al inicio del hook para dar diagnóstico
useEffect(() => {
  console.log("Estado actual de filtros:", JSON.stringify(filters));
  
  // Para debugging: mostrar qué filtros están activos
  const activeFilters = Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== "")
    .map(([key]) => key);
  
  if (activeFilters.length > 0) {
    console.log(`Filtros activos: ${activeFilters.join(', ')}`);
  } else {
    console.log("No hay filtros activos");
  }
}, [filters]);

// Modificar el efecto de búsqueda para evitar conflictos
useEffect(() => {
  // Retrasamos la aplicación del filtro para evitar demasiadas actualizaciones
  const handler = setTimeout(() => {
    if (searchTerm && searchTerm.length >= 3) {
      console.log(`Aplicando filtro de búsqueda: "${searchTerm}"`);
      setFilters({
        ...filters,
        search: searchTerm
      });
    } else if (filters.search) {
      console.log("Eliminando filtro de búsqueda");
      const newFilters = { ...filters };
      delete newFilters.search;
      setFilters(newFilters);
    }
  }, 300); // Debounce de 300ms
  
  return () => clearTimeout(handler);
}, [searchTerm]);


// Cargar alimentacion dependiendo filtros
useEffect(() => {
    console.log("Cargando alimentaciones con filtros:", filters);
    refreshFeedings();
}, [filters]);

  // Cargar trabajadores relacionados
  useEffect(() => {
    if (!feedings || feedings.length === 0) return;

    const workerIds = [...new Set(feedings.map(f => f.id_worker))];
    const workersMap: Record<number, any> = {};

    workerIds.forEach(workerId => {
      const worker = workers.find(w => w.id === workerId);
      if (worker) {
        workersMap[workerId] = worker;
      }
    });

    setWorkersData(workersMap);
  }, [feedings, workers]);
  
  // Actualizar el nombre del trabajador cuando cambie
  useEffect(() => {
    if (!selectedFeeding || !isViewDialogOpen) return;
    
    const workerId = selectedFeeding.id_worker;
    const updatedWorkerName = getWorkerNameById(workerId);
    
    if (updatedWorkerName !== "Cargando..." && 
        selectedFeeding.workerDetails?.name === "Cargando...") {
      
      setSelectedFeeding(prev => {
        if (!prev) return null;
        return {
          ...prev,
          workerDetails: {
            ...prev.workerDetails,
            name: updatedWorkerName
          }
        };
      });
    }
  }, [selectedFeeding, workers, workersData, isViewDialogOpen]);

  // Combinar datos de alimentación con operaciones
  const enhancedFeedings = useMemo(() => {
    if (feedings.length === 0) return [];

    return feedings.map(feeding => {
      const operationData = operationsData[feeding.id_operation];
      return {
        ...feeding,
        enhancedOperation: operationData || feeding.operation || {}
      };
    });
  }, [feedings, operationsData]);
  
  // Filtrar alimentaciones según el término de búsqueda
  const filteredFeedings = useMemo(() => {
    if (!searchTerm) return enhancedFeedings;

    return enhancedFeedings.filter(feeding =>
      feeding.worker?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeding.enhancedOperation?.jobArea?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeding.enhancedOperation?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeding.enhancedOperation?.motorShip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeding.enhancedOperation?.task?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeding.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enhancedFeedings, searchTerm]);

  // Obtener nombre de trabajador por ID
  const getWorkerNameById = (workerId: number) => {
    const workerFromContext = workers.find(w => w.id === workerId);
    if (workerFromContext) {
      return workerFromContext.name;
    }
  
    const workerFromLocal = workersData[workerId];
    if (workerFromLocal) {
      return workerFromLocal.name;
    }
    
    return isLoading || loadingOperations 
      ? "Cargando..."
      : `Trabajador ID: ${workerId}`;
  };

  // Manejar la visualización de detalles
  const handleViewFeeding = async (feeding: any) => {
    if (!feeding || !feeding.id) {
      console.error("Datos de alimentación inválidos:", feeding);
      return;
    }

    const enhancedFeeding = enhancedFeedings.find(ef =>
      Number(ef.id) === Number(feeding.id)
    );

    if (!enhancedFeeding) {
      console.warn("No se encontró la versión mejorada del feeding con ID:", feeding.id);
      
      let operationData = operationsData[feeding.id_operation];

      if (!operationData && feeding.id_operation) {
        try {
          console.log(`Intentando cargar operación ID ${feeding.id_operation} en tiempo real...`);
          setLoadingOperations(true);
          const opData = await operationService.getOperationById(feeding.id_operation);
          
          if (opData) {
            operationData = opData;
            setOperationsData(prev => ({
              ...prev,
              [feeding.id_operation]: opData
            }));
            console.log(`Operación ID ${feeding.id_operation} cargada exitosamente:`, opData);
          } else {
            console.warn(`La operación ID ${feeding.id_operation} no existe o no se pudo cargar`);
          }
        } catch (error) {
          console.error(`Error al cargar operación ID ${feeding.id_operation}:`, error);
        } finally {
          setLoadingOperations(false);
        }
      }

      const workerName = getWorkerNameById(feeding.id_worker);

      const manuallyEnhancedFeeding = {
        ...feeding,
        enhancedOperation: operationData || {},
        operation: operationData || {},
        workerDetails: {
          id: feeding.id_worker,
          name: workerName
        }
      };

      console.log("Objeto enriquecido manualmente:", manuallyEnhancedFeeding);
      setSelectedFeeding(manuallyEnhancedFeeding);
      setIsViewDialogOpen(true);
      return;
    }

    const worker = workers.find(w => Number(w.id) === Number(enhancedFeeding.id_worker));

    const completeFeeding = {
      ...enhancedFeeding,
      workerDetails: worker || {
        id: enhancedFeeding.id_worker,
        name: getWorkerNameById(enhancedFeeding.id_worker)
      },
      operation: enhancedFeeding.enhancedOperation
    };

    console.log("Feeding enriquecido exitosamente:", completeFeeding);
    setSelectedFeeding(completeFeeding);
    setIsViewDialogOpen(true);
  };

  return {
    // Estados
    feedings,
    enhancedFeedings,
    filteredFeedings,
    isLoading,
    loadingOperations,
    searchTerm,
    selectedFeeding,
    isViewDialogOpen,
    filters,
    
    // Acciones
    setSearchTerm,
    setSelectedFeeding,
    setIsViewDialogOpen,
    setFilters,
    refreshFeedings,
    handleViewFeeding,
    getWorkerNameById,

    workers
  };
}