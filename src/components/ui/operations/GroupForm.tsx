import { HiOutlineSearch, HiX } from "react-icons/hi";
import { BsPersonPlus } from "react-icons/bs";
import { HiOutlineUserGroup } from "react-icons/hi";
import { Worker } from "@/core/model/worker";
import { useState } from "react";
import { DateFilter } from "@/components/custom/filter/DateFilterProps";
import { useServices } from "@/contexts/ServicesContext";

interface GroupFormProps {
  currentGroup: any;
  editingGroupIndex: number | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  workersForGroupSelection: Worker[];
  getWorkerNameById: (id: number) => string;
  setCurrentGroup: (group: any) => void;
  handleGroupWorkerSelection: (id: number, selected: boolean) => void;
  addOrUpdateWorkerGroup: () => void;
  cancelGroupEditing: () => void;
}

export const GroupForm: React.FC<GroupFormProps> = ({
  currentGroup,
  editingGroupIndex,
  searchTerm,
  setSearchTerm,
  workersForGroupSelection,
  getWorkerNameById,
  setCurrentGroup,
  handleGroupWorkerSelection,
  addOrUpdateWorkerGroup,
  cancelGroupEditing,
}) => {
  // Estado para controlar el panel activo (fechas o trabajadores)
  const [activePanel, setActivePanel] = useState<"dates" | "workers">("dates");

  const { services } = useServices();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible mt-4">
      {/* Header con pestañas para navegación entre paneles */}
      <div className="p-3 bg-blue-50 border-b border-blue-200">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-blue-800">
            {editingGroupIndex !== null ? "Editar Grupo" : "Crear Nuevo Grupo"}
          </h4>
          <button
            type="button"
            onClick={cancelGroupEditing}
            className="text-gray-600 hover:text-gray-800"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación entre fechas y trabajadores */}
        <div className="flex border-b border-blue-200">
          <button
            className={`px-4 py-2 text-sm font-medium relative ${
              activePanel === "dates"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => setActivePanel("dates")}
          >
            Fechas y Horas
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 ${
              activePanel === "workers"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-blue-600"
            }`}
            onClick={() => setActivePanel("workers")}
          >
            Trabajadores
            {currentGroup.workers.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-1.5 rounded-full">
                {currentGroup.workers.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        {activePanel === "dates" ? (
          /* Fechas y horas */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio <span className="text-red-500">*</span>
              </label>
              <DateFilter
                value={currentGroup.dateStart}
                onChange={(date) =>
                  setCurrentGroup({ ...currentGroup, dateStart: date })
                }
                label="Seleccionar fecha"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={currentGroup.timeStart}
                onChange={(e) =>
                  setCurrentGroup({
                    ...currentGroup,
                    timeStart: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Fecha Fin{" "}
                <span className="text-xs text-gray-400">(Opcional)</span>
              </label>
              <DateFilter
                value={currentGroup.dateEnd}
                onChange={(date) =>
                  setCurrentGroup({ ...currentGroup, dateEnd: date })
                }
                label="Seleccionar fecha"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Hora Fin{" "}
                <span className="text-xs text-gray-400">(Opcional)</span>
              </label>
              <input
                type="time"
                value={currentGroup.timeEnd}
                onChange={(e) =>
                  setCurrentGroup({ ...currentGroup, timeEnd: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servicio/Tarea <span className="text-red-500">*</span>
              </label>
              <select
                value={currentGroup.id_task || ""}
                onChange={(e) =>
                  setCurrentGroup({
                    ...currentGroup,
                    id_task: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
              >
                <option value="">Seleccionar servicio</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          /* Sección de Trabajadores */
          <div>
            {/* Trabajadores ya seleccionados */}
            {currentGroup.workers.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <h5 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <HiOutlineUserGroup className="mr-1.5" />
                  Trabajadores seleccionados ({currentGroup.workers.length})
                </h5>
                {currentGroup.id_task && (
                  <div className="mb-3 px-2 py-1.5 bg-white rounded border border-blue-200 inline-flex items-center text-sm">
                    <span className="mr-1.5 text-blue-600">🔧</span>
                    <span className="font-medium text-blue-700">
                      {services.find((s) => s.id === currentGroup.id_task)
                        ?.name || "Servicio seleccionado"}
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {currentGroup.workers.map((id: number) => (
                    <div
                      key={id}
                      className="flex items-center bg-white text-blue-800 text-xs px-2 py-1 rounded-md border border-blue-200 shadow-sm"
                    >
                      <span>{getWorkerNameById(id)}</span>
                      <button
                        type="button"
                        onClick={() => handleGroupWorkerSelection(id, false)}
                        className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar trabajador"
                      >
                        <HiX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buscar trabajadores */}
            <div className="relative mb-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar trabajadores..."
                className="pl-10 pr-3 py-2 w-full text-sm rounded-lg bg-white border border-gray-300 focus:ring-1 focus:ring-blue-200 focus:border-blue-500"
              />
            </div>

            {/* Lista de trabajadores con scroll único y controlado */}
            <div className="border border-gray-200 rounded-lg mt-2">
              <div className="max-h-64 overflow-y-auto">
                {workersForGroupSelection.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {workersForGroupSelection.map((worker) => (
                      <label
                        key={worker.id}
                        className={`flex items-center p-2 border-b border-gray-100 transition cursor-pointer ${
                          currentGroup.workers.includes(worker.id)
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={currentGroup.workers.includes(worker.id)}
                          onChange={(e) =>
                            handleGroupWorkerSelection(
                              worker.id,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm truncate">
                          {worker.name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500 text-sm">
                    {searchTerm
                      ? "No se encontraron trabajadores con ese nombre"
                      : "No hay trabajadores disponibles"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción - ahora fijados en la parte inferior */}
        <div className="flex justify-between mt-6 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() =>
              activePanel === "dates"
                ? cancelGroupEditing()
                : setActivePanel("dates")
            }
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition shadow-sm"
          >
            {activePanel === "dates" ? "Cancelar" : "Anterior"}
          </button>

          {activePanel === "dates" ? (
            <button
              type="button"
              onClick={() => setActivePanel("workers")}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={addOrUpdateWorkerGroup}
              disabled={
                !currentGroup.dateStart ||
                !currentGroup.timeStart ||
                currentGroup.workers.length === 0
              }
              className={`px-4 py-2 text-sm font-medium flex items-center rounded-lg transition shadow-sm ${
                !currentGroup.dateStart ||
                !currentGroup.timeStart ||
                currentGroup.workers.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <BsPersonPlus className="mr-2" />
              {editingGroupIndex !== null ? "Actualizar Grupo" : "Crear Grupo"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
