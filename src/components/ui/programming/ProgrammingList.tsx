import { Programming } from "@/core/model/programming";
import {
  BsCheckCircle,
  BsXCircle,
  BsClockHistory,
} from "react-icons/bs";
import { FaRegFileExcel } from "react-icons/fa";
import { formatDate } from "@/lib/utils/formatDate";
import { DeleteItemAlert } from "@/components/dialog/CommonAlertActive";
import { useProgrammingList } from "@/lib/hooks/useProgrammingList";
import { DataTable, TableColumn, TableAction } from "@/components/ui/DataTable";
import { FilterBar } from "@/components/custom/filter/FilterBarProps";

interface ProgrammingListProps {
  programmingData: Programming[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  onFiltersChange: (
    searchTerm: string,
    dateFilter: string,
    statusFilter?: string
  ) => Promise<void>;
  onClearFilters: () => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

export function ProgrammingList({
  programmingData,
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  isLoading,
  onFiltersChange,
  onClearFilters,
  onDelete,
}: ProgrammingListProps) {
  // Usar el hook personalizado
  const {
    statusFilter,
    setStatusFilter,
    searchInput,
    setSearchInput,
    hasActiveFilters,
    deleteModalOpen,
    setDeleteModalOpen,
    itemToDelete,
    isDeleting,
    handleSearchSubmit,
    handleDelete,
    confirmDelete,
    cancelDelete,
    handleDateChange,
    clearFilters,
  } = useProgrammingList({
    dateFilter,
    setDateFilter,
    searchTerm,
    setSearchTerm,
    onFiltersChange,
    onClearFilters,
    onDelete,
  });

  // Obtener configuración de estado
  const getStatusConfig = (status: string | undefined) => {
    switch (status) {
      case "COMPLETE":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
          icon: <BsCheckCircle className="w-4 h-4 mr-1.5 text-green-600" />,
          label: "Completado",
        };
      case "UNASSIGNED":
        return {
          bgColor: "bg-amber-100",
          textColor: "text-amber-800",
          borderColor: "border-amber-200",
          icon: <BsClockHistory className="w-4 h-4 mr-1.5 text-amber-600" />,
          label: "Incompleto",
        };
      case "ASSIGNED":
        return {
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
          icon: <BsCheckCircle className="w-4 h-4 mr-1.5 text-blue-600" />,
          label: "Asignado",
        };
      case "CANCELED":
        return {
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
          icon: <BsXCircle className="w-4 h-4 mr-1.5 text-red-600" />,
          label: "Cancelado",
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          icon: <BsClockHistory className="w-4 h-4 mr-1.5 text-gray-600" />,
          label: status || "Desconocido",
        };
    }
  };

  const columns: TableColumn<Programming>[] = [
    {
      header: "ID",
      accessor: "id",
      sortable: true,
      className: "font-medium text-gray-900"
    },
    {
      header: "Solicitud",
      accessor: "service_request",
      sortable: true,
      className: "max-w-[150px] truncate",
      cell: (item) => item.service_request || "-"
    },
    {
      header: "Servicio",
      accessor: "service",
      sortable: true
    },
    {
      header: "Fecha",
      accessor: "dateStart",
      sortable: true,
      cell: (item) => formatDate(item.dateStart)
    },
    {
      header: "Hora",
      accessor: "timeStart",
      sortable: true,
      cell: (item) => item.timeStart || "-"
    },
    {
      header: "Ubicación",
      accessor: "ubication",
      sortable: true,
      className: "max-w-[150px] truncate"
    },
    {
      header: "Cliente",
      accessor: "client",
      sortable: true,
      className: "max-w-[150px] truncate"
    },
    {
      header: "Estado",
      accessor: "status",
      sortable: true,
      cell: (item) => {
        const statusConfig = getStatusConfig(item.status);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        );
      }
    }
  ];

  const actions: TableAction<Programming>[] = onDelete ? [
    {
      icon: <BsXCircle className="h-4 w-4 text-red-600" />,
      label: "Eliminar programación",
      onClick: handleDelete,
    }
  ] : [];

  const statusOptions = [
    { label: "Todos", value: "all" },
    { label: "Completado", value: "COMPLETE" },
    { label: "Incompleto", value: "UNASSIGNED" },
    { label: "Asignado", value: "ASSIGNED" },
    { label: "Cancelado", value: "CANCELED" },
  ];

  // Funciones adaptadas para el FilterBar
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
 if (value === "") {
    // Si el campo se vacía, hacer la búsqueda inmediatamente
    setSearchTerm("");
    onFiltersChange(
      "",
      dateFilter,
      statusFilter !== "all" ? statusFilter : undefined
    );
  }
  };

  const handleSearchSubmitFromBar = () => {
    handleSearchSubmit();
  };

  // Ensure all items have a valid id by providing a fallback for undefined ids
  const filteredData = programmingData.map(item => ({
    ...item,
    id: item.id ?? 0 // Use 0 as fallback if id is undefined
  }));

  return (
    <div className="space-y-6">
      {/* Panel de búsqueda y filtros */}
      <div className="bg-white border border-gray-200 rounded-t-xl shadow-sm">
        <FilterBar
          searchTerm={searchInput} // Usar el estado interno del hook
          setSearchTerm={handleSearchChange} // Función adaptada
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          startDateFilter={dateFilter}
          setStartDateFilter={handleDateChange} // Usar la función del hook
          endDateFilter=""
          setEndDateFilter={() => {}}
          areaFilter="all"
          setAreaFilter={() => {}}
          statusOptions={statusOptions}
          areaOptions={[]} // Array vacío para no mostrar área
          clearAllFilters={clearFilters} // Usar la función del hook
          hasActiveFilters={hasActiveFilters}
          useDateRangeFilter={false}
          searchPlaceholder="Buscar por servicio, cliente o ubicación"
          onSearchSubmit={handleSearchSubmitFromBar}
        />
      </div>

      {/* Tabla de programación */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          actions={actions}
          itemsPerPage={50}
          itemsPerPageOptions={[25, 50, 100, 200]}
          itemName="programaciones"
          isLoading={isLoading}
          emptyMessage={
            hasActiveFilters || searchTerm
              ? "No se encontraron resultados con los filtros aplicados"
              : "Aún no hay programación registrada. Importe desde Excel para comenzar."
          }
          emptyIcon={<FaRegFileExcel className="h-16 w-16 text-gray-300 mb-4" />}
          initialSort={{ key: 'dateStart', direction: 'asc' }}
          className="rounded-xl"
        />
      </div>

      <DeleteItemAlert
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isDeleting}
        itemName={`programación "${itemToDelete?.name}"`}
      />
    </div>
  );
}