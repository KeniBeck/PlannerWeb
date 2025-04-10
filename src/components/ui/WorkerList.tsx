import { Worker, WorkerStatus } from "@/core/model/worker";
import { BsChevronUp, BsChevronDown } from "react-icons/bs";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Pagination from "./Pagination";
import { compareValues } from "@/lib/utils/sortUtils";

interface WorkersListProps {
    workers: Worker[];
}

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
}


export function WorkersList({ workers }: WorkersListProps) {
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
    const sortedWorkers = useMemo(() => {
        const sortableWorkers = [...workers];
        if (sortConfig.key) {
            sortableWorkers.sort((a, b) => {
                const comparison = compareValues(a, b, sortConfig.key);
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return sortableWorkers;
    }, [workers, sortConfig]);

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedWorkers.slice(indexOfFirstItem, indexOfLastItem);

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

    // Estilos para estados de trabajador
    const getStatusConfig = (status: WorkerStatus) => {
        switch (status) {
            case WorkerStatus.AVAILABLE:
                return {
                    label: "Disponible",
                    bgColor: "bg-green-100",
                    textColor: "text-green-800",
                    borderColor: "border-green-200"
                };
            case WorkerStatus.ASSIGNED:
                return {
                    label: "Asignado",
                    bgColor: "bg-blue-100",
                    textColor: "text-blue-800",
                    borderColor: "border-blue-200"
                };
            case WorkerStatus.DEACTIVATED:
                return {
                    label: "Retirado",
                    bgColor: "bg-gray-100",
                    textColor: "text-gray-800",
                    borderColor: "border-gray-200"
                };
            case WorkerStatus.INCAPACITATED:
                return {
                    label: "Incapacitado",
                    bgColor: "bg-purple-100",
                    textColor: "text-purple-800",
                    borderColor: "border-purple-200"
                };
            default:
                return {
                    label: "Desconocido",
                    bgColor: "bg-gray-100",
                    textColor: "text-gray-800",
                    borderColor: "border-gray-200"
                };
        }
    };

    return (
        <div className="overflow-x-auto w-full" >
            <Pagination
                currentPage={currentPage}
                totalItems={sortedWorkers.length}
                itemsPerPage={itemsPerPage}
                paginate={paginate}
                itemName="trabajadores"
            />
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-blue-50 border-b border-blue-100">
                        <SortableHeader label="Código" sortKey="code" />
                        <SortableHeader label="Nombre" sortKey="name" />
                        <SortableHeader label="Teléfono" sortKey="phone" />
                        <SortableHeader label="DNI" sortKey="dni" />
                        <SortableHeader label="Fecha Inicio" sortKey="startDate" />
                        <SortableHeader label="Área" sortKey="area.name" />
                        <SortableHeader label="Estado" sortKey="status" />
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((worker) => {
                            const statusConfig = getStatusConfig(worker.status);
                            // Formatear fecha de inicio
                            const formattedDate = worker.startDate ?
                                format(new Date(worker.startDate), "dd/MM/yyyy", { locale: es }) :
                                'N/A';

                            return (
                                <tr
                                    key={worker.id}
                                    className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                                >
                                    <td className="py-3 px-4 text-sm font-medium ">{worker.code}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800">{worker.name}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800">{worker.phone}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800">{worker.dni}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800">{formattedDate}</td>
                                    <td className="py-3 px-4 text-sm text-gray-800">
                                        <div className="flex items-center">
                                            <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                                            {worker.area.name}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                                            {statusConfig.label}
                                        </span>
                                    </td>

                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={8} className="py-6 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <svg className="h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                    <p>No se encontraron trabajadores</p>
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