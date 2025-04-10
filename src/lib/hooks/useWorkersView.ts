import { useState } from 'react';
import { Worker } from '@/core/model/worker';
import { Fault } from '@/core/model/fault';
import { WorkerViewTab } from './useWorkersFilter';

// Definimos tipos genéricos para manejar diferentes vistas
export type ViewType = 'workers' | 'faults';

export interface ViewData<T> {
    type: ViewType;
    items: T[];
}

export function useWorkersView<W extends Worker, F extends Fault>(
    filteredAllWorkers: W[],
    filteredAvailableWorkers: W[],
    filteredAssignedWorkers: W[],
    filteredDeactivatedWorkers: W[],
    filteredIncapacitatedWorkers: W[],
    filteredFaults: F[],
    activeTab: WorkerViewTab
) {
    const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);

    const getCurrentView = (): ViewData<W | F> => {
        switch (activeTab) {
            case 'all':
                return { type: 'workers', items: filteredAllWorkers };
            case 'available':
                return { type: 'workers', items: filteredAvailableWorkers };
            case 'assigned':
                return { type: 'workers', items: filteredAssignedWorkers };
            case 'deactivated':
                return { type: 'workers', items: filteredDeactivatedWorkers };
            case 'incapacitated':
                return { type: 'workers', items: filteredIncapacitatedWorkers };
            case 'faults':
                return { type: 'faults', items: filteredFaults as unknown as F[] };
            default:
                return { type: 'workers', items: filteredAllWorkers };
        }
    };

    const getTotalCount = (): number => {
        switch (activeTab) {
            case 'all': return filteredAllWorkers.length;
            case 'available': return filteredAvailableWorkers.length;
            case 'assigned': return filteredAssignedWorkers.length;
            case 'deactivated': return filteredDeactivatedWorkers.length;
            case 'incapacitated': return filteredIncapacitatedWorkers.length;
            case 'faults': return filteredFaults.length;
            default: return filteredAllWorkers.length;
        }
    };

    const isWorkersView = activeTab !== 'faults';
    const itemTypeName = isWorkersView ? 'trabajadores' : 'faltas';

    const handleAddWorker = () => {
        setIsAddWorkerOpen(true);
    };

    const handleExportData = () => {
        // Lógica para exportar datos
        console.log('Exportando datos...');
    };

    const handleRefreshData = () => {
        // Lógica para refrescar datos
        console.log('Actualizando datos...');
    };

    return {
        isAddWorkerOpen,
        setIsAddWorkerOpen,
        getCurrentView,
        getTotalCount,
        isWorkersView,
        itemTypeName,
        handleAddWorker,
        handleExportData,
        handleRefreshData,
    };
}