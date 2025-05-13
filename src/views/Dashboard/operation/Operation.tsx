import { useState, useEffect, useMemo } from "react";
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
import { Operation as OperationType } from "@/core/model/operation";

export default function Operation() {
  // Contextos
  const {
    operations: contextOperations,
    isLoading,
    refreshOperations,
    filters,
    setFilters,
    setPage,
    updateOperation,
    fetchAllOperations
  } = useOperations();
  
  // Estado local para almacenar todas las operaciones sin paginación
  const [allOperations, setAllOperations] = useState<OperationType[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);

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

  // Cargar todas las operaciones una vez al inicio
  useEffect(() => {
    const loadAllOperations = async () => {
      setLoadingAll(true);
      try {
        // Usar los mismos filtros que se aplican en el contexto
        const operations = await fetchAllOperations(filters);
        setAllOperations(operations);
      } catch (error) {
        console.error("Error cargando todas las operaciones:", error);
      } finally {
        setLoadingAll(false);
      }
    };
    
    loadAllOperations();
  }, [filters]); // Re-ejecutar cuando cambien los filtros

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
    refreshOperations: async () => {
      await refreshOperations();
      // Después de refrescar los datos en el contexto, actualizamos nuestro estado local
      const operations = await fetchAllOperations(filters);
      setAllOperations(operations);
    },
    updateOperation: wrappedUpdateOperation
  });

  const { exportOperationsByWorker, isExporting } = useOperationExport(workers);

  // Refresh local data
  const refreshDataLocal = async () => {
    await refreshOperations();
    // Actualizar también los datos completos
    const operations = await fetchAllOperations(filters);
    setAllOperations(operations);
    refreshData();
  };

  // Opciones y filtros (sin cambios)
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

  // Filtrados - Aplicamos los filtros localmente a todas las operaciones
  const filteredOperations = useMemo(() => {
    if (!allOperations.length) return [];
    
    return allOperations.filter(operation => {
      // Primero filtrar por término de búsqueda
      const matchesSearch = 
        !searchTerm ||
        operation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.jobArea?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.motorShip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.id?.toString().includes(searchTerm);
      
      if (!matchesSearch) return false;
      
      // Filtrar por estado si se aplica
      if (statusFilter !== "all" && operation.status !== statusFilter) {
        return false;
      }
      
      // Filtrar por área si se aplica
      if (areaFilter !== "all" && operation.jobArea?.id.toString() !== areaFilter) {
        return false;
      }
      
      // Filtrar por supervisor si se aplica
      if (supervisorFilter !== "all") {
        // Verificar que la operación tenga supervisores
        if (!operation.inCharge || !Array.isArray(operation.inCharge)) {
          return false;
        }
        
        // Buscar si alguno de los supervisores coincide con el filtro
        const hasSupervisor = operation.inCharge.some(
          supervisor => supervisor.id.toString() === supervisorFilter
        );
        
        if (!hasSupervisor) {
          return false;
        }
      }
      
      // Filtrar por fecha de inicio si se aplica
      if (startDateFilter) {
        const operationDate = new Date(operation.dateStart);
        const filterDate = new Date(startDateFilter);
        
        // Resetear las horas para comparar solo fechas
        operationDate.setHours(0, 0, 0, 0);
        filterDate.setHours(0, 0, 0, 0);
        
        if (operationDate < filterDate) {
          return false;
        }
      }
      
      // Filtrar por fecha de fin si se aplica
      if (endDateFilter) {
        const operationDate = new Date(operation.dateStart);
        const filterDate = new Date(endDateFilter);
        
        // Resetear las horas para comparar solo fechas
        operationDate.setHours(0, 0, 0, 0);
        filterDate.setHours(0, 0, 0, 0);
        
        if (operationDate > filterDate) {
          return false;
        }
      }
      
      // Si pasó todos los filtros, incluir esta operación
      return true;
    });
  }, [allOperations, searchTerm, statusFilter, areaFilter, supervisorFilter, startDateFilter, endDateFilter]);

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
    {(isExporting || loadingAll) && <ShipLoader/>}
      <div className="container mx-auto py-6 space-y-6">
        <div className="rounded-xl shadow-md">
          <SectionHeader
            title="Operaciones"
            subtitle="Gestión de operaciones, agrega, edita o elimina operaciones"
            btnAddText="Agregar Operación"
            handleAddArea={() => setIsAddOpen(true)}
            refreshData={() => Promise.resolve(refreshDataLocal())}
            loading={isLoading || loadingAll}
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
              allOperations={filteredOperations}
              searchTerm={searchTerm}
              onView={handleViewOperation}
              onEdit={handleEditOperation}
              onDelete={handleDeleteOperation}
              isLoading={isLoading || loadingAll}
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