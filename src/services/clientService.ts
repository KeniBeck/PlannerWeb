import { Client } from "@/core/model/client";
import api from "./client/axiosConfig";

class ClientService {
    private baseUrl = import.meta.env.VITE_API_URL;

    async getClients(): Promise<Client[]> {
        try {
            const response = await api.get(`${this.baseUrl}/client`);

            if (response.status !== 200) {
                throw new Error("Error fetching clients");
            }
            return response.data;
        } catch (error) {
            console.error("Error fetching clients:", error);
            throw error;
        }
    }

    async addClient(client: Omit<Client, "id">): Promise<Client> {
        try {
            const response = await api.post(`${this.baseUrl}/client`, client);

            if (response.status < 200 || response.status >= 300) {
                throw new Error("Error adding client");
            }
            return response.data;
        } catch (error) {
            console.error("Error adding client:", error);
            throw error;
        }
    }

    async updateClient(client: Client): Promise<Client> {
        try {
            const response = await api.put(`${this.baseUrl}/client/${client.id}`, client);

            if (response.status !== 200) {
                throw new Error("Error updating client");
            }
            return response.data;
        } catch (error) {
            console.error("Error updating client:", error);
            throw error;
        }
    }

    async deleteClient(clientId: number): Promise<void> {
        try {
            const response = await api.delete(`${this.baseUrl}/client/${clientId}`);

            if (response.status !== 200) {
                throw new Error("Error deleting client");
            }
        } catch (error) {
            console.error("Error deleting client:", error);
            throw error;
        }
    }
}

export const clientService = new ClientService();