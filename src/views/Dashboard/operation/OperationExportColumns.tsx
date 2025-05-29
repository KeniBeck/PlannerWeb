import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ExcelColumn } from "@/components/ui/SectionHeader";
import { OperationStatus } from "@/core/model/operation";

// Define WorkerGroup interface
interface WorkerGroup {
  workers?: Array<any>;
}

// Función auxiliar para obtener etiqueta amigable para el estado
const getStatusLabel = (status: string): string => {
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

// Definir las columnas para exportación
export const getOperationExportColumns = (): ExcelColumn[] => {
  return [
    { header: "ID", field: "id" },
    {
      header: "Área",
      field: "jobArea.name",
      value: (op) => op.jobArea?.name || "Sin área",
    },
    {
      header: "Cliente",
      field: "client.name",
      value: (op) => op.client?.name || "Sin cliente",
    },
    {
      header: "Supervisores",
      field: "inCharge",
      value: (op) => {
        if (!op.inCharge || op.inCharge.length === 0) return "Sin supervisor";
        return op.inCharge.map((supervisor: { name: string }) => supervisor.name).join(", ");
      },
    },
    {
      header: "Fecha Inicio",
      field: "dateStart",
      value: (op) =>
        op.dateStart
          ? format(new Date(op.dateStart), "dd/MM/yyyy", { locale: es })
          : "N/A",
    },
    {
      header: "Hora Inicio",
      field: "timeStrat",
      value: (op) => op.timeStrat || "N/A",
    },
    {
      header: "Fecha Fin",
      field: "dateEnd",
      value: (op) =>
        op.dateEnd
          ? format(new Date(op.dateEnd), "dd/MM/yyyy", { locale: es })
          : "N/A",
    },
    {
      header: "Hora Final",
      field: "timeEnd",
      value: (op) => op.timeEnd || "N/A",
    },
    {
      header: "Embarcación",
      field: "motorShip",
      value: (op) => op.motorShip || "N/A",
    },
    {
      header: "Estado",
      field: "status",
      value: (op) => getStatusLabel(op.status),
    },
    {
      header: "Grupos de Trabajo",
      field: "workerGroups",
      value: (op) => {
        if (!op.workerGroups || op.workerGroups.length === 0) {
          return "Sin grupos";
        }
        
        // En lugar de solo mostrar el número, podemos dar información más útil
        return `${op.workerGroups.length} grupo(s)`;
      },
    },
    {
        header: "Detalle de Trabajadores",
        field: "workerGroups",
        value: (op) => {
          if (!op.workerGroups || op.workerGroups.length === 0) {
            return "Sin trabajadores";
          }
          
          const groupedDetails: string[] = [];
          
          op.workerGroups.forEach((group: WorkerGroup, index: number) => {
            if (group.workers && Array.isArray(group.workers) && group.workers.length > 0) {
              const workerNames = group.workers
                .filter(worker => worker.name)
                .map(worker => worker.name);
              
              if (workerNames.length > 0) {
                // Identificar cada grupo con un número 
                groupedDetails.push(`Turno ${index + 1}: ${workerNames.join(", ")}`);
              }
            }
          });
          
          return groupedDetails.length > 0 
            ? groupedDetails.join(" | ") 
            : "Grupos sin trabajadores asignados";
        },
      },
    {
      header: "Fecha Creación",
      field: "createAt",
      value: (op) =>
        op.createAt
          ? format(new Date(op.createAt), "dd/MM/yyyy HH:mm", { locale: es })
          : "N/A",
    },
    {
      header: "Última Actualización",
      field: "updateAt",
      value: (op) =>
        op.updateAt
          ? format(new Date(op.updateAt), "dd/MM/yyyy HH:mm", { locale: es })
          : "N/A",
    },
  ];
};


