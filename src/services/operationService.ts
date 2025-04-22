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

  async createOperation(operationData: OperationCreateData): Promise<any> {
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
    updateData: OperationUpdateData
  ): Promise<any> {
    try {
      if (!id) throw new Error("Se requiere un ID de operación válido");

      const response = await api.put(`/operation/${id}`, updateData);

      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
}
export const operationService = new OperationService();
