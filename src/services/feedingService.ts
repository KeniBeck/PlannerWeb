import api from "./client/axiosConfig";
import { handleApiError } from "@/lib/utils/apiUtils";
import { Feeding, FeedingFilterParams } from "./interfaces/feedingDTO";

export interface PaginatedFeedingResponse {
  items: Feeding[];
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
  nextPages?: Array<{ pageNumber: number; items: Feeding[] }>;
}
class FeedingService {
  async getAllFeedings(params?: FeedingFilterParams): Promise<Feeding[]> {
    try {
      // Construir parámetros de consulta
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
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

  async getPaginatedFeeding(
    page = 1,
    limit = 10,
    filters?: FeedingFilterParams
  ): Promise<PaginatedFeedingResponse> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters) {
        // Añadir solo los filtros que existen
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `/feeding/paginated?${queryParams.toString()}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo alimentaciones:", error);
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
      const response = await api.post("/feeding", data);
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
