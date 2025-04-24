import { Area } from "./area";

interface Worker {
    id: number;
    name: string;
    phone: string;
    dni: string;
    createAt: Date;
    endDate?: Date;
   failures:number;
   dateDisableStart?: Date;
    dateDisableEnd?: Date;
    dateRetierment?: Date;
    jobArea: Area;
    status: WorkerStatus;
    code: string;
}



interface Incapacity {
    startDate: Date;
    endDate: Date;
}

enum WorkerStatus {
    AVAILABLE = 'AVALIABLE',
    ASSIGNED = 'ASSIGNED',
    UNAVAILABLE = 'UNAVAILABLE',
    DEACTIVATED = 'DEACTIVATED',
    INCAPACITATED = 'DISABLE',
}

export { WorkerStatus };
export type { Worker, Incapacity };

