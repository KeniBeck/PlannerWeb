import { Operation } from "@/core/model/operation";

export interface Feeding {
  id: number;
  id_worker: number;
  id_operation: number;
  dateFeeding: string;
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  createAt: string;
  updateAt: string;
  operation: Operation;
  enhancedOperation?: Operation;
  createdAt: string;
  status: string;
  workerDetails: any;
  worker: {
    name: string;
  }
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