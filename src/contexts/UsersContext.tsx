import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/core/model/user";
import { userService } from "@/services/userService";

interface UsersContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addUser: (user: Omit<User, "id">) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  changePassword: (userId: number, newPassword: string) => Promise<void>;
}

// Crear el contexto
const UsersContext = createContext<UsersContextType | undefined>(undefined);

// Provider component
export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los usuarios");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Agregar usuario
  const addUser = async (userData: Omit<User, "id">) => {
    setLoading(true);
    try {
      const newUser = await userService.addUser(userData);
      setUsers(prev => [...prev, newUser]);
      setError(null);
    } catch (err) {
      setError("Error al agregar el usuario");
      console.error("Error adding user:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar usuario
  const updateUser = async (userData: User) => {
    setLoading(true);
    try {
      const updatedUser = await userService.updateUser(userData);
      setUsers(prev => prev.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      setError(null);
    } catch (err) {
      setError("Error al actualizar el usuario");
      console.error("Error updating user:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const deleteUser = async (userId: number) => {
    setLoading(true);
    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setError(null);
    } catch (err) {
      setError("Error al eliminar el usuario");
      console.error("Error deleting user:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar contraseña
  const changePassword = async (userId: number, newPassword: string) => {
    setLoading(true);
    try {
      await userService.changePassword(userId, newPassword);
      setError(null);
    } catch (err) {
      setError("Error al cambiar la contraseña");
      console.error("Error changing password:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refrescar datos
  const refreshData = async () => {
    await fetchUsers();
  };

  // Efecto para cargar los usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  const value = {
    users,
    loading,
    error,
    refreshData,
    addUser,
    updateUser,
    deleteUser,
    changePassword
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
}

// Custom hook para usar este contexto
export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}

export { UsersContext };