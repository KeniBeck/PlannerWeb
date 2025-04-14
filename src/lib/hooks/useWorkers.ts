import { useState } from "react";
import { Area } from "@/core/model/area";
import { Worker, WorkerStatus } from "@/core/model/worker";
import { Fault } from "@/core/model/fault";

export function useWorker() {
    // Mock de áreas
    const [areas] = useState<Area[]>([]);

    // Mock de trabajadores
    const [workers] = useState<Worker[]>([]);

    // Mock de faltas
    const [faults] = useState<Fault[]>([]);

    const allWorkers = workers.filter(worker => worker.status !== WorkerStatus.DEACTIVATED);
    const availableWorkers = workers.filter(worker => worker.status === WorkerStatus.AVAILABLE);
    const assignedWorkers = workers.filter(worker => worker.status === WorkerStatus.ASSIGNED);
    const deactivatedWorkers = workers.filter(worker => worker.status === WorkerStatus.DEACTIVATED);
    const incapacitatedWorkers = workers.filter(worker => worker.status === WorkerStatus.INCAPACITATED);

    return {
        allWorkers,
        availableWorkers,
        assignedWorkers,
        deactivatedWorkers,
        incapacitatedWorkers,
        workers,
        areas,
        faults
    };
}