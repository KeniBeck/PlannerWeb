import { useState, useEffect } from "react";
import { User } from "@/core/model/user";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ca } from "date-fns/locale";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User; // Si se proporciona, es para editar
  onSave?: (user: Omit<User, "id"> & { id?: number }) => Promise<void>;
}


export function AddUserDialog({ open, onOpenChange, user, onSave }: AddUserDialogProps) {
  const isEditMode = !!user;

  // Estado para el formulario
  const [formData, setFormData] = useState({
    id: user?.id || undefined,
    name: user?.name || "",
    username: user?.username || "",
    dni: user?.dni || "",
    phone: user?.phone || "",
    password: "",
    cargo: user?.occupation || "SUPERVISOR",
  });

  const [apiError, setApiError] = useState(""); 

  // Estado para validación
  const [errors, setErrors] = useState({
    name: "",
    username: "",
    dni: "",
    phone: "",
    password: "",
    cargo: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        id: user?.id || undefined,
        name: user?.name || "",
        username: user?.username || "",
        dni: user?.dni || "",
        phone: user?.phone || "",
        password: "",
        cargo: user?.occupation || "SUPERVISOR",
      });
      setErrors({ name: "", username: "", dni: "", phone: "", password: "", cargo: "" });
    }
  }, [open, user]);

  // Relación cargo -> role
  const getRoleFromCargo = (cargo: string) => {
    switch (cargo) {
      case "ADMON PLATAFORMA":
        return "SUPERADMIN";
      case "SUPERVISOR":
        return "SUPERVISOR";
      case "COORDINADOR":
        return "ADMIN";
      case "GESTION HUMANA":
        return "GH";
      default:
        return "SUPERVISOR";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "dni" || name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData(prev => ({
        ...prev,
        [name]: numericValue,
      }));
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
      return;
    }

    if (name === "name") {
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData(prev => ({
        ...prev,
        [name]: lettersOnly,
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      username: "",
      dni: "",
      phone: "",
      password: "",
      cargo: "",
    };

    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.username.trim()) newErrors.username = "El nombre de usuario es obligatorio";
    if (!formData.dni.trim()) newErrors.dni = "El documento de identidad es obligatorio";
    else if (!/^\d+$/.test(formData.dni)) newErrors.dni = "El documento debe contener solo números";
    else if (formData.dni.length < 8 || formData.dni.length > 12) newErrors.dni = "El documento debe tener entre 8 y 12 dígitos";
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es obligatorio";
    else if (!/^\d+$/.test(formData.phone)) newErrors.phone = "El teléfono debe contener solo números";
    else if (formData.phone.length < 9 || formData.phone.length > 12) newErrors.phone = "El teléfono debe tener entre 9 y 12 dígitos";
    if (!formData.cargo.trim()) newErrors.cargo = "El cargo es obligatorio";
    if (!isEditMode && !formData.password) newErrors.password = "La contraseña es obligatoria para nuevos usuarios";
    else if (!isEditMode && formData.password.length < 6) newErrors.password = "La contraseña debe tener al menos 6 caracteres";

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(""); 
    if (!validateForm()) return;

    const role = getRoleFromCargo(formData.cargo);

    const userData = isEditMode
      ? {
          id: formData.id,
          name: formData.name,
          username: formData.username,
          dni: formData.dni,
          phone: formData.phone,
          occupation: formData.cargo,
          role,
        }
      : {
          id: formData.id,
          name: formData.name,
          username: formData.username,
          dni: formData.dni,
          phone: formData.phone,
          occupation: formData.cargo,
          role,
          password: formData.password,
        };

        try {
          await onSave?.(userData);
          onOpenChange(false);
        } catch (error: any) {
         
        if (error?.response?.status === 409) {
   
          setApiError("El usuario ya existe. Por favor, elige otro nombre de usuario o DNI.");
        } else {
        
          setApiError("Ocurrió un error al guardar el usuario.");
        }
        }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              {isEditMode ? "Editar Usuario" : "Nuevo Usuario"}
            </h3>
            <button
              onClick={() => {
                setApiError("");
                onOpenChange(false);
              }}
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
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Campo: Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ej. juan.perez"
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.username ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
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
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dni ? "border-red-300" : "border-gray-300"
                }`}
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
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Campo: Cargo */}
            <div>
              <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                Cargo <span className="text-red-500">*</span>
              </label>
              <select
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.cargo ? "border-red-300" : "border-gray-300"
                }`}
              >
                <option value="ADMON PLATAFORMA">Administrador</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="COORDINADOR">Coordinador</option>
                <option value="GESTION HUMANA">Gestión Humana</option>
              </select>
              {errors.cargo && <p className="mt-1 text-sm text-red-500">{errors.cargo}</p>}
            </div>

            {/* Campo: Contraseña */}
            {!isEditMode && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********"
                    className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  >
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
            )}
          </div>

          {apiError && (
            <div className="mb-4 text-red-600 text-sm font-medium">{apiError}</div>
          )}

          {/* Botones de acción */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setApiError("");
                onOpenChange(false);
              }}
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