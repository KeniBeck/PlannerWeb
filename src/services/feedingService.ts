import api from "./client/axiosConfig";
import { handleApiError } from "@/lib/utils/apiUtils";

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
}

class FeedingService {
  async getAllFeedings(params?: FeedingFilterParams): Promise<Feeding[]> {
    try {
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await api.get(`/feeding?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  async getOperationFeedings(operationId: number): Promise<Feeding[]> {
    try {
      const response = await api.get(`/feeding/operation/${operationId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  async assignFeeding(data: {
    operationId: number;
    workerId: number;
    type: string;
  }): Promise<Feeding> {
    try {
      const response = await api.post('/feeding', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  async deleteFeeding(id: number): Promise<void> {
    try {
      await api.delete(`/feeding/${id}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
}

export const feedingService = new FeedingService();