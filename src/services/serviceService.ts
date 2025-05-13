import { Service } from "@/core/model/service";
import api from "./client/axiosConfig";

class ServiceService {
    private baseUrl = import.meta.env.VITE_API_URL;

    async getServices(): Promise<Service[]> {
        try {
            const response = await api.get(`${this.baseUrl}/task`);

            if (response.status !== 200) {
                throw new Error("Error fetching services");
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching services:", error);
            throw error;
        }
    }

    async addService(service: Omit<Service, "id">): Promise<Service> {
        try {
            const response = await api.post(`${this.baseUrl}/task`, service);

            if (response.status < 200 || response.status >= 300) {
                throw new Error("Error adding service");
            }
            return response.data;
        } catch (error) {
            console.error("Error adding service:", error);
            throw error;
        }
    }

    async updateService(service: Service): Promise<Service> {
        try {
            const response = await api.patch(`${this.baseUrl}/task/${service.id}`, service);

            if (response.status !== 200) {
                throw new Error("Error updating service");
            }
            return response.data;
        } catch (error) {
            console.error("Error updating service:", error);
            throw error;
        }
    }

    async deleteService(serviceId: number): Promise<void> {
        try {
            const response = await api.patch(`${this.baseUrl}/task/${serviceId}`,
                { status: "INACTIVE" } 
            );

            if (response.status !== 200) {
                throw new Error("Error deleting service");
            }
        } catch (error) {
            console.error("Error deleting service:", error);
            throw error;
        }
    }
}

export const serviceService = new ServiceService();