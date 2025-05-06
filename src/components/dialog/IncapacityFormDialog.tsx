import React, { useEffect, useState } from 'react';
import { endOfDay, format } from 'date-fns';
import { FaHeartbeat, FaCalendarAlt, FaPen, FaExclamationTriangle } from 'react-icons/fa';
import { Worker } from '@/core/model/worker';
import { DateFilter } from '../custom/filter/DateFilterProps';

// Enumeraciones para los valores de select
enum IncapacityTypeEnum {
  INITIAL = 'INITIAL',
  EXTENSION = 'EXTENSION'
}

enum IncapacityCauseEnum {
  WORK_ACCIDENT = 'WORK_ACCIDENT',
  TRAFFIC_ACCIDENT = 'TRAFFIC_ACCIDENT',
  GENERAL_ILLNESS = 'GENERAL_ILLNESS'
}

// Labels para mostrar en la interfaz
const incapacityTypeLabels = {
  [IncapacityTypeEnum.INITIAL]: 'Inicial',
  [IncapacityTypeEnum.EXTENSION]: 'Prórroga'
};

const incapacityCauseLabels = {
  [IncapacityCauseEnum.WORK_ACCIDENT]: 'Accidente Laboral',
  [IncapacityCauseEnum.TRAFFIC_ACCIDENT]: 'Accidente de Tránsito',
  [IncapacityCauseEnum.GENERAL_ILLNESS]: 'Enfermedad General'
};

interface IncapacityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: Worker | null;
  onSave: (data: { 
    startDate: Date; 
    endDate: Date; 
    cause: IncapacityCauseEnum; 
    type: IncapacityTypeEnum 
  }) => void;
  isLoading?: boolean;
}

export function IncapacityFormDialog({
  open,
  onOpenChange,
  worker,
  onSave,
  isLoading = false
}: IncapacityFormDialogProps) {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    cause: IncapacityCauseEnum.GENERAL_ILLNESS,
    type: IncapacityTypeEnum.INITIAL
  });

  // Estado para errores de validación
  const [errors, setErrors] = useState({
    startDate: "",
    endDate: "",
    cause: "",
    type: ""
  });

  // Resetear formulario cuando se abre/cierra el diálogo
  useEffect(() => {
    if (open) {
      setFormData({
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
        cause: IncapacityCauseEnum.GENERAL_ILLNESS,
        type: IncapacityTypeEnum.INITIAL
      });
      setErrors({ startDate: "", endDate: "", cause: "", type: "" });
    }
  }, [open]);

  // Manejar cambios en select inputs
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {
      startDate: "",
      endDate: "",
      cause: "",
      type: ""
    };
    
    if (!formData.startDate) {
      newErrors.startDate = "La fecha de inicio es obligatoria";
    }
    
    if (!formData.endDate) {
      newErrors.endDate = "La fecha de finalización es obligatoria";
    }
    
    if (!formData.cause) {
      newErrors.cause = "La causa de incapacidad es obligatoria";
    }
    
    if (!formData.type) {
      newErrors.type = "El tipo de incapacidad es obligatorio";
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (!validateForm() || !worker) return;
    
    onSave({
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      cause: formData.cause as IncapacityCauseEnum,
      type: formData.type as IncapacityTypeEnum
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-lg px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white flex items-center">
              <FaHeartbeat className="mr-2" />
              Registrar Incapacidad
            </h3>
            <button
              onClick={() => onOpenChange(false)}
              className="text-white hover:text-amber-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5">
          {worker && (
            <div className="flex items-center mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <div className="flex-shrink-0 bg-gradient-to-r from-amber-400 to-amber-500 h-12 w-12 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">
                  {worker.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trabajador:</p>
                <p className="text-base font-bold">{worker.name}</p>
                <p className="text-xs text-gray-500">DNI: {worker.dni}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Tipo de incapacidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de incapacidad <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-2.5">
                  <FaExclamationTriangle className="text-amber-600" />
                </div>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleSelectChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                    errors.type ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                >
                  {Object.entries(incapacityTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
            </div>

            {/* Causa de incapacidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Causa de incapacidad <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-2.5">
                  <FaHeartbeat className="text-amber-600" />
                </div>
                <select
                  name="cause"
                  value={formData.cause}
                  onChange={handleSelectChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                    errors.cause ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                >
                  {Object.entries(incapacityCauseLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.cause && <p className="mt-1 text-sm text-red-500">{errors.cause}</p>}
            </div>

            {/* Fecha de inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de inicio <span className="text-red-500">*</span>
              </label>
              <DateFilter
                label='Seleccione la fecha de inicio'
                value={formData.startDate}
                onChange={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
                className={`w-full border rounded-lg ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
            </div>

            {/* Fecha de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de finalización <span className="text-red-500">*</span>
              </label>
              <DateFilter
                label='Seleccione la fecha de finalización'
                value={formData.endDate}
                onChange={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
                className={`w-full border rounded-lg ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Exportar las enumeraciones para uso externo
export { IncapacityTypeEnum, IncapacityCauseEnum };