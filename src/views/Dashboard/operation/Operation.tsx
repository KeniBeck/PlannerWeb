import { useState, useEffect, useRef, useMemo } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { OperationList } from "@/components/ui/operations/OperationList";
import { useOperations } from "@/contexts/OperationContext";
import {
  Operation as OperationModel,
  OperationStatus,
} from "@/core/model/operation";
import { parseISO } from "date-fns";
import { FilterTag } from "@/components/custom/filter/FilterTagProps";
import { FilterBar } from "@/components/custom/filter/FilterBarProps";
import { useAreas } from "@/contexts/AreasContext";
import { useUsers } from "@/contexts/UsersContext";
import { getOperationExportColumns } from "./OperationExportColumns";
// Definir el enum para que coincida con el modelo de Operation
import { AddOperationDialog } from "@/components/ui/operations/AddOperationDialog";
import { useServices } from "@/contexts/ServicesContext";
import { useClients } from "@/contexts/ClientsContext";
import { useWorkers } from "@/contexts/WorkerContext";
import { operationService } from "@/services/operationService";
import Swal from "sweetalert2";


export default function Operation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [supervisorFilter, setSupervisorFilter] = useState<string>("all");
   // Obtener datos de áreas, servicios, clientes y trabajadores
   const { areas, refreshData } = useAreas();
   const { services } = useServices();
   const { clients } = useClients();
   const { workers } = useWorkers();
   const { users } = useUsers();
 

  const supervisorsAndCoordinators = useMemo(() => {
    if (!users) return [];

    return users
      .filter((user) => {
        return (
          user.occupation === "SUPERVISOR" || user.occupation === "COORDINADOR"
        );
      })
      .map((user) => ({
        id: user.id,
        name: user.name,
      }));
  }, [users]);

  const supervisorOptions = useMemo(
    () => [
      { value: "all", label: "Todos los supervisores" },
      ...supervisorsAndCoordinators.map((supervisor) => ({
        value: supervisor.id.toString(),
        label: supervisor.name,
      })),
    ],
    [supervisorsAndCoordinators]
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<OperationModel | undefined>(undefined);

  // Referencia para almacenar el valor anterior del filtro
  const prevStatusFilterRef = useRef<string>("all");
  const prevStartDateRef = useRef<string>("");
  const prevEndDateRef = useRef<string>("");
  const prevAreaFilterRef = useRef<string>("all");
  const prevSupervisorFilterRef = useRef<string>("all");

  // Obtener datos de operaciones del contexto
  const {
    operations,
    isLoading,
    error,
    refreshOperations,
    totalItems,
    filters,
    setFilters,
    setPage,
    createOperation
  } = useOperations();



  // Opciones para el filtro de estado
  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: OperationStatus.PENDING, label: "Pendientes" },
    { value: OperationStatus.INPROGRESS, label: "En curso" },
    { value: OperationStatus.COMPLETED, label: "Finalizadas" },
    { value: OperationStatus.CANCELED, label: "Canceladas" },
  ];

  // Opciones para el filtro de áreas
  const areaOptions = [
    { value: "all", label: "Todas las áreas" },
    ...(areas?.map((area) => ({
      value: area.id.toString(),
      label: area.name,
    })) || []),
  ];

  // Efecto para aplicar filtros cuando cambian
  useEffect(() => {
    // Verificar si algún filtro cambió realmente para evitar bucles
    const statusChanged = statusFilter !== prevStatusFilterRef.current;
    const startDateChanged = startDateFilter !== prevStartDateRef.current;
    const endDateChanged = endDateFilter !== prevEndDateRef.current;
    const areaChanged = areaFilter !== prevAreaFilterRef.current;
    const supervisorChanged =
      supervisorFilter !== prevSupervisorFilterRef.current;

    if (statusChanged || startDateChanged || endDateChanged || areaChanged || supervisorChanged) {
      console.log("[Operation] Cambios en filtros detectados");

      // Actualizar referencias a valores anteriores
      prevStatusFilterRef.current = statusFilter;
      prevStartDateRef.current = startDateFilter;
      prevEndDateRef.current = endDateFilter;
      prevAreaFilterRef.current = areaFilter;
      prevSupervisorFilterRef.current = supervisorFilter;

      // Crear una copia del objeto de filtros actual
      const newFilters = { ...filters };

      // Aplicar filtro de estado solo si no es "all"
      if (statusFilter && statusFilter !== "all") {
        console.log(`[Operation] Aplicando filtro de estado: ${statusFilter}`);
        newFilters.status = [statusFilter as any];
      } else {
        // Si es "all", quitar el filtro de estado
        if ("status" in newFilters) {
          delete newFilters.status;
          console.log("[Operation] Quitando filtro de estado");
        }
      }
      // Aplicar filtro de supervisor solo si no es "all"
      if (supervisorFilter && supervisorFilter !== "all") {
        console.log(
          `[Operation] Aplicando filtro de supervisor: ${supervisorFilter}`
        );
        newFilters.inChargedId = parseInt(supervisorFilter);
      } else {
        // Si es "all", quitar el filtro de supervisor
        if ("inChargedId" in newFilters) {
          delete newFilters.inChargedId;
          console.log("[Operation] Quitando filtro de supervisor");
        }
      }

      // Aplicar filtro de área solo si no es "all"
      if (areaFilter && areaFilter !== "all") {
        console.log(`[Operation] Aplicando filtro de área: ${areaFilter}`);
        newFilters.jobAreaId = parseInt(areaFilter);
      } else {
        // Si es "all", quitar el filtro de área
        if ("areaId" in newFilters) {
          delete newFilters.jobAreaId;
          console.log("[Operation] Quitando filtro de área");
        }
      }

      // Aplicar filtro de fecha de inicio
      if (startDateFilter) {
        console.log(
          `[Operation] Aplicando filtro de fecha inicio: ${startDateFilter}`
        );
        // Convertir el string de fecha a Date (el input date devuelve YYYY-MM-DD)
        newFilters.dateStart = parseISO(startDateFilter); // Convertir string a objeto Date
      } else {
        // Si está vacío, quitar el filtro
        if ("dateStart" in newFilters) {
          delete newFilters.dateStart;
          console.log("[Operation] Quitando filtro de fecha inicio");
        }
      }

      // Aplicar filtro de fecha de fin
      if (endDateFilter) {
        console.log(
          `[Operation] Aplicando filtro de fecha fin: ${endDateFilter}`
        );
        // Convertir el string de fecha a Date (el input date devuelve YYYY-MM-DD)
        newFilters.dateEnd = parseISO(endDateFilter); // Convertir string a objeto Date
      } else {
        // Si está vacío, quitar el filtro
        if ("dateEnd" in newFilters) {
          delete newFilters.dateEnd;
          console.log("[Operation] Quitando filtro de fecha fin");
        }
      }

      // Aplicar los filtros y volver a página 1
      setFilters(newFilters);
      setPage(1);
    }
  }, [statusFilter, startDateFilter, endDateFilter, setFilters, setPage]);

  const handleEditOperation = (operation: any) => {
    console.log("Editar operación:", operation);

    // Crear un objeto formateado con los campos correctos
    const formattedOperation = {
      ...operation,
      // Corregir campos de tiempo
      timeStart: operation.timeStrat || operation.timeStart || "",
      // Asegurarse de que los IDs estén correctamente mapeados
      id_client: operation.id_client || operation.client?.id,
      id_area: operation.jobArea?.id,
      id_task: operation.task?.id,
      // Formatear la fecha para que sea compatible con el input date
      dateStart: operation.dateStart ? new Date(operation.dateStart).toISOString().split('T')[0] : "",
      dateEnd: operation.dateEnd ? new Date(operation.dateEnd).toISOString().split('T')[0] : "",
      // Asegurarse de que zone sea string para los inputs
      zone: operation.zone?.toString(),
      // Mantener los grupos y trabajadores
      workerGroups: operation.workerGroups || [],
      inChargedIds: operation.inCharge?.map((s: any) => s.id) || []
    };

    setSelectedOperation(formattedOperation);
    setIsAddOpen(true);
  };

  // Actualizar la función handleSave para asegurar el formato correcto al enviar
  const handleSave = async (data: any, isEdit: boolean) => {
    try {
      // Formatear los datos antes de enviar
      const formattedData = {
        ...data,
        id: isEdit ? data.id : undefined,
        zone: parseInt(data.zone),
        id_client: parseInt(data.id_client),
        id_area: parseInt(data.id_area),
        id_task: parseInt(data.id_task),
        dateStart: data.dateStart,
        timeStart: data.timeStart || data.timeStrat, // Manejar ambos campos
        dateEnd: data.dateEnd || null,
        timeEnd: data.timeEnd || null,
        status: data.status || "PENDING",
        workerGroups: data.workerGroups || [],
        inChargedIds: data.inChargedIds || []
      };

      if (isEdit) {
        await operationService.updateOperation(data.id, formattedData);

        Swal.fire({
          title: 'Operación actualizada',
          text: 'La operación ha sido actualizada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6'
        });
      } else {
        await operationService.createOperation(formattedData);

        Swal.fire({
          title: 'Operación creada',
          text: 'La operación ha sido creada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6'
        });
      }

      await refreshOperations();
      setIsAddOpen(false);
      setSelectedOperation(undefined);
    } catch (error) {
      console.error("Error al guardar la operación:", error);

      Swal.fire({
        title: 'Error',
        text: isEdit
          ? 'Error al actualizar la operación. Inténtelo de nuevo.'
          : 'Error al crear la operación. Inténtelo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setStatusFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setAreaFilter("all");
    setSupervisorFilter("all");
  };

  // Filtrado adicional solo para búsqueda por término (los filtros de estado ya se aplican en el backend)
  const filteredOperations = operations.filter((operation) => {
    return (
      !searchTerm ||
      operation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.jobArea?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      operation.client?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      operation.motorShip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.id?.toString().includes(searchTerm)
    );
  });

  // Obtener etiqueta amigable para el estado
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case OperationStatus.PENDING:
        return "Pendiente";
      case OperationStatus.INPROGRESS:
        return "En Curso";
      case OperationStatus.COMPLETED:
        return "Finalizado";
      case OperationStatus.CANCELED:
        return "Cancelado";
      default:
        return status || "Desconocido";
    }
  };

  // Obtener nombre del área por ID
  const getAreaName = (areaId: string): string => {
    const area = areas?.find((a) => a.id.toString() === areaId);
    return area?.name || "Área desconocida";
  };

  const getSupervisorName = (supervisorId: string): string => {
    const supervisor = supervisorsAndCoordinators.find(
      (s) => s.id.toString() === supervisorId
    );
    return supervisor?.name || "Supervisor desconocido";
  };

  // Manejadores para ver, editar y eliminar operaciones
  const handleViewOperation = (operation: OperationModel) => {
    console.log("Ver detalles:", operation);
    // Implementar navegación a detalles o abrir modal
  };


  const handleDeleteOperation = (operation: OperationModel) => {
    if (
      window.confirm(
        `¿Estás seguro de eliminar la operación "${operation.name}"?`
      )
    ) {
      console.log("Eliminar operación:", operation.id);
      // Implementar eliminación
    }
  };
  // Columnas para exportación a Excel
  const exportColumns = getOperationExportColumns();

  // Verificar si hay filtros activos
  const hasActiveFilters =
    statusFilter !== "all" ||
    startDateFilter !== "" ||
    endDateFilter !== "" ||
    supervisorFilter !== "all" ||
    areaFilter !== "all";

  // Formatear fechas para mostrar
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      // El formato del input date es YYYY-MM-DD, lo convertimos a formato legible
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const refreshDataLocal = () => {
    console.log("Refrescar datos de operaciones");
    refreshOperations();
    refreshData();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        <SectionHeader
          title="Operaciones"
          subtitle="Gestión de operaciones, agrega, edita o elimina operaciones"
          btnAddText="Agregar Operación"
          handleAddArea={() => {
            console.log("Agregar operación****");
            setIsAddOpen(true);
          }}
          refreshData={() => Promise.resolve(refreshDataLocal())}
          loading={isLoading}
          exportData={filteredOperations}
          exportFileName="operaciones"
          exportColumns={exportColumns}
          currentView="operations"
        />

        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          startDateFilter={startDateFilter}
          setStartDateFilter={setStartDateFilter}
          endDateFilter={endDateFilter}
          setEndDateFilter={setEndDateFilter}
          areaFilter={areaFilter}
          setAreaFilter={setAreaFilter}
          areaOptions={areaOptions}
          statusOptions={statusOptions}
          supervisorFilter={supervisorFilter}
          setSupervisorFilter={setSupervisorFilter}
          supervisorOptions={supervisorOptions}
          clearAllFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          useDateRangeFilter={true}
        />
      </div>

      {/* Tabla de operaciones */}
      <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-white">
          <OperationList
            filteredOperations={filteredOperations}
            searchTerm={searchTerm}
            onView={handleViewOperation}
            onEdit={handleEditOperation}
            onDelete={handleDeleteOperation}
          />
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="text-sm text-blue-600 flex items-center flex-wrap gap-2">
          <div className="font-semibold">Filtros activos:</div>

          {statusFilter !== "all" && (
            <FilterTag
              label="Estado"
              value={getStatusLabel(statusFilter)}
              onRemove={() => setStatusFilter("all")}
            />
          )}

          {areaFilter !== "all" && (
            <FilterTag
              label="Área"
              value={getAreaName(areaFilter)}
              onRemove={() => setAreaFilter("all")}
            />
          )}

          {supervisorFilter !== "all" && (
            <FilterTag
              label="Supervisor"
              value={getSupervisorName(supervisorFilter)}
              onRemove={() => setSupervisorFilter("all")}
            />
          )}

          {startDateFilter && (
            <FilterTag
              label="Desde"
              value={formatDisplayDate(startDateFilter)}
              onRemove={() => setStartDateFilter("")}
            />
          )}

          {endDateFilter && (
            <FilterTag
              label="Hasta"
              value={formatDisplayDate(endDateFilter)}
              onRemove={() => setEndDateFilter("")}
            />
          )}

          <button
            className="ml-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
            onClick={clearAllFilters}
          >
            Limpiar todos
          </button>
        </div>
      )}

      {isAddOpen && (
        <AddOperationDialog
          open={isAddOpen}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedOperation(undefined);
            }
            setIsAddOpen(open);
          }}
          operation={selectedOperation}
          areas={areas || []}
          services={services || []}
          clients={clients || []}
          availableWorkers={workers || []}
          supervisors={users?.filter(u => u.occupation === 'SUPERVISOR' || u.occupation === "COORDINADOR") || []}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
