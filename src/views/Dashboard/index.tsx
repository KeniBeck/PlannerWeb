import { Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Workers from "./workers/Workers";
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineUser,
  AiOutlineTeam,
  AiOutlineDashboard,
  AiOutlineBarChart,
} from "react-icons/ai";
import { MdAssignment, MdHomeRepairService, MdKeyboardArrowDown, MdKeyboardArrowRight, MdSecurity, MdRestaurantMenu } from "react-icons/md";
import { PiMapPinSimpleAreaBold } from "react-icons/pi";
import { BsBuildingsFill, BsLayoutWtf } from "react-icons/bs";
import { Feature, LayeredProviders } from "@/contexts/LayeredProviders";
import Areas from "./areas/Areas";
import Services from "./services/Services";
import Clients from "./clients/Clients";
import Operation from "./operation/Operation";
import Users from "./users/Users";
import { GiExitDoor } from "react-icons/gi";
import Profile from "./profile/Profile";
import Reports from "./reports/reports";
import DashboardHome from "./DashboardHome";
import Faults from "./faults/Faults";
import { jwtDecode } from "jwt-decode";
import Feeding from "./feedings/Feeding";


const COLORS = {
  darkBlue: "#155dfc", // Azul oscuro
  limeGreen: "#A5C739", // Verde limón claro
  skyBlue: "#0099ff", // Azul cielo
};

// Interfaz para el menú de categoría
interface MenuCategory {
  title: string;
  icon: React.ReactNode;
  requiredRole?: string; // Añadido para restricción por rol
  items: {
    path: string;
    label: string;
    icon: React.ReactNode;
    requiredRole?: string; // También podemos restringir items individuales
  }[];
}

