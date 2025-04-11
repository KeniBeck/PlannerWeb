import { useMemo, useState } from "react";
import { Client } from "@/core/model/client";
import { BsChevronDown, BsChevronUp, BsThreeDotsVertical, BsPencil, BsTrash } from "react-icons/bs";
import Pagination from "./Pagination";
import { compareValues } from "@/lib/utils/sortUtils";

interface ClientsListProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (clientId: number) => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export function ClientsList({ clients, onEdit, onDelete }: ClientsListProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const itemsPerPage = 5;

  // Ordenamiento
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Lista ordenada y paginada
  const sortedClients = useMemo(() => {
    const sortableClients = [...clients];
    if (sortConfig.key) {
      sortableClients.sort((a, b) => {
        const comparison = compareValues(a, b, sortConfig.key);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return sortableClients;
  }, [clients, sortConfig]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedClients.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Manejo del menú desplegable
  const toggleDropdown = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleClickOutside = () => {
    setActiveDropdown(null);
  };

  // Componente de encabezado ordenable
  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: string }) => {
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
            {isSorted && sortDirection === 'asc' && <BsChevronUp size={14} />}
            {isSorted && sortDirection === 'desc' && <BsChevronDown size={14} />}
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

  return (
    <div className="overflow-x-auto w-full" onClick={handleClickOutside}>
      <Pagination
        currentPage={currentPage}
        totalItems={sortedClients.length}
        itemsPerPage={itemsPerPage}
        paginate={paginate}
        itemName="clientes"
      />
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-50 border-b border-blue-100">
            <SortableHeader label="ID" sortKey="id" />
            <SortableHeader label="Nombre" sortKey="name" />
            <th className="py-3 px-4 text-right text-sm font-medium text-blue-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((client) => (
              <tr
                key={client.id}
                className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
              >
                <td className="py-3 px-4 text-sm font-medium">{client.id}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{client.name}</td>
                <td className="py-3 px-4 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={(e) => toggleDropdown(client.id, e)}
                      className="p-1.5 rounded-md hover:bg-gray-100 focus:outline-none"
                    >
                      <BsThreeDotsVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    {activeDropdown === client.id && (
                      <div className="absolute right-0 mt-1 py-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100">
                        <div className="px-2">
                          <button
                            onClick={() => onEdit?.(client)}
                            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors"
                          >
                            <BsPencil className="h-4 w-4 mr-2" />
                            Editar
                          </button>
                          <button
                            onClick={() => onDelete?.(client.id)}
                            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
                          >
                            <BsTrash className="h-4 w-4 mr-2" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr className="border-b border-gray-100 last:border-b-0">
              <td colSpan={3} className="py-8 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 mb-3 text-gray-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                    />
                  </svg>
                  <p>No se encontraron clientes</p>
                  <p className="text-sm text-gray-400 mt-1">Intenta con otros criterios de búsqueda</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}