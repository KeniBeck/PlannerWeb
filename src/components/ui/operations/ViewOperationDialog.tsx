import { useState } from "react";
import {
  FaUsers,
  FaTimes,
  FaCheck,
  FaCalendarAlt,
  FaClock
} from "react-icons/fa";
import { TabSelector } from "@/components/ui/TabSelector";
import { Operation } from "@/core/model/operation";
import { WorkerGroupCard } from "../workers/WorkerGroupCard";
import { SupervisorsList } from "../supervisors/SupervisorList";
import { OperationInfo } from "./OperationInfo";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { useOperations } from "@/contexts/OperationContext";

interface ViewOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: Operation | null;
}

export function ViewOperationDialog({
  open,
  onOpenChange,
  operation
}: ViewOperationDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("info");
  const [isCompleting, setIsCompleting] = useState(false);

  // Usar el contexto para acceder a los métodos de actualización
  const { updateOperation, refreshOperations } = useOperations();

  if (!open || !operation) return null;

  // Obtener la configuración de estado para mostrar el color correcto
  const getStatusConfig = (status: Operation["status"]) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pendiente",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
        };
      case "INPROGRESS":
        return {
          label: "En curso",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
        };
      case "COMPLETED":
        return {
          label: "Finalizado",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
        };
      case "CANCELED":
        return {
          label: "Cancelado",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
        };
      default:
        return {
          label: "Desconocido",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
        };
    }
  };

  const statusConfig = getStatusConfig(operation.status);

  // Verificar si la operación puede ser completada
  const canCompleteOperation = operation.status === "PENDING" || operation.status === "INPROGRESS";

  // Formatear fecha para API
  const formatDateForApi = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // Función para completar toda la operación
  const handleCompleteOperation = async () => {
    const now = new Date();
    const formattedDate = formatDateForApi(now);
    const formattedTime = format(now, 'HH:mm');

    const { value: formValues } = await Swal.fire({
      title: 'Completar operación',
      html: `
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="end-date">Fecha de finalización</label>
          <input id="end-date" type="date" value="${formattedDate}" class="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="end-time">Hora de finalización</label>
          <input id="end-time" type="time" value="${formattedTime}" class="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Completar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const endDate = (document.getElementById('end-date') as HTMLInputElement).value;
        const endTime = (document.getElementById('end-time') as HTMLInputElement).value;

        if (!endDate || !endTime) {
          Swal.showValidationMessage('Por favor complete todos los campos');
          return false;
        }

        return { endDate, endTime };
      }
    });

    if (!formValues) return; // Usuario canceló

    try {
      setIsCompleting(true);

      // Construir el body para la API
      const body = {
        status: 'COMPLETED',
        dateEnd: formValues.endDate,
        timeEnd: formValues.endTime,
        dateStart: operation.dateStart.toString().split("T")[0],
        timeStart: operation.timeStrat || operation.timeStart,
        zone: operation.zone,
      };

      // Usar el contexto para actualizar la operación
      await updateOperation(operation.id, body);

      Swal.fire({
        icon: 'success',
        title: 'Operación completada',
        text: 'La operación ha sido marcada como completada exitosamente'
      });

      // Cerrar diálogo
      onOpenChange(false);
    } catch (error) {
      console.error("Error al completar operación:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo completar la operación. Intente nuevamente.'
      });
    } finally {
      setIsCompleting(false);
    }
  };

  // Función para completar un grupo específico de trabajadores
  const handleCompleteWorkerGroup = async (group: any, groupIndex: number) => {
    console.log("Grupo a completar:", group);
    const now = new Date();
    const formattedDate = formatDateForApi(now);
    const formattedTime = format(now, 'HH:mm');

    // Usar las fechas y tiempos del grupo si existen
    const startDate = group.schedule?.dateStart || formattedDate;
    const startTime = group.schedule?.timeStrat || formattedTime;

    const { value: formValues } = await Swal.fire({
      title: 'Completar grupo de trabajadores',
      html: `
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="start-date">Fecha de inicio</label>
          <input id="start-date" type="date" value="${startDate}" class="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3">
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="start-time">Hora de inicio</label>
          <input id="start-time" type="time" value="${startTime}" class="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3">
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="end-date">Fecha de finalización</label>
          <input id="end-date" type="date" value="${formattedDate}" class="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="end-time">Hora de finalización</label>
          <input id="end-time" type="time" value="${formattedTime}" class="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Completar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const startDate = (document.getElementById('start-date') as HTMLInputElement).value;
        const startTime = (document.getElementById('start-time') as HTMLInputElement).value;
        const endDate = (document.getElementById('end-date') as HTMLInputElement).value;
        const endTime = (document.getElementById('end-time') as HTMLInputElement).value;

        if (!startDate || !startTime || !endDate || !endTime) {
          Swal.showValidationMessage('Por favor complete todos los campos');
          return false;
        }

        return { startDate, startTime, endDate, endTime };
      }
    });

    if (!formValues) return; // Usuario canceló

    try {
      setIsCompleting(true);

      // Obtener los IDs de los trabajadores en el grupo
      const workerIds = group.workers.map((w: any) => w.id);

      // Construir el body para la API
      const body = {
        workers: {
          update: [
            {
              workerIds: workerIds,
              dateStart: formValues.startDate,
              timeStart: formValues.startTime,
              dateEnd: formValues.endDate,
              timeEnd: formValues.endTime,
              groupId: group.groupId || null
            }
          ]
        }
      };

      // Usar el contexto para actualizar la operación
      await updateOperation(operation.id, body);

      Swal.fire({
        icon: 'success',
        title: 'Grupo completado',
        text: 'El grupo de trabajadores ha sido actualizado exitosamente'
      });

      // Actualizar la vista para mostrar los cambios
      await refreshOperations();
    } catch (error) {
      console.error("Error al completar grupo de trabajadores:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo completar el grupo de trabajadores. Intente nuevamente.'
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl transform transition-all mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                Operación #{operation.id}
                <span
                  className={`ml-4 text-sm px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}
                >
                  {statusConfig.label}
                </span>
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              {canCompleteOperation && (
                <button
                  onClick={handleCompleteOperation}
                  disabled={isCompleting}
                  className="text-white bg-green-500 hover:bg-green-600 rounded-lg py-1 px-3 text-sm flex items-center transition-colors"
                >
                  <FaCheck className="mr-1" />
                  Completar Operación
                </button>
              )}
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
              { id: "info", label: "Información General" },
              { id: "workers", label: "Trabajadores" },
              { id: "supervisors", label: "Supervisores" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Información General */}
          {activeTab === "info" && (
            <OperationInfo
              id={operation.id}
              dateStart={operation.dateStart}
              dateEnd={operation.dateEnd}
              timeStart={operation.timeStrat || operation.timeStart}
              timeEnd={operation.timeEnd}
              motorShip={operation.motorShip}
              zone={operation.zone}
              jobArea={operation.jobArea}
              client={operation.client}
              task={operation.task}
              createAt={operation.createAt}
              updateAt={operation.updateAt}
            />
          )}

          {/* Trabajadores */}
          {activeTab === "workers" && (
            <div className="space-y-6">
              {/* Trabajadores */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaUsers className="mr-3 text-blue-600" />
                  <span>Trabajadores Asignados</span>
                </h4>

                {operation.workerGroups && operation.workerGroups.length > 0 ? (
                  <div className="space-y-6">
                    {operation.workerGroups.map((group, index) => (
                      <div key={index} className="relative">
                        {/* Botón de Completar Grupo (solo visible si la operación está pendiente o en curso) */}
                        {canCompleteOperation && (
                          <div className="absolute top-2 right-2 z-10">
                            <button
                              onClick={() => handleCompleteWorkerGroup(group, index)}
                              disabled={isCompleting}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center"
                            >
                              <FaCheck className="mr-1" />
                              Completar Grupo
                            </button>
                          </div>
                        )}
                        <WorkerGroupCard
                          group={group}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <FaUsers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">
                      No hay trabajadores asignados
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Los trabajadores asignados a esta operación aparecerán
                      aquí
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Supervisores */}
          {activeTab === "supervisors" && (
            <SupervisorsList supervisors={operation.inCharge || []} />
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