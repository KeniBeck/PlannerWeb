import { useState, useMemo } from "react";
import { Service } from "@/core/model/service";
import { AiOutlineSearch } from "react-icons/ai";
import { BsPencil, BsTrash } from "react-icons/bs";
import { DataTable, TableColumn, TableAction } from "@/components/ui/DataTable";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { AddServiceDialog } from "@/components/ui/services/AddServiceDialog";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { useServices } from "@/contexts/ServicesContext";
import { HiOutlineBan, HiOutlineRefresh } from "react-icons/hi";
import {
  ActivateItemAlert,
  DeactivateItemAlert,
} from "@/components/dialog/CommonAlertActive";

export default function Services() {
  const {
    services,
    loading,
    addService,
    updateService,
    deleteService,
    refreshData,
  } = useServices();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | undefined>(
    undefined
  );
  const [serviceToActivate, setServiceToActivate] = useState<Service | null>(
    null
  );
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Filtrar servicios según el término de búsqueda
  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        (service.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [services, searchTerm]
  );

  // Manejar la edición de un servicio
  const handleEditService = (service: Service) => {
    setServiceToEdit(service);
    setIsAddServiceOpen(true);
  };

  // Manejar guardar un servicio (nuevo o editado)
  const handleSaveService = (
    service: Omit<Service, "id"> & { id?: number }
  ) => {
    if (service.id) {
      // Actualizar servicio existente
      updateService(service as Service);
      StatusSuccessAlert("Éxito", "Servicio actualizado correctamente");
    } else {
      // Agregar nuevo servicio
      addService(service);
      StatusSuccessAlert("Éxito", "Servicio agregado correctamente");
    }
  };

  // Manejar la eliminación de un servicio
  const handleDeleteService = (serviceId: number) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este servicio?")
    ) {
      deleteService(serviceId);
      StatusSuccessAlert("Éxito", "Servicio eliminado correctamente");
    }
  };

  // Manejador de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Manejador para abrir diálogo de nuevo servicio
  const handleAddService = () => {
    setServiceToEdit(undefined); // Resetear el servicio a editar
    setIsAddServiceOpen(true);
  };

  const handleActivateClick = (service: Service) => {
    setServiceToActivate(service);
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
  };

  const confirmDeleteArea = () => {
    if (!serviceToDelete) return;

    updateService({
      id: serviceToDelete.id,
      status: "INACTIVE",
    });
    StatusSuccessAlert("Éxito", "Área eliminada correctamente");
  };

  const confirmActivateArea = () => {
    if (!serviceToActivate) return;

    updateService({
      id: serviceToActivate.id,
      status: "ACTIVE",
    });
    StatusSuccessAlert("Éxito", "Área activada correctamente");
  };

  // Definir las columnas para la tabla
  const columns: TableColumn<Service>[] = useMemo(
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
        cell: (service) => {
          const isActive = service.status === "ACTIVE";
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
  const actions: TableAction<Service>[] = useMemo(
    () => [
      {
        label: "Editar",
        icon: <BsPencil className="h-4 w-4" />,
        onClick: handleEditService,
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
      }
    ],
    []
  );

  // Definir las columnas para exportar servicios a Excel
  const serviceExportColumns: ExcelColumn[] = useMemo(
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
            title="Servicios"
            subtitle="Gestión de servicios, agrega, edita o elimina servicios"
            btnAddText="Agregar Servicio"
            handleAddArea={handleAddService}
            refreshData={() => Promise.resolve(refreshData())}
            loading={loading}
            exportData={filteredServices}
            exportFileName="servicios"
            exportColumns={serviceExportColumns}
            currentView="services"
          />

          {/* Filtros */}
          <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
            <div className="flex gap-4 items-center p-2">
              <div>
                <div className="relative">
                  <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre"
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
              data={filteredServices}
              columns={columns}
              actions={actions}
              isLoading={loading}
              itemsPerPage={10}
              itemName="servicios"
              initialSort={{ key: "id", direction: "asc" }}
              emptyMessage="No se encontraron servicios"
            />
          </div>
        </div>

        {/* Diálogo para agregar/editar servicio */}
        <AddServiceDialog
          open={isAddServiceOpen}
          onOpenChange={setIsAddServiceOpen}
          service={serviceToEdit}
          onSave={handleSaveService}
        />
      </div>

      <ActivateItemAlert
        open={!!serviceToActivate}
        onOpenChange={() => setServiceToActivate(null)}
        onConfirm={confirmActivateArea}
        itemName="servicio"
        isLoading={loading}
      />

      <DeactivateItemAlert
        open={!!serviceToDelete}
        onOpenChange={() => setServiceToDelete(null)}
        onConfirm={confirmDeleteArea}
        itemName="servicio"
        isLoading={loading}
      />
    </>
  );
}
