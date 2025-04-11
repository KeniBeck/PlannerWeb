import { Supervisor } from "@/core/model/supervisor";
import { useState, useMemo } from "react";
import { BsChevronUp, BsChevronDown, BsThreeDotsVertical, BsPencil, BsTrash } from "react-icons/bs";
import Pagination from "./Pagination";
import { compareValues } from "@/lib/utils/sortUtils";

interface SupervisorsListProps {
  supervisors: Supervisor[];
  onEdit?: (supervisor: Supervisor) => void;
  onDelete?: (supervisorId: number) => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
}

export function SupervisorsList({ supervisors, onEdit, onDelete }: SupervisorsListProps) {
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
  const sortedSupervisors = useMemo(() => {
    const sortableSupervisors = [...supervisors];
    if (sortConfig.key) {
      sortableSupervisors.sort((a, b) => {
        const comparison = compareValues(a, b, sortConfig.key);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return sortableSupervisors;
  }, [supervisors, sortConfig]);

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedSupervisors.slice(indexOfFirstItem, indexOfLastItem);

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

  // Renderizar el estado del supervisor con color apropiado
  const renderStatus = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            Activo
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Inactivo
          </span>
        );
      case 'on_leave':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            De Permiso
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto w-full" onClick={handleClickOutside}>
      <Pagination
        currentPage={currentPage}
        totalItems={sortedSupervisors.length}
        itemsPerPage={itemsPerPage}
        paginate={paginate}
        itemName="supervisores"
      />
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-50 border-b border-blue-100">
            <SortableHeader label="Código" sortKey="id" />
            <SortableHeader label="Nombre" sortKey="name" />
            <SortableHeader label="DNI" sortKey="dni" />
            <SortableHeader label="Teléfono" sortKey="phone" />
            <SortableHeader label="Especialidad" sortKey="specialty" />
            <SortableHeader label="Estado" sortKey="status" />
            <th className="py-3 px-4 text-right text-sm font-medium text-blue-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((supervisor) => (
              <tr
                key={supervisor.id}
                className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
              >
                <td className="py-3 px-4 text-sm font-medium">{supervisor.id}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{supervisor.name}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{supervisor.dni}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{supervisor.phone}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{supervisor.specialty}</td>
                <td className="py-3 px-4 text-sm text-gray-800">
                  {renderStatus(supervisor.status)}
                </td>
                <td className="py-3 px-4 text-sm text-right">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={(e) => toggleDropdown(supervisor.id, e)}
                      className="p-1 rounded-full hover:bg-blue-100 text-blue-600"
                    >
                      <BsThreeDotsVertical className="h-5 w-5" />
                    </button>

                    {activeDropdown === supervisor.id && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                            role="menuitem"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(supervisor);
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
                              onDelete?.(supervisor.id);
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
              <td colSpan={7} className="py-6 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <svg className="h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <p>No se encontraron supervisores</p>
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