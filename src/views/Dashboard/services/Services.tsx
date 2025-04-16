import { useState, useMemo } from "react";
import { Service } from "@/core/model/service";
import { AiOutlineSearch } from "react-icons/ai";
import { BsPencil, BsTrash } from "react-icons/bs";
import { DataTable, TableColumn, TableAction } from "@/components/ui/DataTable";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { AddServiceDialog } from "@/components/ui/AddServiceDialog";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { useServices } from "@/contexts/ServicesContext";

export default function Services() {
  const { services, loading, addService, updateService, deleteService, refreshData } = useServices();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | undefined>(undefined);

  // Filtrar servicios según el término de búsqueda
  const filteredServices = useMemo(() => 
    services.filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [services, searchTerm]
  );

  // Manejar la edición de un servicio
  const handleEditService = (service: Service) => {
    setServiceToEdit(service);
    setIsAddServiceOpen(true);
  };

  // Manejar guardar un servicio (nuevo o editado)
  const handleSaveService = (service: Omit<Service, "id"> & { id?: number }) => {
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
    if (window.confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
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

  // Definir las columnas para la tabla
  const columns: TableColumn<Service>[] = useMemo(() => [
    { 
      header: "ID", 
      accessor: "id", 
      className: "font-medium"
    },
    { 
      header: "Nombre", 
      accessor: "name"
    }
  ], []);

  // Definir acciones de la tabla
  const actions: TableAction<Service>[] = useMemo(() => [
    {
      label: "Editar",
      icon: <BsPencil className="h-4 w-4" />,
      onClick: handleEditService,
      className: "text-gray-700"
    },
    {
      label: "Eliminar",
      icon: <BsTrash className="h-4 w-4" />,
      onClick: (service) => handleDeleteService(service.id),
      className: "text-red-600"
    }
  ], []);

  // Definir las columnas para exportar servicios a Excel
  const serviceExportColumns: ExcelColumn[] = useMemo(() => [
    { header: 'ID', field: 'id' },
    { header: 'Nombre', field: 'name' }
  ], []);

  return (
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
            initialSort={{ key: 'id', direction: 'asc' }}
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
  );
}