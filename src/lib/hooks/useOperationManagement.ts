import { useState } from 'react';
import { Operation as OperationModel } from '@/core/model/operation';
import { operationService } from '@/services/operationService';
import { OperationCreateData } from '@/services/interfaces/operationDTO';
import Swal from 'sweetalert2';
import { formatOperationForEdit } from "@/lib/utils/operationHelpers";

interface UseOperationManagementProps {
  refreshOperations: () => Promise<void>;
  updateOperation?: (id: number | string, data: OperationCreateData) => Promise<any>;
}

export const useOperationManagement = ({ 
  refreshOperations, 
  updateOperation 
}: UseOperationManagementProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<OperationModel | undefined>(undefined);
  const [operationToActivate, setOperationToActivate] = useState<OperationModel | null>(null);
  const [viewOperation, setViewOperation] = useState<OperationModel | null>(null);

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
      // Formatear los datos antes de enviar
      const formattedData = {
        ...data,
        id: isEdit ? data.id : undefined,
        zone: parseInt(data.zone),
        id_client: parseInt(data.id_client),
        id_area: parseInt(data.id_area),
        id_task: parseInt(data.id_task),
        dateStart: data.dateStart,
        timeStart: data.timeStart || data.timeStrat,
        dateEnd: data.dateEnd || null,
        timeEnd: data.timeEnd || null,
        status: data.status || "PENDING",
        workerGroups: data.workerGroups || [],
        inChargedIds: data.inChargedIds || [],
        removedWorkerIds: data.removedWorkerIds || [],
        removedWorkerGroupIds: data.removedWorkerGroupIds || [],
      };

      if (isEdit) {
        if (updateOperation) {
          await updateOperation(data.id, formattedData as OperationCreateData);
        } else {
          await operationService.updateOperation(data.id, formattedData as OperationCreateData);
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
    confirmDelete
  };
};