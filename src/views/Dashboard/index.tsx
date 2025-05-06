import { Route, Routes } from "react-router-dom";
import { useState } from "react";
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
import Faults from "./faults/Faults";

const COLORS = {
  darkBlue: "#155dfc", // Azul oscuro
  limeGreen: "#A5C739", // Verde limón claro
  skyBlue: "#0099ff", // Azul cielo
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
                label="Graficas"
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

              <MenuItem
                to="/dashboard/faults"
                icon={<AiOutlineUser size={20} />}
                label="Faltas"
                isOpen={isMenuOpen}
                isActive={isActive("/dashboard/faults")}
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
              path="/workers"
              element={
                <LayeredProviders
                  features={[Feature.WORKERS, Feature.FAULTS, Feature.AREAS]}
                >
                  <Workers />
                </LayeredProviders>
              }
            />
            {/* Aquí puedes agregar más rutas según necesites */}

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

            <Route
              path="/services"
              element={
                <LayeredProviders features={[Feature.SERVICES]}>
                  <Services />
                </LayeredProviders>
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
