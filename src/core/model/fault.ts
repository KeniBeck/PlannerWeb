import { Worker } from "./worker";

interface Fault {
    id: number;
    description: string;
    type: FaultType;
    worker: Worker;
    createdAt: string;
}

enum FaultType {
    INASSISTANCE = 'INASISTENCIA',
    IRRESPECTFUL = 'IRRESPETO',
    ABANDONMENT = 'ABANDONO',
}


export { FaultType };
export type { Fault };