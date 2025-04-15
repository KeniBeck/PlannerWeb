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
        } relative`}
      >
        {/* Botón de hamburguesa */}
        <button
          onClick={toggleMenu}
          className="absolute -right-4 top-6 bg-blue-600 text-white rounded-full p-1.5 shadow-md hover:bg-blue-700 focus:outline-none"
        >
          {isMenuOpen ? (
            <AiOutlineClose size={16} />
          ) : (
            <AiOutlineMenu size={16} />
          )}
        </button>

        {/* Logo y encabezado */}
        <div
          className={`px-4 py-6 ${
            isMenuOpen ? "text-center" : "flex justify-center"
          }`}
        >
          <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto">
            P
          </div>
          {isMenuOpen && (
            <h2 className="text-xl font-bold text-gray-800 mt-2">Planner</h2>
          )}
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

            {/* Separador */}
            <li className="my-3">
              {isMenuOpen ? (
                <hr className="border-gray-200" />
              ) : (
                <div className="h-1 w-6 bg-gray-200 rounded-full mx-auto"></div>
              )}
            </li>

            <MenuItem
              to="/dashboard/settings"
              icon={<AiOutlineSetting size={20} />}
              label="Configuración"
              isOpen={isMenuOpen}
              isActive={isActive("/dashboard/settings")}
            />
            <MenuItem
              to="/dashboard/profile"
              icon={<AiOutlineUser size={20} />}
              label="Perfil"
              isOpen={isMenuOpen}
              isActive={isActive("/dashboard/profile")}
            />
          </ul>
        </nav>

        {/* Versión */}
        {isMenuOpen && (
          <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500">
            v1.0.0
          </div>
        )}
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-5">
          <Routes>
            <Route
              path="/"
              element={
                <LayeredProviders features={[Feature.WORKERS, Feature.FAULTS]}>
                  <Workers />
                </LayeredProviders>
              }
            />
            <Route
              path="/workers"
              element={
                <LayeredProviders features={[Feature.WORKERS, Feature.FAULTS]}>
                  <Workers />
                </LayeredProviders>
              }
            />
            {/* Aquí puedes agregar más rutas según necesites */}
            <Route
              path="/operations"
              element={
                <LayeredProviders features={[Feature.OPERATION]}>
                  <Operation />
                </LayeredProviders>
              }
            />
            <Route path="/services" element={<Services />} />
            <Route path="/supersvisors" element={<Supervisors />} />
            <Route
              path="/reports"
              element={
                <div className="text-center p-10 text-gray-600">
                  Reportes en desarrollo
                </div>
              }
            />
            <Route path="/clients" element={<Clients />} />
            <Route
              path="/users"
              element={
                <div className="text-center p-10 text-gray-600">
                  Usuarios en desarrollo
                </div>
              }
            />
            <Route
              path="/areas"
              element={
                <LayeredProviders features={[Feature.AREAS]}>
                  <Areas />
                </LayeredProviders>
              }
            />
            <Route
              path="/settings"
              element={
                <div className="text-center p-10 text-gray-600">
                  Configuración en desarrollo
                </div>
              }
            />
            <Route
              path="/profile"
              element={
                <div className="text-center p-10 text-gray-600">
                  Perfil en desarrollo
                </div>
              }
            />
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
}

function MenuItem({ to, icon, label, isOpen, isActive }: MenuItemProps) {
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
      >
        <span className={`${isActive ? "text-blue-600" : ""}`}>{icon}</span>
        {isOpen && <span className="ml-3 font-medium">{label}</span>}
      </Link>
    </li>
  );
}
