import { Programming } from "@/core/model/programming";
import api from "./client/axiosConfig";
import { StatusCodeAlert } from "@/components/dialog/AlertsLogin";

export class ClientProgrammingService {
    private baseUrl = import.meta.env.VITE_API_URL;

    async createProgramation(programation: Omit<Programming, "id">): Promise<Programming> {
        try {
            const response = await api.post(`${this.baseUrl}/client-programming`, programation);

            if (response.status < 200 || response.status >= 300) {
                StatusCodeAlert(response);
            }
            return response.data;
        } catch (error) {
            console.error("Error creating programation:", error);
            throw error;
        }
    }


    async getProgramation(date: string) {
        try {
            const response = await api.get(`${this.baseUrl}/client-programming?date=${date}`);
            if (response.status < 200 || response.status >= 300) {
                StatusCodeAlert(response);
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching programation:", error);
            throw error;
        }
    }
}