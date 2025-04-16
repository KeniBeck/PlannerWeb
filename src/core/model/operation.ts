import { Worker } from "./worker";
import { Area } from "./area";
import { Service } from "./service";
import { Client } from "./client";
import { WorkersGroup } from "./workersGroup";
import { User } from "./user";

export interface Operation {
  id: number;
  name: string;
  dateStart: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
  status: OperationStatus;
  workers: Worker[];
  workersFinished?: Worker[];
  workersDeleted?: Worker[];
  jobArea: Area;
  task: Service;
  client: Client;
  zone: string;
  motorShip?: string;
  createdAt: Date;
  updatedAt: Date;
  workerGroups: WorkersGroup[];
  inCharge: Pick<User, "id" | "name">[];
}

export enum OperationStatus {
  PENDING = "PENDING",
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}
