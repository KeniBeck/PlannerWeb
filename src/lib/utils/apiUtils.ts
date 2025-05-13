import { AxiosError } from "axios";

/**
 * Maneja errores de API de forma centralizada
 * @param error Error capturado en el catch de la petición
 * @description
 * Esta función procesa los errores de las peticiones a la API y realiza acciones como:
 * - Enviar errores a un sistema de registro (logging)
 * - Manejar errores de autenticación (401)
 * - Formatear mensajes de error para mostrarlos al usuario
 * - Enviar telemetría o analíticas de errores
 * - etc.
 */
export function handleApiError(error: unknown): void {
  // Verificar si es un error de Axios
  if (isAxiosError(error)) {
    const status = error.response?.status;
    
    // Manejar errores de autenticación
    if (status === 401) {
      console.error("Error de autenticación. Redirigiendo al login...");
      // Disparar un evento personalizado para manejar sesión expirada
      const event = new CustomEvent('auth:session_expired');
      window.dispatchEvent(event);
      return;
    }
    
    // Manejar errores de autorización
    if (status === 403) {
      console.error("No tienes permisos para realizar esta acción");
      return;
    }
    
    // Manejar errores del servidor
    if (status && status >= 500) {
      console.error("Error del servidor:", error.response?.data || "Error interno del servidor");
      return;
    }
    
    // Manejar errores de validación
    if (status === 400 || status === 422) {
      console.error("Error de validación:", error.response?.data || "Datos inválidos");
      return;
    }
    
    // Manejar recurso no encontrado
    if (status === 404) {
      console.error("Recurso no encontrado:", error.response?.data|| "El recurso solicitado no existe");
      return;
    }
    
    // Para otros errores de Axios
    console.error("Error en la petición:", error.message);
    return;
  }
  
  // Para errores que no son de Axios
  console.error("Error inesperado:", error);
}

/**
 * Verifica si un error es un error de Axios
 */
function isAxiosError(error: any): error is AxiosError {
  return error && typeof error === 'object' && 'isAxiosError' in error;
}