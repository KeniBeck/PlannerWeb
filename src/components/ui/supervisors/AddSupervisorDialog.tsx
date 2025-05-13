import { useState, useEffect } from "react";
import { User } from "@/core/model/user";

interface AddSupervisorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supervisor?: User; // Si se proporciona, es para editar
  onSave?: (supervisor: Omit<User, "id" | "username"> & { id?: number }) => void;
}

export function AddSupervisorDialog({ open, onOpenChange, supervisor, onSave }: AddSupervisorDialogProps) {
  const isEditMode = !!supervisor;

  // Estado para el formulario
  const [formData, setFormData] = useState({
    id: supervisor?.id || undefined,
    name: supervisor?.name || "",
    dni: supervisor?.dni || "",
    phone: supervisor?.phone || "",
    cargo: supervisor?.occupation || "",
  });

  // Estado para validación
  const [errors, setErrors] = useState({
    name: "",
    dni: "",
    phone: "",
    cargo: "",
  });

  // Restablecer el formulario cuando se abre/cierra o cambia el supervisor
  useEffect(() => {
    if (open) {
      setFormData({
        id: supervisor?.id || undefined,
        name: supervisor?.name || "",
        dni: supervisor?.dni || "",
        phone: supervisor?.phone || "",
        cargo: supervisor?.occupation || "",
      });
      setErrors({ name: "", dni: "", phone: "", cargo: "" });
    }
  }, [open, supervisor]);

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo permitir números
    setFormData(prev => ({
      ...prev,
      dni: value
    }));

    // Limpiar mensaje de error
    setErrors(prev => ({
      ...prev,
      dni: ''
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo permitir números
    setFormData(prev => ({
      ...prev,
      phone: value
    }));

    // Limpiar mensaje de error
    setErrors(prev => ({
      ...prev,
      phone: ''
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Solo permitir letras y espacios
    setFormData(prev => ({
      ...prev,
      name: value
    }));

    // Limpiar mensaje de error
    setErrors(prev => ({
      ...prev,
      name: ''
    }));
  }

  // Gestionar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Para campos específicos, usar manejadores especiales
    if (name === 'dni') {
      handleDniChange(e);
      return;
    }

    if (name === 'phone') {
      handlePhoneChange(e);
      return;
    }

    if (name === 'name') {
      handleNameChange(e);
      return;
    }

    // Para los demás campos, usar el manejador genérico
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
      dni: "",
      phone: "",
      cargo: "",
    };

    // Validación del nombre: no debe contener números y es obligatorio
    if (!formData.name) {
      newErrors.name = "El nombre es obligatorio";
    } else if (/\d/.test(formData.name)) {
      newErrors.name = "El nombre no debe contener números";
    }

    // Validación del DNI: solo debe contener números y es obligatorio
    if (!formData.dni) {
      newErrors.dni = "El documento es obligatorio";
    } else if (!/^\d+$/.test(formData.dni)) {
      newErrors.dni = "El documento debe contener solo números";
    } else if (formData.dni.length < 8 || formData.dni.length > 12) {
      newErrors.dni = 'El documento debe tener entre 8 y 12 dígitos';
    }

    // Validación del teléfono: solo debe contener números y tener longitud adecuada
    if (!formData.phone) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono debe contener solo números';
    } else if (formData.phone.length < 9 || formData.phone.length > 12) {
      newErrors.phone = 'El teléfono debe tener entre 9 y 12 dígitos';
    }

    // Validación del cargo: es obligatorio
    if (!formData.cargo) {
      newErrors.cargo = 'El cargo es obligatorio';
    } else if (formData.cargo.length < 3) {
      newErrors.cargo = 'El cargo debe tener al menos 3 caracteres';
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
      dni: formData.dni,
      phone: formData.phone,
      occupation: formData.cargo,
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
              {isEditMode ? "Editar Supervisor" : "Nuevo Supervisor"}
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
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej. Juan Pérez García"
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Campo: DNI */}
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
                Documento de identidad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="dni"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                placeholder="Ej. 12345678"
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.dni ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.dni && <p className="mt-1 text-sm text-red-500">{errors.dni}</p>}
            </div>

            {/* Campo: Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ej. 987654321"
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Campo: Cargo/Especialidad */}
            <div>
              <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                Cargo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                placeholder="Ej. Logística marítima"
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.cargo ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.cargo && <p className="mt-1 text-sm text-red-500">{errors.cargo}</p>}
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