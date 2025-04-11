import { useState } from "react";
import { Service } from "@/core/model/service";

// Datos iniciales para simular servicios
const initialServices: Service[] = [
  { id: 1, name: "Carga y Descarga" },
  { id: 2, name: "Estiba y Desestiba" },
  { id: 3, name: "Almacenamiento" },
  { id: 4, name: "Transporte Marítimo" },
  { id: 5, name: "Logística Portuaria" }
];

export function useServices() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Agregar un nuevo servicio
  const addService = (newService: Omit<Service, "id">) => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        const newId = Math.max(...services.map(service => service.id), 0) + 1;
        const serviceToAdd = { ...newService, id: newId };
        setServices([...services, serviceToAdd]);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  // Actualizar un servicio existente
  const updateService = (updatedService: Service) => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        const updatedServices = services.map(service => 
          service.id === updatedService.id ? updatedService : service
        );
        setServices(updatedServices);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  // Eliminar un servicio por ID
  const deleteService = (serviceId: number) => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        setServices(services.filter(service => service.id !== serviceId));
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
        setServices(initialServices);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    error,
    addService,
    updateService,
    deleteService,
    refreshData
  };
}