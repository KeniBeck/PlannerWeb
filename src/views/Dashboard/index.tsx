import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Workers from "./workers/Workers";
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineUser,
  AiOutlineSetting,
  AiOutlineTeam,
  AiOutlineDashboard,
  AiOutlineBarChart,
} from "react-icons/ai";
import { MdAssignment, MdHomeRepairService } from "react-icons/md";
import { PiMapPinSimpleAreaBold } from "react-icons/pi";
import { FaPersonMilitaryPointing } from "react-icons/fa6";
import { BsBuildingsFill } from "react-icons/bs";
import { Feature, LayeredProviders } from "@/contexts/LayeredProviders";
import Areas from "./areas/Areas";
import Supervisors from "./supervisors/Supervisors";
import Services from "./services/Services";
import Clients from "./clients/Clients";
import Operation from "./operation/Operation";
import Users from "./users/Users";
import { GiExitDoor } from "react-icons/gi";
import Profile from "./profile/Profile";
import Reports from "./reports/reports";
import DashboardHome from "./DashboardHome";

const COLORS = {
  darkBlue: "#1D2455", // Azul oscuro
  limeGreen: "#A5C739", // Verde limón claro
  skyBlue: "#0099ff"   // Azul cielo
};

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const location = useLocation();

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
            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.15)`
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
          {/* Header del sidebar rediseñado */}
          <div 
            style={{ 
              background: COLORS.darkBlue,
              padding: "24px 16px 20px", 
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Elemento decorativo de ondas */}
            <div 
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "12px",
                opacity: 0.7,
                borderRadius: "100% 100% 0 0",
                transform: "scaleX(1.5)"
              }}
            ></div>
            
            {/* Logotipo y nombre */}
            <div className={`flex ${isMenuOpen ? "items-center" : "justify-center"}`}>
              <div className="relative">
                <div 
                  className="h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${COLORS.skyBlue} 0%, ${COLORS.limeGreen} 100%)`,
                    boxShadow: `0 3px 10px rgba(0, 0, 0, 0.2)`,
                    color: COLORS.darkBlue
                  }}
                >
                  CP
                </div>
                <div 
                  className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full"
                  style={{ backgroundColor: COLORS.limeGreen }}
                ></div>
              </div>
              
              {isMenuOpen && (
                <div className="ml-3">
                  <h2 className="font-bold text-xl" style={{ color: COLORS.skyBlue }}>
                    Cargo<span style={{ color: COLORS.limeGreen }}>Planner</span>
                  </h2>
                  <p className="text-xs" style={{ color: "white" }}>
                    Sistema de Gestión Marítima
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Enlaces de navegación */}
          <nav className="mt-6 px-3">
            <ul className="space-y-1">
              <MenuItem
                to="/dashboard"
                icon={<AiOutlineDashboard size={20} />}
                label="Dashboard"
                isOpen={isMenuOpen}
                isActive={isActive("/dashboard")}
              />
              <MenuItem
                to="/dashboard/operations"
                icon={<MdAssignment size={20} />}
                label="Operaciones"
                isOpen={isMenuOpen}
                isActive={isActive("/dashboard/operations")}
              />
              <MenuItem
                to="/dashboard/workers"
                icon={<AiOutlineTeam size={20} />}
                label="Trabajadores"
                isOpen={isMenuOpen}
                isActive={isActive("/dashboard/workers")}
              />

              <MenuItem
                to="/dashboard/reports"
                icon={<AiOutlineBarChart size={20} />}
                label="Reportes"
                isOpen={isMenuOpen}
                isActive={isActive("/dashboard/reports")}
              />
              <MenuItem
                to="/dashboard/areas"
                icon={<PiMapPinSimpleAreaBold size={20} />}
                label="Áreas"
                isOpen={isMenuOpen}
                isActive={isActive("/dashboard/areas")}
              />

              <MenuItem
                to="/dashboard/services"
                icon={<MdHomeRepairService size={20} />}
                label="Servicios"
                isOpen={isMenuOpen}
                isActive={isActive("/dashboard/services")}
              />
              <MenuItem
                to="/dashboard/supersvisors"
                icon={<FaPersonMilitaryPointing size={20} />}
                label="Supervisores"
                isOpen={isMenuOpen}
                isActive={isActive("/dashboard/supersvisors")}
              />

              <MenuItem
                to="/dashboard/users"
                icon={<AiOutlineUser size={20} />}
                label="Usuarios"
                isOpen={isMenuOpen}
                isActive={isActive("/dashboard/users")}
              />

              <MenuItem
                to="/dashboard/clients"
                icon={<BsBuildingsFill size={20} />}
                label="Clientes"
                isOpen={isMenuOpen}
                isActive={isActive("/dashboard/clients")}
              />

              <li className="my-3">
                {isMenuOpen ? (
                  <hr className="border-gray-200" />
                ) : (
                  <div className="h-1 w-6 bg-gray-200 rounded-full mx-auto"></div>
                )}
              </li>

              <MenuItem
                to="/dashboard/profile"
                icon={<AiOutlineUser size={20} />}
                label="Perfil"
                isOpen={isMenuOpen}
                isActive={isActive("/dashboard/profile")}
              />
              <MenuItem
                to="/dashboard/login"
                icon={<GiExitDoor size={20} />}
                label="Salir"
                isOpen={isMenuOpen}
                isActive={isActive("/dashboard/settings")}
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
              />
            </ul>
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
                <LayeredProviders features={[Feature.WORKERS, Feature.FAULTS, Feature.OPERATION, Feature.AREAS, Feature.USERS, Feature.SERVICES, Feature.CLIENTS]}>
                  <DashboardHome />
                </LayeredProviders>
              }
            />
            <Route
              path="/workers"
              element={
                <LayeredProviders features={[Feature.WORKERS, Feature.FAULTS, Feature.AREAS]}>
                  <Workers />
                </LayeredProviders>
              }
            />
            {/* Aquí puedes agregar más rutas según necesites */}

            <Route
              path="/operations"
              element={
                <LayeredProviders features={[Feature.OPERATION, Feature.AREAS, Feature.WORKERS, Feature.USERS, Feature.SERVICES, Feature.CLIENTS]}>
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

            <Route
              path="/services"
              element={
                <LayeredProviders features={[Feature.SERVICES]}>
                  <Services />
                </LayeredProviders>
              }
            />
            <Route
              path="/supersvisors"
              element={
                <LayeredProviders features={[Feature.USERS]}>
                  <Supervisors />
                </LayeredProviders>
              }
            />
            <Route
              path="/reports"
              element={
                <div className="text-center p-10 text-gray-600">
                  Reportes en desarrollo
                </div>
              }
            />
            <Route
              path="/clients"
              element={
                <LayeredProviders features={[Feature.CLIENTS]}>
                  <Clients />
                </LayeredProviders>
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
                <LayeredProviders features={[Feature.AREAS, Feature.WORKERS]}>
                  <Areas />
                </LayeredProviders>
              }
            />

            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Componente para los elementos del menú
interface MenuItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  isActive: boolean;
  onClick?: () => void;
}

function MenuItem({
  to,
  icon,
  label,
  isOpen,
  isActive,
  onClick,
}: MenuItemProps) {
  return (
    <li>
      <Link
        to={to}
        className={`
          flex items-center p-3 rounded-lg transition-all
          ${
            isActive
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }
          ${isOpen ? "" : "justify-center"}
        `}
        onClick={onClick}
      >
        <span className={`${isActive ? "text-blue-600" : ""}`}>{icon}</span>
        {isOpen && <span className="ml-3 font-medium">{label}</span>}
      </Link>
    </li>
  );
}
