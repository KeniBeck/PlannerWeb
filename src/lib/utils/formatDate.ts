import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea una fecha en formato largo (ej: "21 de mayo de 2023")
 * Evita problemas de zona horaria extrayendo los componentes manualmente
 */
export const formatLongDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "No definida";
  
  try {
    // Extraer componentes de la fecha para evitar problemas de zona horaria
    const datePart = dateStr.split('T')[0]; // Obtener solo la parte de la fecha
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Crear fecha con los componentes extraídos y hora fija para evitar problemas DST
    const date = new Date(year, month - 1, day, 12, 0, 0);
    
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
  } catch (e) {
    console.error("Error al formatear fecha:", e, dateStr);
    return String(dateStr || "Fecha inválida");
  }
};

/**
 * Formatea una fecha en formato corto (ej: "21/05/2023")
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "Sin fecha";
  
  try {
    // Extraer componentes de la fecha
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Devolver en formato DD/MM/YYYY
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  } catch (e) {
    console.error("Error al formatear fecha corta:", e, dateStr);
    return "Formato inválido";
  }
};

/**
 * Formatea una hora (ej: "14:30")
 */
export const formatTime = (timeStr: string | null | undefined): string => {
  if (!timeStr) return "No definida";
  return timeStr;
};



/**
 * Formatea una fecha y hora completa (ej: "21 de mayo de 2023, 14:30")
 */
export const formatDateTime = (dateTimeStr: string | null | undefined): string => {
  if (!dateTimeStr) return "No disponible";
  
  try {
    // Para fechas con hora, extraemos componentes para evitar problemas de zona horaria
    const [datePart, timePart] = dateTimeStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Extraer componentes de hora si existen
    let hours = 12, minutes = 0;
    if (timePart) {
      const timeComponents = timePart.split(':').map(Number);
      hours = timeComponents[0] || 12;
      minutes = timeComponents[1] || 0;
    }
    
    const date = new Date(year, month - 1, day, hours, minutes);
    return format(date, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
  } catch (e) {
    console.error("Error al formatear fecha y hora:", e, dateTimeStr);
    return String(dateTimeStr || "Fecha y hora inválidas");
  }
};