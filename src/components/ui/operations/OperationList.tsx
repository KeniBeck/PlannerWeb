import { useMemo, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BsEye,
  BsPencil,
  BsTrash,
} from "react-icons/bs";
import { Operation } from "@/core/model/operation";
import { DataTable, TableColumn, TableAction } from "../DataTable";

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

interface OperationListProps {
  allOperations: Operation[];
  searchTerm?: string;
  onView?: (operation: Operation) => void;
  onEdit?: (operation: Operation) => void;
  onDelete?: (operation: Operation) => void;
  isLoading?: boolean;
}

export function OperationList({
  allOperations,
  searchTerm,
  onView,
  onEdit,
  onDelete,
  isLoading = false
}: OperationListProps) {
  // Estados para manejar la paginación local
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const prevSearchTermRef = useRef<string | undefined>(undefined);

  // Efecto mejorado para resetear a la primera página cuando cambia el término de búsqueda
  useEffect(() => {
    // Solo resetear si el término de búsqueda ha cambiado (no en el montaje inicial)
    if (prevSearchTermRef.current !== searchTerm) {
      console.log(`Término de búsqueda cambiado de "${prevSearchTermRef.current}" a "${searchTerm}"`);
      setCurrentPage(1);
      
      // Retraso pequeño para asegurar que la página se establece correctamente
      setTimeout(() => {
        if (currentPage !== 1) {
          console.log("Forzando reset a página 1");
          setCurrentPage(1);
        }
      }, 0);
      
      prevSearchTermRef.current = searchTerm;
    }
  }, [searchTerm, currentPage]);

  // Configuración de estados de operación para estilos
  const getOperationStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pendiente",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-200",
        };
      case "INPROGRESS":
        return {
          label: "En curso",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
        };
      case "COMPLETED":
        return {
          label: "Finalizado",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
        };
      case "CANCELED":
        return {
          label: "Cancelado",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
        };
      default:
        return {
          label: status || "Desconocido",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
        };
    }
  };

  // Definir columnas usando useMemo
  const columns: TableColumn<Operation>[] = useMemo(
    () => [
      {
        header: "ID",
        accessor: "id",
        className: "font-medium",
      },
      {
        header: "Área",
        accessor: "jobArea.name",
        cell: (operation) => (
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
            {operation.jobArea?.name || "Sin área"}
          </div>
        ),
      },
      {
        header: "Cliente",
        accessor: "client.name",
        cell: (operation) => operation.client?.name || "Sin cliente",
      },
      {
        header: "Fecha Inicio",
        accessor: "dateStart",
        cell: (operation) => {
          try {
            return operation.dateStart
              ? operation.dateStart.split("T")[0]
              : "N/A";
          } catch (error) {
            return "Fecha inválida";
          }
        },
      },
      {
        header: "Servicio",
        accessor: "task.name",
        cell: (operation) => operation.task?.name || "N/A",
      },
      {
        header: "Encargado",
        accessor: "inCharge.name",
        cell: (operation) => 
          operation.inCharge && Array.isArray(operation.inCharge) 
            ? operation.inCharge.map((user) => user.name).join(", ") 
            : "N/A",
      },
      {
        header: "Estado",
        accessor: "status",
        cell: (operation) => {
          const statusConfig = getOperationStatusConfig(operation.status);
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

  const actions: TableAction<Operation>[] = useMemo(() => {
    const actionsList: TableAction<Operation>[] = [];
  
    // Acción de Ver - siempre disponible para todas las operaciones
    if (onView) {
      actionsList.push({
        label: "Ver detalles",
        icon: <BsEye className="h-4 w-4" />,
        onClick: onView,
        className: "text-blue-600",
      });
    }
  
    // Acción de Editar - solo disponible si la operación NO está finalizada
    if (onEdit) {
      actionsList.push({
        label: "Editar",
        icon: <BsPencil className="h-4 w-4" />,
        onClick: onEdit,
        className: "text-gray-700",
        // Ocultar si el estado es COMPLETED (finalizada)
        hidden: (operation) => operation.status === "COMPLETED",
      });
    }
  
    // Acción de Eliminar - solo disponible si la operación NO está finalizada
    if (onDelete) {
      actionsList.push({
        label: "Eliminar",
        icon: <BsTrash className="h-4 w-4" />,
        onClick: onDelete,
        className: "text-red-600",
        // Ocultar si el estado es COMPLETED (finalizada)
        hidden: (operation) => operation.status === "COMPLETED",
      });
    }
  
    return actionsList;
  }, [onView, onEdit, onDelete]);
  
  // Funciones para manejar la paginación local
  const handlePageChange = (page: number) => {
    console.log(`Cambiando a página ${page}`);
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    console.log(`Cambiando a ${newItemsPerPage} elementos por página`);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Volver a la primera página
  };

  // Calcular el total de páginas
  const totalPages = Math.ceil(allOperations.length / itemsPerPage);

  // Efectuar el reseteo de página cuando se detecte un cambio en el filtro
  useEffect(() => {
    console.log(`Página actual: ${currentPage}, Término de búsqueda: ${searchTerm}`);
  }, [currentPage, searchTerm]);

  // Render principal
  return (
    <div className="w-full">
      <DataTable
        data={allOperations}
        columns={columns}
        actions={actions}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10, 20, 30, 50]}
        itemName="operaciones"
        isLoading={isLoading}
        emptyMessage={
          searchTerm
            ? `No se encontraron operaciones para "${searchTerm}"`
            : "No hay operaciones registradas"
        }
        className="mb-4"
        initialSort={{ key: "id", direction: "desc" }}
        // Configurar para paginación interna
        externalPagination={false}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        currentPage={1} // Forzar siempre página 1 cuando hay un filtro activo
        key={`datatable-${searchTerm}`} // Force re-render on search change
      />

      {lastUpdated && (
        <div className="text-xs text-gray-500 m-2">
          <span>
            Última actualización:{" "}
            {format(new Date(lastUpdated), "dd/MM/yyyy HH:mm:ss", {
              locale: es,
            })}
          </span>
        </div>
      )}
    </div>
  );
}