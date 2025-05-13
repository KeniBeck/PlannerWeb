import { useMemo } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { OperationList } from "@/components/ui/operations/OperationList";
import { useOperations } from "@/contexts/OperationContext";
import { FilterBar } from "@/components/custom/filter/FilterBarProps";
import { useAreas } from "@/contexts/AreasContext";
import { useUsers } from "@/contexts/UsersContext";
import { getOperationExportColumns } from "./OperationExportColumns";
import { AddOperationDialog } from "@/components/ui/operations/AddOperationDialog";
import { ViewOperationDialog } from "@/components/ui/operations/ViewOperationDialog";
import { useServices } from "@/contexts/ServicesContext";
import { useClients } from "@/contexts/ClientsContext";
import { useWorkers } from "@/contexts/WorkerContext";
import { useOperationFilters } from "@/lib/hooks/useOperationFilters";
import { ActiveFilters } from "@/components/custom/filter/ActiveFilter";
import { DeactivateItemAlert } from "@/components/dialog/CommonAlertActive";
import { useOperationManagement } from "@/lib/hooks/useOperationManagement";
import { useOperationExport } from "@/lib/hooks/useOperationExport";
import { ShipLoader } from "@/components/dialog/Loading";

export default function Operation() {
  // Contextos
  const {
    operations,
    isLoading,
    refreshOperations,
    filters,
    setFilters,
    setPage,
    updateOperation,
  } = useOperations();
  const { areas, refreshData } = useAreas();
  const { services } = useServices();
  const { clients } = useClients();
  const { workers } = useWorkers();
  const { users } = useUsers();

  // Hooks personalizados
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

  // Crear un wrapper para updateOperation que maneje tanto string como number
  const wrappedUpdateOperation = (id: number | string, data: any) => {
    return updateOperation(Number(id), data);
  };

  const {
    isAddOpen,
    setIsAddOpen,
    isViewOpen,
    setIsViewOpen,
    selectedOperation,
    setSelectedOperation,
    operationToActivate,
    setOperationToActivate,
    viewOperation,
    handleEditOperation,
    handleViewOperation,
    handleDeleteOperation,
    handleSave,
    confirmDelete
  } = useOperationManagement({
    refreshOperations,
    updateOperation: wrappedUpdateOperation
  });

  const { exportOperationsByWorker, isExporting } = useOperationExport(workers);

  // Refresh local data
  const refreshDataLocal = () => {
    refreshOperations();
    refreshData();
  };

  // Opciones y filtros
  const supervisorsAndCoordinators = useMemo(() => {
    if (!users) return [];
    return users
      .filter(user => ["SUPERVISOR", "COORDINADOR"].includes(user.occupation || ""))
      .map(user => ({ id: user.id, name: user.name }));
  }, [users]);

  const supervisorOptions = useMemo(() => [
    { value: "all", label: "Todos los supervisores" },
    ...supervisorsAndCoordinators.map(supervisor => ({
      value: supervisor.id.toString(),
      label: supervisor.name,
    })),
  ], [supervisorsAndCoordinators]);

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "PENDING", label: "Pendientes" },
    { value: "INPROGRESS", label: "En curso" },
    { value: "COMPLETED", label: "Finalizadas" },
    { value: "CANCELED", label: "Canceladas" },
  ];

  const areaOptions = useMemo(() => [
    { value: "all", label: "Todas las áreas" },
    ...(areas?.map(area => ({
      value: area.id.toString(),
      label: area.name,
    })) || []),
  ], [areas]);

  // Filtrados
  const filteredOperations = useMemo(() => {
    return operations.filter(operation => {
      return (
        !searchTerm ||
        operation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.jobArea?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.motorShip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.id?.toString().includes(searchTerm)
      );
    });
  }, [operations, searchTerm]);

  // Funciones auxiliares
  const getAreaName = (areaId: string): string => {
    const area = areas?.find(a => a.id.toString() === areaId);
    return area?.name || "Área desconocida";
  };

  const getSupervisorName = (supervisorId: string): string => {
    const supervisor = supervisorsAndCoordinators.find(
      s => s.id.toString() === supervisorId
    );
    return supervisor?.name || "Supervisor desconocido";
  };

  // Columnas para exportación
  const exportColumns = getOperationExportColumns();

  // Manejar exportación personalizada
  const handleExport = () => {
    exportOperationsByWorker(filters, searchTerm);
  };

  return (
    <>
    {isExporting && <ShipLoader/>}
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
            customExportFunction={handleExport}
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
      </div>

      {/* Diálogos y modales */}
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
          supervisors={users?.filter(u => ["SUPERVISOR", "COORDINADOR"].includes(u.occupation || "")) || []}
          onSave={handleSave}
        />
      )}

      <ViewOperationDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        operation={viewOperation}
      />

      <DeactivateItemAlert
        open={!!operationToActivate}
        onOpenChange={() => setOperationToActivate(null)}
        onConfirm={confirmDelete}
        itemName="operación"
        isLoading={isLoading}
      />
    </>
  );
}