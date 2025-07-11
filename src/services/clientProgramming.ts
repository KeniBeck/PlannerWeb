import { Programming } from "@/core/model/programming";
import api from "./client/axiosConfig";
import { StatusCodeAlert } from "@/components/dialog/AlertsLogin";
import { globalServiceCache } from "@/lib/utils/requestUtils";
import { ProgrammingFilterDTO } from "./interfaces/programming";

export class ClientProgrammingService {
  async createProgramation(
    programation: Omit<Programming, "id">
  ): Promise<Programming> {
    try {
      const response = await api.post(`/client-programming`, programation);

      if (response.status < 200 || response.status >= 300) {
        StatusCodeAlert(response);
      }
      return response.data;
    } catch (error) {
      console.error("Error creating programation:", error);
      throw error;
    }
  }

  async updateProgramation(programation: Programming): Promise<Programming> {
    try {
      const response = await api.patch(
        `/client-programming/${programation.id}`,
        programation
      );

      if (response.status < 200 || response.status >= 300) {
        StatusCodeAlert(response);
      }
      return response.data;
    } catch (error) {
      console.error("Error updating programation:", error);
      throw error;
    }
  }

  async getProgramation(fliter?: ProgrammingFilterDTO): Promise<Programming[]> {
    try {
          const response = await api.get(`/client-programming/filtered`, {
            params: fliter,
          });
          return response.data;
    } catch (error) {
      console.error("Error fetching programation:", error);
      throw error;
    }
  }

  async deleteProgramation(id: number): Promise<void> {
    try {
      const response = await api.delete(`/client-programming/${id}`);

      if (response.status < 200 || response.status >= 300) {
        StatusCodeAlert(response);
      }
    } catch (error) {
      console.error("Error deleting programation:", error);
      throw error;
    }
  }
}
