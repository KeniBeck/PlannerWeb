import { OperationStatus } from "@/core/model/operation";

// Obtener etiqueta amigable para el estado
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case OperationStatus.PENDING:
      return "Pendiente";
    case OperationStatus.INPROGRESS:
      return "En Curso";
    case OperationStatus.COMPLETED:
      return "Finalizado";
    case OperationStatus.CANCELED:
      return "Cancelado";
    default:
      return status || "Desconocido";
  }
};

// Formatear fechas para mostrar
export const formatDisplayDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    // El formato del input date es YYYY-MM-DD, lo convertimos a formato legible
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
};

// Función para formatear una operación para edición
export const formatOperationForEdit = (operation: any) => {
  return {
    ...operation,
    // Corregir campos de tiempo
    timeStart: operation.timeStrat || operation.timeStart || "",
    // Asegurarse de que los IDs estén correctamente mapeados
    id_client: operation.id_client || operation.client?.id,
    id_area: operation.jobArea?.id,
    id_task: operation.task?.id,
    // Formatear la fecha para que sea compatible con el input date
    dateStart: operation.dateStart
      ? new Date(operation.dateStart).toISOString().split("T")[0]
      : "",
    dateEnd: operation.dateEnd
      ? new Date(operation.dateEnd).toISOString().split("T")[0]
      : "",
    // Asegurarse de que zone sea string para los inputs
    zone: operation.zone?.toString(),
    // Mantener los grupos y trabajadores
    workerGroups: operation.workerGroups || [],
    inChargedIds: operation.inCharge?.map((s: any) => s.id) || [],
  };
};