import { useState, useMemo, useEffect } from "react";
import { useFeedings } from "@/contexts/FeedingContext";
import { useWorkers } from "@/contexts/WorkerContext";
import { operationService } from "@/services/operationService";
import { Feeding } from "@/services/interfaces/feedingDTO";


export function useFeeding() {
  // Obtener datos y funciones del contexto actualizado
  const {
    feedings,
    isLoading,
    refreshFeedings,
    deleteFeeding,
    filters,
    setFilters,
    lastUpdated,
    totalItems,
    currentPage,
    itemsPerPage,
    totalPages,
    setPage,
    setItemsPerPage
  } = useFeedings();

  // Obtener la lista de trabajadores del contexto
  const { workers } = useWorkers();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [selectedFeeding, setSelectedFeeding] = useState<Feeding | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [operationsData, setOperationsData] = useState<Record<number, any>>({});
  const [loadingOperations, setLoadingOperations] = useState<boolean>(false);
  const [workersData, setWorkersData] = useState<Record<number, any>>({});

  // Sincronización bidireccional entre searchTerm y filters.search (optimizado)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search || "") &&
        (searchTerm.length >= 3 || searchTerm === "")) {
        if (searchTerm) {
          setFilters({ ...filters, search: searchTerm });
        } else if (filters.search) {
          const { search, ...restFilters } = filters;
          setFilters(restFilters);
        }
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Sincronización inversa
  useEffect(() => {
    if (filters.search !== searchTerm) {
      setSearchTerm(filters.search || "");
    }
  }, [filters.search]);

  // Cargar operaciones faltantes (optimizado)
  useEffect(() => {
    async function loadMissingOperationsData() {
      if (!feedings || feedings.length === 0) return;


      const missingOperations = feedings.filter(f =>
        f.id_operation && (!f.operation || !f.operation.task)
      ).map(f => f.id_operation);

      if (missingOperations.length === 0) return;

      setLoadingOperations(true);
      const operationsMap = { ...operationsData };

      try {
        const operations = await Promise.all(
          missingOperations.map(async (opId) => {
            try {
              const opData = await operationService.getOperationById(opId);
              return { id: opId, data: opData };
            } catch (error) {
              return { id: opId, data: null };
            }
          })
        );

        operations.forEach(op => {
          if (op.data) operationsMap[op.id] = op.data;
        });

        setOperationsData(operationsMap);
      } catch (error) {
        console.error("Error al cargar datos de operaciones:", error);
      } finally {
        setLoadingOperations(false);
      }
    }

    loadMissingOperationsData();
  }, [feedings]);

  // Optimización para trabajadores (simplificado)
  useEffect(() => {
    if (!feedings || feedings.length === 0) return;

    const workerIds = feedings
      .filter(f => f.id_worker && (!f.worker || !f.worker.name))
      .map(f => f.id_worker);

    if (workerIds.length === 0) return;

    const workersMap = { ...workersData };
    let updated = false;

    workerIds.forEach(workerId => {
      const worker = workers.find(w => w.id === workerId);
      if (worker) {
        workersMap[workerId] = worker;
        updated = true;
      }
    });

    if (updated) {
      setWorkersData(workersMap);
    }
  }, [feedings, workers]);

  // Actualizar detalles para el diálogo (simplificado)
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

  // Enriquecer datos (simplificado)
  const enhancedFeedings = useMemo(() => {
    if (feedings.length === 0) return [];

    return feedings.map(feeding => ({
      ...feeding,
      enhancedOperation:  operationsData[feeding.id_operation] || feeding.operation || {},
      worker: feeding.worker || workersData[feeding.id_worker] || {}
    }));
  }, [feedings, operationsData, workersData]);

  // Obtener nombre de trabajador (optimizado)
  const getWorkerNameById = (workerId: number) => {
    // Verificar en orden de prioridad
    const feedingWithWorker = feedings.find(f => f.id_worker === workerId && f.worker?.name);
    if (feedingWithWorker?.worker?.name) return feedingWithWorker.worker.name;

    const workerFromContext = workers.find(w => w.id === workerId);
    if (workerFromContext) return workerFromContext.name;

    const workerFromLocal = workersData[workerId];
    if (workerFromLocal) return workerFromLocal.name;

    return isLoading || loadingOperations ? "Cargando..." : `Trabajador ID: ${workerId}`;
  };


  
             
      const getServiceGroupByFeeding = (feeding: any) => {
          
      
      }

  // Ver detalles de alimentación (optimizado)
  const handleViewFeeding = async (feeding: any) => {
    if (!feeding || !feeding.id) return;


    // Buscar versión mejorada
    const enhancedFeeding = enhancedFeedings.find(ef =>
      Number(ef.id) === Number(feeding.id)
    );

    if (enhancedFeeding) {
      setSelectedFeeding({
        ...enhancedFeeding,
        workerDetails: enhancedFeeding.worker || {
          id: enhancedFeeding.id_worker,
          name: getWorkerNameById(enhancedFeeding.id_worker)
        }
      });
      setIsViewDialogOpen(true);
      return;
    }

    // Si no se encuentra, crear versión mejorada manualmente
    let operationData =  operationsData[feeding.id_operation] || feeding.operation || {};

    // Cargar operación faltante si es necesario
    if (!operationData.task && feeding.id_operation) {
      try {
        setLoadingOperations(true);
        const opData = await operationService.getOperationById(feeding.id_operation);

        if (opData) {
          operationData = opData;
          setOperationsData(prev => ({ ...prev, [feeding.id_operation]: opData }));
        }
      } catch (error) {
        console.error(`Error al cargar operación:`, error);
      } finally {
        setLoadingOperations(false);
      }
    }

    

    const workerName = feeding.worker?.name || getWorkerNameById(feeding.id_worker);

    setSelectedFeeding({
      ...feeding,
      enhancedOperation: operationData,
      operation: operationData,
      worker: feeding.worker || {},
      workerDetails: {
        id: feeding.id_worker,
        name: workerName
      }
    });

    setIsViewDialogOpen(true);
  };

  // Funciones de filtrado (simplificadas)
  const applyFeedingTypeFilter = (type: string) => {
    const newFilters = { ...filters };

    if (type === "all") {
      delete newFilters.type;
    } else {
      newFilters.type = type;
    }

    setFilters(newFilters);
  };

  const applyDateFilters = (startDate: string, endDate: string) => {
    const newFilters = { ...filters };

    if (startDate) newFilters.startDate = startDate;
    else delete newFilters.startDate;

    if (endDate) newFilters.endDate = endDate;
    else delete newFilters.endDate;

    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters({});
  };

  return {
    feedings: enhancedFeedings,
    filteredFeedings: enhancedFeedings,
    isLoading,
    loadingOperations,
    searchTerm,
    selectedFeeding,
    isViewDialogOpen,
    filters,

    // Acciones
    setSearchTerm,
    setIsViewDialogOpen,
    setFilters,
    refreshFeedings,
    handleViewFeeding,
    getWorkerNameById,
    workers,

    // Paginación
    totalItems,
    currentPage,
    itemsPerPage,
    totalPages,
    setPage,
    setItemsPerPage,

    // Filtros
    applyFeedingTypeFilter,
    applyDateFilters,
    clearAllFilters,
    getServiceGroupByFeeding: getServiceGroupByFeeding,
  };
}