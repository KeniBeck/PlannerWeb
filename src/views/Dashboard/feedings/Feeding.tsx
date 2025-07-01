import { useMemo } from "react";
import { format, isWithinInterval, parseISO } from "date-fns";
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

  // Función para obtener el servicio del grupo que coincide con la fecha/hora de la alimentación
  const getServiceName = useMemo(() => {
    return (feeding: Feeding) => {
      
      const workerGroups = feeding?.enhancedOperation?.workerGroups;

      if (!workerGroups || workerGroups.length === 0) {
        return {
          serviceName: feeding.enhancedOperation?.task?.name || "Sin servicio",
          isFromGroup: false
        };
      }

      // Buscar el primer grupo que contenga al trabajador
      for (const group of workerGroups) {
        
        // Verificar si el trabajador está en este grupo
        const isWorkerInGroup = group.workers?.some((worker: any) => {
          const workerId = worker.id || worker.workerId || worker;
          const isMatch = Number(workerId) === Number(feeding.id_worker);
          return isMatch;
        });

        if (!isWorkerInGroup) {
          continue;
        }


        // Si encontramos al trabajador en el grupo, obtener el servicio
        const serviceName = group.schedule?.task || 
                           (group.schedule?.id_task ? `Servicio ID: ${group.schedule.id_task}` : null) ||
                           "Servicio del grupo";

        return {
          serviceName,
          isFromGroup: true
        };
      }

      console.log("No se encontró al trabajador en ningún grupo, usando servicio general");
      return {
        serviceName: feeding.enhancedOperation?.task?.name || "Sin servicio",
        isFromGroup: false
      };
    };
  }, [filteredFeedings]); // Agregar dependencia de los datos

  // Función para manejar la exportación
  const handleExport = () => {
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
            {feeding.worker?.name}
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
        header: "Servicio",
        accessor: "service",
        cell: (feeding: Feeding) => {
          const serviceInfo = getServiceName(feeding);

          return (
            <div className="flex items-center">
              <span className={serviceInfo.serviceName === "Sin servicio" ? "text-gray-400 italic" : ""}>
                {serviceInfo.serviceName}
              </span>
             
            </div>
          );
        }
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
        cell: (feeding: Feeding) =>
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
    [getServiceName] // Agregar dependencia
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
    [handleViewFeeding]
  );

  const enhancedFeedingWithService = useMemo(() => {
    if (!selectedFeeding) return null;
    return {
      ...selectedFeeding,
      enhancedOperation: {
        ...selectedFeeding.enhancedOperation,
        serviceName: getServiceName(selectedFeeding)?.serviceName || "Sin servicio"
      }
    };
  }, [selectedFeeding, getServiceName]);

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
            exportData={filteredFeedings}
            exportFileName="registros_alimentacion"
            currentView="food"
            showAddButton={false}
            customExportFunction={handleExport}
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
              totalItems={totalItems}
              currentPage={currentPage}
              onPageChange={setPage}
            />
      {/* Dialog para ver detalles */}
      <ViewFeedingDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        feeding={enhancedFeedingWithService || selectedFeeding}
        serviceName={enhancedFeedingWithService?.enhancedOperation?.serviceName || "Sin servicio"}
      />

          </div>
        </div>
      </div>
    </>
  );
}