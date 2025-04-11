import { Area } from "./area";

interface Worker {
    id: number;
    name: string;
    phone: string;
    dni: string;
    createAt: Date;
    endDate?: Date;
    incapacity?: Incapacity;
    deactivationDate?: Date;
    jobArea: Area;
    status: WorkerStatus;
    code: string;
}



interface Incapacity {
    startDate: Date;
    endDate: Date;
}

enum WorkerStatus {
    AVAILABLE = 'DISPONIBLE',
    ASSIGNED = 'ASIGNADO',
    UNAVAILABLE = 'NO DISPONIBLE',
    DEACTIVATED = 'DESACTIVADO',
    INCAPACITATED = 'INCAPACITADO',
}

export { WorkerStatus };
export type { Worker, Incapacity };

