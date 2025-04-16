import { Service } from "@/core/model/service";
import { serviceService } from "@/services/serviceService";
import { createContext, useContext, useEffect, useState } from "react";

interface ServicesContextType {
    services: Service[];
    loading: boolean;
    refreshData: () => Promise<void>;
    addService: (service: Omit<Service, "id">) => Promise<void>;
    updateService: (service: Service) => Promise<void>;
    deleteService: (serviceId: number) => Promise<void>;
}

// Crear el contexto
const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

// Provider component
export function ServicesProvider({ children }: { children: React.ReactNode }) {
    // Inicializa el estado
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    
    // Función para cargar los servicios
    const refreshServices = async () => {
        setIsLoading(true);
        try {
            const response = await serviceService.getServices();
            setServices(response);
            setLastUpdated(new Date());
        } catch (err) {
            setError("Error al cargar los servicios");
            console.error("Error loading services:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para agregar un servicio
    const addService = async (service: Omit<Service, "id">) => {
        setIsLoading(true);
        try {
            const response = await serviceService.addService(service);
            setServices((prevServices) => [...prevServices, response]);
            setLastUpdated(new Date());
        } catch (err) {
            setError("Error al agregar el servicio");
            console.error("Error adding service:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para actualizar un servicio
    const updateService = async (service: Service) => {
        setIsLoading(true);
        try {
            const response = await serviceService.updateService(service);
            setServices((prevServices) =>
                prevServices.map((s) => (s.id === response.id ? response : s))
            );
            setLastUpdated(new Date());
        } catch (err) {
            setError("Error al actualizar el servicio");
            console.error("Error updating service:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para eliminar un servicio
    const deleteService = async (serviceId: number) => {
        setIsLoading(true);
        try {
            await serviceService.deleteService(serviceId);
            setServices((prevServices) => prevServices.filter((s) => s.id !== serviceId));
            setLastUpdated(new Date());
        } catch (err) {
            setError("Error al eliminar el servicio");
            console.error("Error deleting service:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para refrescar los datos
    const refreshData = async () => {
        await refreshServices();
    };
    
    // Cargar los servicios al montar el componente
    useEffect(() => {
        refreshServices();
    }, []);
    
    const value = {
        services,
        loading: isLoading,
        refreshData,
        addService,
        updateService,
        deleteService
    };
    
    return (
        <ServicesContext.Provider value={value}>
            {children}
        </ServicesContext.Provider>
    );
}

// Custom hook para usar este contexto
export function useServices() {
    const context = useContext(ServicesContext);

    if (!context) {
        throw new Error("useServices must be used within a ServicesProvider");
    }

    return context;
}

// Exportar el contexto para uso directo si es necesario
export { ServicesContext };