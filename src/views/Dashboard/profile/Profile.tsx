import { useEffect, useState } from "react";
import { decodeToken } from "@/lib/utils/jwtutils";
import { User } from "@/core/model/user";
import { StatusSuccessAlert, StatusCodeAlert } from "@/components/dialog/AlertsLogin";
import api from "@/services/client/axiosConfig";
import { z } from "zod";
import EditableInput from "@/components/ui/EditableInput";
import { FaUserCircle, FaSave, FaIdCard, FaMobileAlt, FaBriefcase } from "react-icons/fa";

// Definir los roles disponibles
const AVAILABLE_ROLES = [
  { value: "ADMIN", label: "Administrador" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "COORDINADOR", label: "Coordinador" },
  { value: "GH", label: "Gestión Humana" }
];



export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState<User | null>(null);

  // Cargar datos del usuario desde la API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = decodeToken(token);
    if (!decoded?.dni) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/user/${decoded.dni}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const userData = {
          ...response.data,
          cargo: response.data.occupation || response.data.cargo || ""
        };
        
        setUser(userData);
        setOriginalData(JSON.parse(JSON.stringify(userData))); // Deep clone para restaurar
      } catch (error) {
        StatusCodeAlert(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Guardar cambios
  const handleSave = async () => {
    if (!user?.id || !hasChanges) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Asegurate de que occupation también se actualiza
      const dataToSave = {
        name: user.name,
        dni: user.dni,
        phone: user.phone,
        username: user.username,
        occupation: user.cargo,
      };
      
      await api.patch(
        `/user/${user.dni}`,
        dataToSave,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOriginalData(JSON.parse(JSON.stringify(user))); // Actualizar original tras guardar
      setHasChanges(false);
      StatusSuccessAlert("Perfil actualizado", "Tus datos han sido actualizados correctamente.");
    } catch (error) {
      StatusCodeAlert(error);
    } finally {
      setLoading(false);
    }
  };

  // Detectar cambios para habilitar/deshabilitar el botón de guardar
  useEffect(() => {
    if (user && originalData) {
      const changed = 
        user.name !== originalData.name ||
        user.dni !== originalData.dni ||
        user.phone !== originalData.phone ||
        user.cargo !== originalData.cargo;
      
      setHasChanges(changed);
    }
  }, [user, originalData]);

  // Manejar cambio en un campo
  const handleFieldChange = (field: string, value: string) => {
    // Validar el campo según su tipo
    if (field === "dni" && !/^\d+$/.test(value)) {
      return; // Solo números
    }
    if (field === "phone" && !/^\d+$/.test(value)) {
      return; // Solo números
    }
    if(field === "name" && !/^[a-zA-Z\s]+$/.test(value)) {
      return; // Solo letras y espacios
    }
    if(field === "phone" && (value.length < 9 || value.length > 12)) {
      return; // Longitud entre 9 y 12 caracteres
    }

    if (user) {
      setUser({ ...user, [field]: value });
    }
  };

  // Restaurar cambios
  const handleCancel = () => {
    if (originalData) {
      setUser(JSON.parse(JSON.stringify(originalData)));
      setHasChanges(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-gray-600">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Encabezado con tarjeta de perfil */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl mb-8 overflow-hidden">
          <div className="relative h-32 bg-blue-900">
            <div className="absolute -bottom-16 left-8">
              <div className="bg-white p-1.5 rounded-full shadow-lg">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-full h-28 w-28 flex items-center justify-center text-white text-4xl font-bold shadow-inner">
                  {user.name?.charAt(0).toUpperCase() || <FaUserCircle size={60} />}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white pt-20 pb-6 px-8">
            <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
            <div className="flex items-center text-gray-500 mt-1">
              <span className="text-blue-600 font-medium">{user.username}</span>
              <span className="mx-2">•</span>
              <span>{AVAILABLE_ROLES.find(role => role.value === user.cargo)?.label || user.cargo}</span>
            </div>
          </div>
        </div>

        {/* Formulario de información personal */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaIdCard className="mr-2 text-blue-600" />
            Información Personal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <EditableInput
                label="Nombre Completo"
                id="name"
                value={user.name}
                onChange={(value) => handleFieldChange('name', value)}
                required
              />
            </div>
            
            <div>
              <EditableInput
                label="Nombre de Usuario"
                id="username"
                value={user.username}
                onChange={(value) =>  handleFieldChange('username', value)}
              />
            </div>
            
            <div>
              <EditableInput
                label="Número de Identificación (DNI)"
                id="dni"
                value={user.dni}
                onChange={(value) => handleFieldChange('dni', value)}
                required
                pattern="^\d+$"
                minLength={8}
                maxLength={12}
              />
            </div>
            
            <div>
              <EditableInput
                label="Teléfono de Contacto"
                id="phone"
                value={user.phone}
                onChange={(value) => handleFieldChange('phone', value)}
                required
                pattern="^\d+$"
                minLength={9}
                maxLength={12}
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="mb-4">
                <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo / Posición <span className="text-red-500">*</span>
                </label>
                <select
                  id="cargo"
                  name="cargo"
                  value={user.cargo}
                  onChange={(e) => handleFieldChange('cargo', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Selecciona un cargo</option>
                  {AVAILABLE_ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {!user.cargo && (
                  <p className="mt-1 text-sm text-red-500">El cargo es obligatorio</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-10">
            {hasChanges && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
                disabled={loading}
              >
                Cancelar
              </button>
            )}
            
            <button
              type="button"
              onClick={handleSave}
              className={`
                px-5 py-2.5 rounded-lg font-medium flex items-center gap-2
                ${hasChanges 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"}
                transition-all
              `}
              disabled={!hasChanges || loading}
            >
              <FaSave />
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}