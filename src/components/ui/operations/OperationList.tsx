import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BsEye,
  BsPencil,
  BsTrash,
} from "react-icons/bs";
import { useOperations } from "@/contexts/OperationContext";
import { Operation } from "@/core/model/operation";
import { DataTable, TableColumn, TableAction } from "../DataTable";

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

interface OperationListProps {
  filteredOperations?: Operation[];
  searchTerm?: string;
  onView?: (operation: Operation) => void;
  onEdit?: (operation: Operation) => void;
  onDelete?: (operation: Operation) => void;
}

export function OperationList({
  filteredOperations,
  searchTerm,
  onView,
  onEdit,
  onDelete,
}: OperationListProps) {
  // Hooks primero - Siempre deben ejecutarse en el mismo orden
  const {
    operations,
    isLoading,
    error,
    refreshOperations,
    totalItems,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setPage,
    lastUpdated,
    totalPages,
    preloadNextPages
  } = useOperations();

  // Estado para rastrear la primera carga
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Hook useState - Siempre debe estar aquí sin condiciones
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "",
    direction: "asc",
  });

  // Efecto para rastrear la carga inicial y ejecutar la precarga
  useEffect(() => {
    // Si tenemos operaciones y no estamos cargando, la carga inicial ha terminado
    if (operations.length > 0 && !isLoading && !initialLoadDone) {
      console.log("Carga inicial completada");
      setInitialLoadDone(true);
      
      // Precargar siguiente página después de la primera carga
      if (preloadNextPages) {
        console.log("Ejecutando precarga inicial");
        preloadNextPages();
      }
    }
  }, [operations, isLoading, initialLoadDone, preloadNextPages]);

  // Efecto para precargar cuando cambia la página
  useEffect(() => {
    if (initialLoadDone && !isLoading && preloadNextPages) {
      // Esperar un poco después del cambio de página antes de precargar la siguiente
      const timer = setTimeout(() => {
        console.log("Precargando después de cambio de página");
        preloadNextPages();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentPage, initialLoadDone, isLoading, preloadNextPages]);

  // Cálculos y funciones después de todos los hooks
  const operationsToUse = filteredOperations || operations;

  // Ordenamiento
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Funciones para manejar la paginación
  const handlePageChange = (page: number) => {
    // Asegurarse de que la página es válida
    if (page >= 1 && page <= totalPages) {
      console.log(`Cambiando a página ${page}`);
      setPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    console.log(`Cambiando a ${newItemsPerPage} elementos por página`);
    setItemsPerPage(newItemsPerPage);
  };

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

  // Definir columnas usando useMemo - Siempre debe ejecutarse
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
              ? format(new Date(operation.dateStart), "dd/MM/yyyy", {
                  locale: es,
                })
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

  // Definir acciones usando useMemo - Siempre debe ejecutarse
  const actions: TableAction<Operation>[] = useMemo(() => {
    const actionsList: TableAction<Operation>[] = [];

    if (onView) {
      actionsList.push({
        label: "Ver detalles",
        icon: <BsEye className="h-4 w-4" />,
        onClick: onView,
        className: "text-blue-600",
      });
    }

    if (onEdit) {
      actionsList.push({
        label: "Editar",
        icon: <BsPencil className="h-4 w-4" />,
        onClick: onEdit,
        className: "text-gray-700",
      });
    }

    if (onDelete) {
      actionsList.push({
        label: "Eliminar",
        icon: <BsTrash className="h-4 w-4" />,
        onClick: onDelete,
        className: "text-red-600",
      });
    }

    return actionsList;
  }, [onView, onEdit, onDelete]);

  // Evitar returns tempranos antes de otros hooks
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>{error}</p>
        <button
          onClick={refreshOperations}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Render de carga - Solo después de todos los hooks
  if (isLoading && !operations.length) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render principal
  return (
    <div className="w-full">
      <DataTable
        data={operationsToUse}
        columns={columns}
        actions={actions}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10, 20, 30, 50]}
        itemName="operaciones"
        isLoading={isLoading && operations.length > 0}
        emptyMessage={
          searchTerm
            ? `No se encontraron operaciones para "${searchTerm}"`
            : "No hay operaciones registradas"
        }
        className="mb-4"
        initialSort={{ key: "id", direction: "desc" }}
        // Props esenciales para la paginación:
        externalPagination={true}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        currentPage={currentPage}
        totalItems={totalItems}
        totalPages={totalPages}
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