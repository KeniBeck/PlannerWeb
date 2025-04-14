import { useState } from "react";
import { Area } from "@/core/model/area";

// Datos de ejemplo para áreas
const initialAreas: Area[] = [
  { id: 1, name: "Construcción" },
  { id: 2, name: "Electricidad" },
  { id: 3, name: "Plomería" },
  { id: 4, name: "Carpintería" },
  { id: 5, name: "Pintura" },
  { id: 6, name: "Soldadura" },
  { id: 7, name: "Mecánica" },
  { id: 8, name: "Limpieza" },
  { id: 9, name: "Jardinería" },
  { id: 10, name: "Seguridad" },
];

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>(initialAreas);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Agregar una nueva área
  const addArea = (newArea: Omit<Area, "id">) => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        const newId = Math.max(...areas.map(area => area.id), 0) + 1;
        const areaToAdd = { ...newArea, id: newId };
        setAreas([...areas, areaToAdd]);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  // Actualizar un área existente
  const updateArea = (updatedArea: Area) => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        const updatedAreas = areas.map(area => 
          area.id === updatedArea.id ? updatedArea : area
        );
        setAreas(updatedAreas);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  // Eliminar un área por ID
  const deleteArea = (areaId: number) => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        setAreas(areas.filter(area => area.id !== areaId));
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  // Refrescar datos
  const refreshData = () => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        setAreas(initialAreas);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  return {
    areas,
    loading,
    error,
    addArea,
    updateArea,
    deleteArea,
    refreshData
  };
}