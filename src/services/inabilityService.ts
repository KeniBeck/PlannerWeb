import { Inability } from "@/core/model/inability";
import api from "./client/axiosConfig";
import axios from "axios";
import { AxiosError } from "axios";

class InabilityService {
  async create(inability: Inability): Promise<Inability> {
    try {
      const response = await api.post(`/inability`, inability);
      return response.data;
    } catch (error) {
      console.error("Error creating inability:", error);
      const status = (error as AxiosError).response?.data;
      throw error;
    }
  }
}
export const inabilityService = new InabilityService();