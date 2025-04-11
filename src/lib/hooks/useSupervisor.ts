import { useState } from "react";
import { Supervisor } from "@/core/model/supervisor";

// Datos de ejemplo para supervisores
const initialSupervisors: Supervisor[] = [
  { 
    id: 1, 
    name: "Carlos Mendoza", 
    dni: "12345678", 
    phone: "999888777", 
    specialty: "Carga y descarga",
    email: "carlos.mendoza@empresa.com",
    status: "active",
    yearsOfExperience: 5
  },
  { 
    id: 2, 
    name: "Ana Quiroz", 
    dni: "87654321", 
    phone: "987654321", 
    specialty: "Logística marítima",
    email: "ana.quiroz@empresa.com",
    status: "active",
    yearsOfExperience: 8
  },
  { 
    id: 3, 
    name: "Miguel Paredes", 
    dni: "23456789", 
    phone: "956784321", 
    specialty: "Operaciones portuarias",
    email: "miguel.paredes@empresa.com",
    status: "inactive",
    yearsOfExperience: 3
  },
  { 
    id: 4, 
    name: "Luisa Vargas", 
    dni: "34567890", 
    phone: "978563412", 
    specialty: "Seguridad industrial",
    email: "luisa.vargas@empresa.com",
    status: "on_leave",
    yearsOfExperience: 6
  },
  { 
    id: 5, 
    name: "Roberto Sánchez", 
    dni: "45678901", 
    phone: "965874123", 
    specialty: "Operaciones especiales",
    email: "roberto.sanchez@empresa.com",
    status: "active",
    yearsOfExperience: 10
  }
];

export function useSupervisors() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>(initialSupervisors);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Agregar un nuevo supervisor
  const addSupervisor = (newSupervisor: Omit<Supervisor, "id">) => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        const newId = Math.max(...supervisors.map(supervisor => supervisor.id), 0) + 1;
        const supervisorToAdd = { ...newSupervisor, id: newId };
        setSupervisors([...supervisors, supervisorToAdd as Supervisor]);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  // Actualizar un supervisor existente
  const updateSupervisor = (updatedSupervisor: Supervisor) => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        const updatedSupervisors = supervisors.map(supervisor => 
          supervisor.id === updatedSupervisor.id ? updatedSupervisor : supervisor
        );
        setSupervisors(updatedSupervisors);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  // Eliminar un supervisor por ID
  const deleteSupervisor = (supervisorId: number) => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        setSupervisors(supervisors.filter(supervisor => supervisor.id !== supervisorId));
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
        setSupervisors(initialSupervisors);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  return {
    supervisors,
    loading,
    error,
    addSupervisor,
    updateSupervisor,
    deleteSupervisor,
    refreshData
  };
}