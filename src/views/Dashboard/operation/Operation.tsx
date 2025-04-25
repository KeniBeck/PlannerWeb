import { useState, useMemo } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { OperationList } from "@/components/ui/operations/OperationList";
import { useOperations } from "@/contexts/OperationContext";
import { Operation as OperationModel } from "@/core/model/operation";
import { FilterBar } from "@/components/custom/filter/FilterBarProps";
import { useAreas } from "@/contexts/AreasContext";
import { useUsers } from "@/contexts/UsersContext";
import { getOperationExportColumns } from "./OperationExportColumns";
import { AddOperationDialog } from "@/components/ui/operations/AddOperationDialog";
import { ViewOperationDialog } from "@/components/ui/operations/ViewOperationDialog";
import { useServices } from "@/contexts/ServicesContext";
import { useClients } from "@/contexts/ClientsContext";
import { useWorkers } from "@/contexts/WorkerContext";
import { operationService } from "@/services/operationService";
import Swal from "sweetalert2";
import { useOperationFilters } from "@/lib/hooks/useOperationFilters";
import { formatOperationForEdit } from "@/lib/utils/operationHelpers";
import { ActiveFilters } from "@/components/custom/filter/ActiveFilter";
import { set } from "date-fns";
import { DeactivateItemAlert } from "@/components/dialog/CommonAlertActive";
import { OperationCreateData } from "@/services/interfaces/operationDTO";

export default function Operation() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<
    OperationModel | undefined
  >(undefined);
  const [operationToActivate, setOperationToActivate] =
    useState<OperationModel | null>(null);
  const [viewOperation, setViewOperation] = useState<OperationModel | null>(
    null
  );
  // Contextos
  const { areas, refreshData } = useAreas();
  const { services } = useServices();
  const { clients } = useClients();
  const { workers } = useWorkers();
  const { users } = useUsers();
  const {
    operations,
    isLoading,
    refreshOperations,
    filters,
    setFilters,
    setPage,
    updateOperation,
  } = useOperations();

  // Extraer lógica de filtros a un hook personalizado
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    areaFilter,
    setAreaFilter,
    supervisorFilter,
    setSupervisorFilter,
    clearAllFilters,
    hasActiveFilters,
  } = useOperationFilters({ setFilters, setPage, filters });

  // Filtrar supervisores y coordinadores
  const supervisorsAndCoordinators = useMemo(() => {
    if (!users) return [];
    return users
      .filter(
        (user) =>
          user.occupation === "SUPERVISOR" || user.occupation === "COORDINADOR"
      )
      .map((user) => ({ id: user.id, name: user.name }));
  }, [users]);

  // Opciones para los filtros
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

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "PENDING", label: "Pendientes" },
    { value: "INPROGRESS", label: "En curso" },
    { value: "COMPLETED", label: "Finalizadas" },
    { value: "CANCELED", label: "Canceladas" },
  ];

  const areaOptions = useMemo(
    () => [
      { value: "all", label: "Todas las áreas" },
      ...(areas?.map((area) => ({
        value: area.id.toString(),
        label: area.name,
      })) || []),
    ],
    [areas]
  );

  // Filtrado adicional para búsqueda por término
  const filteredOperations = useMemo(() => {
    return operations.filter((operation) => {
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
  }, [operations, searchTerm]);

  // Funciones auxiliares para los filtros
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

  // Manejadores para acciones de operaciones
  const handleEditOperation = (operation: any) => {
    console.log("Editar operación:", operation);
    const formattedOperation = formatOperationForEdit(operation);
    setSelectedOperation(formattedOperation);
    setIsAddOpen(true);
  };

  const handleViewOperation = (operation: OperationModel) => {
    setViewOperation(operation);
    setIsViewOpen(true);
  };

  const handleDeleteOperation = (operation: OperationModel) => {
    setOperationToActivate(operation);
  };

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
        timeStart: data.timeStart || data.timeStrat,
        dateEnd: data.dateEnd || null,
        timeEnd: data.timeEnd || null,
        status: data.status || "PENDING",
        workerGroups: data.workerGroups || [],
        inChargedIds: data.inChargedIds || [],
        removedWorkerIds: data.removedWorkerIds || [],
        removedWorkerGroupIds: data.removedWorkerGroupIds || [],
      };

      if (isEdit) {
        await updateOperation(
          data.id,
          formattedData as OperationCreateData
        );
      } else {
        await operationService.createOperation(formattedData);
        Swal.fire({
          title: "Operación creada",
          text: "La operación ha sido creada correctamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#3085d6",
        });
      }

      await refreshOperations();
      setIsAddOpen(false);
      setSelectedOperation(undefined);
    } catch (error) {
      console.error("Error al guardar la operación:", error);
      Swal.fire({
        title: "Error",
        text: isEdit
          ? "Error al actualizar la operación. Inténtelo de nuevo."
          : "Error al crear la operación. Inténtelo de nuevo.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const refreshDataLocal = () => {
    console.log("Refrescar datos de operaciones");
    refreshOperations();
    refreshData();
  };

  const ConfirmToActive = async () => {
    if (!operationToActivate) return;
    console.log("Activar operación:", operationToActivate);
    await operationService
      .deleteOperation(operationToActivate.id)
      refreshDataLocal();
  }

  // Columnas para exportación a Excel
  const exportColumns = getOperationExportColumns();

  return (
    <>
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        <SectionHeader
          title="Operaciones"
          subtitle="Gestión de operaciones, agrega, edita o elimina operaciones"
          btnAddText="Agregar Operación"
          handleAddArea={() => setIsAddOpen(true)}
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
      <ActiveFilters
        hasActiveFilters={hasActiveFilters}
        statusFilter={statusFilter}
        areaFilter={areaFilter}
        supervisorFilter={supervisorFilter}
        startDateFilter={startDateFilter}
        endDateFilter={endDateFilter}
        clearAllFilters={clearAllFilters}
        setStatusFilter={setStatusFilter}
        setAreaFilter={setAreaFilter}
        setSupervisorFilter={setSupervisorFilter}
        setStartDateFilter={setStartDateFilter}
        setEndDateFilter={setEndDateFilter}
        getAreaName={getAreaName}
        getSupervisorName={getSupervisorName}
      />

      {/* Diálogo para agregar/editar operación */}
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
          supervisors={
            users?.filter(
              (u) =>
                u.occupation === "SUPERVISOR" || u.occupation === "COORDINADOR"
            ) || []
          }
          onSave={handleSave}
        />
      )}

      <ViewOperationDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        operation={viewOperation}
      />
    </div>

      <DeactivateItemAlert
      open={!!operationToActivate}
      onOpenChange={() => setOperationToActivate(null)}
      onConfirm={ConfirmToActive}
      itemName="operación"
      isLoading={isLoading}
      />
    </>
  );
}
