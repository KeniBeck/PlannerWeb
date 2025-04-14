import { Fault, PaginatedResponse } from "@/core/model/fault";
import api from "./client/axiosConfig";

class FaultService {
  async getPaginatedFaults(page = 1, limit = 10): Promise<PaginatedResponse> {
    try {
      const response = await api.get(
        `/called-attention/paginated?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error obteniendo faltas:", error);
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
