import { useMemo, useState } from "react";
import { Service } from "@/core/model/service";
import { BsChevronDown, BsChevronUp, BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "./Pagination";

interface ServicesListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (serviceId: number) => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

// Función para comparar valores y ordenar
const compareValues = (a: any, b: any, key: string) => {
  // Manejar propiedades anidadas como "area.name"
  const keys = key.split('.');
  let valueA = a;
  let valueB = b;

  // Recorrer las claves para acceder a propiedades anidadas
  for (const k of keys) {
    if (valueA && valueB) {
      valueA = valueA[k];
      valueB = valueB[k];
    }
  }

  // Normalizar valores para comparación (tratar undefined, null, etc.)
  valueA = valueA === null || valueA === undefined ? '' : valueA;
  valueB = valueB === null || valueB === undefined ? '' : valueB;

  if (typeof valueA === 'string' && typeof valueB === 'string') {
    return valueA.localeCompare(valueB);
  }

  if (valueA < valueB) return -1;
  if (valueA > valueB) return 1;
  return 0;
};

export function ServicesList({ services, onEdit, onDelete }: ServicesListProps) {
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
  const sortedServices = useMemo(() => {
    const sortableServices = [...services];
    if (sortConfig.key) {
      sortableServices.sort((a, b) => {
        const comparison = compareValues(a, b, sortConfig.key);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return sortableServices;
  }, [services, sortConfig]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedServices.slice(indexOfFirstItem, indexOfLastItem);

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
        totalItems={sortedServices.length}
        itemsPerPage={itemsPerPage}
        paginate={paginate}
        itemName="servicios"
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
            currentItems.map((service) => (
              <tr
                key={service.id}
                className="border-b border-gray-100 hover:bg-gray-50 last:border-b-0"
              >
                <td className="py-3 px-4 text-gray-800">#{service.id}</td>
                <td className="py-3 px-4 text-gray-800 font-medium">{service.name}</td>
                <td className="py-3 px-4 text-right">
                  <div className="relative inline-block">
                    <button
                      className="text-gray-500 hover:text-blue-700 focus:outline-none p-1"
                      onClick={(e) => toggleDropdown(service.id, e)}
                    >
                      <BsThreeDotsVertical size={18} />
                    </button>
                    {activeDropdown === service.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-md overflow-hidden shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center"
                            onClick={() => {
                              onEdit(service);
                              setActiveDropdown(null);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4 mr-2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                            Editar
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                            onClick={() => {
                              onDelete(service.id);
                              setActiveDropdown(null);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4 mr-2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
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
                  <p>No se encontraron servicios</p>
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