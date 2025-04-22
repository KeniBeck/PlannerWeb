import api from "./client/axiosConfig";
import { User } from "@/core/model/user";


class UserService {
  private baseUrl = import.meta.env.VITE_API_URL || "";

  // Obtener todos los usuarios
  async getUsers(): Promise<User[]> {
    try {

      // En producción, usar la API
      const response = await api.get(`${this.baseUrl}/user`);
      return response.data.map((user: any) => ({
        ...user,
        cargo: user.occupation
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  getRoleFromCargo(cargo: string): string {
    console.log("Cargo:", cargo);
    switch (cargo) {
      case "SUPERVISOR":
        return "ADMIN";
      case "COORDINADOR":
        return "ADMIN";
      case "GESTION HUMANA":
        return "GH";
      case "ADMON PLATAFORMA":
        return "SUPERADMIN";
    }
  return "";
  }

  // Agregar un nuevo usuario
  async addUser(userData: Omit<User, "id">): Promise<User> {
    try {
      const dataToSend = {
        occupation: userData.occupation,
        role: this.getRoleFromCargo(userData.occupation),
        dni: userData.dni,
        phone: userData.phone,
        username: userData.username,
        password: userData.password,
        name: userData.name,
      };
    
      // En producción, usar la API
      const response = await api.post(`${this.baseUrl}/user`, dataToSend);
      return response.data;
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  }

  // Actualizar un usuario existente
  async updateUser(userData: User): Promise<User> {
    try {
      const dataToSend = {
        occupation: userData.occupation,
        role: this.getRoleFromCargo(userData.occupation),
        dni: userData.dni,
        phone: userData.phone,
        username: userData.username,
        password: userData.password,
        name: userData.name,
      };

      // En producción, usar la API
      const response = await api.patch(`${this.baseUrl}/user/${userData.dni}`, dataToSend);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Eliminar un usuario
  async deleteUser(userId: number): Promise<void> {
    try {
      // En producción, usar la API
      await api.patch(`${this.baseUrl}/user/${userId}`,
        { status: "INACTIVE" }
      );
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Cambiar contraseña
  async changePassword(dni: string, newPassword: string): Promise<void> {
    try {
      // En producción, usar la API
      await api.patch(`${this.baseUrl}/user/${dni}`, { password: newPassword });
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }
}

export const userService = new UserService();