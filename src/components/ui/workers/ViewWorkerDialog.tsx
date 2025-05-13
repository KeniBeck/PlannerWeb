import { useEffect, useState } from "react";
import { Worker, WorkerStatus } from "@/core/model/worker";
import { TabSelector } from "@/components/ui/TabSelector";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  FaUserAlt, 
  FaIdCard, 
  FaBriefcase, 
  FaCalendarAlt, 
  FaTimes, 
  FaHistory, 
  FaClock, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaPhoneAlt
} from "react-icons/fa";
import { WorkerOperationsList } from "./WorkerOperationList"; 
import { WorkerIncidencesList } from "./WorkerIncidencesList";
import { faultService } from "@/services/faultService";

interface ViewWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: Worker | null;
}

export function ViewWorkerDialog({
  open,
  onOpenChange,
  worker
}: ViewWorkerDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("info");
  const [faultsCount, setFaultsCount] = useState<number>(0);
  useEffect(() => {
    if (open && worker) {
      const fetchFaultsCount = async () => {
        try {
          const count = await faultService.getFaultByIdWorker(worker.id);
          setFaultsCount(count.length);
        } catch (error) {
          console.error("Error al cargar el conteo de faltas:", error);
        }
      };

      fetchFaultsCount();
    }
  }, [open, worker]);

  if (!open || !worker) return null;

  // Configuración de estados de trabajador para estilos
  const getStatusConfig = (status: string) => {
    switch (status) {
      case WorkerStatus.AVAILABLE:
        return {
          label: "Disponible",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          icon: <FaCheckCircle className="mr-2" />
        };
      case WorkerStatus.ASSIGNED:
        return {
          label: "Asignado",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          icon: <FaBriefcase className="mr-2" />
        };
      case WorkerStatus.DEACTIVATED:
        return {
          label: "Retirado",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: <FaTimes className="mr-2" />
        };
      case WorkerStatus.UNAVAILABLE:
        return {
          label: "Deshabilitado",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          icon: <FaTimes className="mr-2" />
        };
      case WorkerStatus.INCAPACITATED:
        return {
          label: "Incapacitado",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          icon: <FaExclamationTriangle className="mr-2" />
        };
      default:
        return {
          label: "Desconocido",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: <FaIdCard className="mr-2" />
        };
    }
  };

  const statusConfig = getStatusConfig(worker.status);

  // Formato de fecha seguro
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "No especificada";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl w-full max-w-4xl transform transition-all mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                {worker.name}
                <span
                  className={`ml-4 text-sm px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} flex items-center shadow-sm`}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </h3>
              <p className="text-blue-100 mt-1">Código: {worker.code}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenChange(false)}
                className="text-white hover:text-blue-200 focus:outline-none"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
          <TabSelector
            tabs={[
              { id: "info", label: "Información Personal" },
              { id: "operations", label: "Operaciones Asignadas" },
              { id: "incidences", label: "Faltas e Incidencias" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {/* Información Personal */}
          {activeTab === "info" && (
            <div className="space-y-6">
              {/* Datos Personales */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-blue-200 flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 shadow-sm">
                    <FaUserAlt className="text-blue-600" />
                  </div>
                  <span>Datos Personales</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  {/* Nombre Completo */}
                  <div className="flex">
                    <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                      <FaUserAlt className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700 mb-1">Nombre Completo</p>
                      <p className="text-gray-800 font-semibold">{worker.name || "No especificado"}</p>
                    </div>
                  </div>

                  {/* DNI */}
                  <div className="flex">
                    <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                      <FaIdCard className="text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-700 mb-1">Documento de Identidad</p>
                      <p className="text-gray-800 font-semibold">{worker.dni || "No especificado"}</p>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex">
                    <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                      <FaPhoneAlt className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Teléfono</p>
                      <p className="text-gray-800 font-semibold">{worker.phone || "No especificado"}</p>
                    </div>
                  </div>

                  {/* Área de Trabajo */}
                  <div className="flex">
                    <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                      <FaBriefcase className="text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-700 mb-1">Área de Trabajo</p>
                      <p className="text-gray-800 font-semibold">{worker.jobArea?.name || "Sin asignar"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas y Estado */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl shadow-md border border-emerald-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-emerald-200 flex items-center">
                  <div className="bg-emerald-100 p-2 rounded-full mr-3 shadow-sm">
                    <FaCalendarAlt className="text-emerald-600" />
                  </div>
                  <span>Fechas y Estado</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  {/* Estado Actual */}
                  <div className="flex">
                    <div className={`min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm`}>
                      <span className={statusConfig.textColor}>{statusConfig.icon.props.children}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Estado Actual</p>
                      <p className={`font-semibold ${statusConfig.textColor}`}>{statusConfig.label}</p>
                    </div>
                  </div>

                  {/* Fecha de Ingreso */}
                  <div className="flex">
                    <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                      <FaCalendarAlt className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-700 mb-1">Fecha de Ingreso</p>
                      <p className="text-gray-800 font-semibold">{formatDate(worker.createAt)}</p>
                    </div>
                  </div>

                  {/* Mostrar fechas condicionales basadas en el estado */}
                  {worker.status === WorkerStatus.DEACTIVATED && worker.dateRetierment && (
                    <div className="flex">
                      <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                        <FaCalendarAlt className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-700 mb-1">Fecha de Retiro</p>
                        <p className="text-gray-800 font-semibold">{formatDate(worker.dateRetierment)}</p>
                      </div>
                    </div>
                  )}

                  {worker.status === WorkerStatus.INCAPACITATED && (
                    <>
                      <div className="flex">
                        <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                          <FaCalendarAlt className="text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-yellow-700 mb-1">Inicio Incapacidad</p>
                          <p className="text-gray-800 font-semibold">{formatDate(worker.dateDisableStart)}</p>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                          <FaCalendarAlt className="text-lime-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-lime-700 mb-1">Fin Incapacidad</p>
                          <p className="text-gray-800 font-semibold">{formatDate(worker.dateDisableEnd)}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Historial Laboral */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl shadow-md border border-amber-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-amber-200 flex items-center">
                  <div className="bg-amber-100 p-2 rounded-full mr-3 shadow-sm">
                    <FaHistory className="text-amber-600" />
                  </div>
                  <span>Historial Laboral</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  {/* Total Horas Trabajadas */}
                  <div className="flex">
                    <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                      <FaClock className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-700 mb-1">Total Horas Trabajadas</p>
                      <p className="text-2xl font-bold text-indigo-600">{worker.hoursWorked || 0}</p>
                    </div>
                  </div>

                  {/* Faltas Acumuladas */}
                  <div className="flex">
                    <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                      <FaExclamationTriangle className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-1">Faltas Acumuladas</p>
                      <p className="text-2xl font-bold text-red-600">{faultsCount || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Operaciones Asignadas */}
          {activeTab === "operations" && (
            <WorkerOperationsList workerId={worker.id} />
          )}

          {/* Faltas e Incidencias */}
          {activeTab === "incidences" && (
            <WorkerIncidencesList workerId={worker.id} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-all focus:outline-none shadow-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}