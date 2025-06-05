
import { formatDate, formatDateTime, formatLongDate, formatTime } from "@/lib/utils/formatDate";
import {
  FaMapMarkerAlt,
  FaClock,
  FaBuilding,
  FaTasks,
  FaCalendarAlt,
  FaShip,
  FaRegClock,
  FaIndustry,
  FaUser,
  FaClipboardList,
} from "react-icons/fa";
import { PiClipboardTextFill } from "react-icons/pi";

interface JobArea {
  id: number;
  name: string;
}

interface Client {
  name: string;
}

interface Task {
  id: number;
  name: string;
}

interface Site {
  name: string;
}
interface clientProgramming {
  service: string;
}

interface OperationInfoProps {
  id: number;
  name?: string;
  dateStart?: string | null;
  dateEnd?: string | null;
  timeStart?: string | null;
  timeEnd?: string | null;
  motorShip?: string | null;
  zone?: number | null;
  jobArea?: JobArea | null;
  client?: Client | null;
  task?: Task | null;
  createAt?: string;
  updateAt?: string;
  Site?: Site | null;
  clientProgramming?: clientProgramming | null;
}

export const OperationInfo = ({
  id,
  name,
  dateStart,
  dateEnd,
  timeStart,
  timeEnd,
  motorShip,
  zone,
  jobArea,
  client,
  task,
  createAt,
  updateAt,
  Site,
  clientProgramming,
}: OperationInfoProps) => {

  return (
    <div className="space-y-8">
      {/* Detalles básicos */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100 transition-all hover:shadow-md">
        <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center border-b border-blue-100 pb-3">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <FaClipboardList className="text-blue-600 text-lg" />
          </div>
          Detalles de la Operación
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">ID de Operación</p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded mr-2">#{id}</span>
              {name && <span className="text-gray-600 text-base">{name}</span>}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cliente</p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <FaBuilding className="text-blue-500 mr-2" />
              {client?.name || "No especificado"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all md:col-span-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tarea</p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <FaTasks className="text-blue-500 mr-2" />
              {task?.name || "No especificada"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all md:col-span-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Programacion Cliente</p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <PiClipboardTextFill className="text-blue-500 mr-2" />
              {clientProgramming?.service || "No especificada"}
            </p>
          </div>
        </div>
      </div>

      {/* Ubicación y Buque */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl shadow-sm border border-green-100 transition-all hover:shadow-md">
        <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center border-b border-green-100 pb-3">
          <div className="bg-green-100 p-2 rounded-lg mr-3">
            <FaMapMarkerAlt className="text-green-600 text-lg" />
          </div>
          Ubicación y Buque
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-green-200 transition-all">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Área</p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <FaIndustry className="text-green-500 mr-2" />
              {jobArea?.name || "No definida"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-green-200 transition-all">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Zona</p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <FaMapMarkerAlt className="text-green-500 mr-2" />
              {zone || "No definida"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-green-200 transition-all">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Buque</p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <FaShip className="text-green-500 mr-2" />
              {motorShip || "No definido"}
            </p>
          </div>
        </div>
      </div>

      {/* Programación */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-2xl shadow-sm border border-amber-100 transition-all hover:shadow-md">
        <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center border-b border-amber-100 pb-3">
          <div className="bg-amber-100 p-2 rounded-lg mr-3">
            <FaClock className="text-amber-600 text-lg" />
          </div>
          Programación
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-amber-200 transition-all">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Fecha de Inicio
            </p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <FaCalendarAlt className="text-amber-500 mr-2" />
              {formatLongDate(dateStart)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-amber-200 transition-all">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Hora de Inicio
            </p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <FaClock className="text-amber-500 mr-2" />
              {formatTime(timeStart)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-amber-200 transition-all">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Fecha de Fin
            </p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <FaCalendarAlt className="text-amber-500 mr-2" />
              {formatLongDate(dateEnd)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-amber-200 transition-all">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Hora de Fin
            </p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <FaClock className="text-amber-500 mr-2" />
              {formatTime(timeEnd)}
            </p>
          </div>
        </div>
      </div>

      {/* Información de sistema */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl shadow-sm border border-gray-200 transition-all hover:shadow-md">
        <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center border-b border-gray-200 pb-3">
          <div className="bg-gray-200 p-2 rounded-lg mr-3">
            <FaRegClock className="text-gray-600 text-lg" />
          </div>
          Datos del Sistema
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 transition-all">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Fecha de Creación
            </p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <FaRegClock className="text-gray-500 mr-2" />
              {formatDateTime(createAt)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 transition-all">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Última Actualización
            </p>
            <p className="text-lg font-medium text-gray-800 flex items-center">
              <FaRegClock className="text-gray-500 mr-2" />
              {formatDateTime(updateAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};