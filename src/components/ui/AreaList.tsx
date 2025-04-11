import { Area } from "@/core/model/area";
import { useState, useMemo } from "react";
import { BsChevronUp, BsChevronDown, BsThreeDotsVertical, BsPencil, BsTrash } from "react-icons/bs";
import Pagination from "./Pagination";
import { compareValues } from "@/lib/utils/sortUtils";

interface AreasListProps {
  areas: Area[];
  onEdit?: (area: Area) => void;
  onDelete?: (areaId: number) => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
}

export function AreasList({ areas, onEdit, onDelete }: AreasListProps) {
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
  const sortedAreas = useMemo(() => {
    const sortableAreas = [...areas];
    if (sortConfig.key) {
      sortableAreas.sort((a, b) => {
        const comparison = compareValues(a, b, sortConfig.key);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return sortableAreas;
  }, [areas, sortConfig]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAreas.slice(indexOfFirstItem, indexOfLastItem);

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

  // Obtener el número total de trabajadores en cada área
  const getWorkersCount = (areaId: number) => {
    // Aquí podríamos obtener el número real de trabajadores por área
    // Por ahora, usamos un número aleatorio como ejemplo
    return Math.floor(Math.random() * 20);
  };

  return (
    <div className="overflow-x-auto w-full" onClick={handleClickOutside}>
      <Pagination
        currentPage={currentPage}
        totalItems={sortedAreas.length}
        itemsPerPage={itemsPerPage}
        paginate={paginate}
        itemName="áreas"
      />
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-50 border-b border-blue-100">
            <SortableHeader label="ID" sortKey="id" />
            <SortableHeader label="Nombre" sortKey="name" />
            <th className="py-3 px-4 text-left text-sm font-medium text-blue-700">Total Trabajadores</th>
            <th className="py-3 px-4 text-right text-sm font-medium text-blue-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((area) => (
              <tr
                key={area.id}
                className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
              >
                <td className="py-3 px-4 text-sm font-medium">{area.id}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{area.name}</td>
                <td className="py-3 px-4 text-sm text-gray-800">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    {getWorkersCount(area.id)} trabajadores
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-right">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={(e) => toggleDropdown(area.id, e)}
                      className="p-1 rounded-full hover:bg-blue-100 text-blue-600"
                    >
                      <BsThreeDotsVertical className="h-5 w-5" />
                    </button>

                    {activeDropdown === area.id && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(area);
                            }}
                          >
                            <BsPencil className="mr-2 h-4 w-4" />
                            Editar
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete?.(area.id);
                            }}
                          >
                            <BsTrash className="mr-2 h-4 w-4" />
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
            <tr>
              <td colSpan={4} className="py-6 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <svg className="h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                  </svg>
                  <p>No se encontraron áreas</p>
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