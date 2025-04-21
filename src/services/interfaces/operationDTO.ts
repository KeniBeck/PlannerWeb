export interface OperationFilterDto {
  status?: StatusOperation[];
  dateStart?: Date;
  dateEnd?: Date;
  jobAreaId?: number;
  userId?: number;
  search?: string;
  inChargedId?: number;
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
  timeStrat?: string; // Nota: parece tener un typo en la API
  timeStart?: string; // Alternativa correcta
  dateEnd?: string;
  timeEnd?: string;
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
}

export interface OperationCreateData {
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
  workerIds: number[];
  groups?: WorkerGroup[];
  id_group?: string;
  inChargedIds: number[];
}
