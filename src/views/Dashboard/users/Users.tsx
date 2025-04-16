import { useState, useMemo } from "react";
import { useUsers } from "@/contexts/UsersContext";
import { User } from "@/core/model/user";
import { AiOutlineSearch } from "react-icons/ai";
import { BsPencil, BsTrash, BsKey } from "react-icons/bs";
import { FiFilter } from "react-icons/fi";
import { DataTable, TableColumn, TableAction } from "@/components/ui/DataTable";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { AddUserDialog } from "@/components/ui/users/AddUserDialog";
import { ChangePasswordDialog } from "@/components/ui/users/ChangePasswordDialog";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { userService } from "@/services/userService";

export default function Users() {
  const { users, loading, addUser, updateUser, deleteUser, refreshData } = useUsers();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | undefined>(undefined);
  const [userToChangePassword, setUserToChangePassword] = useState<User | undefined>(undefined);

  // Filtrar usuarios según el término de búsqueda y rol
  const filteredUsers = useMemo(() => 
    users.filter(user => {
      // Filtro por búsqueda
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.dni?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por rol
      const matchesRole = roleFilter === "all" || user.cargo === roleFilter;
      
      return matchesSearch && matchesRole;
    }), [users, searchTerm, roleFilter]
  );

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

  const handleSaveUser = async (user: Omit<User, "id"> & { id?: number }) => {
    try {
      if (user.id) {
        await updateUser(user as User);
        StatusSuccessAlert("Éxito", "Usuario actualizado correctamente");
      } else {
        await addUser(user);
        StatusSuccessAlert("Éxito", "Usuario agregado correctamente");
      }
      setIsAddUserOpen(false);
    } catch (error: any) {
      throw error;
    }
  };
 
  // Manejar la eliminación de un usuario
  const handleDeleteUser = (userId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      deleteUser(userId);
      StatusSuccessAlert("Éxito", "Usuario eliminado correctamente");
    }
  };

  // Manejador para cambiar la contraseña
  const handleSavePassword = (dni: string, newPassword: string) => {
    userService.changePassword(dni, newPassword)
    StatusSuccessAlert("Éxito", "Contraseña actualizada correctamente");
    setIsChangePasswordOpen(false);
  };

  // Manejador de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Manejador para filtrar por rol
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };

  // Manejador para abrir diálogo de nuevo usuario
  const handleAddUser = () => {
    setUserToEdit(undefined); // Resetear el usuario a editar
    setIsAddUserOpen(true);
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
      header: "Nombre de usuario", 
      accessor: "username"
    },
    { 
      header: "Rol", 
      accessor: "role",
      cell: (user) => {
        let bgColor = "bg-gray-100";
        let textColor = "text-gray-800";
        
        switch(user.cargo) {
          case "ADMIN":
            bgColor = "bg-purple-100";
            textColor = "text-purple-800";
            break;
          case "SUPERVISOR":
            bgColor = "bg-blue-100";
            textColor = "text-blue-800";
            break;
          case "COORDINADOR":
            bgColor = "bg-green-100";
            textColor = "text-green-800";
            break;
          case "OPERADOR":
            bgColor = "bg-yellow-100";
            textColor = "text-yellow-800";
            break;
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            {user.cargo}
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

  // Definir las columnas para exportar usuarios a Excel
  const userExportColumns: ExcelColumn[] = useMemo(() => [
    { header: 'ID', field: 'id' },
    { header: 'Nombre', field: 'name' },
    { header: 'DNI', field: 'dni' },
    { header: 'Teléfono', field: 'phone' },
    { header: 'Rol', field: 'role' },
    { header: 'Nombre de usuario', field: 'username' },
  ], []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        {/* Header con exportación */}
        <SectionHeader
          title="Usuarios"
          subtitle="Gestión de usuarios del sistema"
          btnAddText="Agregar Usuario"
          handleAddArea={handleAddUser}
          refreshData={() => Promise.resolve(refreshData())}
          loading={loading}
          exportData={filteredUsers}
          exportFileName="usuarios"
          exportColumns={userExportColumns}
          currentView="users"
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
                  value={roleFilter}
                  onChange={handleRoleChange}
                  style={{
                    backgroundImage: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                >
                  <option value="all">Todos los roles</option>
                  <option value="ADMON PLATAFORMA">Administradores</option>
                  <option value="SUPERVISOR">Supervisores</option>
                  <option value="COORDINADOR">Coordinadores</option>
                  <option value="GESTION HUMANA">Gestion Humana</option>
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
            data={filteredUsers}
            columns={columns}
            actions={actions}
            isLoading={loading}
            itemsPerPage={10}
            itemName="usuarios"
            initialSort={{ key: 'id', direction: 'asc' }}
            emptyMessage="No se encontraron usuarios"
          />
        </div>
      </div>

      {/* Diálogo para agregar/editar usuario */}
      <AddUserDialog
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        user={userToEdit}
        onSave={handleSaveUser}
      />

      {/* Diálogo para cambiar contraseña */}
      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        dni={userToChangePassword?.dni}
        userName={userToChangePassword?.name}
        onSave={handleSavePassword}
      />
    </div>
  );
}