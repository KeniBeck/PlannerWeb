import { Worker} from "./worker";
export interface WorkersGroup {
    id: number;
    name: string;
    workers: Worker[];
    startDate: Date;
    endDate?: Date;
    startTime: string;
    endTime?: string;
}

