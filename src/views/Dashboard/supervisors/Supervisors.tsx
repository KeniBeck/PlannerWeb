import { useState } from "react";
import { useSupervisors } from "@/lib/hooks/useSupervisors";
import { Supervisor } from "@/core/model/supervisor";
import { SupervisorsList } from "@/components/ui/SupervisorsList";
import { AddSupervisorDialog } from "@/components/ui/AddSupervisorDialog";
import { AiOutlineSearch, AiOutlineUserAdd, AiOutlineDownload, AiOutlineReload } from "react-icons/ai";
import { FiFilter } from "react-icons/fi";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";

export default function Supervisors() {
  const { supervisors, loading, addSupervisor, updateSupervisor, deleteSupervisor, refreshData } = useSupervisors();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [isAddSupervisorOpen, setIsAddSupervisorOpen] = useState(false);
  const [supervisorToEdit, setSupervisorToEdit] = useState<Supervisor | undefined>(undefined);

  // Filtrar supervisores según el término de búsqueda
  const filteredSupervisors = supervisors.filter(supervisor => 
    (supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     supervisor.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
     supervisor.phone.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeStatus === "all" || supervisor.status === activeStatus)
  );

  // Manejar la edición de un supervisor
  const handleEditSupervisor = (supervisor: Supervisor) => {
    setSupervisorToEdit(supervisor);
    setIsAddSupervisorOpen(true);
  };

  // Manejar guardar un supervisor (nuevo o editado)
  const handleSaveSupervisor = (supervisor: Omit<Supervisor, "id"> & { id?: number }) => {
    if (supervisor.id) {
      // Actualizar supervisor existente
      updateSupervisor(supervisor as Supervisor);
      StatusSuccessAlert("Éxito", "Supervisor actualizado correctamente");
    } else {
      // Agregar nuevo supervisor
      addSupervisor(supervisor);
      StatusSuccessAlert("Éxito", "Supervisor agregado correctamente");
    }
  };

  // Manejar la eliminación de un supervisor
  const handleDeleteSupervisor = (supervisorId: number) => {
    // Aquí podrías mostrar una confirmación antes de eliminar
    if (window.confirm("¿Estás seguro de que quieres eliminar este supervisor?")) {
      deleteSupervisor(supervisorId);
      StatusSuccessAlert("Éxito", "Supervisor eliminado correctamente");
    }
  };

  // Manejador de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Manejador para filtrar por estado
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveStatus(e.target.value);
  };

  // Manejador para abrir diálogo de nuevo supervisor
  const handleAddSupervisor = () => {
    setSupervisorToEdit(undefined); // Resetear el supervisor a editar
    setIsAddSupervisorOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        {/* Header */}
        <header className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-md">
          <div>
            <h1 className="text-3xl font-bold">Supervisores</h1>
            <p className="text-blue-100 mt-1 font-light">
              Administración de supervisores de operaciones
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
              onClick={handleAddSupervisor}
            >
              <AiOutlineUserAdd className="mr-2" /> Agregar Supervisor
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
                  placeholder="Buscar por nombre, DNI o teléfono"
                  className="p-2 pl-10 w-80 border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative w-full">
                <div className="absolute left-3 top-3">
                  <FiFilter className="h-5 w-5 text-blue-500" />
                </div>
                <select
                  className="pl-10 pr-10 py-2.5 w-60 appearance-none border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm text-gray-700 font-medium"
                  value={activeStatus}
                  onChange={handleStatusChange}
                  style={{
                    backgroundImage: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                  <option value="on_leave">De permiso</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                  <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
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
                <p className="mt-4 text-gray-600">Cargando supervisores...</p>
              </div>
            </div>
          ) : (
            <SupervisorsList 
              supervisors={filteredSupervisors} 
              onEdit={handleEditSupervisor} 
              onDelete={handleDeleteSupervisor} 
            />
          )}
        </div>
      </div>

      {/* Diálogo para agregar/editar supervisor */}
      <AddSupervisorDialog
        open={isAddSupervisorOpen}
        onOpenChange={setIsAddSupervisorOpen}
        supervisor={supervisorToEdit}
        onSave={handleSaveSupervisor}
      />
    </div>
  );
}