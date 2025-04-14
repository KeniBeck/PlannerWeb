import { Area } from "@/core/model/area";
import { areaService } from "@/services/areaService";
import { createContext, useContext, useEffect, useState } from "react";

interface AreasContextType {
    areas: Area[];
    loading: boolean;
    refreshData: () => Promise<void>;
    addArea: (area: Omit<Area, "id">) => Promise<void>;
    updateArea: (area: Area) => Promise<void>;
    deleteArea: (areaId: number) => Promise<void>;
}

// Crear el contexto
const AreasContext = createContext<AreasContextType | undefined>(undefined);

// Provider component
export function AreasProvider({ children }: { children: React.ReactNode }) {
    // Inicializa el estado
    const [areas, setAreas] = useState<Area[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    
    // Función para cargar las áreas
    const refreshAreas = async () => {
        setIsLoading(true);
        try {
            const response = await areaService.getAreas();
            setAreas(response);
            setLastUpdated(new Date());
        } catch (err) {
            setError("Error al cargar las áreas");
            console.error("Error loading areas:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para agregar un área
    const addArea = async (area: Omit<Area, "id">) => {
        setIsLoading(true);
        try {
            const response = await areaService.addArea(area);
            setAreas((prevAreas) => [...prevAreas, response]);
            setLastUpdated(new Date());
        } catch (err) {
            setError("Error al agregar el área");
            console.error("Error adding area:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para actualizar un área
    const updateArea = async (area: Area) => {
        setIsLoading(true);
        try {
            const response = await areaService.updateArea(area);
            setAreas((prevAreas) =>
                prevAreas.map((a) => (a.id === response.id ? response : a))
            );
            setLastUpdated(new Date());
        } catch (err) {
            setError("Error al actualizar el área");
            console.error("Error updating area:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para eliminar un área
    const deleteArea = async (areaId: number) => {
        setIsLoading(true);
        try {
            await areaService.deleteArea(areaId);
            setAreas((prevAreas) => prevAreas.filter((a) => a.id !== areaId));
            setLastUpdated(new Date());
        } catch (err) {
            setError("Error al eliminar el área");
            console.error("Error deleting area:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para refrescar los datos
    const refreshData = async () => {
        await refreshAreas();
    };
    
    // Cargar las áreas al montar el componente
    useEffect(() => {
        refreshAreas();
    }, []);
    
    const value = {
        areas,
        loading: isLoading,
        refreshData,
        addArea,
        updateArea,
        deleteArea
    };
    

    return (
        <AreasContext.Provider value={value}>
            {children}
        </AreasContext.Provider>
    );
}

// Custom hook para usar este contexto
export function useAreas() {
    const context = useContext(AreasContext);

    if (!context) {
        throw new Error("useAreas must be used within an AreasProvider");
    }

    return context;
}

// Exportar el contexto para uso directo si es necesario
export { AreasContext };