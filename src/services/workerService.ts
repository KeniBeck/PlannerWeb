import { Worker } from "@/core/model/worker";
import api from "./client/axiosConfig";
class WorkerService {
  private baseUrl = import.meta.env.VITE_API_URL;

  async getWorkers(): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/worker`);
      return response.data;
    } catch (error) {}
  }

  async updateWorker(workerId: number,workerData: Worker): Promise<any> {
    try {
      const {      
        dni,
        code,
        phone,
        name,
        status,
        failures,
        dateDisableStart,
        dateDisableEnd,
        dateRetierment,
        jobArea,
      } = workerData;

        const uppdateData = {
          dni,
          code,
          phone,
          name,
          status,
          failures,
          dateDisableStart,
          dateDisableEnd,
          dateRetierment,
          id_area: jobArea.id,
        }
      const response = await api.patch(`${this.baseUrl}/worker/${workerId}`, uppdateData);
      return response.data;
    } catch (error) {}
  }

 
}
export const workerService = new WorkerService();
