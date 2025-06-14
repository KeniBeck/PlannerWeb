import { useMemo, useState } from "react";
import { Worker, WorkerStatus } from "@/core/model/worker";
import { Fault } from "@/core/model/fault";
import { useWorkers } from "@/contexts/WorkerContext";
import { AiOutlineSearch } from "react-icons/ai";
import { FiFilter } from "react-icons/fi";
import { useWorkersFilter, WorkerViewTab } from "@/lib/hooks/useWorkersFilter";
import { useWorkersView } from "@/lib/hooks/useWorkersView";
import { useAreas } from "@/contexts/AreasContext";
import { AddWorkerDialog } from "@/components/ui/workers/AddWorkerDialog";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { format } from "date-fns";
import { es, id } from "date-fns/locale";
import { WorkersList } from "@/components/ui/workers/WorkerList";
import {
  ActivateItemAlert,
  DeactivateItemAlert,
} from "@/components/dialog/CommonAlertActive";
import { workerService } from "@/services/workerService";
import { ViewWorkerDialog } from "@/components/ui/workers/ViewWorkerDialog";
import { EndIncapacityAlert } from "@/components/dialog/IncapacityAlert";
import { IncapacityFormDialog } from "@/components/dialog/IncapacityFormDialog";
import { CauseDisability, TypeDisability } from "@/core/model/inability";
import { inabilityService } from "@/services/inabilityService";

