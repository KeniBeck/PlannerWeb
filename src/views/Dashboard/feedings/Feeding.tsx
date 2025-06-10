import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DataTable, TableColumn, TableAction } from "@/components/ui/DataTable";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { FeedingFilterBar } from "@/components/ui/feedings/FeedingFilterBar";
import { BsEye } from "react-icons/bs";
import type { Feeding } from "@/services/interfaces/feedingDTO"; 
import { ViewFeedingDialog } from "@/components/ui/feedings/ViewFeedingDialog";
import { useFeeding } from "@/lib/hooks/useFeeding";
import { useFeedingExport } from "@/lib/hooks/useFeedingExport";
import { ShipLoader } from "@/components/dialog/Loading";

export default function Feeding() {
  const {
    feedings,
    filteredFeedings,
    isLoading,
    loadingOperations,
    searchTerm,
    selectedFeeding,
    isViewDialogOpen,
    filters,
    setSearchTerm,
    setIsViewDialogOpen,
    setFilters,
    refreshFeedings,
    handleViewFeeding,
    getWorkerNameById,
    // Propiedades de paginación
    totalItems,
    currentPage,
    totalPages,
    itemsPerPage,
    setPage,
    setItemsPerPage,
    // Funciones para filtros
    applyFeedingTypeFilter,
    applyDateFilters,
    clearAllFilters
  } = useFeeding();

  // Usar el hook de exportación
  const { exportFeedings, isExporting } = useFeedingExport(getWorkerNameById);

  // Función para manejar la exportación
  const handleExport = () => {
    console.log('[Feeding] Iniciando exportación con filtros:', filters);
    exportFeedings(filters);
  };

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
        accessor: "worker.name",
        cell: (feeding) => (
          <div className="flex items-center">
            {feeding.worker?.name }
          </div>
        ),
      },
      {
        header: "Operación",
        accessor: "id_operation",
        cell: (feeding) => (
          <div className="flex items-center">
            <span>#{feeding.id_operation}</span>
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
    []
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
        field: "worker.name",
        value: (feeding) => getWorkerNameById(feeding.worker.name)
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
    []
  );

  return (
    <>
      {/* Mostrar indicador de carga durante la exportación */}
      {isExporting && <ShipLoader />}
    
      <div className="container mx-auto py-6 space-y-6">
        <div className="rounded-xl shadow-md">
          <SectionHeader
            title="Alimentación"
            subtitle="Registro de alimentación proporcionada a trabajadores"
            btnAddText=""
            handleAddArea={() => { }}
            refreshData={() => Promise.resolve(refreshFeedings())}
            loading={isLoading || isExporting}
            exportData={filteredFeedings} // Estos datos no se usarán con customExportFunction
            exportFileName="registros_alimentacion"
            exportColumns={exportColumns}
            currentView="food"
            showAddButton={false}
            customExportFunction={handleExport} // Usamos nuestra función personalizada
          />

          {/* Filtros */}
          <FeedingFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
            applyTypeFilter={applyFeedingTypeFilter}
            applyDateFilters={applyDateFilters}
            clearAllFilters={clearAllFilters}
          />
        </div>

        {/* Tabla de alimentación */}
        <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-white">
            <DataTable
              data={filteredFeedings}
              columns={columns}
              actions={actions}
              isLoading={isLoading || loadingOperations}
              itemsPerPage={itemsPerPage}
              itemName="registros de alimentación"
              initialSort={{ key: "createAt", direction: "desc" }}
              emptyMessage={
                filters.search
                  ? `No se encontraron registros para "${filters.search}"`
                  : "No hay registros de alimentación"
              }
              // Estas propiedades son para la paginación
              totalItems={totalItems}
              currentPage={currentPage}
              onPageChange={setPage}
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