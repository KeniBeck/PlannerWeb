import { useState } from "react";
import { useServices } from "@/lib/hooks/useServices";
import { Service } from "@/core/model/service";
import { ServicesList } from "@/components/ui/ServicesList";
import { AiOutlineSearch, AiOutlinePlus, AiOutlineDownload, AiOutlineReload } from "react-icons/ai";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { AddServiceDialog } from "@/components/ui/AddServiceDialog";

export default function Services() {
  const { services, loading, addService, updateService, deleteService, refreshData } = useServices();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | undefined>(undefined);

  // Filtrar servicios según el término de búsqueda
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    // Aquí podrías mostrar una confirmación antes de eliminar
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        {/* Header */}
        <header className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-md">
          <div>
            <h1 className="text-3xl font-bold">Servicios</h1>
            <p className="text-blue-100 mt-1 font-light">
              Administración de servicios operativos
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
              onClick={handleAddService}
            >
              <AiOutlinePlus className="mr-2" /> Agregar Servicio
            </button>
          </div>
        </header>

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

      {/* Vista principal */}
      <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando servicios...</p>
              </div>
            </div>
          ) : (
            <ServicesList 
              services={filteredServices} 
              onEdit={handleEditService} 
              onDelete={handleDeleteService} 
            />
          )}
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