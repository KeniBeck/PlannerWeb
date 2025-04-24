import { useState, useMemo } from "react";
import { Worker, WorkerStatus } from "@/core/model/worker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DataTable, TableColumn, TableAction } from "../DataTable";
import { BsPencil, BsTrash, BsCheckCircle, BsXCircle } from "react-icons/bs";
import { FiRefreshCw } from "react-icons/fi";
import Swal from "sweetalert2";

interface WorkersListProps {
  workers: Worker[];
  isLoading?: boolean;
  searchTerm?: string;
  onEdit?: (worker: Worker) => void;
  onActivate?: (worker: Worker) => void;
  onDeactivate?: (worker: Worker) => void;
}

export function WorkersList({ 
  workers, 
  isLoading = false, 
  searchTerm = '', 
  onEdit,
  onActivate,
  onDeactivate 
}: WorkersListProps) {
  // Estados para manejar la paginación interna
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Configuración de estados de trabajador para estilos
  const getStatusConfig = (status: string) => {
    switch (status) {
      case WorkerStatus.AVAILABLE:
        return {
          label: "Disponible",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
        };
      case WorkerStatus.ASSIGNED:
        return {
          label: "Asignado",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
        };
      case WorkerStatus.DEACTIVATED:
        return {
          label: "Retirado",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
        };
      case WorkerStatus.UNAVAILABLE:
        return {
          label: "Deshabilitado",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
        };
      case WorkerStatus.INCAPACITATED:
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

  // Manejadores para acciones confirmadas
  const handleEdit = (worker: Worker) => {
    if (onEdit) onEdit(worker);
  };

  const handleDeactivate = (worker: Worker) => {
    if (!onDeactivate) return;
    
    Swal.fire({
      title: '¿Desactivar trabajador?',
      html: `¿Estás seguro de que deseas desactivar a <strong>${worker.name}</strong>?<br/><br/><span class="text-sm text-gray-600">El trabajador no podrá ser asignado a nuevas operaciones.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        onDeactivate(worker);
      }
    });
  };
  
  const handleActivate = (worker: Worker) => {
    if (!onActivate) return;
    
    Swal.fire({
      title: '¿Activar trabajador?',
      html: `¿Estás seguro de que deseas activar a <strong>${worker.name}</strong>?<br/><br/><span class="text-sm text-gray-600">El trabajador volverá a estar disponible para ser asignado.</span>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6b7280'
    }).then((result) => {
      if (result.isConfirmed) {
        onActivate(worker);
      }
    });
  };

  // Definir acciones dinámicamente según el estado del trabajador
  const getActionsForWorker = (worker: Worker): TableAction<Worker>[] => {
    const actions: TableAction<Worker>[] = [
      {
        label: "Editar",
        icon: <BsPencil className="h-4 w-4" />,
        onClick: handleEdit,
        className: "text-blue-600",
      }
    ];
    
    // Agregar acción según estado
    if (worker.status === WorkerStatus.DEACTIVATED) {
      actions.push({
        label: "Activar",
        icon: <BsCheckCircle className="h-4 w-4" />,
        onClick: handleActivate,
        className: "text-green-600",
      });
    } else {
      actions.push({
        label: "Desactivar",
        icon: <BsXCircle className="h-4 w-4" />,
        onClick: handleDeactivate,
        className: "text-red-600",
      });
    }
    
    return actions;
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