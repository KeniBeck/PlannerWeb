import { HiOutlineSearch, HiX } from "react-icons/hi";
import { BsPersonPlus } from "react-icons/bs";
import { HiOutlineUserGroup } from "react-icons/hi";
import { Worker } from "@/core/model/worker";
import { useState, useMemo } from "react";
import { DateFilter } from "@/components/custom/filter/DateFilterProps";
import { useServices } from "@/contexts/ServicesContext";
import { useAreas } from "@/contexts/AreasContext";
import { ServiceSelector } from "./ServiceSelector";
import { AreaFilter } from "@/components/custom/filter/AreaFilter";

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
  
  // Estado para el filtro de área
  const [areaFilter, setAreaFilter] = useState<string>("all");

  const { services } = useServices();
  const { areas } = useAreas();

  // Preparar opciones para el filtro de área
  const areaOptions = useMemo(() => {
    const options = [{ value: "all", label: "Todas las áreas" }];
    
    // Filtrar solo áreas activas
    const activeAreas = areas.filter(area => area.status === "ACTIVE");
    
    activeAreas.forEach(area => {
      options.push({
        value: area.id.toString(),
        label: area.name
      });
    });
    
    return options;
  }, [areas]);

  // Filtrar trabajadores por área y término de búsqueda
  const filteredWorkers = useMemo(() => {
    let filtered = workersForGroupSelection;

    // Filtrar por área si se ha seleccionado una específica
    if (areaFilter !== "all") {
      filtered = filtered.filter(worker => 
        worker.jobArea?.id.toString() === areaFilter
      );
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(worker =>
        worker.name.toLowerCase().includes(searchLower) ||
        worker.dni?.toLowerCase().includes(searchLower) ||
        worker.code?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [workersForGroupSelection, areaFilter, searchTerm]);

  // Función para limpiar filtros
  const clearFilters = () => {
    setAreaFilter("all");
    setSearchTerm("");
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = areaFilter !== "all" || searchTerm.trim() !== "";

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
                Servicio <span className="text-red-500">*</span>
              </label>
              <ServiceSelector
                services={services}
                value={currentGroup.id_task}
                onChange={(serviceId) =>
                  setCurrentGroup({
                    ...currentGroup,
                    id_task: serviceId,
                  })
                }
                placeholder="Buscar y seleccionar servicio"
                required
              />
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

            {/* Filtros de búsqueda y área */}
            <div className="space-y-3 mb-4">
              {/* Fila de filtros */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Buscar trabajadores */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, DNI o código..."
                    className="pl-10 pr-3 py-2 w-full text-sm rounded-lg bg-white border border-gray-300 focus:ring-1 focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>

                {/* Filtro por área */}
                <div className="w-full sm:w-64">
                  <AreaFilter
                    value={areaFilter}
                    onChange={setAreaFilter}
                    options={areaOptions}
                    className="w-full text-xs h-10"
                  />
                </div>
              </div>

              {/* Indicadores de filtros activos */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between bg-blue-50 p-2 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <span className="font-medium">Filtros activos:</span>
                    
                    {areaFilter !== "all" && (
                      <span className="bg-white px-2 py-1 rounded text-xs border border-blue-200">
                        Área: {areaOptions.find(opt => opt.value === areaFilter)?.label}
                      </span>
                    )}
                    
                    {searchTerm.trim() && (
                      <span className="bg-white px-2 py-1 rounded text-xs border border-blue-200">
                        Búsqueda: "{searchTerm.trim()}"
                      </span>
                    )}
                    
                    <span className="text-blue-600 font-medium">
                      ({filteredWorkers.length} trabajador{filteredWorkers.length !== 1 ? 'es' : ''})
                    </span>
                  </div>
                  
                  <button
                    onClick={clearFilters}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>

            {/* Lista de trabajadores con scroll único y controlado */}
            <div className="border border-gray-200 rounded-lg">
              <div className="max-h-64 overflow-y-auto">
                {filteredWorkers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredWorkers.map((worker) => (
                      <label
                        key={worker.id}
                        className={`flex items-center p-3 border-b border-gray-100 transition cursor-pointer ${
                          currentGroup.workers.includes(worker.id)
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
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
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {worker.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>DNI: {worker.dni}</span>
                            {worker.jobArea && (
                              <>
                                <span>•</span>
                                <span className="truncate">{worker.jobArea.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <div className="space-y-2">
                      <div className="text-lg">🔍</div>
                      <div className="text-sm font-medium">
                        {hasActiveFilters 
                          ? "No se encontraron trabajadores" 
                          : "No hay trabajadores disponibles"}
                      </div>
                      <div className="text-xs">
                        {hasActiveFilters 
                          ? "Intenta ajustar los filtros de búsqueda"
                          : "Los trabajadores disponibles aparecerán aquí"}
                      </div>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-blue-600 hover:text-blue-800 underline mt-2"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información adicional */}
            {filteredWorkers.length > 0 && (
              <div className="mt-3 text-xs text-gray-500 text-center">
                Mostrando {filteredWorkers.length} de {workersForGroupSelection.length} trabajadores disponibles
              </div>
            )}
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