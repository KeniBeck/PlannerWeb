import { handleApiError } from "@/lib/utils/apiUtils";
import api from "./client/axiosConfig";
import {
  OperationCreateData,
  OperationFilterDto,
  OperationUpdateData,
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

      console.log("Response data:", response.data);

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

  async updateOperation(
    id: number,
    updateData: any
  ): Promise<any> {
    try {
      if (!id) throw new Error("Se requiere un ID de operación válido");

      console.log("Datos de actualización:", updateData);

      // Separar la lógica de trabajadores para simplificar
      const workers: {
        connect: Array<{
          workerIds: any[];
          dateStart: string | null;
          dateEnd: string | null;
          timeStart: string | null;
          timeEnd: string | null;
        }>;
        disconnect: Array<{ id: number }>;
        update: Array<{
          workerIds: any[];
          dateStart: string | null;
          dateEnd: string | null;
          timeStart: string | null;
          timeEnd: string | null;
        }>;
      } = {
        // Conectar nuevos trabajadores individuales y grupos
        connect: [],
        // Desconectar trabajadores que se eliminaron
        disconnect: [],
        update: [],
      };

      // Crear estructura base para los datos a enviar
      const dataFmt: any = {
        dateStart: updateData.dateStart || "",
        timeStrat: updateData.timeStrat || "",
        inCharged: updateData.inChargedIds || [],
        status: updateData.status || null,
        zone: updateData.zone || null,
      };

      // Agregar campos opcionales si existen
      if (updateData.timeEnd) dataFmt.timeEnd = updateData.timeEnd;
      if (updateData.dateEnd) dataFmt.dateEnd = updateData.dateEnd;
      if (updateData.motorShip) dataFmt.motorShip = updateData.motorShip;

      // Procesar grupos y trabajadores
      if (updateData.groups && updateData.groups.length > 0) {
        // Grupos con fechas (cada uno se envía como un connect)
        const realGroups = updateData.groups.filter(
          (group: any) => group.dateStart && group.timeStart
        );

        const individualWorker = updateData.groups.filter(
          (group: any) => !group.dateStart && !group.timeStart
        );

        individualWorker.forEach((worker: any) => {
          workers.update.push({
            workerIds: worker.workers || worker.workerIds || [],
            dateStart: null,
            dateEnd: null,
            timeStart: null,
            timeEnd: null
          });
        });


        

        if (updateData.removedWorkerIds
          && updateData.removedWorkerIds
          .length > 0) {
          workers.disconnect = updateData.removedWorkerIds
          .map((id: number) => ({ id }));
        }

        // Para cada grupo real, crear una entrada en connect
        if (realGroups.length > 0) {
          realGroups.forEach((group: any)  => {
            workers.update.push({
              workerIds: group.workers || group.workerIds || [],
              dateStart: group.dateStart,
              dateEnd: group.dateEnd || null,
              timeStart: group.timeStart,
              timeEnd: group.timeEnd || null
            });
          });
        }
      }

     
      // Si hay workers que ya no están incluidos, agregarlos a disconnect
      if (updateData.removedWorkerIds && updateData.removedWorkerIds.length > 0) {
        workers.disconnect = updateData.removedWorkerIds.map((id: number) => ({ id }));
      }

          // Solo incluir workers en el payload si hay algo para conectar, desconectar o actualizar
      if (workers.connect.length > 0 || workers.disconnect.length > 0 || workers.update.length > 0) {
        dataFmt.workers = workers;
      }

      console.log("Enviando datos de actualización:", dataFmt);
      const response = await api.patch(`/operation/${id}`, dataFmt);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
}
export const operationService = new OperationService();
