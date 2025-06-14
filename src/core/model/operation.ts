
export interface Operation {
  id: number;
  name: string;
  status: "PENDING" | "INPROGRESS" | "COMPLETED" | "CANCELED" | "DEACTIVATED";
  dateStart: string;
  dateEnd: string | null;
  timeStrat: string;
  timeEnd: string | null;
  motorShip: string;
  zone: number;
  client: {
    id: number;
    name: string;
  };
  jobArea: {
    id: number;
    name: string;
  };
  task: {
    id: number;
    name: string;
  };
  inCharge: Array<{
    id: number;
    name: string;
    occupation?: string;
  }>;
  workers: Array<{
    id: number;
    name: string;
  }>;
  Site: {
    id: number;
    name: string;
  } | null;
  clientProgramming: {
    service: string;
  } | null;
  workerGroups: Array<{
    groupId: number | null;
    schedule: {
      dateStart: string | null;
      dateEnd: string | null;
      timeStart: string | null;
      timeEnd: string | null;
      id_task: string | null;
      task: string | null;
    };
    workers: Array<{
      id: number;
      name: string;
    }>;
  }>;
  createAt: string;
  updateAt: string;
}

export enum OperationStatus {
  PENDING = "PENDING",
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}
