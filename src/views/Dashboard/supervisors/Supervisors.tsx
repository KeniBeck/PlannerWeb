import { useState, useMemo } from "react";
import { useSupervisors } from "@/lib/hooks/useSupervisors";
import { User } from "@/core/model/user";
import { AiOutlineSearch } from "react-icons/ai";
import { BsPencil, BsTrash } from "react-icons/bs";
import { FiFilter } from "react-icons/fi";
import { DataTable, TableColumn, TableAction } from "@/components/ui/DataTable";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { AddSupervisorDialog } from "@/components/ui/AddSupervisorDialog";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";

export default function Supervisors() {
  const { supervisors, loading, addSupervisor, updateSupervisor, deleteSupervisor, refreshData } = useSupervisors();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [isAddSupervisorOpen, setIsAddSupervisorOpen] = useState(false);
  const [supervisorToEdit, setSupervisorToEdit] = useState<User | undefined>(undefined);

  // Filtrar supervisores según el término de búsqueda y estado
  const filteredSupervisors = useMemo(() => 
    supervisors.filter(supervisor => {
      // Filtro por búsqueda
      const matchesSearch = 
        supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.phone.toLowerCase().includes(searchTerm.toLowerCase());
      
      
      return matchesSearch;
    }), [supervisors, searchTerm, activeStatus]
  );

  // Manejar la edición de un supervisor
  const handleEditSupervisor = (supervisor: User) => {
    setSupervisorToEdit(supervisor);
    setIsAddSupervisorOpen(true);
  };

  // Manejar guardar un supervisor (nuevo o editado)
  const handleSaveSupervisor = (supervisor: Omit<User, "id"> & { id?: number }) => {
    if (supervisor.id) {
      // Actualizar supervisor existente
      updateSupervisor(supervisor as User);
      StatusSuccessAlert("Éxito", "Supervisor actualizado correctamente");
    } else {
      // Agregar nuevo supervisor
      addSupervisor(supervisor);
      StatusSuccessAlert("Éxito", "Supervisor agregado correctamente");
    }
  };

  // Manejar la eliminación de un supervisor
  const handleDeleteSupervisor = (supervisorId: number) => {
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

  // Definir las columnas para la tabla
  const columns: TableColumn<User>[] = useMemo(() => [
    { 
      header: "ID", 
      accessor: "id", 
      className: "font-medium"
    },
    { 
      header: "Nombre", 
      accessor: "name" 
    },
    { 
      header: "DNI", 
      accessor: "dni" 
    },
    { 
      header: "Teléfono", 
      accessor: "phone" 
    },
    { 
      header: "Especialidad", 
      accessor: "cargo" 
    },
  ], []);

  // Definir acciones de la tabla
  const actions: TableAction<User>[] = useMemo(() => [
    {
      label: "Editar",
      icon: <BsPencil className="h-4 w-4" />,
      onClick: handleEditSupervisor,
      className: "text-gray-700"
    },
    {
      label: "Eliminar",
      icon: <BsTrash className="h-4 w-4" />,
      onClick: (supervisor) => handleDeleteSupervisor(supervisor.id),
      className: "text-red-600"
    }
  ], []);

  // Definir las columnas para exportar supervisores a Excel
  const supervisorExportColumns: ExcelColumn[] = useMemo(() => [
    { header: 'Código', field: 'id' },
    { header: 'Nombre', field: 'name' },
    { header: 'DNI', field: 'dni' },
    { header: 'Teléfono', field: 'phone' },
    { header: 'Especialidad', field: 'cargo' },
  ], []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        {/* Header con exportación */}
        <SectionHeader
          title="Supervisores"
          subtitle="Gestión de supervisores"
          btnAddText="Agregar Supervisor"
          handleAddArea={handleAddSupervisor}
          refreshData={() => Promise.resolve(refreshData())}
          loading={loading}
          exportData={filteredSupervisors}
          exportFileName="supervisores"
          exportColumns={supervisorExportColumns}
          currentView="supervisors"
        />
        
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

      {/* Vista principal con DataTable */}
      <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-white p-4">
          <DataTable
            data={filteredSupervisors}
            columns={columns}
            actions={actions}
            isLoading={loading}
            itemsPerPage={10}
            itemName="supervisores"
            initialSort={{ key: 'id', direction: 'asc' }}
            emptyMessage="No se encontraron supervisores"
          />
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