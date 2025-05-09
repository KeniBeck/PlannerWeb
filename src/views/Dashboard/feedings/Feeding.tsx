import { useState, useMemo } from "react";
import { useFeedings } from "@/contexts/FeedingContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DataTable, TableColumn, TableAction } from "@/components/ui/DataTable";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { FeedingFilterBar } from "@/components/ui/feedings/FeedingFilterBar";
import { BsEye, BsTrash } from "react-icons/bs";
import type { Feeding } from "@/services/feedingService";
import { determineEligibleFoods } from "@/lib/utils/feedingutils";
import Swal from 'sweetalert2';
import { ViewFeedingDialog } from "@/components/ui/feedings/ViewFeedingDialog";

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
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeeding, setSelectedFeeding] = useState<Feeding | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Filtrar alimentaciones según el término de búsqueda
  const filteredFeedings = useMemo(() => {
    if (!searchTerm) return feedings;
    
    return feedings.filter(feeding => 
      feeding.workerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeding.operationDetails?.jobArea?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeding.operationDetails?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeding.operationDetails?.motorShip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeding.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [feedings, searchTerm]);

  // Manejar la visualización de detalles
  const handleViewFeeding = (feeding: Feeding) => {
    setSelectedFeeding(feeding);
    setIsViewDialogOpen(true);
  };

  // Manejar la eliminación
  const handleDeleteFeeding = (feeding: Feeding) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar este registro de alimentación de ${feeding.workerName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await deleteFeeding(feeding.id);
        if (success) {
          Swal.fire('Eliminado', 'El registro ha sido eliminado correctamente', 'success');
        }
      }
    });
  };

  // Definir las columnas para la tabla
  const columns: TableColumn<Feeding>[] = useMemo(
    () => [
      {
        header: "ID",
        accessor: "id",
        className: "font-medium",
      },
      {
        header: "Trabajador",
        accessor: "workerName",
      },
      {
        header: "Área",
        accessor: "operationDetails.jobArea.name",
        cell: (feeding) => (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
            {feeding.operationDetails?.jobArea?.name || "Sin área"}
          </div>
        ),
      },
      {
        header: "Cliente",
        accessor: "operationDetails.client.name",
        cell: (feeding) => feeding.operationDetails?.client?.name || "Sin cliente",
      },
      {
        header: "Embarcación",
        accessor: "operationDetails.motorShip",
        cell: (feeding) => feeding.operationDetails?.motorShip || "Sin embarcación",
      },
      {
        header: "Tipo Alimentación",
        accessor: "type",
        cell: (feeding) => {
          let bgColor = "bg-gray-100";
          let textColor = "text-gray-800";
          let borderColor = "border-gray-200";

          switch (feeding.type) {
            case "Desayuno":
              bgColor = "bg-yellow-100";
              textColor = "text-yellow-800";
              borderColor = "border-yellow-200";
              break;
            case "Almuerzo":
              bgColor = "bg-blue-100";
              textColor = "text-blue-800";
              borderColor = "border-blue-200";
              break;
            case "Cena":
              bgColor = "bg-indigo-100";
              textColor = "text-indigo-800";
              borderColor = "border-indigo-200";
              break;
            case "Media noche":
              bgColor = "bg-purple-100";
              textColor = "text-purple-800";
              borderColor = "border-purple-200";
              break;
          }

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${bgColor} ${textColor} border ${borderColor}`}
            >
              {feeding.type}
            </span>
          );
        },
      },
      {
        header: "Fecha",
        accessor: "createdAt",
        cell: (feeding) =>
          feeding.createdAt
            ? format(new Date(feeding.createdAt), "dd/MM/yyyy", { locale: es })
            : "N/A",
      },
      {
        header: "Hora",
        accessor: "createdAt",
        cell: (feeding) =>
          feeding.createdAt
            ? format(new Date(feeding.createdAt), "HH:mm", { locale: es })
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
      {
        label: "Eliminar",
        icon: <BsTrash className="h-4 w-4" />,
        onClick: handleDeleteFeeding,
        className: "text-red-600",
      },
    ],
    []
  );

  // Definir las columnas para exportar a Excel
  const exportColumns: ExcelColumn[] = useMemo(
    () => [
      { header: "ID", field: "id" },
      { header: "Trabajador", field: "workerName" },
      { header: "Operación ID", field: "operationId" },
      { header: "Área", field: "operationDetails.jobArea.name" },
      { header: "Cliente", field: "operationDetails.client.name" },
      { header: "Embarcación", field: "operationDetails.motorShip" },
      { header: "Tipo Alimentación", field: "type" },
      {
        header: "Fecha",
        field: "createdAt",
        value: (feeding) =>
          feeding.createdAt
            ? format(new Date(feeding.createdAt), "dd/MM/yyyy", { locale: es })
            : "N/A",
      },
      {
        header: "Hora",
        field: "createdAt",
        value: (feeding) =>
          feeding.createdAt
            ? format(new Date(feeding.createdAt), "HH:mm", { locale: es })
            : "N/A",
      },
    ],
    []
  );

  return (
    <>
      <div className="container mx-auto py-6 space-y-6">
        <div className="rounded-xl shadow-md">
          <SectionHeader
            title="Alimentación"
            subtitle="Registro de alimentación proporcionada a trabajadores"
            btnAddText=""
            handleAddArea={() => {}}
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
              isLoading={isLoading}
              itemsPerPage={10}
              itemName="registros de alimentación"
              initialSort={{ key: "createdAt", direction: "desc" }}
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