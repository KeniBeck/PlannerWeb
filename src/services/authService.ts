import axios, { AxiosError } from 'axios';
import { LoginCredentials, AuthResponse } from './interfaces/LoginCredential';


// Clase de servicio de autenticación
class AuthService {
  // URL base desde variables de entorno
  private baseUrl = import.meta.env.API_URL || 'http://localhost:3000';
  
  // Método de login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${this.baseUrl}/login`, 
        credentials
      );
      
      // Guardar el token en localStorage para mantener la sesión
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
        const status = (error as AxiosError).response?.data;
      if (axios.isAxiosError(error)) {
        console.error('Error durante el login:', error.response?.data);
      }
      throw status;
    }
  }
  
  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
  
  // Obtener el token actual
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  // Obtener datos del usuario actual
  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

// Exportamos una instancia única del servicio
export const authService = new AuthService();