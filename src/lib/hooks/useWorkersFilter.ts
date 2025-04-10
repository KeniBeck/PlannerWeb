import { useState } from 'react';
import { Worker } from '@/core/model/worker';
import { Fault } from '@/core/model/fault';

export type WorkerViewTab = 'all' | 'available' | 'assigned' | 'deactivated' | 'incapacitated' | 'faults';

export interface WorkerFilters {
    searchTerm: string;
    activeTab: WorkerViewTab;
}

export function useWorkersFilter<W extends Worker, F extends Fault>(
    allWorkers: W[],
    availableWorkers: W[],
    assignedWorkers: W[],
    deactivatedWorkers: W[],
    incapacitatedWorkers: W[],
    faults: F[]
) {
    const [filters, setFilters] = useState<WorkerFilters>({
        searchTerm: '',
        activeTab: 'all',
    });

    // Filtrar trabajadores por término de búsqueda
    const filterWorkersBySearchTerm = (workers: W[]): W[] => {
        if (!filters.searchTerm) return workers;

        const searchTermLower = filters.searchTerm.toLowerCase();

        return workers.filter(worker =>
            worker.name.toLowerCase().includes(searchTermLower) ||
            (worker.dni && worker.dni.toLowerCase().includes(searchTermLower))
        );
    };

    // Filtrar faltas por término de búsqueda
    const filterFaultsBySearchTerm = (faults: F[]): F[] => {
        if (!filters.searchTerm) return faults;

        const searchTermLower = filters.searchTerm.toLowerCase();

        return faults.filter(fault =>
            fault.worker.name.toLowerCase().includes(searchTermLower) ||
            (fault.worker.dni && fault.worker.dni.toLowerCase().includes(searchTermLower))
        );
    };

    const filteredAllWorkers = filterWorkersBySearchTerm(allWorkers);
    const filteredAvailableWorkers = filterWorkersBySearchTerm(availableWorkers);
    const filteredAssignedWorkers = filterWorkersBySearchTerm(assignedWorkers);
    const filteredDeactivatedWorkers = filterWorkersBySearchTerm(deactivatedWorkers);
    const filteredIncapacitatedWorkers = filterWorkersBySearchTerm(incapacitatedWorkers);
    const filteredFaults = filterFaultsBySearchTerm(faults);

    const setSearchTerm = (term: string) => {
        setFilters(prev => ({ ...prev, searchTerm: term }));
    };

    const setActiveTab = (tab: WorkerViewTab) => {
        setFilters(prev => ({ ...prev, activeTab: tab }));
    };

    // Obtener etiqueta para la pestaña activa
    const getActiveTabLabel = () => {
        switch (filters.activeTab) {
            case 'all':
                return 'Todos los trabajadores';
            case 'available':
                return 'Trabajadores disponibles';
            case 'assigned':
                return 'Trabajadores asignados';
            case 'deactivated':
                return 'Trabajadores retirados';
            case 'incapacitated':
                return 'Trabajadores incapacitados';
            case 'faults':
                return 'Faltas registradas';
            default:
                return 'Trabajadores';
        }
    };

    return {
        searchTerm: filters.searchTerm,
        activeTab: filters.activeTab,
        filteredAllWorkers,
        filteredAvailableWorkers,
        filteredAssignedWorkers,
        filteredDeactivatedWorkers,
        filteredIncapacitatedWorkers,
        filteredFaults,
        setSearchTerm,
        setActiveTab,
        getActiveTabLabel,
    };
}