import { useState, useMemo } from "react";
import { Worker } from "@/core/model/worker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DataTable, TableColumn } from "../DataTable";

interface WorkersListProps {
  workers: Worker[];
  isLoading?: boolean;
  searchTerm?: string;
}

export function WorkersList({ workers, isLoading = false, searchTerm = '' }: WorkersListProps) {
  // Estados para manejar la paginación interna
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Configuración de estados de trabajador para estilos
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "AVALIABLE":
        return {
          label: "Disponible",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
        };
      case "ASSIGNED":
        return {
          label: "Asignado",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
        };
      case "DEACTIVATED":
        return {
          label: "Retirado",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
        };
      case "DISABLE":
        return {
          label: "Deshabilitado",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
        };
      case "INCAPACITATED":
        return {
          label: "Incapacitado",
          bgColor: "bg-purple-100",
          textColor: "text-purple-800",
          borderColor: "border-purple-200",
        };
      default:
        return {
          label: "Desconocido",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
        };
    }
  };

  // Definir columnas usando useMemo
  const columns: TableColumn<Worker>[] = useMemo(
    () => [
      {
        header: "Código",
        accessor: "code",
        className: "font-medium",
      },
      {
        header: "Nombre",
        accessor: "name",
      },
      {
        header: "Teléfono",
        accessor: "phone",
      },
      {
        header: "DNI",
        accessor: "dni",
      },
      {
        header: "Fecha Inicio",
        accessor: "createAt",
        cell: (worker) =>
          worker.createAt
            ? format(new Date(worker.createAt), "dd/MM/yyyy", { locale: es })
            : "N/A",
      },
      {
        header: "Área",
        accessor: "jobArea.name",
        cell: (worker) => (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
            {worker.jobArea?.name || "Sin área"}
          </div>
        ),
      },
      {
        header: "Estado",
        accessor: "status",
        cell: (worker) => {
          const statusConfig = getStatusConfig(worker.status);
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}
            >
              {statusConfig.label}
            </span>
          );
        },
      },
    ],
    []
  );

  // Manejadores para la paginación interna
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset a la primera página al cambiar items por página
  };

  return (
    <div className="w-full">
      <DataTable
        data={workers}
        columns={columns}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10, 20, 30, 50]}
        itemName="trabajadores"
        isLoading={isLoading}
        emptyMessage={
          searchTerm
            ? `No se encontraron trabajadores para "${searchTerm}"`
            : "No hay trabajadores registrados"
        }
        className="mb-4"
        initialSort={{ key: "code", direction: "asc" }}
        // Usamos paginación interna (no externa), así que no necesitamos estas props
        externalPagination={false}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        currentPage={currentPage}
        totalItems={workers.length}
        emptyIcon={
          <svg
            className="h-12 w-12 text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
        }
      />
    </div>
  );
}