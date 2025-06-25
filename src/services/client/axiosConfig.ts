import axios from "axios";
import { notifyServerStatus } from "@/components/dialog/ServerStatusBanner";

// Contadores para rastrear errores consecutivos
let consecutiveServerErrors = 0;
const ERROR_THRESHOLD = 2; // Número de errores consecutivos antes de mostrar el banner

// Creamos una instancia personalizada de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000, // 15 segundos de timeout
  headers: {
    "Content-Type": "application/json",
  }
});

// Interceptor de solicitudes
api.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const token = localStorage.getItem("token");
    
    // Si existe un token, añadirlo a los headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas mejorado
api.interceptors.response.use(
  (response) => {
    // Si hay respuesta exitosa, resetear contador de errores y notificar que el servidor está bien
    consecutiveServerErrors = 0;
    notifyServerStatus(false);
    return response;
  },
  (error) => {
    // Verificar si es un error de servidor (500+) o un error de conexión
    if (error.response && error.response.status >= 500) {
      consecutiveServerErrors++;
      console.log(`Error de servidor detectado (${consecutiveServerErrors}/${ERROR_THRESHOLD}):`, error.response.status);
      
      // Solo notificar después de varios errores consecutivos para evitar falsos positivos
      if (consecutiveServerErrors >= ERROR_THRESHOLD) {
        notifyServerStatus(true);
      }
    } else if (!error.response) {
      // Error de red (sin respuesta)
      consecutiveServerErrors++;
      console.log(`Error de conexión detectado (${consecutiveServerErrors}/${ERROR_THRESHOLD})`);
      
      if (consecutiveServerErrors >= ERROR_THRESHOLD) {
        notifyServerStatus(true);
      }
    } else {
      // Para otros errores (400s), no incrementar el contador
      console.log(`Error de aplicación (${error.response.status}):`, error.response.data);
    }
    
    // Manejar errores comunes como 401 (no autorizado)
    if (error.response && error.response.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem("token");
      // Redireccionar al login o mostrar mensaje
      window.location.href = "/CargoPlanner-Web/login";
    }
    
    return Promise.reject(error);
  }
);
export default api;