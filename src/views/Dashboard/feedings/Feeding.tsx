import { useState, useMemo, useEffect } from "react";
import { useFeedings } from "@/contexts/FeedingContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DataTable, TableColumn, TableAction } from "@/components/ui/DataTable";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { FeedingFilterBar } from "@/components/ui/feedings/FeedingFilterBar";
import { BsEye } from "react-icons/bs";
import type { Feeding } from "@/services/feedingService";
import { ViewFeedingDialog } from "@/components/ui/feedings/ViewFeedingDialog";
import { useWorkers } from "@/contexts/WorkerContext";
import { operationService } from "@/services/operationService";

export default function Feeding() {
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

  // Cargar operaciones relacionadas
  useEffect(() => {
    async function loadOperationsData() {
      if (!feedings || feedings.length === 0) return;

      setLoadingOperations(true);

      // Obtener IDs únicos de operaciones
      const operationIds = [...new Set(feedings.map(f => f.id_operation))];
      const operationsMap: Record<number, any> = {};

      try {
        // Cargar datos para cada operación
        const operations = await Promise.all(
          operationIds.map(async (opId) => {
            try {
              const opData = await operationService.getOperationById(opId);
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
          }
        });

        setOperationsData(operationsMap);
      } catch (error) {
        console.error("Error al cargar datos de operaciones:", error);
      } finally {
        setLoadingOperations(false);
      }
    }

    loadOperationsData();
  }, [feedings]);

  // Cargar Trajadores relacionados
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


  
  useEffect(() => {
    // Si no hay un feeding seleccionado o el diálogo está cerrado, no hacer nada
    if (!selectedFeeding || !isViewDialogOpen) return;
    
    // Buscar el worker actualizado
    const workerId = selectedFeeding.id_worker;
    const updatedWorkerName = getWorkerNameById(workerId);
    
    // Si el nombre del worker ha cambiado y ya no es "Cargando..."
    if (updatedWorkerName !== "Cargando..." && 
        selectedFeeding.workerDetails?.name === "Cargando...") {
      
      // Actualizar el feeding seleccionado con el nombre actualizado
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

  const handleViewFeeding = (feeding: any) => {
    // Asegurar que tenemos datos válidos
    if (!feeding || !feeding.id) {
      console.error("Datos de alimentación inválidos:", feeding);
      return;
    }

    console.log("Intentando buscar feeding con ID:", feeding.id);
    console.log("Cantidad de enhancedFeedings disponibles:", enhancedFeedings.length);

    // Intentar buscar por ID con conversión de tipo explícita para evitar problemas de tipado
    const enhancedFeeding = enhancedFeedings.find(ef =>
      Number(ef.id) === Number(feeding.id)
    );

    console.log("¿Se encontró enhancedFeeding?", enhancedFeeding ? "Sí" : "No");

    // Si no encontramos la alimentación, crear un objeto enriquecido manualmente
    if (!enhancedFeeding) {
      console.warn("No se encontró la versión mejorada del feeding con ID:", feeding.id);
      console.log("IDs disponibles en enhancedFeedings:", enhancedFeedings.map(f => f.id));

      // Intentar obtener la operación relacionada del cache
      const operationData = operationsData[feeding.id_operation];

      // Obtener el nombre del trabajador
      const workerName = getWorkerNameById(feeding.id_worker);

      // Crear un objeto enriquecido manualmente
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

    // Código existente para cuando sí encontramos enhancedFeeding
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

    // Mejorar la función getWorkerNameById para manejar la carga inicial
  const getWorkerNameById = (workerId: number) => {
    // Primero buscar en el array de workers del contexto
    const workerFromContext = workers.find(w => w.id === workerId);
    if (workerFromContext) {
      return workerFromContext.name;
    }
  
    const workerFromLocal = workersData[workerId];
    if (workerFromLocal) {
      return workerFromLocal.name;
    }
    
    // Si aún no está disponible, mostrar un formato provisional
    return isLoading || loadingOperations 
      ? "Cargando..."
      : `Trabajador ID: ${workerId}`;
  };;


  // Definir las columnas para la tabla
  const columns: TableColumn<any>[] = useMemo(
    () => [
      {
        header: "ID",
        accessor: "id",
        className: "font-medium",
      },
      {
        header: "Trabajador",
        accessor: "id_worker",
        cell: (feeding) => (
          <div className="flex items-center">
            {getWorkerNameById(feeding.id_worker)}
          </div>
        ),
      },
      {
        header: "Operación",
        accessor: "id_operation",
        cell: (feeding) => (
          <div className="flex items-center">
            <button
            >
              #{feeding.id_operation}
            </button>
          </div>
        ),
      },
      {
        header: "Servicio",
        accessor: "enhancedOperation.task.name",
        cell: (feeding) => (
          <div className="flex items-center">
            {feeding.enhancedOperation?.task?.name || "Sin servicio"}
          </div>
        ),
      },
      {
        header: "Embarcación",
        accessor: "enhancedOperation.motorShip",
        cell: (feeding) => feeding.enhancedOperation?.motorShip || "Sin embarcación",
      },
      {
        header: "Tipo Alimentación",
        accessor: "type",
        cell: (feeding) => {
          let bgColor = "bg-gray-100";
          let textColor = "text-gray-800";
          let borderColor = "border-gray-200";
          let displayText = feeding.type || "";

          // Mapeo de tipos de API a textos mostrados
          switch (feeding.type) {
            case "BREAKFAST":
              displayText = "Desayuno";
              bgColor = "bg-yellow-100";
              textColor = "text-yellow-800";
              borderColor = "border-yellow-200";
              break;
            case "LUNCH":
              displayText = "Almuerzo";
              bgColor = "bg-blue-100";
              textColor = "text-blue-800";
              borderColor = "border-blue-200";
              break;
            case "DINNER":
              displayText = "Cena";
              bgColor = "bg-indigo-100";
              textColor = "text-indigo-800";
              borderColor = "border-indigo-200";
              break;
            case "MIDNIGHT":
              displayText = "Media noche";
              bgColor = "bg-purple-100";
              textColor = "text-purple-800";
              borderColor = "border-purple-200";
              break;
          }

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${bgColor} ${textColor} border ${borderColor}`}
            >
              {displayText}
            </span>
          );
        },
      },
      {
        header: "Fecha",
        accessor: "dateFeeding",
        cell: (feeding) =>
          feeding.dateFeeding
            ? format(new Date(feeding.dateFeeding), "dd/MM/yyyy", { locale: es })
            : "N/A",
      },
      {
        header: "Hora",
        accessor: "createAt",
        cell: (feeding) =>
          feeding.createAt
            ? format(new Date(feeding.createAt), "HH:mm", { locale: es })
            : "N/A",
      },
    ],
    [workers]
  );
  // Definir acciones para cada registro
  const actions: TableAction<Feeding>[] = useMemo(
    () => [
      {
        label: "Ver detalles",
        icon: <BsEye className="h-4 w-4" />,
        onClick: handleViewFeeding,
        className: "text-blue-600",
      },
    ],
    []
  );

  // Definir las columnas para exportar a Excel
  const exportColumns: ExcelColumn[] = useMemo(
    () => [
      { header: "ID", field: "id" },
      {
        header: "Trabajador",
        field: "id_worker",
        value: (feeding) => getWorkerNameById(feeding.id_worker)
      },
      { header: "Operación ID", field: "id_operation" },
      {
        header: "Servicio",
        field: "enhancedOperation.task.name",
        value: (feeding) => feeding.enhancedOperation?.task?.name || "Sin servicio"
      },
      {
        header: "Cliente",
        field: "enhancedOperation.client.name",
        value: (feeding) => feeding.enhancedOperation?.client?.name || "Sin cliente"
      },
      {
        header: "Tipo Alimentación",
        field: "type",
        value: (feeding) => {
          switch (feeding.type) {
            case "BREAKFAST": return "Desayuno";
            case "LUNCH": return "Almuerzo";
            case "DINNER": return "Cena";
            case "MIDNIGHT": return "Media noche";
            default: return feeding.type || "Desconocido";
          }
        }
      },
      {
        header: "Fecha",
        field: "dateFeeding",
        value: (feeding) =>
          feeding.dateFeeding
            ? format(new Date(feeding.dateFeeding), "dd/MM/yyyy", { locale: es })
            : "N/A",
      },
      {
        header: "Fecha de registro",
        field: "createAt",
        value: (feeding) =>
          feeding.createAt
            ? format(new Date(feeding.createAt), "dd/MM/yyyy HH:mm", { locale: es })
            : "N/A",
      },
    ],
    [workers]
  );

  return (
    <>
      <div className="container mx-auto py-6 space-y-6">
        <div className="rounded-xl shadow-md">
          <SectionHeader
            title="Alimentación"
            subtitle="Registro de alimentación proporcionada a trabajadores"
            btnAddText=""
            handleAddArea={() => { }}
            refreshData={() => Promise.resolve(refreshFeedings())}
            loading={isLoading}
            exportData={filteredFeedings}
            exportFileName="registros_alimentacion"
            exportColumns={exportColumns}
            currentView="food"
            showAddButton={false}
          />

          {/* Filtros */}
          <FeedingFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
          />
        </div>

        {/* Tabla de alimentación */}
        <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-white">
            <DataTable
              data={filteredFeedings}
              columns={columns}
              actions={actions}
              isLoading={isLoading || loadingOperations} // Incluir loadingOperations para reflejar ambos estados de carga
              itemsPerPage={10}
              itemName="registros de alimentación"
              initialSort={{ key: "createAt", direction: "desc" }} // Cambiar de createdAt a createAt para que coincida con tu modelo
              emptyMessage={
                searchTerm
                  ? `No se encontraron registros para "${searchTerm}"`
                  : "No hay registros de alimentación"
              }
            />
          </div>
        </div>
      </div>
      {/* Dialog para ver detalles */}
      <ViewFeedingDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        feeding={selectedFeeding}
      />
    </>
  );
}