import { Area } from "@/core/model/area";
import api from "./client/axiosConfig";

class AreaService {
    private baseUrl = import.meta.env.VITE_API_URL;

    async getAreas(): Promise<Area[]> {
        try {
            const response = await api.get(`${this.baseUrl}/area`);

            if (response.status !== 200) {
                throw new Error("Error fetching areas");
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching areas:", error);
            throw error;
        }
    }

    async addArea(area: Omit<Area, "id">): Promise<Area> {
        try {
            const response = await api.post(`${this.baseUrl}/area`, area);

            if (response.status < 200 || response.status >= 300) {
                throw new Error("Error adding area");
            }
            return response.data;
        } catch (error) {
            console.error("Error adding area:", error);
            throw error;
        }
    }

    async updateArea(area: Area): Promise<Area> {
        try {
            const response = await api.put(`${this.baseUrl}/area/${area.id}`, area);

            if (response.status !== 200) {
                throw new Error("Error updating area");
            }
            return response.data;
        } catch (error) {
            console.error("Error updating area:", error);
            throw error;
        }
    }

    async deleteArea(areaId: number): Promise<void> {
        try {
            const response = await api.delete(`${this.baseUrl}/area/${areaId}`);

            if (response.status !== 200) {
                throw new Error("Error deleting area");
            }
        } catch (error) {
            console.error("Error deleting area:", error);
            throw error;
        }
    }
}

export const areaService = new AreaService();