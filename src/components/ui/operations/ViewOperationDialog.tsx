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
import { operationService } from "@/services/operationService";

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
  const { updateOperation, refreshOperations, completeIndividualWorker } = useOperations();

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
        timeStart: operation.timeStrat || operation.timeStrat ,
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

  
    // método para completar trabajador individual
  const handleCompleteIndividualWorker = async (worker: any, group: any) => {
    const now = new Date();
    const formattedDate = formatDateForApi(now);
    const formattedTime = format(now, 'HH:mm');
  
    // Para trabajador individual, usamos la fecha de inicio de la operación
    const operationStartDate = operation.dateStart ? 
      (typeof operation.dateStart === 'string' ? operation.dateStart.split('T')[0] : format(new Date(operation.dateStart), 'yyyy-MM-dd')) : 
      formattedDate;
    
    const operationStartTime = operation.timeStrat || operation.timeStrat  || formattedTime;
  
    const { value: formValues } = await Swal.fire({
      title: 'Completar trabajador',
      html: `
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="start-date">Fecha de inicio (Operación)</label>
          <input id="start-date" type="date" value="${operationStartDate}" class="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 bg-gray-100" readonly>
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="start-time">Hora de inicio (Operación)</label>
          <input id="start-time" type="time" value="${operationStartTime}" class="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 bg-gray-100" readonly>
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
  
      // Construir el body para la API - usando solo el ID del trabajador seleccionado
      const body = {
        workers: {
          disconnect: [{ id: worker.id }]
        }
      };


       // Verificar si era el último trabajador en la operación
       const remainingWorkers = operation.workerGroups
       .flatMap(g => g.workers)
       .filter(w => w.id !== worker.id);
     
     if (remainingWorkers.length === 0) {
       setIsCompleting(false); // Asegurar que no esté en "loading" mientras se muestra el diálogo
       
       // Si era el último trabajador, preguntar si desea completar toda la operación
       const { isConfirmed } = await Swal.fire({
         icon: 'question',
         title: 'Completar operación',
         text: 'Este era el último trabajador. ¿Desea marcar toda la operación como completada?',
         showCancelButton: true,
         confirmButtonText: 'Sí, completar operación',
         cancelButtonText: 'No, solo quitar trabajador',
         allowOutsideClick: false, // Evitar que se cierre al hacer clic fuera
         allowEscapeKey: false, // Evitar que se cierre con la tecla ESC
         backdrop: `rgba(0,0,0,0.4)` // Oscurecer más el fondo para resaltar la importancia
       });
     
       if (isConfirmed) {
         // Completar toda la operación
         setIsCompleting(true); // Volver a activar el estado de carga
         await handleCompleteOperation();
         return;
       }
     }
  
      // Usar el contexto en vez del servicio directo
      await completeIndividualWorker(operation.id, body);
  
      Swal.fire({
        icon: 'success',
        title: 'Trabajador completado',
        text: `${worker.name} ha sido completado exitosamente`
      });
  
     
    } catch (error) {
      console.error("Error al completar trabajador:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo completar el trabajador. Intente nuevamente.'
      });
    } finally {
      setIsCompleting(false);
    }
  };
  
  // Y modificar también handleCompleteWorkerGroup para usar el contexto
  const handleCompleteWorkerGroup = async (group: any, groupIndex: number) => {
    const now = new Date();
    const formattedDate = formatDateForApi(now);
    const formattedTime = format(now, 'HH:mm');
  
    // Verificar si es un grupo sin programación (trabajadores individuales)
    const isIndividualWorkers = 
      !group.groupId || 
      (group.schedule?.dateStart === null && 
       group.schedule?.timeStart === null && 
       group.schedule?.dateEnd === null && 
       group.schedule?.timeEnd === null);
  
    // Para trabajadores individuales, usamos la fecha de inicio de la operación
    const operationStartDate = operation.dateStart ? 
      (typeof operation.dateStart === 'string' ? operation.dateStart.split('T')[0] : format(new Date(operation.dateStart), 'yyyy-MM-dd')) : 
      formattedDate;
    
    const operationStartTime = operation.timeStrat || operation.timeStrat  || formattedTime;
  
    // Determinar valores iniciales para el formulario
    const startDate = isIndividualWorkers ? operationStartDate : (group.schedule?.dateStart || formattedDate);
    const startTime = isIndividualWorkers ? operationStartTime : (group.schedule?.timeStart || formattedTime);
  
    // Crear el HTML para el formulario
    const formHtml = isIndividualWorkers ? 
      // Para trabajadores individuales, solo mostramos fechas inicio/fin pero no editables para inicio
      `
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="start-date">Fecha de inicio (Operación)</label>
          <input id="start-date" type="date" value="${operationStartDate}" class="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 bg-gray-100" readonly>
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="start-time">Hora de inicio (Operación)</label>
          <input id="start-time" type="time" value="${operationStartTime}" class="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 bg-gray-100" readonly>
        </div>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="end-date">Fecha de finalización</label>
          <input id="end-date" type="date" value="${formattedDate}" class="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="end-time">Hora de finalización</label>
          <input id="end-time" type="time" value="${formattedTime}" class="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3">
        </div>
      ` : 
      // Para grupos normales, permitimos editar fecha/hora inicio y fin
      `
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
      `;
  
    const { value: formValues } = await Swal.fire({
      title: isIndividualWorkers ? 'Completar trabajadores individuales' : 'Completar grupo de trabajadores',
      html: formHtml,
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
              dateStart: isIndividualWorkers ? operationStartDate : formValues.startDate,
              timeStart: isIndividualWorkers ? operationStartTime : formValues.startTime,
              dateEnd: formValues.endDate,
              timeEnd: formValues.endTime,
            }
          ]
        }
      };
  
      // Usar el contexto en vez del servicio directo
      await updateOperation(operation.id, body);
  
      Swal.fire({
        icon: 'success',
        title: isIndividualWorkers ? 'Trabajadores completados' : 'Grupo completado',
        text: isIndividualWorkers 
          ? 'Los trabajadores individuales han sido actualizados exitosamente'
          : 'El grupo de trabajadores ha sido actualizado exitosamente'
      });
  
      // Verificar si eran todos los trabajadores en la operación
      const otherGroupsWorkers = operation.workerGroups
        .filter((g, idx) => idx !== groupIndex)
        .flatMap(g => g.workers);
      
      if (otherGroupsWorkers.length === 0) {
        // Si eran todos los trabajadores, preguntar si desea completar toda la operación
        const { isConfirmed } = await Swal.fire({
          icon: 'question',
          title: 'Completar operación',
          text: 'Estos eran los últimos trabajadores. ¿Desea marcar toda la operación como completada?',
          showCancelButton: true,
          confirmButtonText: 'Sí, completar operación',
          cancelButtonText: 'No, solo quitar trabajadores'
        });
  
        if (isConfirmed) {
          // Completar toda la operación
          await handleCompleteOperation();
          return;
        }
      }
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
                  className="text-white bg-green-500 hover:bg-green-600 rounded-lg py-1 px-3 text-sm flex items-center transition-colors disabled:opacity-70"
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
              timeStart={operation.timeStrat || operation.timeStrat }
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
                              {(!group.groupId || 
                                (group.schedule?.dateStart === null && 
                                 group.schedule?.timeStart === null)) ? 
                                'Completar Trabajadores' : 'Completar Grupo'}
                            </button>
                          </div>
                        )}
                        <WorkerGroupCard
                          group={group}
                          index={index}
                          showCompleteButtons={canCompleteOperation}
                          onCompleteWorker={(worker) => handleCompleteIndividualWorker(worker, group)}
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