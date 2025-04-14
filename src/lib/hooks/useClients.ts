import { useState } from "react";
import { Client } from "@/core/model/client";

// Datos de ejemplo para clientes
const initialClients: Client[] = [
  { id: 1, name: "Empresa ABC" },
  { id: 2, name: "Corporación XYZ" },
  { id: 3, name: "Industrias DEF" },
  { id: 4, name: "Transportes GHI" },
  { id: 5, name: "Logística JKL" },
  { id: 6, name: "Construcciones MNO" },
  { id: 7, name: "Marítima PQR" },
  { id: 8, name: "Exportadora STU" },
  { id: 9, name: "Importadora VWX" },
  { id: 10, name: "Internacional YZ" },
];

export function useClients() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Agregar un nuevo cliente
  const addClient = (clientData: Omit<Client, "id">) => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        const newClient = {
          ...clientData,
          id: Math.max(0, ...clients.map((c) => c.id)) + 1,
        };
        setClients([...clients, newClient]);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  // Actualizar un cliente existente
  const updateClient = (updatedClient: Client) => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        const updatedClients = clients.map((client) =>
          client.id === updatedClient.id ? updatedClient : client
        );
        setClients(updatedClients);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  // Eliminar un cliente por ID
  const deleteClient = (clientId: number) => {
    setLoading(true);
    try {
      // Simulamos una llamada a API
      setTimeout(() => {
        setClients(clients.filter((client) => client.id !== clientId));
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
        setClients(initialClients);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    refreshData,
  };
}