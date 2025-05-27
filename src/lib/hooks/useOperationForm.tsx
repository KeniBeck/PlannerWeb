import { useState, useEffect, useCallback } from "react";
import { OperationStatus } from "@/core/model/operation";

export function useOperationForm(
  operation: any,
  open: boolean,
  onOpenChange: (open: boolean) => void
) {
  // Estados para el paso actual y estado de envío
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 3;
  const isEditMode = !!operation;

  const [isDateStartLocked, setIsDateStartLocked] = useState(false);
  const [isDateEndLocked, setIsDateEndLocked] = useState(false);
  const [isTimeStartLocked, setIsTimeStartLocked] = useState(false);
  const [isTimeEndLocked, setIsTimeEndLocked] = useState(false);

  // Estados para errores y datos del formulario
  const [errors, setErrors] = useState({
    zone: "",
    motorShip: "",
    dateStart: "",
    timeStart: "",
    id_area: "",
    // id_task: "",
    id_client: "",
    workers: "",
    inCharged: "",
  });

  const [formData, setFormData] = useState({
    id: operation?.id,
    status: operation?.status || OperationStatus.PENDING,
    zone: operation?.zone || "",
    motorShip: operation?.motorShip || "",
    dateStart: operation?.dateStart || "",
    dateEnd: operation?.endDate || "",
    timeStrat: operation?.timeStrat || "",
    timeEnd: operation?.timeEnd || "",
    id_area: operation?.jobArea?.id || "",
    // id_task: operation?.task?.id || null,
    id_client: operation?.client?.id || "",
    id_clientProgramming: operation?.clientProgramming?.id || "",
    workerIds: operation?.workers?.map((w: any) => w.id) || [],
    groups: operation?.workerGroups || [],
    inChargedIds: operation?.inCharge?.map((s: any) => s.id) || [],
  });

  // Función para actualizar fechas/horas según grupos
  const syncDatesWithGroups = useCallback((groups: any[]) => {
    if (!groups || groups.length === 0) {
      // Si no hay grupos, nada está bloqueado
      setIsDateStartLocked(false);
      setIsTimeStartLocked(false);
      setIsDateEndLocked(false);
      setIsTimeEndLocked(false);
      return;
    }

    // Filtrar solo grupos que tengan horarios programados
    const scheduledGroups = groups.filter(
      (g) =>
        g.dateStart &&
        g.timeStart &&
        g.dateStart !== null &&
        g.timeStart !== null
    );

    if (scheduledGroups.length === 0) {
      // Si no hay grupos programados, nada está bloqueado
      setIsDateStartLocked(false);
      setIsTimeStartLocked(false);
      setIsDateEndLocked(false);
      setIsTimeEndLocked(false);
      return;
    }

    // Encontrar la fecha/hora mínima (para inicio)
    const startDates = scheduledGroups
      .map((g) => ({ date: g.dateStart, time: g.timeStart }))
      .filter((dt) => dt.date && dt.time);

    // Encontrar la fecha/hora máxima (para fin)
    const endDates = scheduledGroups
      .map((g) => ({ date: g.dateEnd, time: g.timeEnd }))
      .filter((dt) => dt.date && dt.time);

    // Ordenar por fecha y hora
    if (startDates.length > 0) {
      // Ordenar para obtener la fecha/hora más temprana
      startDates.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });

      const earliestDate = startDates[0].date;
      const earliestTime = startDates[0].time;

      // Actualizar el formulario con la fecha/hora más temprana
      setFormData((prev) => ({
        ...prev,
        dateStart: earliestDate,
        timeStrat: earliestTime,
      }));

      // Bloquear la edición de estos campos
      setIsDateStartLocked(true);
      setIsTimeStartLocked(true);
    } else {
      setIsDateStartLocked(false);
      setIsTimeStartLocked(false);
    }

    if (endDates.length > 0) {
      // Ordenar para obtener la fecha/hora más tardía
      endDates.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB.getTime() - dateA.getTime(); // Orden inverso
      });

      const latestDate = endDates[0].date;
      const latestTime = endDates[0].time;

      // Actualizar el formulario con la fecha/hora más tardía
      setFormData((prev) => ({
        ...prev,
        dateEnd: latestDate,
        timeEnd: latestTime,
      }));

      // Bloquear la edición de estos campos
      setIsDateEndLocked(true);
      setIsTimeEndLocked(true);
    } else {
      setIsDateEndLocked(false);
      setIsTimeEndLocked(false);
    }
  }, []);

  // Observar cambios en grupos para sincronizar fechas
  useEffect(() => {
    if (formData.groups) {
      syncDatesWithGroups(formData.groups);
    }
  }, [formData.groups, syncDatesWithGroups]);

  // Efecto para inicializar y actualizar el formulario cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      let individualWorkerIds: number[] = [];
      let actualGroups: any[] = [];

      if (operation) {
        // Procesar los grupos de trabajadores
        if (
          operation.workerGroups &&
          Array.isArray(operation.workerGroups) &&
          operation.workerGroups.length > 0
        ) {
          operation.workerGroups.forEach((group: any) => {
            // Si es un grupo sin fecha/hora específica (trabajadores individuales)
            if (!group.schedule?.dateStart || !group.schedule?.timeStart) {
              // Añadir estos trabajadores a la selección individual
              if (group.workers && Array.isArray(group.workers)) {
                individualWorkerIds = [
                  ...individualWorkerIds,
                  ...group.workers.map((w: any) => w.id),
                ];
              }
            } else {
              // Este es un grupo real con fechas específicas
              const formattedGroup = {
                ...group,
                dateStart: group.schedule.dateStart || "",
                dateEnd: group.schedule.dateEnd || "",
                timeStart: group.schedule.timeStart || "",
                timeEnd: group.schedule.timeEnd || "",
                workers: group.workers
                  ? group.workers.map((w: any) =>
                      typeof w === "object" ? w.id : w
                    )
                  : group.workerIds || [],
              };
              actualGroups.push(formattedGroup);
            }
          });
        }

        // Añadir trabajadores individuales si existen
        if (operation.workers && Array.isArray(operation.workers)) {
          individualWorkerIds = [
            ...individualWorkerIds,
            ...operation.workers.map((w: any) => w.id),
          ];
        }

        // Eliminar duplicados
        individualWorkerIds = [...new Set(individualWorkerIds)];
      }

      // Actualizar formData con los datos procesados
      setFormData({
        id: operation?.id || 0,
        status: operation?.status || OperationStatus.PENDING,
        zone: operation?.zone?.toString() || "",
        motorShip: operation?.motorShip || "",
        dateStart: operation?.dateStart || "",
        dateEnd: operation?.endDate || operation?.dateEnd || "",
        timeStrat: operation?.timeStart || operation?.timeStrat || "",
        timeEnd: operation?.timeEnd || "",
        id_area:
          operation?.id_area?.toString() ||
          operation?.jobArea?.id?.toString() ||
          "",
        // id_task:
        //   operation?.id_task?.toString() ||
        //   operation?.task?.id?.toString() ||
        //   null,
        id_client:
          operation?.id_client?.toString() ||
          operation?.client?.id?.toString() ||
          "",
           id_clientProgramming: operation?.id_clientProgramming?.toString() || operation?.clientProgramming?.id?.toString() || "",
        workerIds: individualWorkerIds,
        groups: actualGroups,
        inChargedIds:
          operation?.inChargedIds ||
          (operation?.inCharge?.map
            ? operation?.inCharge?.map((s: any) => s.id)
            : []) ||
          [],
      });

      // Guardar IDs de trabajadores originales para comparar después
      const originalWorkerIds = new Set();
      if (operation) {
        if (operation.workers && Array.isArray(operation.workers)) {
          operation.workers.forEach((w: any) => originalWorkerIds.add(w.id));
        }

        if (operation.workerGroups && Array.isArray(operation.workerGroups)) {
          operation.workerGroups.forEach((group: any) => {
            if (group.workers && Array.isArray(group.workers)) {
              group.workers.forEach((w: any) => originalWorkerIds.add(w.id));
            }
          });
        }

        // Añadir esto al final del useEffect
        setFormData((prev) => ({
          ...prev,
          originalWorkerIds: Array.from(originalWorkerIds),
          removedWorkerIds: [], // Inicializar array vacío
        }));
      }

      // Resetear errores
      setErrors({
        zone: "",
        motorShip: "",
        dateStart: "",
        timeStart: "",
        id_area: "",
        // id_task: "",
        id_client: "",
        workers: "",
        inCharged: "",
      });
    }
  }, [open, operation]);

  return {
    currentStep,
    setCurrentStep,
    totalSteps,
    isSubmitting,
    setIsSubmitting,
    errors,
    setErrors,
    formData,
    setFormData,
    isEditMode,
    isDateStartLocked,
    isDateEndLocked,
    isTimeStartLocked,
    isTimeEndLocked,
  };
}
