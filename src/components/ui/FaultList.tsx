import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BsChevronUp, BsChevronDown } from "react-icons/bs";
import { useFaults } from "@/contexts/FaultContext";
import { compareValues } from "@/lib/utils/sortUtils";
import Pagination from "./Pagination";
import { Fault } from "@/core/model/fault";

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

interface FaultsListProps {
  filteredFaults?: Fault[];
  searchTerm?: string;
}

export function FaultsList({ filteredFaults, searchTerm }: FaultsListProps) {
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
  const faultsToUse = filteredFaults || faults;
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "",
    direction: "asc",
  });

  const itemsPerPageOptions = [10, 20, 30, 50];

  // Ordenamiento
  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Lista ordenada
  const sortedFaults = useMemo(() => {
    const sortableFaults = [...faultsToUse];
    if (sortConfig.key) {
      sortableFaults.sort((a, b) => {
        const comparison = compareValues(a, b, sortConfig.key);
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }
    return sortableFaults;
  }, [faultsToUse, sortConfig]);

  // Función para cambiar de página
  const paginate = (pageNumber: number) => {
    setPage(pageNumber);
  };

  // Función para cambiar elementos por página
  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newValue = Number(e.target.value);
    setItemsPerPage(newValue);
  };

  // Componente de encabezado ordenable
  const SortableHeader = ({
    label,
    sortKey,
  }: {
    label: string;
    sortKey: string;
  }) => {
    const isSorted = sortConfig.key === sortKey;
    const sortDirection = isSorted ? sortConfig.direction : undefined;

    return (
      <th
        className="py-3 px-4 text-left text-sm font-medium text-blue-700 cursor-pointer select-none"
        onClick={() => requestSort(sortKey)}
      >
        <div className="flex items-center gap-2">
          {label}
          <span className="text-blue-500">
            {isSorted && sortDirection === "asc" && <BsChevronUp size={14} />}
            {isSorted && sortDirection === "desc" && (
              <BsChevronDown size={14} />
            )}
            {!isSorted && (
              <span className="text-gray-300">
                <BsChevronDown size={14} />
              </span>
            )}
          </span>
        </div>
      </th>
    );
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
      default:
        return {
          label: type || "Desconocido",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
        };
    }
  };

  if (isLoading && !faults.length) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

  // Calcular índices para el mensaje "Mostrando X a Y"
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="overflow-x-auto w-full">
      <div className="flex justify-between items-center ">
        <div className="flex items-center space-x-2 ml-2">
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="py-1 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-between items-center">
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            paginate={paginate}
            itemName="faltas"
          />
        </div>
      </div>

      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-blue-50 border-b border-blue-100">
            <SortableHeader label="ID" sortKey="id" />
            <SortableHeader label="Trabajador" sortKey="worker.name" />
            <SortableHeader label="DNI" sortKey="worker.code" />
            <SortableHeader label="Fecha" sortKey="createAt" />
            <SortableHeader label="Descripción" sortKey="description" />
            <SortableHeader label="Tipo" sortKey="type" />
          </tr>
        </thead>
        <tbody>
          {sortedFaults.length > 0 ? (
            sortedFaults.map((fault) => {
              const typeConfig = getFaultTypeConfig(fault.type);
              const formattedDate = fault.createAt
                ? format(new Date(fault.createAt), "dd/MM/yyyy", { locale: es })
                : "N/A";

              return (
                <tr
                  key={fault.id}
                  className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-medium">{fault.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {fault.worker?.name || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {fault.worker.dni}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {formattedDate}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {fault.description}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${typeConfig.bgColor} ${typeConfig.textColor} border ${typeConfig.borderColor}`}
                    >
                      {typeConfig.label}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center">
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
                  <p>No se encontraron faltas</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Intenta con otros criterios de búsqueda
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="text-xs text-gray-500 m-2">
        {lastUpdated && (
          <span>
            Última actualización:{" "}
            {format(new Date(lastUpdated), "dd/MM/yyyy HH:mm:ss", {
              locale: es,
            })}
          </span>
        )}
      </div>
    </div>
  );
}
