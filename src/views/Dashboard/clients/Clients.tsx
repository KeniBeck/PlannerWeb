import { useState } from "react";
import { useClients } from "@/lib/hooks/useClients";
import { Client } from "@/core/model/client";
import { ClientsList } from "@/components/ui/ClientsList";
import { AiOutlineSearch, AiOutlinePlusCircle, AiOutlineDownload, AiOutlineReload } from "react-icons/ai";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { AddClientDialog } from "@/components/ui/AddClientDialog";

export default function Clients() {
  const { clients, loading, addClient, updateClient, deleteClient, refreshData } = useClients();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | undefined>(undefined);

  // Filtrar clientes según el término de búsqueda
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar la edición de un cliente
  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsAddClientOpen(true);
  };

  // Manejar guardar un cliente (nuevo o editado)
  const handleSaveClient = (client: Omit<Client, "id"> & { id?: number }) => {
    if (client.id) {
      // Actualizar cliente existente
      updateClient(client as Client);
      StatusSuccessAlert("Éxito", "Cliente actualizado correctamente");
    } else {
      // Agregar nuevo cliente
      addClient(client);
      StatusSuccessAlert("Éxito", "Cliente agregado correctamente");
    }
  };

  // Manejar la eliminación de un cliente
  const handleDeleteClient = (clientId: number) => {
    // Aquí podrías mostrar una confirmación antes de eliminar
    if (window.confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      deleteClient(clientId);
      StatusSuccessAlert("Éxito", "Cliente eliminado correctamente");
    }
  };

  // Manejador de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Manejador para abrir diálogo de nuevo cliente
  const handleAddClient = () => {
    setClientToEdit(undefined); // Resetear el cliente a editar
    setIsAddClientOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        {/* Header */}
        <header className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-md">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-blue-100 mt-1 font-light">
              Administración de clientes de la empresa
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              title="Exportar datos"
              className="p-2 rounded-lg bg-blue-500 bg-opacity-30 hover:bg-opacity-50 text-white transition-all shadow-sm"
            >
              <AiOutlineDownload className="h-5 w-5" />
            </button>

            <button
              title="Actualizar datos"
              className="p-2 rounded-lg bg-blue-500 bg-opacity-30 hover:bg-opacity-50 text-white transition-all shadow-sm"
              onClick={() => refreshData()}
              disabled={loading}
            >
              <AiOutlineReload className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              className="bg-white text-blue-700 border-none hover:bg-blue-50 shadow-sm ml-2 rounded-md flex gap-1 items-center p-2 transition-all"
              onClick={handleAddClient}
            >
              <AiOutlinePlusCircle className="mr-2" /> Agregar Cliente
            </button>
          </div>
        </header>

        {/* Búsqueda */}
        <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
          <div className="flex gap-4 items-center p-2">
            <div>
              <div className="relative">
                <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de cliente"
                  className="p-2 pl-10 w-80 border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vista principal */}
      <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando clientes...</p>
              </div>
            </div>
          ) : (
            <ClientsList 
              clients={filteredClients} 
              onEdit={handleEditClient} 
              onDelete={handleDeleteClient} 
            />
          )}
        </div>
      </div>

      {/* Diálogo para agregar/editar cliente */}
      <AddClientDialog
        open={isAddClientOpen}
        onOpenChange={setIsAddClientOpen}
        client={clientToEdit}
        onSave={handleSaveClient}
      />
    </div>
  );
}