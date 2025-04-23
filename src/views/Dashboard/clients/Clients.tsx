import { useState, useMemo } from "react";
import { Client } from "@/core/model/client";
import { AiOutlineSearch } from "react-icons/ai";
import { BsPencil, BsTrash } from "react-icons/bs";
import { DataTable, TableColumn, TableAction } from "@/components/ui/DataTable";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { AddClientDialog } from "@/components/ui/clients/AddClientDialog";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { useClients } from "@/contexts/ClientsContext";
import { HiOutlineBan, HiOutlineRefresh } from "react-icons/hi";
import { ActivateItemAlert, DeactivateItemAlert } from "@/components/dialog/CommonAlertActive";

export default function Clients() {
  const {
    clients,
    loading,
    addClient,
    updateClient,
    deleteClient,
    refreshData,
  } = useClients();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | undefined>(
    undefined
  );
  const [clientToActivate, setClientToActivate] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Filtrar clientes según el término de búsqueda
  const filteredClients = useMemo(
    () =>
      clients.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [clients, searchTerm]
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

  const handleActivateClick = (client: Client) => {
    setClientToActivate(client);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
  };

  const ConfirmActiveClient = () => {
    if (!clientToActivate) return;

    updateClient({
      ...clientToActivate,
      status: "ACTIVE",
    });
    StatusSuccessAlert("Éxito", "Cliente activado correctamente");
  };

  const ConfirmDeleteClient = () => {
    if (!clientToDelete) return;

    updateClient({
      ...clientToDelete,
      status: "INACTIVE",
    });
    StatusSuccessAlert("Éxito", "Cliente eliminado correctamente");
  };

  // Definir las columnas para la tabla
  const columns: TableColumn<Client>[] = useMemo(
    () => [
      {
        header: "ID",
        accessor: "id",
        className: "font-medium",
      },
      {
        header: "Nombre",
        accessor: "name",
      },
      {
        header: "Estado",
        accessor: "status",
        cell: (area) => {
          const isActive = area.status === "ACTIVE";
          return (
            <span
              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${
              isActive
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-orange-100 text-orange-600 border border-orange-300"
            }`}
            >
              <span className="flex items-center">
                <span
                  className={`h-2 w-2 mr-1.5 rounded-full ${
                    isActive ? "bg-green-500" : "bg-orange-500"
                  }`}
                ></span>
                {isActive ? "Activo" : "Inactivo"}
              </span>
            </span>
          );
        },
      },
    ],
    []
  );

  // Definir acciones de la tabla
  const actions: TableAction<Client>[] = useMemo(
    () => [
      {
        label: "Editar",
        icon: <BsPencil className="h-4 w-4" />,
        onClick: handleEditClient,
        className: "text-gray-700",
      },
      {
        label: (area) => (area.status === "ACTIVE" ? "Eliminar" : "Activar"),
        icon: (area) =>
          area.status === "ACTIVE" ? (
            <HiOutlineBan className="h-4 w-4" />
          ) : (
            <HiOutlineRefresh className="h-4 w-4" />
          ),
        onClick: (area) =>
          area.status === "ACTIVE"
            ? handleDeleteClick(area)
            : handleActivateClick(area),
        className: (area) =>
          area.status === "ACTIVE"
            ? "text-orange-600 hover:bg-red-50"
            : "text-green-600 hover:bg-green-50",
      },
    ],
    []
  );

  // Definir las columnas para exportar clientes a Excel
  const clientExportColumns: ExcelColumn[] = useMemo(
    () => [
      { header: "ID", field: "id" },
      { header: "Nombre", field: "name" },
    ],
    []
  );

  return (
    <>
      <div className="container mx-auto py-6 space-y-6">
        <div className="rounded-xl shadow-md">
          {/* Header con exportación */}
          <SectionHeader
            title="Clientes"
            subtitle="Agrega, edita o elimina clientes"
            btnAddText="Agregar cliente"
            handleAddArea={handleAddClient}
            refreshData={() => Promise.resolve(refreshData())}
            loading={loading}
            exportData={filteredClients}
            exportFileName="clientes"
            exportColumns={clientExportColumns}
            currentView="clients"
          />

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

        {/* Vista principal con DataTable */}
        <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-white p-4">
            <DataTable
              data={filteredClients}
              columns={columns}
              actions={actions}
              isLoading={loading}
              itemsPerPage={10}
              itemName="clientes"
              initialSort={{ key: "id", direction: "asc" }}
              emptyMessage="No se encontraron clientes"
            />
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

      <ActivateItemAlert
      open={!!clientToActivate}
      onOpenChange={() => setClientToActivate(null)}
      onConfirm={ConfirmActiveClient}
      itemName="cliente"
      isLoading={loading}
      />

      <DeactivateItemAlert
      open={!!clientToDelete}
      onOpenChange={() => setClientToDelete(null)}
      onConfirm={ConfirmDeleteClient}
      itemName="cliente"
      isLoading={loading}
      />
    </>
  );
}
