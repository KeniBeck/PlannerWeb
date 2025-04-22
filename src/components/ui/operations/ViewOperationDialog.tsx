import { useState } from "react";
import {
  FaUsers,
  FaTimes,
} from "react-icons/fa";
import { TabSelector } from "@/components/ui/TabSelector";
import { Operation } from "@/core/model/operation";
import { WorkerGroupCard } from "../workers/WorkerGroupCard";
import { SupervisorsList } from "../supervisors/SupervisorList";
import { OperationInfo } from "./OperationInfo"; // Importar el nuevo componente

interface ViewOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: Operation | null;
}

export function ViewOperationDialog({
  open,
  onOpenChange,
  operation,
}: ViewOperationDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("info");

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
            <button
              onClick={() => onOpenChange(false)}
              className="text-white hover:text-blue-200 focus:outline-none"
            >
              <FaTimes className="h-6 w-6" />
            </button>
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
              timeStart={operation.timeStrat}
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
                      <WorkerGroupCard
                        key={index}
                        group={group}
                        index={index}
                      />
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