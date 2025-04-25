import { useState } from "react";
import { Worker, WorkerStatus } from "@/core/model/worker";
import { TabSelector } from "@/components/ui/TabSelector";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FaUserAlt, FaIdCard, FaPhone, FaBriefcase, FaCalendarAlt, FaTimes, FaHistory } from "react-icons/fa";
import { WorkerOperationsList } from "./WorkerOperationList"; 
import { WorkerIncidencesList } from "./WorkerIncidencesList";

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

  if (!open || !worker) return null;

  // Configuración de estados de trabajador para estilos
  const getStatusConfig = (status: string) => {
    switch (status) {
      case WorkerStatus.AVAILABLE:
        return {
          label: "Disponible",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
        };
      case WorkerStatus.ASSIGNED:
        return {
          label: "Asignado",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
        };
      case WorkerStatus.DEACTIVATED:
        return {
          label: "Retirado",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
        };
      case WorkerStatus.UNAVAILABLE:
        return {
          label: "Deshabilitado",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
        };
      case WorkerStatus.INCAPACITATED:
        return {
          label: "Incapacitado",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
        };
      default:
        return {
          label: "Desconocido",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
        };
    }
  };

  const statusConfig = getStatusConfig(worker.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl transform transition-all mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                {worker.name}
                <span
                  className={`ml-4 text-sm px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}
                >
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
        <div className="bg-white border-b border-gray-200">
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
        <div className="flex-1 overflow-y-auto p-6">
          {/* Información Personal */}
          {activeTab === "info" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaUserAlt className="mr-3 text-blue-600" />
                  <span>Datos Personales</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center">
                        <FaIdCard className="mr-2 text-blue-500" />
                        DNI
                      </p>
                      <p className="text-gray-800 font-medium">{worker.dni || "No especificado"}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center">
                        <FaPhone className="mr-2 text-blue-500" />
                        Teléfono
                      </p>
                      <p className="text-gray-800 font-medium">{worker.phone || "No especificado"}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center">
                        <FaBriefcase className="mr-2 text-blue-500" />
                        Área de Trabajo
                      </p>
                      <p className="text-gray-800 font-medium">{worker.jobArea?.name || "Sin asignar"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center">
                        <FaCalendarAlt className="mr-2 text-blue-500" />
                        Fecha de Ingreso
                      </p>
                      <p className="text-gray-800 font-medium">
                        {worker.createAt
                          ? format(new Date(worker.createAt), "dd MMMM yyyy", { locale: es })
                          : "No especificada"}
                      </p>
                    </div>

                    {worker.status === WorkerStatus.DEACTIVATED && worker.dateRetierment && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1 flex items-center">
                          <FaCalendarAlt className="mr-2 text-red-500" />
                          Fecha de Retiro
                        </p>
                        <p className="text-gray-800 font-medium">
                          {format(new Date(worker.dateRetierment), "dd MMMM yyyy", { locale: es })}
                        </p>
                      </div>
                    )}

                    {worker.status === WorkerStatus.INCAPACITATED && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 mb-1 flex items-center">
                            <FaCalendarAlt className="mr-2 text-yellow-500" />
                            Inicio Incapacidad
                          </p>
                          <p className="text-gray-800 font-medium">
                            {worker.dateDisableStart
                              ? format(new Date(worker.dateDisableStart), "dd MMMM yyyy", { locale: es })
                              : "No especificada"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 mb-1 flex items-center">
                            <FaCalendarAlt className="mr-2 text-green-500" />
                            Fin Incapacidad
                          </p>
                          <p className="text-gray-800 font-medium">
                            {worker.dateDisableEnd
                              ? format(new Date(worker.dateDisableEnd), "dd MMMM yyyy", { locale: es })
                              : "No especificada"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaHistory className="mr-3 text-blue-600" />
                  <span>Historial Laboral</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Horas Trabajadas</p>
                      <p className="text-gray-800 text-2xl font-bold">{worker.hoursWorked || 0}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Faltas Acumuladas</p>
                      <p className="text-gray-800 text-2xl font-bold">{worker.failures || 0}</p>
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
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all focus:outline-none"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}