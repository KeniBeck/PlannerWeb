import { useState } from 'react';
import { Worker } from '@/core/model/worker';
import { Fault } from '@/core/model/fault';

export type WorkerViewTab = 'all' | 'available' | 'assigned' | 'deactivated' | 'incapacitated' | 'faults';

export interface WorkerFilters {
    searchTerm: string;
    activeTab: WorkerViewTab;
}

/**
 * Normaliza un string eliminando acentos/tildes y convirtiéndolo a minúsculas
 */
const normalizeString = (text?: string): string => {
    if (!text) return '';

    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Elimina diacríticos (acentos, tildes, etc.)
};

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

        // Normalizar el término de búsqueda (sin acentos y en minúsculas)
        const normalizedSearchTerm = normalizeString(filters.searchTerm);

        return workers.filter(worker => {
            // Normalizar los campos del trabajador para la búsqueda
            const normalizedName = normalizeString(worker.name);
            const normalizedDni = normalizeString(worker.dni);
            const normalizedCode = normalizeString(worker.code);

            // Buscar en nombre, DNI y código
            return normalizedName.includes(normalizedSearchTerm) ||
                normalizedDni.includes(normalizedSearchTerm) ||
                normalizedCode.includes(normalizedSearchTerm);
        });
    };

    // Filtrar faltas por término de búsqueda
    const filterFaultsBySearchTerm = (faults: F[]): F[] => {
        if (!filters.searchTerm) return faults;

        // Normalizar el término de búsqueda (sin acentos y en minúsculas)
        const normalizedSearchTerm = normalizeString(filters.searchTerm);

        return faults.filter(fault => {
            // Normalizar los campos del trabajador para la búsqueda
            const normalizedWorkerName = normalizeString(fault.worker.name);
            const normalizedWorkerDni = normalizeString(fault.worker.dni);
            const normalizedWorkerCode = normalizeString(fault.worker.code);
            const normalizedDescription = normalizeString(fault.description);

            // Buscar en nombre del trabajador, DNI, código y descripción de la falta
            return normalizedWorkerName.includes(normalizedSearchTerm) ||
                normalizedWorkerDni.includes(normalizedSearchTerm) ||
                normalizedWorkerCode.includes(normalizedSearchTerm) ||
                normalizedDescription.includes(normalizedSearchTerm);
        });
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

    // Obtener el número total de elementos según la pestaña activa
    const getTotalCount = (): number => {
        switch (filters.activeTab) {
            case 'all': return filteredAllWorkers.length;
            case 'available': return filteredAvailableWorkers.length;
            case 'assigned': return filteredAssignedWorkers.length;
            case 'deactivated': return filteredDeactivatedWorkers.length;
            case 'incapacitated': return filteredIncapacitatedWorkers.length;
            case 'faults': return filteredFaults.length;
            default: return filteredAllWorkers.length;
        }
    };

    // Determinar si la vista actual es de trabajadores o faltas
    const isWorkersView = filters.activeTab !== 'faults';

    // Obtener el nombre del tipo de elemento actual (trabajadores o faltas)
    const itemTypeName = isWorkersView ? 'trabajadores' : 'faltas';

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
        getTotalCount,
        isWorkersView,
        itemTypeName,
    };
}