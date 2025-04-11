import { useState, useEffect } from "react";
import { Service } from "@/core/model/service";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service; // Si se proporciona, es para editar
  onSave?: (service: Omit<Service, "id"> & { id?: number }) => void;
}

export function AddServiceDialog({ open, onOpenChange, service, onSave }: AddServiceDialogProps) {
  const isEditMode = !!service;

  // Estado para el formulario
  const [formData, setFormData] = useState({
    id: service?.id || undefined,
    name: service?.name || "",
  });

  // Estado para validación
  const [errors, setErrors] = useState({
    name: "",
  });

  // Restablecer el formulario cuando se abre/cierra o cambia el servicio
  useEffect(() => {
    if (open) {
      setFormData({
        id: service?.id || undefined,
        name: service?.name || "",
      });
      setErrors({ name: "" });
    }
  }, [open, service]);

  // Gestionar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar mensaje de error
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {
      name: "",
    };

    // Validación del nombre: es obligatorio
    if (!formData.name) {
      newErrors.name = "El nombre del servicio es obligatorio";
    } else if (formData.name.length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    }

    setErrors(newErrors);

    // El formulario es válido si no hay mensajes de error
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSave?.({
      id: formData.id,
      name: formData.name,
    });
    
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              {isEditMode ? "Editar Servicio" : "Nuevo Servicio"}
            </h3>
            <button
              onClick={() => onOpenChange(false)}
              className="text-white hover:text-blue-200 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Campo: Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del servicio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Carga y Descarga"
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isEditMode ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}