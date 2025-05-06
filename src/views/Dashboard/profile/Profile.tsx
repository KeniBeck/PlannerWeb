import { useEffect, useState } from "react";
import { decodeToken } from "@/lib/utils/jwtutils";
import { User } from "@/core/model/user";
import { StatusSuccessAlert, StatusCodeAlert } from "@/components/dialog/AlertsLogin";
import api from "@/services/client/axiosConfig";
import { z } from "zod";
import  { ViewOnlyInput } from "@/components/ui/ViewOnlyInput";
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


  // Detectar cambios para habilitar/deshabilitar el botón de guardar
  useEffect(() => {
    if (user && originalData) {
      const changed = 
        user.name !== originalData.name ||
        user.dni !== originalData.dni ||
        user.phone !== originalData.phone ||
        user.occupation !== originalData.occupation;
      
      setHasChanges(changed);
    }
  }, [user, originalData]);

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
              <span>{AVAILABLE_ROLES.find(role => role.value === user.occupation)?.label || user.occupation}</span>
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
              <ViewOnlyInput
                label="Nombre Completo"
                id="name"
                value={user.name}
              />
            </div>
            
            <div>
              <ViewOnlyInput
                label="Nombre de Usuario"
                id="username"
                value={user.username}
              />
            </div>
            
            <div>
              <ViewOnlyInput
                label="Número de Identificación (DNI)"
                id="dni"
                value={user.dni}
              />
            </div>
            
            <div>
              <ViewOnlyInput
                label="Teléfono de Contacto"
                id="phone"
                value={user.phone}
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="mb-4">
                <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo 
                </label>
                <div className="flex items-center border border-gray-200 bg-gray-50 rounded-md px-3 py-2 transition-all duration-200 ease-in-out">
                  <FaBriefcase className="text-gray-400 mr-2" />
                  <span className="text-gray-800">{user.occupation}</span>
                  </div>
               
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
          </div>
        </div>
      </div>
    </div>
  );
}