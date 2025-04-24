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
      
      console.log("Actualizando grupos de trabajadores:", groupData);
      
      // Enviar directamente el objeto de actualización de grupos sin procesar
      const response = await api.patch(`/operation/${operationId}`, groupData);
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

      console.log("Datos de actualización recibidos:", updateData);

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

      // Crear estructura base para los datos a enviar
      const dataFmt: any = {
        dateStart: updateData.dateStart || "",
        timeStrat: updateData.timeStart || updateData.timeStrat || "",
        inCharged: updateData.inChargedIds || [],
        status: updateData.status || null,
        zone: updateData.zone || null,
      };

      // Agregar campos opcionales si existen
      if (updateData.timeEnd) dataFmt.timeEnd = updateData.timeEnd;
      if (updateData.dateEnd) dataFmt.dateEnd = updateData.dateEnd;
      if (updateData.motorShip) dataFmt.motorShip = updateData.motorShip;

      // Procesar workerGroups si existen
      if (updateData.workerGroups && Array.isArray(updateData.workerGroups)) {
        console.log("Procesando workerGroups:", updateData.workerGroups.length);

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
            console.log(`Actualizando grupo existente ${group.groupId} con ${workerIds.length} trabajadores`);
          } else {
            // GRUPOS NUEVOS - Añadir mediante 'connect'
            workers.connect.push({
              workerIds: workerIds,
              dateStart: isScheduled ? group.dateStart : null,
              dateEnd: isScheduled ? (group.dateEnd || null) : null,
              timeStart: isScheduled ? group.timeStart : null,
              timeEnd: isScheduled ? (group.timeEnd || null) : null
            });
            console.log(`Creando nuevo grupo con ${workerIds.length} trabajadores`);
          }
        });
      }

      // Procesar trabajadores a desconectar
      if (updateData.removedWorkerIds && Array.isArray(updateData.removedWorkerIds) && updateData.removedWorkerIds.length > 0) {
        workers.disconnect = [...new Set(updateData.removedWorkerIds)]
          .filter((id: any) => id !== undefined && id !== null)
          .map((id: any) => ({ id: Number(id) }));

        console.log("Trabajadores a desconectar:", workers.disconnect);
      }

      // Solo incluir workers en el payload si hay algo para conectar, desconectar o actualizar
      if (workers.connect.length > 0 || workers.disconnect.length > 0 || workers.update.length > 0) {
        dataFmt.workers = workers;
      }

      console.log("Enviando datos de actualización:", JSON.stringify(dataFmt, null, 2));
      const response = await api.patch(`/operation/${id}`, dataFmt);
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

      console.log("Respuesta de eliminación:", response.data);

      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
}
export const operationService = new OperationService();
