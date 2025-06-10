import { handleApiError } from "@/lib/utils/apiUtils";
import api from "./client/axiosConfig";
import axios from "axios";
import {
  OperationFilterDto
} from "./interfaces/operationDTO";


class OperationService {
  async getPaginatedOperations(
    page = 1,
    limit = 10,
    filters?: OperationFilterDto
  ): Promise<any> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Añadir solo los filtros que existen
      if (filters) {
        // Usando Object.entries para iterar por las propiedades del objeto filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }
      const url = `/operation/paginated?${queryParams.toString()}`;

      const response = await api.get(url);

      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  async createOperation(operationData: any): Promise<any> {
    try {
      const response = await api.post("/operation", operationData);

      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  async getOperationById(id: number): Promise<any> {
    try {
      const response = await api.get(`/operation/${id}`);

      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  async updateWorkerGroups(
    operationId: number,
    groupData: {
      workers: {
        disconnect: Array<{
          id: number;
        }>;
      }
    }
  ): Promise<any> {
    try {
      if (!operationId) throw new Error("Se requiere un ID de operación válido");
      
      
      // Enviar directamente el objeto de actualización de grupos sin procesar
      const response = await api.patch(`/operation/${operationId}`, groupData);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }


  async getWorkersDistribution(date: string): Promise<any> {
    try {
      const response = await api.get(`/operation/analytics/worker-distribution?date=${date}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  async updateOperation(
    id: number,
    updateData: any
  ): Promise<any> {
    try {
      if (!id) throw new Error("Se requiere un ID de operación válido");


      // Separar la lógica de trabajadores para simplificar
      const workers: {
        connect: Array<any>;
        disconnect: Array<{ id: number }>;
        update: Array<any>;
      } = {
        connect: [],
        disconnect: [],
        update: [],
      };

    
   

      // Procesar workerGroups si existen
      if (updateData.workerGroups && Array.isArray(updateData.workerGroups)) {
  

        updateData.workerGroups.forEach((group: any) => {
          // Extraer los IDs de trabajadores
          const workerIds = Array.isArray(group.workers)
            ? group.workers.map((w: any) => typeof w === 'object' ? w.id : w)
            : (group.workerIds || []);

          if (workerIds.length === 0) return; // Saltar grupos vacíos

          // Determinar si es un grupo programado o trabajadores individuales
          const isScheduled =
            group.dateStart &&
            group.timeStart &&
            group.dateStart !== null &&
            group.timeStart !== null;

          // Verificar si el grupo tiene un ID (existente) o es nuevo
          if (group.groupId) {
            // GRUPOS EXISTENTES - Actualizar mediante 'update'
            workers.update.push({
              groupId: group.groupId,
              workerIds: workerIds,
              dateStart: isScheduled ? group.dateStart : null,
              dateEnd: isScheduled ? (group.dateEnd || null) : null,
              timeStart: isScheduled ? group.timeStart : null,
              timeEnd: isScheduled ? (group.timeEnd || null) : null
            });
      
          } else {
            // GRUPOS NUEVOS - Añadir mediante 'connect'
            workers.connect.push({
              workerIds: workerIds,
              dateStart: isScheduled ? group.dateStart : null,
              dateEnd: isScheduled ? (group.dateEnd || null) : null,
              timeStart: isScheduled ? group.timeStart : null,
              timeEnd: isScheduled ? (group.timeEnd || null) : null
            });
  
          }
        });
      }

      // Procesar trabajadores a desconectar
      if (updateData.removedWorkerIds && Array.isArray(updateData.removedWorkerIds) && updateData.removedWorkerIds.length > 0) {
        workers.disconnect = [...new Set(updateData.removedWorkerIds)]
          .filter((id: any) => id !== undefined && id !== null)
          .map((id: any) => ({ id: Number(id) }));

      
      }

    

      const response = await api.patch(`/operation/${id}`, updateData);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  async deleteOperation(id: number): Promise<any> {
    try {
      const response = await api.patch(`/operation/${id}`,
        { status: "DEACTIVATED" }
      );


      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }

  async getOperationByIdWithWorkers(id: number): Promise<any> {
    try {
      const response = await api.get(`/operation/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Manejar silenciosamente el caso cuando no hay operaciones
        return [];
      }
      // Para otros errores, propagar para manejo adecuado
      throw error;
    }
  }
}
export const operationService = new OperationService();
