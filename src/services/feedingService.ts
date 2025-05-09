import api from "./client/axiosConfig";
import { handleApiError } from "@/lib/utils/apiUtils";
import { format } from "date-fns"; // Asegúrate de importar format

interface FeedingResponse {
  id: number;
  type: string; // 'Desayuno', 'Almuerzo', 'Cena', 'Media noche'
  id_worker: number | null;
  id_operation: number;
  createdAt: string;
}

class FeedingService {
  async getOperationFeedings(operationId: number): Promise<FeedingResponse[]> {
    try {
      const response = await api.get(`/feeding/operation/${operationId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return [];
    }
  }

  async assignFeeding(operationId: number, workerId: number, type: string): Promise<FeedingResponse | null> {
    try {
      // Formatear la fecha correctamente como YYYY-MM-DD HH:MM
      const formattedDate = format(new Date(), "yyyy-MM-dd HH:mm");
      
      const response = await api.post('/feeding', {
        id_operation: operationId,
        id_worker: workerId,
        type,
        dateFeeding: formattedDate, // Formato correcto
      });

      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  }
}

export const feedingService = new FeedingService();