export default function Workers() {
  const {
    workers,
    availableWorkers,
    assignedWorkers,
    deactivatedWorkers,
    incapacitatedWorkers,
    isLoading,
    refreshWorkers,
  } = useWorkers();
  const { areas } = useAreas();
  const [workerToDeactivate, setWorkerToDeactivate] = useState<Worker | null>(
    null
  );
  const [workerToActivate, setWorkerToActivate] = useState<Worker | null>(null);
  const [viewWorker, setViewWorker] = useState<Worker | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isEditWorkerOpen, setIsEditWorkerOpen] = useState(false);
  const [workerForIncapacity, setWorkerForIncapacity] = useState<Worker | null>(
    null
  );
  const [isIncapacityFormOpen, setIsIncapacityFormOpen] = useState(false);
  const [workerToEndIncapacity, setWorkerToEndIncapacity] =
    useState<Worker | null>(null);
  const [isIncapacityLoading, setIsIncapacityLoading] = useState(false);

  // Todas las distintas categorías de trabajadores
  const allWorkers = workers;

  // Hook para el filtrado y búsqueda
  const {
    searchTerm,
    activeTab,
    filteredAllWorkers,
    filteredAvailableWorkers,
    filteredAssignedWorkers,
    filteredDeactivatedWorkers,
    filteredIncapacitatedWorkers,
    setSearchTerm,
    setActiveTab,
  } = useWorkersFilter<Worker, Fault>(
    allWorkers,
    availableWorkers,
    assignedWorkers,
    deactivatedWorkers,
    incapacitatedWorkers
  );

  // Hook para la vista y acciones
  const { isAddWorkerOpen, setIsAddWorkerOpen, getCurrentView } =
    useWorkersView(
      filteredAllWorkers,
      filteredAvailableWorkers,
      filteredAssignedWorkers,
      filteredDeactivatedWorkers,
      filteredIncapacitatedWorkers,
      activeTab
    );

  const currentView = getCurrentView();

  // Manejadores de acciones para los trabajadores
  const handleEditWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsEditWorkerOpen(true);
  };

  const handleDeleteWorker = (worker: Worker) => {
    setWorkerToDeactivate(worker);
  };

  const handleActivateWorker = (worker: Worker) => {
    setWorkerToActivate(worker);
  };

  const handleViewWorker = (worker: Worker) => {
    setViewWorker(worker);
  };

  const handleTabChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveTab(e.target.value as WorkerViewTab);
  };

  const handleUpdateWorker = async (worker: Worker) => {
    try {
      if (!worker.id) return;
      await workerService.updateWorker(worker.id, worker);
      refreshWorkers();
      setIsEditWorkerOpen(false);
      setSelectedWorker(null);
    } catch (error) {
      console.error("Error updating worker:", error);
    }
  };

  const handleCreateWorker = async (worker: Worker) => {
    try {
      await workerService.createWorker(worker);
      refreshWorkers();
      setIsAddWorkerOpen(false);
    } catch (error) {
      console.error("Error creating worker:", error);
    }
  };

  const ConfirmToDeactivated = async () => {
    if (!workerToDeactivate) return;
    if (workerToDeactivate.id) {
      await workerService.updateWorker(workerToDeactivate.id, {
        ...workerToDeactivate,
        status: WorkerStatus.DEACTIVATED,
      });
    }

    refreshWorkers();
    setWorkerToDeactivate(null);
  };

  const ConfirmToActivated = async () => {
    if (!workerToActivate) return;
    if (workerToActivate.id) {
      await workerService.updateWorker(workerToActivate.id, {
        ...workerToActivate,
        status: WorkerStatus.AVAILABLE,
      });
    }
    refreshWorkers();
    setWorkerToActivate(null);
  };

  const handleStartIncapacity = (worker: Worker) => {
    setWorkerForIncapacity(worker);
  };

  const handleEndIncapacity = (worker: Worker) => {
    setWorkerToEndIncapacity(worker);
  };

  // Confirmar inicio de proceso de incapacidad
  const confirmStartIncapacity = () => {
    setIsIncapacityFormOpen(true);
  };

  // Guardar datos de incapacidad
  const saveIncapacityData = async (data: {
    startDate: string;
    endDate: string;
    cause: CauseDisability;
    type: TypeDisability;
  }) => {
    if (!workerForIncapacity) return;
    setIsIncapacityLoading(true);
    try {
      if (workerForIncapacity.id) {
        await workerService.updateWorker(workerForIncapacity.id, {
          ...workerForIncapacity,
          status: WorkerStatus.INCAPACITATED,
          dateDisableEnd: data.endDate,
          dateDisableStart: data.startDate,
        });
        await inabilityService.create({
          id_worker: workerForIncapacity.id,
          dateDisableStart: data.startDate,
          dateDisableEnd: data.endDate,
          cause: data.cause,
          type: data.type,
        });
      }

      await refreshWorkers();

      setWorkerForIncapacity(null);
      setIsIncapacityFormOpen(false);
    } catch (error) {
      console.error("Error al registrar incapacidad:", error);
    } finally {
      setIsIncapacityLoading(false);
    }
  };

  // Confirmar finalización de incapacidad
  const confirmEndIncapacity = async () => {
    if (!workerToEndIncapacity) return;

    setIsIncapacityLoading(true);
    try {
      if (workerToEndIncapacity.id) {
        await workerService.updateWorker(workerToEndIncapacity.id, {
          ...workerToEndIncapacity,
          status: WorkerStatus.AVAILABLE,
        });
      }
      await refreshWorkers();
      setWorkerToEndIncapacity(null);
    } catch (error) {
      console.error("Error al finalizar incapacidad:", error);
    } finally {
      setIsIncapacityLoading(false);
    }
  };

  // Definir columnas para exportar trabajadores
  const workerExportColumns: ExcelColumn[] = useMemo(
    () => [
      { header: "Código", field: "code" },
      { header: "Nombre", field: "name" },
      { header: "Teléfono", field: "phone" },
      { header: "DNI", field: "dni" },
      {
        header: "Fecha Inicio",
        field: "createAt",
        value: (worker) =>
          worker.createAt
            ? format(new Date(worker.createAt), "dd/MM/yyyy", { locale: es })
            : "N/A",
      },
      {
        header: "Área",
        field: "jobArea.name",
      },
      {
        header: "Estado",
        field: "status",
        value: (worker) => {
          switch (worker.status) {
            case "AVALIABLE":
              return "Disponible";
            case "ASSIGNED":
              return "Asignado";
            case "DEACTIVATED":
              return "Retirado";
            case "DISABLE":
              return "Deshabilitado";
            case "INCAPACITATED":
              return "Incapacitado";
            default:
              return "Desconocido";
          }
        },
      },
    ],
    []
  );

  // Definir columnas para exportar faltas
  const faultExportColumns: ExcelColumn[] = useMemo(
    () => [
      { header: "Documento", field: "worker.dni" },
      { header: "Trabajador", field: "worker.name" },
      {
        header: "Tipo",
        field: "type",
        value: (fault) => {
          switch (fault.type) {
            case "INNASSISTENCE":
              return "Ausencia";
            case "IRRESPECTFUL":
              return "Irrespetuoso";
            case "OTHER":
              return "Otro";
            default:
              return fault.type;
          }
        },
      },
      { header: "Descripción", field: "description" },
      {
        header: "Fecha",
        field: "createdAt",
        value: (fault) =>
          format(new Date(fault.createdAt), "dd/MM/yyyy", { locale: es }),
      },
    ],
    []
  );

  // Obtener las columnas correspondientes según la vista actual
  const currentExportColumns = useMemo(() => {
    return currentView.type === "workers"
      ? workerExportColumns
      : faultExportColumns;
  }, [currentView.type, workerExportColumns, faultExportColumns]);

  return (
    <>
      <div className="container mx-auto py-6 space-y-6">
        <div className="rounded-xl shadow-md">
          {/* Header mejorado con exportación personalizada */}
          <SectionHeader
            title="Trabajadores"
            subtitle="Gestión de trabajadores"
            btnAddText="Agregar Trabajador"
            handleAddArea={() => setIsAddWorkerOpen(true)}
            refreshData={() => Promise.resolve(refreshWorkers())}
            loading={false}
            exportData={currentView.items}
            exportFileName={`${
              currentView.type === "workers" ? "trabajadores" : "faltas"
            }_${activeTab}`}
            exportColumns={currentExportColumns}
            currentView={currentView.type}
          />

          <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
            <div className="flex gap-4 items-center p-2">
              <div>
                <div className="relative">
                  <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o cédula"
                    className="p-2 pl-10 w-80 border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="relative w-full">
                  <div className="absolute left-3 top-3">
                    <FiFilter className="h-5 w-5 text-blue-500" />
                  </div>
                  <select
                    className="pl-10 pr-10 py-2.5 w-60 appearance-none border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm text-gray-700 font-medium"
                    value={activeTab}
                    onChange={handleTabChange}
                    style={{
                      backgroundImage: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                    }}
                  >
                    <option value="all">Todos</option>
                    <option value="assigned">Asignados</option>
                    <option value="available">Disponibles</option>
                    <option value="deactivated">Retirados</option>
                    <option value="incapacitated">Incapacitados</option>
                  </select>
                  <div className="absolute right-3 top-3 pointer-events-none">
                    <svg
                      className="h-5 w-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vista principal usando DataTable */}
        {activeTab && (
          <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="bg-white">
              <WorkersList
                workers={currentView.items as Worker[]}
                onDeactivate={handleDeleteWorker}
                onActivate={handleActivateWorker}
                onEdit={handleEditWorker}
                onView={handleViewWorker}
                onIncapacity={handleStartIncapacity}
                onEndIncapacity={handleEndIncapacity}
              />
            </div>
          </div>
        )}

        <DeactivateItemAlert
          open={!!workerToDeactivate}
          onOpenChange={() => setWorkerToDeactivate(null)}
          onConfirm={ConfirmToDeactivated}
          itemName="trabajador"
          isLoading={isLoading}
        />

        <EndIncapacityAlert
          open={!!workerToEndIncapacity}
          onOpenChange={() => setWorkerToEndIncapacity(null)}
          onConfirm={confirmEndIncapacity}
          workerName={workerToEndIncapacity?.name}
          isLoading={isIncapacityLoading}
        />

        <IncapacityFormDialog
          open={!!workerForIncapacity}
          onOpenChange={(open) => {
            if (!open) {
              // Si se está cerrando el diálogo, limpia el worker seleccionado
              setWorkerForIncapacity(null);
            }
            setIsIncapacityFormOpen(open);
          }}
          worker={workerForIncapacity}
          onSave={saveIncapacityData}
          isLoading={isIncapacityLoading}
        />
      </div>
      <DeactivateItemAlert
        open={!!workerToDeactivate}
        onOpenChange={() => setWorkerToDeactivate(null)}
        onConfirm={ConfirmToDeactivated}
        itemName="trabajador"
        isLoading={isLoading}
      />

      <ActivateItemAlert
        open={!!workerToActivate}
        onOpenChange={() => setWorkerToActivate(null)}
        onConfirm={ConfirmToActivated}
        itemName="trabajador"
        isLoading={isLoading}
      />

      <ViewWorkerDialog
        open={!!viewWorker}
        onOpenChange={() => setViewWorker(null)}
        worker={viewWorker}
      />

      <AddWorkerDialog
        open={isAddWorkerOpen || isEditWorkerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddWorkerOpen(false);
            setIsEditWorkerOpen(false);
            setSelectedWorker(null);
          }
        }}
        worker={selectedWorker || undefined}
        areas={areas}
        onAddWorker={handleCreateWorker}
        onUpdateWorker={handleUpdateWorker}
      />
    </>
  );
}
