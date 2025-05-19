import { Area } from "@/core/model/area";
import api from "./client/axiosConfig";
import { globalServiceCache } from "@/lib/utils/requestUtils";

class AreaService {
  private baseUrl = import.meta.env.VITE_API_URL;

  async getAreas(): Promise<Area[]> {
    try {
      return await globalServiceCache.getOrFetch("area:all", async () => {
        const response = await api.get(`${this.baseUrl}/area`);

        if (response.status !== 200) {
          throw new Error("Error fetching areas");
        }
        return response.data;
      });
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
      const response = await api.patch(`${this.baseUrl}/area/${area.id}`, area);

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
      const response = await api.patch(`${this.baseUrl}/area/${areaId}`, {
        status: "INACTIVE",
      });

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
