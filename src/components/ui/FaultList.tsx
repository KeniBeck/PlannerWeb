import { useState, useMemo } from "react";
import { Fault } from "@/core/model/fault";
import { FaultTypeBadge } from "./FaultTypeBadge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Pagination from "./Pagination";
import { BsChevronUp, BsChevronDown } from "react-icons/bs";
import { compareValues } from "@/lib/utils/sortUtils";
interface FaultsListProps {
    faults: Fault[];
}

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
}

export function FaultsList({ faults }: FaultsListProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
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
    const sortedFaults = useMemo(() => {
        const sortableFaults = [...faults];
        if (sortConfig.key) {
            sortableFaults.sort((a, b) => {
                const comparison = compareValues(a, b, sortConfig.key);
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return sortableFaults;
    }, [faults, sortConfig]);

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedFaults.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
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
        <div className="overflow-x-auto w-full">
            <Pagination
                currentPage={currentPage}
                totalItems={sortedFaults.length}
                itemsPerPage={itemsPerPage}
                paginate={paginate}
                itemName="faltas"
            />
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-blue-50 border-b border-blue-100">
                        <SortableHeader label="ID" sortKey="id" />
                        <SortableHeader label="Trabajador" sortKey="worker.name" />
                        <SortableHeader label="Tipo" sortKey="type" />
                        <SortableHeader label="Descripción" sortKey="description" />
                        <SortableHeader label="Fecha" sortKey="createdAt" />
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((fault) => (
                            <tr
                                key={fault.id}
                                className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                            >
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">{fault.id}</td>
                                <td className="py-3 px-4 text-sm text-gray-800">{fault.worker.name}</td>
                                <td className="py-3 px-4 text-sm">
                                    <FaultTypeBadge type={fault.type} />
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-800 max-w-xs truncate">{fault.description}</td>
                                <td className="py-3 px-4 text-sm text-gray-800">
                                    {format(new Date(fault.createdAt), "dd/MM/yyyy", { locale: es })}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="py-6 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p>No se encontraron faltas</p>
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