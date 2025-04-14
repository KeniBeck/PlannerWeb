import { User } from "@/core/model/user";
import { useState, useMemo } from "react";
import { BsChevronUp, BsChevronDown } from "react-icons/bs";
import Pagination from "./Pagination";
import { compareValues } from "@/lib/utils/sortUtils";

interface SupervisorsListProps {
  supervisors: User[];
  onEdit?: (supervisor: User) => void;
  onDelete?: (supervisorId: number) => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
}

export function SupervisorsList({ supervisors }: SupervisorsListProps) {
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

  // // Manejo del menú desplegable
  // const toggleDropdown = (id: number, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setActiveDropdown(activeDropdown === id ? null : id);
  // };

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
                <td className="py-3 px-4 text-sm text-gray-800">{supervisor.cargo}</td>
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