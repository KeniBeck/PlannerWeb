import { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useFaults } from "@/contexts/FaultContext";
import { Fault } from "@/core/model/fault";
import { DataTable, TableColumn } from "../DataTable";

interface FaultsListProps {
  filteredFaults?: Fault[];
  searchTerm?: string;
}

export function FaultsList({ filteredFaults, searchTerm }: FaultsListProps) {
  // Extraer todos los datos y funciones necesarias del contexto
  const {
    faults,
    isLoading,
    error,
    refreshFaults,
    totalItems,
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setPage,
    lastUpdated,
  } = useFaults();

  // Estado para rastrear la primera carga
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Efecto para rastrear la carga inicial
  useEffect(() => {
    if (faults.length > 0 && !isLoading && !initialLoadDone) {
      console.log("Carga inicial de faltas completada");
      setInitialLoadDone(true);
    }
  }, [faults, isLoading, initialLoadDone]);

  // Funciones para manejar la paginación
  const handlePageChange = (page: number) => {
    console.log(`Cambiando a página ${page}`);
    setPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    console.log(`Cambiando a ${newItemsPerPage} elementos por página`);
    setItemsPerPage(newItemsPerPage);
  };

  // Configuración de tipos de faltas para estilos
  const getFaultTypeConfig = (type: string) => {
    switch (type) {
      case "INASSISTANCE":
        return {
          label: "Inasistencia",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
        };
      case "TARDINESS":
        return {
          label: "Tardanza",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          borderColor: "border-yellow-200",
        };
      case "IRRESPECTFUL":
        return {
          label: "Irrespetuoso",
          bgColor: "bg-orange-100",
          textColor: "text-orange-800",
          borderColor: "border-orange-200",
        };
      case "ABANDONMENT":
        return {
          label: "Abandono",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
        };
      default:
        return {
          label: type || "Desconocido",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
        };
    }
  };

  // Definir columnas usando useMemo
  const columns: TableColumn<Fault>[] = useMemo(
    () => [
      {
        header: "ID",
        accessor: "id",
        className: "font-medium",
      },
      {
        header: "Trabajador",
        accessor: "worker.name",
        cell: (fault) => fault.worker?.name || "N/A",
      },
      {
        header: "DNI",
        accessor: "worker.dni",
        cell: (fault) => fault.worker?.dni || "N/A",
      },
      {
        header: "Fecha",
        accessor: "createAt",
        cell: (fault) =>
          fault.createAt
            ? format(new Date(fault.createAt), "dd/MM/yyyy", { locale: es })
            : "N/A",
      },
      {
        header: "Descripción",
        accessor: "description",
      },
      {
        header: "Tipo",
        accessor: "type",
        cell: (fault) => {
          const typeConfig = getFaultTypeConfig(fault.type);
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${typeConfig.bgColor} ${typeConfig.textColor} border ${typeConfig.borderColor}`}
            >
              {typeConfig.label}
            </span>
          );
        },
      },
    ],
    []
  );

  // Renderizado condicional para errores
  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>{error}</p>
        <button
          onClick={refreshFaults}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DataTable
        data={filteredFaults || faults}
        columns={columns}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10, 20, 30, 50]}
        itemName="faltas"
        isLoading={isLoading}
        emptyMessage={
          searchTerm
            ? `No se encontraron faltas para "${searchTerm}"`
            : "No hay faltas registradas"
        }
        className="mb-4"
        initialSort={{ key: "id", direction: "desc" }}
        // Props para la paginación externa
        externalPagination={true}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        currentPage={currentPage}
        totalItems={totalItems}
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        }
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