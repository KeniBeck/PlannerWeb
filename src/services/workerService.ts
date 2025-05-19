import { Worker } from "@/core/model/worker";
import api from "./client/axiosConfig";
import { globalServiceCache } from "@/lib/utils/requestUtils";
class WorkerService {

  async createWorker(workerData: Worker): Promise<any> {
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

      const createData = {
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
      };
      const response = await api.post(`/worker`, createData);
      return response.data;
    } catch (error) {}
  }

  async getWorkers(): Promise<any> {
    try {
      return await globalServiceCache.getOrFetch("worker:all", async () => {
      const response = await api.get(`/worker`);
      return response.data;
    });
    } catch (error) {}
  }

  async updateWorker(workerId: number, workerData: Worker): Promise<any> {
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
      };
      const response = await api.patch(`/worker/${workerId}`, uppdateData);
      return response.data;
    } catch (error) {}
  }
}
export const workerService = new WorkerService();
