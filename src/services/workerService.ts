import api from "./client/axiosConfig";
class WorkerService {
  private baseUrl = import.meta.env.VITE_API_URL;

  async getWorkers(): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/worker`);
      return response.data;
    } catch (error) {}
  }
}
export const workerService = new WorkerService();
