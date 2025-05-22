export interface OperationFilterDto {
  status?: StatusOperation[];
  dateStart?: Date;
  dateEnd?: Date;
  jobAreaId?: number;
  userId?: number;
  search?: string;
  inChargedId?: number;
  activatePaginated?:boolean;
}

enum StatusOperation {
  PENDING = "PENDING",
  IN_PROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELED",
}

export interface WorkerConnection {
  id?: number;
  workerIds?: number[];
  dateStart?: string;
  dateEnd?: string;
  timeStart?: string;
  timeEnd?: string;
}

export interface WorkerRelations {
  connect?: WorkerConnection[];
  update?: WorkerConnection[];
  disconnect?: {id: number}[];
}

export interface PersonnelConnection {
  id: number;
}

export interface PersonnelRelations {
  connect?: PersonnelConnection[];
  disconnect?: PersonnelConnection[];
}

export interface OperationUpdateData {
  status?: StatusOperation;
  zone?: number;
  motorShip?: string;
  dateStart?: string;
  timeStrat?: string; 
  dateEnd?: string;
  timeEnd?: string;
  id_clientProgramming?: number;
  id_group?: string;
  workers?: WorkerRelations;
  inCharged?: PersonnelRelations;
}
 interface WorkerGroup {
  workerIds: number[];
  dateStart: string;
  dateEnd: string;
  timeStart: string;
  timeEnd: string;
  id_task?: string;
}

export interface OperationCreateData {
  id?: number;
  status: StatusOperation;
  zone?: number;
  motorShip?: string;
  dateStart: string;
  timeStrat: string; 
  dateEnd: string;
  timeEnd: string;
  id_area: number;
  id_task?: number;
  id_client?: number;
  id_clientProgramming?: number | null;
  workerIds: number[];
  groups?: WorkerGroup[];
  id_group?: string;
  inChargedIds: number[];
}
