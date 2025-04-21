import { useState, useMemo } from "react";
import { useUsers } from "@/contexts/UsersContext"; // Cambiamos a useUsers en lugar de useSupervisors
import { User } from "@/core/model/user";
import { AiOutlineSearch } from "react-icons/ai";
import { FiFilter } from "react-icons/fi";
import { DataTable, TableAction, TableColumn } from "@/components/ui/DataTable";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { BsKey, BsPencil, BsTrash } from "react-icons/bs";

export default function Supervisors() {
  const { users, loading, refreshData, deleteUser } = useUsers();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [userToEdit, setUserToEdit] = useState<User | undefined>(undefined);
  const [userToChangePassword, setUserToChangePassword] = useState<User | undefined>(undefined);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);



  // Filtrar solo supervisores y coordinadores
  const supervisors = useMemo(() => 
    users.filter(user => user.occupation === "SUPERVISOR" || user.occupation === "COORDINADOR"), 
    [users]
  );

  // Filtrar supervisores según el término de búsqueda y estado
  const filteredSupervisors = useMemo(() => 
    supervisors.filter(supervisor => {
      // Filtro por búsqueda
      const matchesSearch = 
        supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.dni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      

      return matchesSearch;
    }), [supervisors, searchTerm, activeStatus]
  );

  // Manejador de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Manejador para filtrar por estado
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveStatus(e.target.value);
  };

    // Manejar la edición de un usuario
    const handleEditUser = (user: User) => {
      setUserToEdit(user);
      setIsAddUserOpen(true);
    };
  
    // Manejar cambio de contraseña
    const handleChangePassword = (user: User) => {
      setUserToChangePassword(user);
      setIsChangePasswordOpen(true);
    };

    // Manejar la eliminación de un usuario
      const handleDeleteUser = (userId: number) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
          deleteUser(userId);
          // StatusSuccessAlert("Éxito", "Usuario eliminado correctamente");
        }
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
      header: "Cargo", 
      accessor: "cargo",
      cell: (user) => {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium 
            ${user.occupation === "SUPERVISOR" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
            {user.occupation}
          </span>
        );
      }
    },
  ], []);

    // Definir acciones de la tabla
    const actions: TableAction<User>[] = useMemo(() => [
      {
        label: "Editar",
        icon: <BsPencil className="h-4 w-4" />,
        onClick: handleEditUser,
        className: "text-gray-700"
      },
      {
        label: "Cambiar contraseña",
        icon: <BsKey className="h-4 w-4" />,
        onClick: handleChangePassword,
        className: "text-blue-600"
      },
      {
        label: "Eliminar",
        icon: <BsTrash className="h-4 w-4" />,
        onClick: (user) => handleDeleteUser(user.id),
        className: "text-red-600"
      }
    ], []);

  // Definir las columnas para exportar supervisores a Excel
  const supervisorExportColumns: ExcelColumn[] = useMemo(() => [
    { header: 'ID', field: 'id' },
    { header: 'Nombre', field: 'name' },
    { header: 'DNI', field: 'dni' },
    { header: 'Teléfono', field: 'phone' },
    { header: 'Cargo', field: 'cargo' },
  ], []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        {/* Header con exportación */}
        <SectionHeader
          title="Supervisores"
          subtitle="Visualización de supervisores y coordinadores"
          btnAddText=""
          handleAddArea={() => {}}
          refreshData={() => Promise.resolve(refreshData())}
          loading={loading}
          exportData={filteredSupervisors}
          exportFileName="supervisores_coordinadores"
          exportColumns={supervisorExportColumns}
          currentView="supervisors"
          showAddButton={false}
        />
        
        {/* Filtros */}
        <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
          <div className="flex gap-4 items-center p-2">
            <div>
              <div className="relative">
                <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, DNI o teléfono"
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
            isLoading={loading}
            itemsPerPage={10}
            itemName="supervisores"
            initialSort={{ key: 'id', direction: 'asc' }}
            emptyMessage="No se encontraron supervisores"
            actions={actions}
          />
        </div>
      </div>
    </div>
  );
}