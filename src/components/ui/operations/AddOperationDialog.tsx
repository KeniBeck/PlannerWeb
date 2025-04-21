import { useState, useEffect } from "react";
import { Operation, OperationStatus } from "@/core/model/operation";
import { Worker } from "@/core/model/worker";
import { Area } from "@/core/model/area";
import { Service } from "@/core/model/service";
import { Client } from "@/core/model/client";
import { User } from "@/core/model/user";
import BasicInfoForm from "./BasicInfoForm";
import WorkersForm from "./WorkersForms";
import SupervisorsForm from "./SupervisorsForm";
import { HiOutlineClipboardList, HiOutlineUserGroup, HiOutlineUsers } from "react-icons/hi";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";


interface AddOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation?: Operation;
  areas: Area[];
  services: Service[];
  clients: Client[];
  availableWorkers: Worker[];
  supervisors: User[];
  onSave?: (data: any, isEdit: boolean) => Promise<void>;
}

export function AddOperationDialog({
  open,
  onOpenChange,
  operation,
  areas,
  services,
  clients,
  availableWorkers,
  supervisors,
  onSave
}: AddOperationDialogProps) {
  
  const isEditMode = !!operation;
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);



  const [formData, setFormData] = useState({
    id: operation?.id,
    status: operation?.status || OperationStatus.PENDING,
    zone: operation?.zone || "",
    motorShip: operation?.motorShip || "",
    dateStart: operation?.dateStart || "",
    dateEnd: operation?.endDate || "",
    timeStart: operation?.timeStart || "",
    timeEnd: operation?.timeEnd|| "",
    id_area: operation?.jobArea?.id || "",
    id_task: operation?.task?.id || "",
    id_client: operation?.client?.id || "",
    workerIds: operation?.workers?.map(w => w.id) || [],
    groups: operation?.workerGroups || [],
    inChargedIds: operation?.inCharge?.map(s => s.id) || []
  });

    // Resetear el formulario cuando cambia el modo (crear/editar) o se abre el modal
    useEffect(() => {
      if (open) {
        setCurrentStep(1);
        setFormData({
          id: operation?.id || 0,
          status: operation?.status || OperationStatus.PENDING,
          zone: operation?.zone?.toString() || "",
          motorShip: operation?.motorShip || "",
          dateStart: operation?.dateStart || "",
          dateEnd: operation?.endDate || "",
          timeStart: operation?.timeStart || "",
          timeEnd: operation?.timeEnd || "",
          id_area: operation?.jobArea?.id?.toString() || "",
          id_task: operation?.task?.id?.toString() || "",
          id_client: operation?.client?.id?.toString() || "",
          workerIds: operation?.workers?.map(w => w.id) || [],
          groups: operation?.workerGroups || [],
          inChargedIds: operation?.inCharge?.map(s => s.id) || []
        });
        setErrors({
          zone: "",
          motorShip: "",
          dateStart: "",
          timeStart: "",
          id_area: "",
          id_task: "",
          id_client: "",
          workers: "",
          inCharged: ""
        });
      }
    }, [open, operation]);

  const [errors, setErrors] = useState({
    zone: "",
    motorShip: "",
    dateStart: "",
    timeStart: "",
    id_area: "",
    id_task: "",
    id_client: "",
    workers: "",
    inCharged: ""
  });

  const steps = [
    {
      number: 1,
      title: "Selección de Trabajadores",
      icon: <HiOutlineUserGroup className="w-6 h-6" />,
      component: (
        <WorkersForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          availableWorkers={availableWorkers}
        />
      )
    },
    {
      number: 2,
      title: "Información Básica",
      icon: <HiOutlineClipboardList className="w-6 h-6" />,
      component: (
        <BasicInfoForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          areas={areas}
          services={services}
          clients={clients}
        />
      )
    },
    {
      number: 3,
      title: "Asignación de Supervisores",
      icon: <HiOutlineUsers className="w-6 h-6" />,
      component: (
        <SupervisorsForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          supervisors={supervisors}
        />
      )
    }
  ];

   const validateStep = (step: number) => {
    // Crear una copia del objeto de errores actual
    const newErrors = { ...errors };
    let isValid = true;
  
    // Limpiar errores previos para este paso específico
    switch (step) {
      case 1:
        newErrors.workers = "";
        break;
      case 2:
        newErrors.zone = "";
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
  
        if(!formData.id_client) {
          newErrors.id_client = "El cliente es obligatorio";
          isValid = false;
        }
  
        if(!formData.id_area) {
          newErrors.id_area = "El área es obligatoria";
          isValid = false;
        }
  
        if(!formData.dateStart) {
          newErrors.dateStart = "La fecha de inicio es obligatoria";
          isValid = false;
        }
  
        if(!formData.timeStart) {
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
  
    // Actualizar el estado de los errores
    setErrors(newErrors);
    return isValid;
  };

    // Función para validar todos los pasos
    const validateAllSteps = () => {
      for (let step = 1; step <= totalSteps; step++) {
        if (!validateStep(step)) {
          setCurrentStep(step);
          return false;
        }
      }
      return true;
    };
  


  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      // Mostrar notificación de error con SweetAlert2
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos requeridos para continuar.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar el paso actual
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
    
    // Validar todos los pasos
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
      // Preparar los datos para guardar
      const dataToSave = {
        ...formData,
        // Si estamos editando, usar el ID existente, sino generar uno nuevo
        id_group: isEditMode ? formData.id : Math.random().toString(36).substring(7)
      };
      
      // Llamar a la función onSave con el indicador de modo
      await onSave?.(dataToSave, isEditMode);
      
      // Mostrar notificación de éxito
      Swal.fire({
        title: isEditMode ? 'Operación actualizada' : 'Operación creada',
        text: isEditMode 
          ? 'La operación ha sido actualizada correctamente.'
          : 'La operación ha sido creada correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6'
      });
      
      // Cerrar el modal
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      
      // Mostrar notificación de error
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
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl transform transition-all mx-4">
        {/* Header con steps */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {operation ? "Editar Operación" : "Nueva Operación"}
              </h3>
              <button
                onClick={() => onOpenChange(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Steps indicator */}
            <div className="flex justify-between">
              {steps.map(step => (
                <div
                  key={step.number}
                  className={`flex-1 ${
                    step.number !== steps.length ? "border-r border-gray-200" : ""
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      step.number <= currentStep
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.number === currentStep
                            ? "bg-blue-100 text-blue-600"
                            : step.number < currentStep
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {step.icon}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">Paso {step.number}</p>
                        <p className="text-sm">{step.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="px-6 py-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {steps[currentStep - 1].component}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer with navigation buttons */}
        <div className="border-t border-gray-200 px-6 py-2 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center px-4 py-2 rounded-lg ${
                currentStep === 1
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-gray-700 bg-white hover:bg-gray-50 border border-gray-300"
              }`}
            >
              <BsArrowLeft className="mr-2" />
              Anterior
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg"
              >
                Cancelar
              </button>
              {currentStep === totalSteps ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                >
                  Guardar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                >
                  Siguiente
                  <BsArrowRight className="ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}