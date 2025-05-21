import { addDays, addMinutes } from "date-fns";

export const formatDate = (date: string | undefined) => {
  if (!date) return "Sin fecha";
  try {
    const [year, month, day] = date.split("T")[0].split("-");
    if (!year || !month || !day) {
      return "Formato inválido";
    }
    return `${day}/${month}/${year}`;
  } catch {
    return "Sin fecha";
  }
};




export function excelDateToJSDate(excelDate: number) {
  // Excel epoch (Jan 1, 1900)
  const epoch = new Date(1899, 11, 30); 
  // Ajuste para el error de Excel con 1900 como año bisiesto
  const days = excelDate > 60 ? excelDate - 1 : excelDate;
  // Añadir días a la fecha base
  const date = addDays(epoch, days);
  
  // Manejar la parte decimal para las horas
  const timeValue = excelDate % 1;
  if (timeValue > 0) {
    const millisInDay = timeValue * 24 * 60 * 60 * 1000;
    date.setMilliseconds(date.getMilliseconds() + millisInDay);
  }
  
  // Redondear minutos que terminan en 59 a la siguiente hora
  const minutes = date.getMinutes();
  if (minutes === 59) {
    return addMinutes(date, 1);
  }

  if (minutes === 29) {
    return addMinutes(date, 1);
  }
  
  return date;
}