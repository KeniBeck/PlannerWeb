import { Fault, PaginatedResponse } from "@/core/model/fault";
import api from "./client/axiosConfig";
import { Incidence } from "@/components/ui/workers/WorkerIncidencesList";
import { FaultFilterDTO } from "./interfaces/faultDTo";

class FaultService {
  async getPaginatedFaults(
    page = 1,
    limit = 10,
    filters?: FaultFilterDTO
  ): Promise<PaginatedResponse> {
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

      const url = `/called-attention/paginated?${queryParams.toString()}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo faltas:", error);
      throw error;
    }
  }

  async getFaultById(id: number): Promise<Fault> {
    try {
      const response = await api.get(`/called-attention/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo falta por ID:", error);
      throw error;
    }
  }

  async getFaultByIdWorker(id: number): Promise<Incidence[]> {
    try {
      const response = await api.get(`/called-attention/by-worker/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo falta por ID de trabajador:", error);
      throw error;
    }
  }

  async createFault(faultData: Omit<Fault, "id">): Promise<Fault> {
    try {
      const response = await api.post("/called-attention", faultData);
      return response.data;
    } catch (error) {
      console.error("Error creando falta:", error);
      throw error;
    }
  }

  async updateFault(id: number, faultData: Partial<Fault>): Promise<Fault> {
    try {
      const response = await api.put(`/called-attention/${id}`, faultData);
      return response.data;
    } catch (error) {
      console.error("Error actualizando falta:", error);
      throw error;
    }
  }

  async deleteFault(id: number): Promise<void> {
    try {
      await api.delete(`/called-attention/${id}`);
    } catch (error) {
      console.error("Error eliminando falta:", error);
      throw error;
    }
  }
}

export const faultService = new FaultService();
