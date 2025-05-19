export interface Feeding {
   id: number;
  id_worker: number;
  id_operation: number;
  dateFeeding: string;
  type: string; // 'BREAKFAST', 'LUNCH', 'DINNER', 'MIDNIGHT'
  createAt: string;
  updateAt: string;
  // Referencias opcionales que podrían ser cargadas por relación
  worker?: {
    id: number;
    name: string;
    // otros campos del trabajador...
  };
  operation?: {
    id: number;
    jobArea?: {
      name: string;
    };
    client?: {
      name: string;
    };
    task?:{
      name: string;     
    };
    motorShip?: string;
  };
  createdAt: string;
  status: string;
  workerDetails: any;
}

export interface FeedingFilterParams {
  startDate?: string;
  endDate?: string;
  operationId?: number;
  workerId?: number;
  type?: string;
  status?: string;
  search?: string;
}