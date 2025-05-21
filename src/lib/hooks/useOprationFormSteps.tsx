import { useCallback } from "react";
import Swal from "sweetalert2";

export function useStepNavigation(
  currentStep: number, 
  setCurrentStep: (step: number | ((prev: number) => number)) => void,
  totalSteps: number,
  errors: any,
  setErrors: (errors: any) => void,
  formData: any
) {
  // Validar un paso específico
  const validateStep = useCallback((step: number): boolean => {
    const newErrors = { ...errors };
    let isValid = true;

    // Limpiar errores previos para este paso específico
    switch (step) {
      case 1:
        newErrors.workers = "";
        break;
      case 2:
        newErrors.motorShip = "";
        newErrors.dateStart = "";
        newErrors.timeStart = "";
        newErrors.id_area = "";
        newErrors.id_task = "";
        newErrors.id_client = "";
        break;
      case 3:
        newErrors.inCharged = "";
        break;
    }

    // Realizar las validaciones
    switch (step) {
      case 1:
        if (formData.workerIds.length === 0 && formData.groups.length === 0) {
          newErrors.workers = "Debe seleccionar al menos un trabajador o grupo";
          isValid = false;
        }
        break;
      case 2:
        // Validaciones para información básica
        if (!formData.zone) {
          newErrors.zone = "La zona es obligatoria";
          isValid = false;
        }

        if (!formData.id_task) {
          newErrors.id_task = "La tarea es obligatoria";
          isValid = false;
        }

        if (!formData.id_client) {
          newErrors.id_client = "El cliente es obligatorio";
          isValid = false;
        }

        if (!formData.id_area) {
          newErrors.id_area = "El área es obligatoria";
          isValid = false;
        }

        if (!formData.dateStart) {
          newErrors.dateStart = "La fecha de inicio es obligatoria";
          isValid = false;
        }

        if (!formData.timeStrat) {
          newErrors.timeStart = "La hora de inicio es obligatoria";
          isValid = false;
        }
        break;

      case 3:
        if (formData.inChargedIds.length === 0) {
          newErrors.inCharged = "Debe seleccionar al menos un supervisor";
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  }, [errors, setErrors, formData]);

  // Validar todos los pasos
  const validateAllSteps = useCallback((): boolean => {
    for (let step = 1; step <= totalSteps; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return false;
      }
    }
    return true;
  }, [validateStep, totalSteps, setCurrentStep]);

  // Navegar a un paso específico por ID de tab
  const handleTabChange = useCallback((id: string, steps: Array<{id: string}>) => {
    const stepIndex = steps.findIndex(step => step.id === id);
    if (stepIndex !== -1 && validateStep(currentStep)) {
      setCurrentStep(stepIndex + 1);
    }
  }, [currentStep, validateStep, setCurrentStep]);

  // Ir al siguiente paso
  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos requeridos para continuar.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6'
      });
    }
  }, [currentStep, validateStep, setCurrentStep, totalSteps]);

  // Ir al paso anterior
  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, [setCurrentStep]);

  return {
    validateStep,
    validateAllSteps,
    handleTabChange,
    handleNext,
    handleBack
  };
}