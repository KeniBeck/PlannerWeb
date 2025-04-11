import axios from "axios";

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

// Interceptor de respuestas (opcional pero útil para manejar errores)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores comunes como 401 (no autorizado)
    if (error.response && error.response.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem("token");
      // Redireccionar al login o mostrar mensaje
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export default api;