// Componente para rutas protegidas por rol
const ProtectedRoute = ({ element, requiredRole }: { element: React.ReactNode, requiredRole: string }) => {
  // Función para verificar si el usuario tiene el rol requerido
  const hasRequiredRole = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      
      const decodedToken: any = jwtDecode(token);
      return decodedToken?.role === requiredRole;
    } catch (error) {
      console.error("Error al verificar el rol:", error);
      return false;
    }
  };
  
  // Si el usuario tiene el rol, muestra el componente, si no, redirige al dashboard
  return hasRequiredRole() ? <>{element}</> : <Navigate to="/dashboard" replace />;
};

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['dashboard']);
  const [userRole, setUserRole] = useState<string>("");
  const location = useLocation();

  // Obtener el rol del usuario del token
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken: any = jwtDecode(token);
        setUserRole(decodedToken?.role || "");
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Función para determinar si un enlace está activo
  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      (path !== "/dashboard" && location.pathname.startsWith(path))
    );
  };
  
  // Función para expandir/contraer una categoría
  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(cat => cat !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };

  
  // Define las categorías del menú y sus elementos
  const menuCategories: MenuCategory[] = [
    {
      title: 'Operaciones',
      icon: <MdAssignment size={20} />,
      items: [
        { path: '/dashboard/operations', label: 'Registro de Operaciones', icon: <MdAssignment size={18} /> },
        { path: '/dashboard/workers', label: 'Trabajadores', icon: <AiOutlineTeam size={18} /> },
        { path: '/dashboard/reports', label: 'Gráficas', icon: <AiOutlineBarChart size={18} /> },
        { path: '/dashboard/faults', label: 'Faltas', icon: <MdAssignment size={18} /> },
        { path: '/dashboard/feedings', label: 'Alimentación', icon: <MdRestaurantMenu size={18} /> }
      ]
    },
    {
      title: 'Maestra',
      icon: <BsLayoutWtf size={20} />,
      requiredRole: "SUPERADMIN", // Solo visible para rol ADMON_PLATFORM
      items: [
        { path: '/dashboard/clients', label: 'Clientes', icon: <BsBuildingsFill size={18} />, requiredRole: "SUPERADMIN" },
        { path: '/dashboard/areas', label: 'Áreas', icon: <PiMapPinSimpleAreaBold size={18} />, requiredRole: "SUPERADMIN" },
        { path: '/dashboard/services', label: 'Servicios', icon: <MdHomeRepairService size={18} />, requiredRole: "SUPERADMIN" }
      ]
    },
    {
      title: 'Seguridad',
      icon: <MdSecurity size={20} />,
      requiredRole: "SUPERADMIN", // Solo visible para rol ADMON_PLATFORM
      items: [
        { path: '/dashboard/users', label: 'Usuarios', icon: <AiOutlineUser size={18} /> }
      ]
    }
  ];

  // Filtra las categorías según el rol del usuario
  const filteredCategories = menuCategories.filter(category => 
    !category.requiredRole || category.requiredRole === userRole
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Menú lateral */}
      <aside
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out z-10 ${
          isMenuOpen ? "w-64" : "w-20"
        } relative overflow-y-auto h-screen`}
      >
        {/* Botón de hamburguesa */}
        <button
          onClick={toggleMenu}
          className={`
            absolute top-6
            ${isMenuOpen ? "left-52" : "right-2"}
            text-white rounded-full p-1.5 shadow-md hover:opacity-90 focus:outline-none
            z-20
          `}
          style={{
            backgroundColor: COLORS.limeGreen,
            transition: "right 0.3s",
            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.15)`,
          }}
        >
          {isMenuOpen ? (
            <AiOutlineClose size={16} />
          ) : (
            <AiOutlineMenu size={16} />
          )}
        </button>

        {/* Contenedor principal del sidebar */}
        <div className="overflow-y-auto h-full">
          <div
            className="relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${COLORS.darkBlue} 0%, #1047c9 100%)`,
              padding: "1.75rem 1rem 1.5rem",
            }}
          >
            {/* Elemento decorativo con ondas */}
            <div className="absolute inset-0 z-0">
              <svg
                className="absolute bottom-0 left-0 w-full"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                style={{ height: "60px" }}
              >
                <path
                  fill="rgba(255, 255, 255, 0.08)"
                  fillOpacity="1"
                  d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                ></path>
              </svg>

              {/* Círculos decorativos */}
              <div className="absolute top-2 right-2 w-12 h-12 rounded-full bg-white opacity-5"></div>
              <div className="absolute top-10 left-3 w-6 h-6 rounded-full bg-white opacity-5"></div>
            </div>

            {/* Logotipo y nombre */}
            <div
              className={`flex relative z-10 ${
                isMenuOpen ? "items-center" : "justify-center"
              }`}
            >
              {!isMenuOpen && (
                <div className="flex justify-center items-center w-10 h-10 bg-white bg-opacity-10 rounded-full shadow-lg">
                  <span className="text-lg font-bold text-white">CP</span>
                </div>
              )}

              {isMenuOpen && (
                <div className="ml-1">
                  <h2
                    className=" tracking-wide"
                    style={{
                      color: "white",
                      fontFamily: "amertha",
                      textShadow: "0 2px 4px rgba(0,0,0,0.15)",
                      fontSize: "2rem",
                    }}
                  >
                    Cargo
                    <span
                      style={{
                        color: COLORS.limeGreen,
                        fontFamily: "amertha",
                        textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      Planner
                    </span>
                  </h2>
                  <div className="flex items-center mt-1">
                    <div className="h-0.5 w-2 bg-white opacity-50 rounded-full mr-1"></div>
                    <p className="text-xs font-light tracking-wider text-white text-opacity-90">
                      Sistema de Gestión Marítima
                    </p>
                    <div className="h-0.5 w-2 bg-white opacity-50 rounded-full ml-1"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Barra decorativa en la parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-50"></div>
          </div>

          {/* Enlaces de navegación */}
          <nav className="mt-4 flex flex-col min-h-[78vh] justify-between">
            <ul className="space-y-0.5 flex flex-col justify-between h-min">
                <Link
                  to="/dashboard"
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all
                    ${isMenuOpen ? "" : "justify-center"} 
                    ${isActive("/dashboard") 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <span className={`${isActive("/dashboard") ? "text-blue-600" : ""}`}>
                    <AiOutlineDashboard size={20} />
                  </span>
                  {isMenuOpen && (
                    <span className="ml-3 text-sm font-medium">Principal</span>
                  )}
                </Link>
              
              {/* Solo mostrar categorías filtradas por rol */}
              {filteredCategories.map((category) => {
                const isExpanded = expandedCategories.includes(category.title.toLowerCase());
                // Filtrar items por rol para verificar elementos activos
                const visibleItems = category.items.filter(item => !item.requiredRole || item.requiredRole === userRole);
                const hasActiveChild = visibleItems.some(item => isActive(item.path));
                
                return (
                  <li key={category.title} className="mb-1">
                    {/* Cabecera de la categoría */}
                    <button
                      onClick={() => toggleCategory(category.title.toLowerCase())}
                      className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all
                        ${isMenuOpen ? "justify-between" : "justify-center"} 
                        ${hasActiveChild ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      <div className="flex items-center">
                        <span className={`${hasActiveChild ? "text-blue-600" : ""}`}>
                          {category.icon}
                        </span>
                        {isMenuOpen && (
                          <span className="ml-3 text-sm font-medium">{category.title}</span>
                        )}
                      </div>
                      
                      {isMenuOpen && visibleItems.length > 0 && (
                        <span className="text-gray-500">
                          {isExpanded ? <MdKeyboardArrowDown size={18} /> : <MdKeyboardArrowRight size={18} />}
                        </span>
                      )}
                    </button>
                    
                    {/* Elementos del submenú - solo mostrar items permitidos */}
                    <div className={`${isExpanded ? "max-h-96" : "max-h-0"} overflow-hidden transition-all duration-300`}>
                      <ul className={`pl-2 space-y-1 mt-1 ${isMenuOpen ? "" : "text-center"}`}>
                        {visibleItems.map((item) => {
                          const itemIsActive = isActive(item.path);
                          
                          return (
                            <li key={item.path}>
                              <Link
                                to={item.path}
                                className={`flex items-center py-2 px-3 rounded-lg transition-all
                                  ${isMenuOpen ? "" : "justify-center"} 
                                  ${itemIsActive 
                                    ? "bg-blue-50 text-blue-700" 
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
                              >
                                <span className={`${itemIsActive ? "text-blue-600" : ""}`}>
                                  {item.icon}
                                </span>
                                {isMenuOpen && (
                                  <span className="ml-3 text-sm">{item.label}</span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div>
              {/* Separador */}
              <div className="my-2 px-3">
                {isMenuOpen ? (
                  <hr className="border-gray-200" />
                ) : (
                  <div className="h-0.5 w-6 bg-gray-200 rounded-full mx-auto"></div>
                )}
              </div>

              {/* Perfil y cerrar sesión fuera de categorías */}
              <div>
                <Link
                  to="/dashboard/profile"
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all
                    ${isMenuOpen ? "" : "justify-center"} 
                    ${isActive("/dashboard/profile") 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <span className={`${isActive("/dashboard/profile") ? "text-blue-600" : ""}`}>
                    <AiOutlineUser size={20} />
                  </span>
                  {isMenuOpen && (
                    <span className="ml-3 text-sm font-medium">Perfil</span>
                  )}
                </Link>
              </div>
              <div>
                <Link
                  to="/login"
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all
                    ${isMenuOpen ? "" : "justify-center"} text-gray-600 hover:bg-gray-100`}
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                  }}
                >
                  <span>
                    <GiExitDoor size={20} />
                  </span>
                  {isMenuOpen && (
                    <span className="ml-3 text-sm font-medium">Salir</span>
                  )}
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-5">
          <Routes>
            <Route
              path="/"
              element={
                <LayeredProviders
                  features={[
                    Feature.WORKERS,
                    Feature.FAULTS,
                    Feature.OPERATION,
                    Feature.AREAS,
                    Feature.USERS,
                    Feature.SERVICES,
                    Feature.CLIENTS,
                  ]}
                >
                  <DashboardHome />
                </LayeredProviders>
              }
            />
            <Route
  path="/feedings"
  element={
    <LayeredProviders features={[Feature.OPERATION, Feature.WORKERS, Feature.FEEDINGS]}>
      <Feeding />
    </LayeredProviders>
  }
/>
            <Route
              path="/workers"
              element={
                <LayeredProviders
                  features={[Feature.WORKERS, Feature.FAULTS, Feature.AREAS]}
                >
                  <Workers />
                </LayeredProviders>
              }
            />
            <Route
              path="/operations"
              element={
                <LayeredProviders
                  features={[
                    Feature.OPERATION,
                    Feature.AREAS,
                    Feature.WORKERS,
                    Feature.USERS,
                    Feature.SERVICES,
                    Feature.CLIENTS,
                  ]}
                >
                  <Operation />
                </LayeredProviders>
              }
            />
            <Route
              path="/reports"
              element={
                <LayeredProviders
                  features={[Feature.OPERATION, Feature.AREAS, Feature.WORKERS]}
                >
                  <Reports />
                </LayeredProviders>
              }
            />
            
            {/* Rutas protegidas con ProtectedRoute */}
            <Route
              path="/services"
              element={
                <ProtectedRoute
                  requiredRole="SUPERADMIN"
                  element={
                    <LayeredProviders features={[Feature.SERVICES]}>
                      <Services />
                    </LayeredProviders>
                  }
                />
              }
            />
            
            <Route
              path="/faults"
              element={
                <LayeredProviders features={[Feature.FAULTS, Feature.WORKERS]}>
                  <Faults />
                </LayeredProviders>
              }
            />
           
            
            <Route
              path="/clients"
              element={
                <ProtectedRoute
                  requiredRole="SUPERADMIN"
                  element={
                    <LayeredProviders features={[Feature.CLIENTS]}>
                      <Clients />
                    </LayeredProviders>
                  }
                />
              }
            />
            <Route
              path="/users"
              element={
                <LayeredProviders features={[Feature.USERS]}>
                  <Users />
                </LayeredProviders>
              }
            />
            <Route
              path="/areas"
              element={
                <ProtectedRoute
                  requiredRole="SUPERADMIN"
                  element={
                    <LayeredProviders features={[Feature.AREAS, Feature.WORKERS]}>
                      <Areas />
                    </LayeredProviders>
                  }
                />
              }
            />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}