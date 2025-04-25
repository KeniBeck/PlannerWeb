import { useCallback } from "react";
import Swal from "sweetalert2";

export function useOperationSubmit(
  formData: any,
  isEditMode: boolean,
  isSubmitting: boolean,
  setIsSubmitting: (submitting: boolean) => void,
  onSave: ((data: any, isEdit: boolean) => Promise<void>) | undefined,
  onOpenChange: (open: boolean) => void,
  validateStep: (step: number) => boolean,
  validateAllSteps: () => boolean,
  currentStep: number
) {
  // Preparar los grupos de trabajadores para enviarlos
  const prepareWorkerGroups = useCallback(() => {
    // Preparar los grupos para enviarlos con formato consistente
    const normalizedGroups = formData.groups.map((group: any) => {
      // Asegurarnos de tener la propiedad workers o workerIds consistente
      const workerIds = group.workers || group.workerIds || [];
      
      return {
        // Solo incluir groupId si existe (para grupos existentes)
        ...(group.groupId ? {groupId: group.groupId} : {}),
        dateStart: group.dateStart || null,
        dateEnd: group.dateEnd || null,
        timeStart: group.timeStart || null,
        timeEnd: group.timeEnd || null,
        workers: workerIds,
        workerIds: workerIds, // garantizar que esté disponible en ambos formatos
        // Añadir un indicador para grupos nuevos
        isNewGroup: !group.groupId
      };
    });
    
    // Si hay trabajadores individuales, crea un grupo especial
    if (formData.workerIds && formData.workerIds.length > 0) {
      normalizedGroups.push({
        dateStart: null,
        dateEnd: null,
        timeStart: null,
        timeEnd: null,
        workers: formData.workerIds,
        workerIds: formData.workerIds,
        isNewGroup: true // Este siempre se considera un nuevo grupo o actualización de existente
      });
    }

    return normalizedGroups;
  }, [formData.groups, formData.workerIds]);

  // Determinar los trabajadores que han sido removidos
  const getRemovedWorkerIds = useCallback(() => {
    const data = formData as any;
    
    // Obtener todos los IDs de trabajadores actuales
    const currentWorkerIds = new Set([
      ...formData.workerIds,
      ...formData.groups.flatMap((group: any) =>
        Array.isArray(group.workers) ? group.workers : (group.workerIds || [])
      )
    ]);

    // Usar los trabajadores ya marcados para eliminar de formData.removedWorkerIds
    // y añadir cualquier otro que haya sido eliminado
    let allRemovedWorkerIds: number[] = [...(data.removedWorkerIds || [])];
    
    // Además, verificar si hay trabajadores originales que ya no están en los actuales
    if (Array.isArray(data.originalWorkerIds)) {
      data.originalWorkerIds.forEach((id: number) => {
        if (!currentWorkerIds.has(id) && !allRemovedWorkerIds.includes(id)) {
          allRemovedWorkerIds.push(id);
        }
      });
    }

    return {
      allRemovedWorkerIds,
      originalWorkerIds: data.originalWorkerIds || []
    };
  }, [formData]);

  // Manejar el envío del formulario
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateStep(currentStep)) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos requeridos.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
  
    if (!validateAllSteps()) {
      Swal.fire({
        title: 'Información incompleta',
        text: 'Por favor complete todos los campos requeridos en todos los pasos.',
        icon: 'warning',
        confirmButtonText: 'Revisar',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const data = formData as any;
      const { allRemovedWorkerIds, originalWorkerIds } = getRemovedWorkerIds();
      const normalizedGroups = prepareWorkerGroups();
      
      const dataToSave = {
        id: isEditMode ? formData.id : undefined,
        status: formData.status,
        zone: Number(formData.zone),
        motorShip: formData.motorShip || "",
        dateStart: formData.dateStart,
        timeStrat: data.timeStart || formData.timeStrat, // Enviamos ambas para compatibilidad
        timeStart: data.timeStart || formData.timeStrat, // con el backend
        dateEnd: formData.dateEnd || null,
        timeEnd: formData.timeEnd || null,
        id_area: Number(formData.id_area),
        id_task: Number(formData.id_task),
        id_client: Number(formData.id_client),
        workerGroups: normalizedGroups,
        inChargedIds: formData.inChargedIds,
        removedWorkerIds: allRemovedWorkerIds,
        originalWorkerIds: originalWorkerIds
      };
      
      await onSave?.(dataToSave, isEditMode);
  
      Swal.fire({
        title: isEditMode ? 'Operación actualizada' : 'Operación creada',
        text: isEditMode
          ? 'La operación ha sido actualizada correctamente.'
          : 'La operación ha sido creada correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6'
      });
  
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire({
        title: 'Error',
        text: isEditMode
          ? 'Error al actualizar la operación. Inténtelo de nuevo.'
          : 'Error al crear la operación. Inténtelo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateStep, 
    validateAllSteps, 
    currentStep, 
    setIsSubmitting, 
    formData, 
    getRemovedWorkerIds, 
    prepareWorkerGroups, 
    isEditMode, 
    onSave, 
    onOpenChange
  ]);

  return {
    handleSubmit,
    isSubmitting
  };
}