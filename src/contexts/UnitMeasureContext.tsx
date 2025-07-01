import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/core/model/user";
import { UnitMeasure } from "@/core/model/unitMeasure";
import { unitMeasureService } from "@/services/unitMeasureService";

interface UnitsMeasureContextType {
  unitsMeasure: UnitMeasure[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addUnitMeasure: (user: Omit<UnitMeasure, "id">) => Promise<void>;
//   updateUnitMeasure: (user: UnitMeasure) => Promise<void>;
//   deleteUnitMeasure: (userId: number) => Promise<void>;
}

// Crear el contexto
const UnitsMeasureContext = createContext<UnitsMeasureContextType | undefined>(undefined);

// Provider component
export function UnitsMeasureProvider({ children }: { children: React.ReactNode }) {
  const [unitsMeasure, setUnitsMeasure] = useState<UnitMeasure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar unidades de medida
  const fetchUnitsMeasure = async () => {
    setLoading(true);
    try {
      const data = await unitMeasureService.getUnitMeasures();
      setUnitsMeasure(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar las unidades de medida");
      console.error("Error fetching units measure:", err);
    } finally {
      setLoading(false);
    }
  };

  // Agregar unidad de medida
  const addUnitMeasure = async (unitMeasureData: Omit<UnitMeasure, "id">) => {
    // setLoading(true);
    // try {
    //   const newUnitMeasure = await unitMeasureService.addUnitMeasure(unitMeasureData);
    //   setUnitsMeasure(prev => [...prev, newUnitMeasure]);
    //   setError(null);
    // } catch (err) {
    //   setError("Error al agregar la unidad de medida");
    //   console.error("Error adding unit measure:", err);
    //   throw err;
    // } finally {
    //   setLoading(false);
    // }
  };

  // Actualizar usuario
  const updateUser = async (userData: User) => {
    // setLoading(true);
    // try {
    //   const updatedUser = await userService.updateUser(userData);
    //   setUsers(prev => prev.map(user => 
    //     user.id === updatedUser.id ? updatedUser : user
    //   ));
    //   setError(null);
    // } catch (err) {
    //   setError("Error al actualizar el usuario");
    //   console.error("Error updating user:", err);
    //   throw err;
    // } finally {
    //   setLoading(false);
    // }
  };

  // Eliminar usuario
  const deleteUser = async (userId: number) => {
    // setLoading(true);
    // try {
    //   await userService.deleteUser(userId);
    //   setUsers(prev => prev.filter(user => user.id !== userId));
    //   setError(null);
    // } catch (err) {
    //   setError("Error al eliminar el usuario");
    //   console.error("Error deleting user:", err);
    //   throw err;
    // } finally {
    //   setLoading(false);
    // }
  };

  // Cambiar contraseña
  const changePassword = async (userId: string, newPassword: string) => {
    // setLoading(true);
    // try {
    //   await userService.changePassword(userId, newPassword);
    //   setError(null);
    // } catch (err) {
    //   setError("Error al cambiar la contraseña");
    //   console.error("Error changing password:", err);
    //   throw err;
    // } finally {
    //   setLoading(false);
    // }
  };

  // Refrescar datos
  const refreshData = async () => {
    await fetchUnitsMeasure();
  };

  // Efecto para cargar los usuarios al montar el componente
  useEffect(() => {
    fetchUnitsMeasure();
  }, []);

  const value = {
    unitsMeasure,
    loading,
    error,
    refreshData,
    addUnitMeasure
  };

  return (
    <UnitsMeasureContext.Provider value={value}>
      {children}
    </UnitsMeasureContext.Provider>
  );
}

// Custom hook para usar este contexto
export function useUnitsMeasure() {
  const context = useContext(UnitsMeasureContext);
  if (!context) {
    throw new Error("useUnitsMeasure must be used within a UnitsMeasureProvider");
  }
  return context;
}

export { UnitsMeasureContext };