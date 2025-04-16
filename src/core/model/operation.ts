import { Worker } from "./worker";
import { Area } from "./area";
import { Service } from "./service";
import { Client } from "./client";
import { WorkersGroup } from "./workersGroup";
import { User } from "./user";

export interface Operation {
  id: number;
  name: string;
  dateStart: Date;
  endDate?: Date;
  startTime: string;
  endTime?: string;
  status: OperationStatus;
  workers: Worker[];
  workersFinished?: Worker[];
  workersDeleted?: Worker[];
  jobArea: Area;
  task: Service;
  client: Client;
  motorship?: string;
  createdAt: Date;
  updatedAt: Date;
  groups: WorkersGroup[];
  inCharge: Pick<User, "id" | "name">[];
}

enum OperationStatus {
  PENDING = "PENDIENTE",
  IN_PROGRESS = "EN CURSO",
  FINISHED = "FINALIZADO",
  CANCELLED = "CANCELADO",
}
