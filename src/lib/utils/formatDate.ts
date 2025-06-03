import { addDays, addMinutes } from "date-fns";
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
    const datePart = dateStr.split("T")[0]; // Obtener solo la parte de la fecha
    const [year, month, day] = datePart.split("-").map(Number);

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
    const datePart = dateStr.split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);

    // Devolver en formato DD/MM/YYYY
    return `${day.toString().padStart(2, "0")}/${month
      .toString()
      .padStart(2, "0")}/${year}`;
  } catch (e) {
    console.error("Error al formatear fecha corta:", e, dateStr);
    return "Formato inválido";
  }
};

// Función para comparar si dos fechas son el mismo día
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Función para verificar si una fecha es anterior a otra (ignorando la hora)
export const isDateBefore = (date1: Date, date2: Date): boolean => {
  return (
    new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) <
    new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())
  );
};

/**
 * Verifica si un año es bisiesto
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Obtiene los días del mes según el mes y año
 */
function getDaysInMonth(month: number, year: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Ajustar febrero en años bisiestos
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  
  return daysInMonth[month - 1];
}

/**
 * Función mejorada para convertir fechas de Excel a fechas JavaScript
 * Preserva la hora original y asegura formato hispano para las fechas
 */
export function excelDateToJSDate(excelDate: number): Date {
  // Excel epoch (Jan 1, 1900) - pero Excel tiene un bug que considera 1900 como año bisiesto
  const epoch = new Date(1899, 11, 30); // 30 de diciembre de 1899
  
  // Ajuste para el error de Excel con 1900 como año bisiesto
  let days = excelDate > 60 ? excelDate - 1 : excelDate;
  
  // Crear fecha base
  let resultDate = addDays(epoch, Math.floor(days));
  
  // Preservar la hora original de Excel
  const timeValue = excelDate % 1;
  if (timeValue > 0) {
    const millisInDay = timeValue * 24 * 60 * 60 * 1000;
    resultDate.setMilliseconds(resultDate.getMilliseconds() + millisInDay);
  }

  // Verificar y ajustar según el tipo de mes
  const currentMonth = resultDate.getMonth() + 1; // getMonth() es 0-indexado
  const currentYear = resultDate.getFullYear();
  
  // Obtener días en el mes actual
  const daysInCurrentMonth = getDaysInMonth(currentMonth, currentYear);
  
  // Ajuste específico basado en el tipo de mes
  if (daysInCurrentMonth === 28) {
    // Febrero (año no bisiesto) - agregar 1 día
    resultDate = addDays(resultDate, 1);
  } else if (daysInCurrentMonth === 29) {
    // Febrero (año bisiesto) - agregar 1 día
    resultDate = addDays(resultDate, 1);
  } else if (daysInCurrentMonth === 30) {
    // Meses de 30 días (abril, junio, septiembre, noviembre) - agregar 1 día
    resultDate = addDays(resultDate, 1);
  } else if (daysInCurrentMonth === 31) {
    // Meses de 31 días - agregar 1 día
    resultDate = addDays(resultDate, 1);
  }

  // Redondear minutos que terminan en 59 a la siguiente hora
  const minutes = resultDate.getMinutes();
  if (minutes === 59) {
    resultDate = addMinutes(resultDate, 1);
  } else if (minutes === 29) {
    resultDate = addMinutes(resultDate, 1);
  }

  // CONVERSIÓN A FORMATO HISPANO: Solo intercambiar mes y día si es necesario
  // Preservar la hora y otros componentes intactos
  const originalMonth = resultDate.getMonth() + 1; // 1-12
  const originalDay = resultDate.getDate(); // 1-31
  const originalYear = resultDate.getFullYear();
  const originalHours = resultDate.getHours();
  const originalMinutes = resultDate.getMinutes();
  const originalSeconds = resultDate.getSeconds();
  const originalMillis = resultDate.getMilliseconds();

  // Solo intercambiar si ambos valores son válidos como mes y día
  // Y si detectamos que viene en formato US (MM/DD/YYYY)
  if (originalMonth <= 12 && originalDay <= 12 && originalMonth !== originalDay) {
    // Verificar que el intercambio sea válido
    const maxDaysInMonth = getDaysInMonth(originalDay, originalYear);
    
    if (originalMonth <= maxDaysInMonth) {
      // Crear nueva fecha con día y mes intercambiados, preservando hora
      const hispanicDate = new Date(
        originalYear,
        originalDay - 1, // mes (0-indexado)
        originalMonth,   // día
        originalHours,
        originalMinutes,
        originalSeconds,
        originalMillis
      );
      
      // Validar que la fecha intercambiada sea válida
      if (hispanicDate.getMonth() === (originalDay - 1) && 
          hispanicDate.getDate() === originalMonth) {
        return hispanicDate;
      }
    }
  }

  // Si no se puede o no se debe intercambiar, devolver fecha original
  return resultDate;
}

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
export const formatDateTime = (
  dateTimeStr: string | null | undefined
): string => {
  if (!dateTimeStr) return "No disponible";

  try {
    // Para fechas con hora, extraemos componentes para evitar problemas de zona horaria
    const [datePart, timePart] = dateTimeStr.split("T");
    const [year, month, day] = datePart.split("-").map(Number);

    // Extraer componentes de hora si existen
    let hours = 12,
      minutes = 0;
    if (timePart) {
      const timeComponents = timePart.split(":").map(Number);
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

/**
 * Convierte una fecha en formato local (DD/MM/YYYY, HH:MM:SS a./p. m.)
 * a un formato elegante (DD de mes de YYYY, HH:MM)
 */
export const formatLocalTimeToElegant = (localDateStr: string): string => {
  if (!localDateStr) return "No disponible";

  try {
    // Dividir la fecha y la hora
    const [datePart, timeWithAmPmAndSeconds] = localDateStr.split(", ");

    // Separar componentes de la fecha
    const [day, month, year] = datePart.split("/").map(Number);

    // Procesar la parte de hora
    const isPm = timeWithAmPmAndSeconds.includes("p. m.");
    const timeOnly = timeWithAmPmAndSeconds
      .replace(" a. m.", "")
      .replace(" p. m.", "");

    // Extraer hora y minuto (sin segundos)
    let [hours, minutes] = timeOnly.split(":").map(Number);

    // Convertir a formato 24h si es PM
    if (isPm && hours !== 12) {
      hours += 12;
    } else if (!isPm && hours === 12) {
      hours = 0;
    }

    // Crear un objeto Date
    const date = new Date(year, month - 1, day, hours, minutes);

    // Formatear al formato deseado
    return format(date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
  } catch (e) {
    console.error("Error al formatear fecha local:", e, localDateStr);
    return localDateStr || "Fecha inválida";
  }
};

// Calcular minutos entre dos fechas
export const getMinutesBetween = (date1: Date, date2: Date): number => {
  const diffMs = Math.abs(date1.getTime() - date2.getDate());
  return Math.floor(diffMs / 60000); // Convertir ms a minutos
};

  // Función utilitaria para convertir formato de fecha
  export const formatDateToISO = (dateStr: string): string => {
    if (!dateStr) return dateStr;

    // Si ya está en formato ISO (YYYY-MM-DD), devolverlo tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    try {
      // Convertir de DD/MM/YYYY a YYYY-MM-DD
      const [day, month, year] = dateStr.split("/");
      if (day && month && year) {
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      // Intentar parsearlo como Date si no se pudo dividir
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }

      return dateStr;
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return dateStr;
    }
  };
