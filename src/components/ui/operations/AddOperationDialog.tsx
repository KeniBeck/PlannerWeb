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
import { FaTimes } from "react-icons/fa";
import { TabSelector } from "@/components/ui/TabSelector";
import { AnimatePresence, motion } from "framer-motion";
import { useOperationSubmit } from "@/lib/hooks/useOperationSubmit";
import { useStepNavigation } from "@/lib/hooks/useOprationFormSteps";
import { useOperationForm } from "@/lib/hooks/useOperationForm";

interface AddOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation?: any;
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
  // Usar el hook para gestión del formulario
  const {
    currentStep,
    setCurrentStep,
    totalSteps,
    isSubmitting,
    setIsSubmitting,
    errors,
    setErrors,
    formData,
    setFormData,
    isEditMode
  } = useOperationForm(operation, open, onOpenChange);

  // Usar el hook para navegación entre pasos
  const {
    validateStep,
    validateAllSteps,
    handleTabChange,
    handleNext,
    handleBack,
  } = useStepNavigation(
    currentStep,
    setCurrentStep,
    totalSteps,
    errors,
    setErrors,
    formData,
  );

  // Usar el hook para envío de formulario
  const { handleSubmit } = useOperationSubmit(
    formData,
    isEditMode,
    isSubmitting,
    setIsSubmitting,
    onSave,
    onOpenChange,
    validateStep,
    validateAllSteps,
    currentStep
  );

  // Definir los pasos del formulario
  const steps = [
    { id: "workers", label: "Trabajadores", icon: <HiOutlineUserGroup className="w-5 h-5 mr-2" /> },
    { id: "info", label: "Información", icon: <HiOutlineClipboardList className="w-5 h-5 mr-2" /> },
    { id: "supervisors", label: "Supervisores", icon: <HiOutlineUsers className="w-5 h-5 mr-2" /> },
  ];

  if (!open) return null;

  // Renderizar los componentes para cada paso
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <WorkersForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            availableWorkers={availableWorkers}
          />
        );
      case 2:
        return (
          <BasicInfoForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            areas={areas}
            services={services}
            clients={clients}
            isEditMode={isEditMode}
          />
        );
      case 3:
        return (
          <SupervisorsForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            supervisors={supervisors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl transform transition-all mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {isEditMode ? "Editar Operación" : "Nueva Operación"}
              </h3>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-white hover:text-blue-200 focus:outline-none"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <TabSelector
            tabs={steps.map((step, index) => ({
              id: step.id,
              label: (
                <div className="flex items-center">
                  {step.icon}
                  <span>{step.label}</span>
                  {index + 1 === currentStep && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      Actual
                    </span>
                  )}
                </div>
              )
            }))}
            activeTab={steps[currentStep - 1].id}
            onChange={(id) => handleTabChange(id, steps)}
          />
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center px-4 py-2 rounded-lg ${currentStep === 1
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
                  disabled={isSubmitting}
                  className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
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