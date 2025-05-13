import { Worker } from "./worker";

export interface Schedule {
  dateStart: string;
  dateEnd?: string | null;
  timeStart: string;
  timeEnd?: string | null;
}

export interface WorkersGroup {
  groupId: string;
  schedule: Schedule;
  workers: Pick<Worker, "id">[];
}