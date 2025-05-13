import { useEffect, useState } from "react";
import { decodeToken } from "@/lib/utils/jwtutils";
import { User } from "@/core/model/user";
import  { ViewOnlyInput } from "@/components/ui/ViewOnlyInput";
import { FaUserCircle,  FaIdCard,  FaBriefcase } from "react-icons/fa";

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
    if (!token) {
      setLoading(false);
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      setLoading(false);
      return;
    }

    // Extraer la información del usuario del token decodificado
    const userData: User = {
      id: decoded.id,
      name: decoded.name || '',
      username: decoded.username || decoded.sub || '',
      dni: decoded.dni || '',
      phone: decoded.phone || '',
      occupation: decoded.occupation || decoded.role || '',
      // Otros campos que puedan existir en el token
    };

    setUser(userData);
    setLoading(false);
  }, []);

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
          {/* Sección azul con elementos decorativos */}
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-800">
            {/* Elementos decorativos */}
            <svg
              className="absolute bottom-0 left-0 w-full"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              style={{ height: "40px" }}
            >
              <path
                fill="rgba(255, 255, 255, 0.08)"
                fillOpacity="1"
                d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
            
            {/* Círculos decorativos */}
            <div className="absolute top-2 right-10 w-12 h-12 rounded-full bg-white opacity-5"></div>
            <div className="absolute bottom-8 right-40 w-8 h-8 rounded-full bg-white opacity-5"></div>
            
            {/* Barra decorativa en la parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-50"></div>
            
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
                  <span className="text-gray-800">
                    {AVAILABLE_ROLES.find(role => role.value === user.occupation)?.label || user.occupation}
                  </span>
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