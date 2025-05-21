import { useState } from "react";
import { Operation as OperationModel } from "@/core/model/operation";
import { operationService } from "@/services/operationService";
import { OperationCreateData } from "@/services/interfaces/operationDTO";
import Swal from "sweetalert2";
import { formatOperationForEdit } from "@/lib/utils/operationHelpers";

interface UseOperationManagementProps {
  refreshOperations: () => Promise<void>;
  updateOperation?: (
    id: number | string,
    data: OperationCreateData
  ) => Promise<any>;
}

export const useOperationManagement = ({
  refreshOperations,
  updateOperation,
}: UseOperationManagementProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<
    OperationModel | undefined
  >(undefined);
  const [operationToActivate, setOperationToActivate] =
    useState<OperationModel | null>(null);
  const [viewOperation, setViewOperation] = useState<OperationModel | null>(
    null
  );

  // Manejadores para acciones de operaciones
  const handleEditOperation = (operation: any) => {
    const formattedOperation = formatOperationForEdit(operation);
    setSelectedOperation(formattedOperation);
    setIsAddOpen(true);
  };

  const handleViewOperation = (operation: OperationModel) => {
    setViewOperation(operation);
    setIsViewOpen(true);
  };

  const handleDeleteOperation = (operation: OperationModel) => {
    setOperationToActivate(operation);
  };

  const handleSave = async (data: any, isEdit: boolean) => {
    try {
      // Crear un objeto que solo contenga los campos necesarios para el backend
      const formattedData: OperationCreateData = {
        status: data.status || "PENDING",
        zone: parseInt(data.zone),
        motorShip: data.motorShip || "",
        dateStart: data.dateStart,
        timeStrat: data.timeStrat || data.timeStart, // Priorizar timeStrat
        dateEnd: data.dateEnd || null,
        timeEnd: data.timeEnd || null,
        id_area: parseInt(data.id_area),
        id_task: parseInt(data.id_task),
        id_client: parseInt(data.id_client),
        inChargedIds: data.inChargedIds || [],
        workerIds: [], // Será rellenado a partir de los grupos
      };

      // Normalizar grupos para evitar duplicación y usar el formato correcto
      if (data.groups && data.groups.length > 0) {
        formattedData.groups = data.groups.map((group: any) => {
          // Verificar si es un grupo de trabajadores individuales (sin fecha/hora)
          const isIndividualGroup = !group.dateStart || !group.timeStart;

          return {
            workerIds: group.workerIds || group.workers || [],
            dateStart: group.dateStart || null,
            dateEnd: group.dateEnd || null,
            timeStart: group.timeStart || null,
            timeEnd: group.timeEnd || null,
            // Usar el id_task del grupo si existe, si no, usar el de la operación principal
            // especialmente para grupos individuales
            id_task:
              group.id_task ||
              (isIndividualGroup ? parseInt(data.id_task) : null),
          };
        });
      }

      // Añadir campos solo para actualización
      if (isEdit) {
        formattedData.id = data.id;

        if (data.removedWorkerIds && data.removedWorkerIds.length > 0) {
          (formattedData as any).removedWorkerIds = data.removedWorkerIds;
        }
      }

      // Eliminar campos no utilizados o con valores null/undefined
      Object.keys(formattedData).forEach((key) => {
        if (
          formattedData[key as keyof OperationCreateData] === null ||
          formattedData[key as keyof OperationCreateData] === undefined
        ) {
          delete formattedData[key as keyof OperationCreateData];
        }
      });

      if (isEdit) {
        if (updateOperation) {
          await updateOperation(data.id, formattedData);
        } else {
          await operationService.updateOperation(data.id, formattedData);
        }
      } else {
        await operationService.createOperation(formattedData);
        Swal.fire({
          title: "Operación creada",
          text: "La operación ha sido creada correctamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#3085d6",
        });
      }

      await refreshOperations();
      setIsAddOpen(false);
      setSelectedOperation(undefined);
    } catch (error) {
      console.error("Error al guardar la operación:", error);
      Swal.fire({
        title: "Error",
        text: isEdit
          ? "Error al actualizar la operación. Inténtelo de nuevo."
          : "Error al crear la operación. Inténtelo de nuevo.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const confirmDelete = async () => {
    if (!operationToActivate) return;
    try {
      await operationService.deleteOperation(operationToActivate.id);
      await refreshOperations();
      setOperationToActivate(null);
    } catch (error) {
      console.error("Error al eliminar operación:", error);
      Swal.fire({
        title: "Error",
        text: "Error al eliminar la operación. Inténtelo de nuevo.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  return {
    isAddOpen,
    setIsAddOpen,
    isViewOpen,
    setIsViewOpen,
    selectedOperation,
    setSelectedOperation,
    operationToActivate,
    setOperationToActivate,
    viewOperation,
    setViewOperation,
    handleEditOperation,
    handleViewOperation,
    handleDeleteOperation,
    handleSave,
    confirmDelete,
  };
};
