import { Client } from "@/core/model/client";
import { clientService } from "@/services/clientService";
import { createContext, useContext, useEffect, useState } from "react";

interface ClientsContextType {
    clients: Client[];
    loading: boolean;
    refreshData: () => Promise<void>;
    addClient: (client: Omit<Client, "id">) => Promise<void>;
    updateClient: (client: Client) => Promise<void>;
    deleteClient: (clientId: number) => Promise<void>;
}

// Crear el contexto
const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

// Provider component
export function ClientsProvider({ children }: { children: React.ReactNode }) {
    // Inicializa el estado
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    
    // Función para cargar los clientes
    const refreshClients = async () => {
        setIsLoading(true);
        try {
            const response = await clientService.getClients();
            setClients(response);
            setLastUpdated(new Date());
        } catch (err) {
            setError("Error al cargar los clientes");
            console.error("Error loading clients:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para agregar un cliente
    const addClient = async (client: Omit<Client, "id">) => {
        setIsLoading(true);
        try {
            const response = await clientService.addClient(client);
            setClients((prevClients) => [...prevClients, response]);
            setLastUpdated(new Date());
        } catch (err) {
            setError("Error al agregar el cliente");
            console.error("Error adding client:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para actualizar un cliente
    const updateClient = async (client: Client) => {
        setIsLoading(true);
        try {
            const response = await clientService.updateClient(client);
            setClients((prevClients) =>
                prevClients.map((c) => (c.id === response.id ? response : c))
            );
            setLastUpdated(new Date());
        } catch (err) {
            setError("Error al actualizar el cliente");
            console.error("Error updating client:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para eliminar un cliente
    const deleteClient = async (clientId: number) => {
        setIsLoading(true);
        try {
            await clientService.deleteClient(clientId);
            setClients((prevClients) => prevClients.filter((c) => c.id !== clientId));
            setLastUpdated(new Date());
        } catch (err) {
            setError("Error al eliminar el cliente");
            console.error("Error deleting client:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para refrescar los datos
    const refreshData = async () => {
        await refreshClients();
    };
    
    // Cargar los clientes al montar el componente
    useEffect(() => {
        refreshClients();
    }, []);
    
    const value = {
        clients,
        loading: isLoading,
        refreshData,
        addClient,
        updateClient,
        deleteClient
    };
    
    return (
        <ClientsContext.Provider value={value}>
            {children}
        </ClientsContext.Provider>
    );
}

// Custom hook para usar este contexto
export function useClients() {
    const context = useContext(ClientsContext);

    if (!context) {
        throw new Error("useClients must be used within a ClientsProvider");
    }

    return context;
}

// Exportar el contexto para uso directo si es necesario
export { ClientsContext };