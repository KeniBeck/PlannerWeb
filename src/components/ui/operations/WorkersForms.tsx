import { useState, useEffect, useMemo } from "react";
import { Worker } from "@/core/model/worker";
import { HiOutlineUserGroup, HiOutlineSearch, HiPlus, HiX, HiTrash } from "react-icons/hi";
import { BsCalendarEvent, BsClock, BsPersonPlus } from "react-icons/bs";
import { FaRegClock } from "react-icons/fa";
import { WorkersGroup } from "@/core/model/workersGroup";
import { number } from "zod";

interface WorkersFormProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  availableWorkers: Worker[];
}

export default function WorkersForm({
  formData,
  setFormData,
  errors,
  availableWorkers
}: WorkersFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState("individual");
  const [currentGroup, setCurrentGroup] = useState({
    workers: [] as number[],
    dateStart: "",
    dateEnd: "",
    timeStart: "",
    timeEnd: ""
  });
  const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(null);

  // Obtener todos los trabajadores ya asignados a grupos
  const workersInGroups = useMemo(() => {
    const ids = new Set<number>();
    formData.groups.forEach((group: any) => {
      if (Array.isArray(group.workers)) {
        group.workers.forEach((id: number) => {
          ids.add(id);
        });
      }
    });
    return ids;
  }, [formData.groups]);
  
  // Trabajadores disponibles para selección individual (excluye a los que están en grupos)
  const workersForIndividualSelection = useMemo(() => {
    return availableWorkers.filter(worker => 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      !workersInGroups.has(worker.id)
    );
  }, [availableWorkers, searchTerm, workersInGroups]);
  
  // Trabajadores disponibles para grupos (excluye a los seleccionados individualmente excepto los del grupo actual)
  const workersForGroupSelection = useMemo(() => {
    // Excluir los que ya están en selección individual o en otros grupos
    const excludedIds = new Set<number>([...formData.workerIds]);
    
    // Si estamos editando un grupo, no excluir los trabajadores de ese grupo
    if (editingGroupIndex !== null) {
      const groupBeingEdited = formData.groups[editingGroupIndex];
      if (groupBeingEdited && Array.isArray(groupBeingEdited.workers)) {
        groupBeingEdited.workers.forEach((id: number) => {
          excludedIds.delete(id);
        });
      }
    }
    
    // No excluir los del grupo actual que estamos creando/editando
    const availableForCurrentGroup = availableWorkers.filter(worker => 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (!excludedIds.has(worker.id) || currentGroup.workers.includes(worker.id))
    );
    
    return availableForCurrentGroup;
  }, [availableWorkers, searchTerm, formData.workerIds, currentGroup.workers, editingGroupIndex, formData.groups]);

  // Manejar selección de trabajadores individuales
  const handleWorkerSelection = (workerId: number, selected: boolean) => {
    const newWorkerIds = selected 
      ? [...formData.workerIds, workerId]
      : formData.workerIds.filter((id: number) => id !== workerId);
    
    setFormData({ ...formData, workerIds: newWorkerIds });
  };

  // Manejar selección de trabajadores para un grupo
  const handleGroupWorkerSelection = (workerId: number, selected: boolean) => {
    if (selected) {
      if (!currentGroup.workers.includes(workerId)) {
        setCurrentGroup({
          ...currentGroup,
          workers: [...currentGroup.workers, workerId]
        });
      }
    } else {
      setCurrentGroup({
        ...currentGroup,
        workers: currentGroup.workers.filter(id => id !== workerId)
      });
    }
  };

  // Remover un trabajador específico de un grupo existente
  const removeWorkerFromGroup = (groupIndex: number, workerId: number) => {
    const newGroups = [...formData.groups];
    newGroups[groupIndex] = {
      ...newGroups[groupIndex],
      workers: newGroups[groupIndex].workers.filter((id: number) => id !== workerId)
    };
    setFormData({ ...formData, groups: newGroups });
  };

  // Iniciar la edición de un grupo existente
  const startEditingGroup = (groupIndex: number) => {
    const group = formData.groups[groupIndex];
    setCurrentGroup({
      workers: [...group.workers],
      dateStart: group.dateStart || "",
      dateEnd: group.dateEnd || "",
      timeStart: group.timeStart || "",
      timeEnd: group.timeEnd || ""
    });
    setEditingGroupIndex(groupIndex);
    setShowGroupForm(true);
  };

  // Añadir un nuevo grupo o actualizar uno existente
  const addOrUpdateWorkerGroup = () => {
    if (currentGroup.workers.length > 0 && currentGroup.dateStart && currentGroup.timeStart) {
      const newGroups = [...formData.groups];
      
      if (editingGroupIndex !== null) {
        // Actualizar grupo existente
        newGroups[editingGroupIndex] = { ...currentGroup };
      } else {
        // Crear nuevo grupo
        newGroups.push({ ...currentGroup });
      }
      
      setFormData({
        ...formData,
        groups: newGroups
      });
      
      // Resetear el formulario
      setCurrentGroup({
        workers: [],
        dateStart: "",
        dateEnd: "",
        timeStart: "",
        timeEnd: ""
      });
      setShowGroupForm(false);
      setEditingGroupIndex(null);
    }
  };

  // Eliminar un grupo completo
  const removeWorkerGroup = (index: number) => {
    const newGroups = [...formData.groups];
    newGroups.splice(index, 1);
    setFormData({ ...formData, groups: newGroups });
  };

  // Obtener nombre de trabajador por ID
  const getWorkerNameById = (id: number) => {
    const worker = availableWorkers.find(w => w.id === id);
    return worker ? worker.name : `Trabajador ${id}`;
  };

  // Cancelar edición de grupo
  const cancelGroupEditing = () => {
    setCurrentGroup({
      workers: [],
      dateStart: "",
      dateEnd: "",
      timeStart: "",
      timeEnd: ""
    });
    setShowGroupForm(false);
    setEditingGroupIndex(null);
  };

  return (
    <div className="space-y-1">
      {/* Header con tabs mejorado */}
      <div className="flex flex-col space-y-2">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <HiOutlineUserGroup className="mr-2 text-blue-600" />
          Asignación de Personal
        </h3>
        
        <div className="border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setSelectedTab("individual")}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                selectedTab === "individual"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Trabajadores Individuales
              {formData.workerIds.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {formData.workerIds.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("groups")}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                selectedTab === "groups"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Grupos de Trabajo
              {formData.groups.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {formData.groups.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {selectedTab === "individual" ? (
        <div className="space-y-3">
          {/* Lista de trabajadores individuales ya seleccionados */}
          {formData.workerIds.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <HiOutlineUserGroup className="mr-1.5" />
                Trabajadores Seleccionados ({formData.workerIds.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.workerIds.map((id: number) => (
                  <div 
                    key={id}
                    className="flex items-center bg-white text-blue-800 text-sm px-2.5 py-1 rounded-md border border-blue-200 shadow-sm"
                  >
                    <span>{getWorkerNameById(id)}</span>
                    <button
                      type="button"
                      onClick={() => handleWorkerSelection(id, false)}
                      className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Eliminar trabajador"
                    >
                      <HiX className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buscador de trabajadores */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar trabajadores..."
              className="pl-10 pr-4 py-2.5 w-full rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            />
          </div>
          
          {/* Lista de trabajadores */}
          <div className=" max-h-58 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h4 className="font-medium text-gray-700">
                Trabajadores Disponibles
              </h4>
            </div>
            
            <div className="p-1 max-h-64 overflow-y-auto">
              {workersForIndividualSelection.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {workersForIndividualSelection.map(worker => (
                    <label 
                      key={worker.id} 
                      className={`flex items-center p-3 rounded-lg transition cursor-pointer ${
                        formData.workerIds.includes(worker.id)
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.workerIds.includes(worker.id)}
                        onChange={(e) => handleWorkerSelection(worker.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{worker.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  {searchTerm 
                    ? "No se encontraron trabajadores con ese nombre" 
                    : "No hay trabajadores disponibles"}
                </div>
              )}
            </div>
          </div>
          
          {errors.workers && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center">
              <span className="mr-1.5">•</span>
              {errors.workers}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pb-4">
          {/* Grupos existentes - Diseño mejorado */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <h4 className="font-medium text-gray-700 flex items-center">
                <span className="mr-2">Grupos de Trabajo</span>
                {formData.groups.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {formData.groups.length}
                  </span>
                )}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setCurrentGroup({
                    workers: [],
                    dateStart: "",
                    dateEnd: "",
                    timeStart: "",
                    timeEnd: ""
                  });
                  setEditingGroupIndex(null);
                  setShowGroupForm(true);
                }}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <HiPlus className="mr-1.5" />
                Nuevo Grupo
              </button>
            </div>
            
            {formData.groups.length > 0 && !showGroupForm ?  (
              <div className="p-3">
                {formData.groups.map((group: any, index: number) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3 last:mb-0 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800 text-sm flex items-center">
                          <span className="mr-1">Grupo {index + 1}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full ml-2">
                            {group.workers.length} trabajadores
                          </span>
                        </h5>
                        
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-2">
                          <span className="flex items-center px-2 py-1 bg-white rounded-md border border-gray-200">
                            <BsCalendarEvent className="mr-1.5 text-blue-600" />
                            <span className="font-medium mr-1">Fecha inicio:</span>
                            {group.dateStart}
                          </span>
                          <span className="flex items-center px-2 py-1 bg-white rounded-md border border-gray-200">
                            <FaRegClock className="mr-1.5 text-blue-600" />
                            <span className="font-medium mr-1">Hora inicio:</span>
                            {group.timeStart}
                          </span>
                          
                          {group.dateEnd && (
                            <span className="flex items-center px-2 py-1 bg-white rounded-md border border-gray-200">
                              <BsCalendarEvent className="mr-1.5 text-blue-600" />
                              <span className="font-medium mr-1">Fecha fin:</span>
                              {group.dateEnd}
                            </span>
                          )}
                          
                          {group.timeEnd && (
                            <span className="flex items-center px-2 py-1 bg-white rounded-md border border-gray-200">
                              <FaRegClock className="mr-1.5 text-blue-600" />
                              <span className="font-medium mr-1">Hora fin:</span>
                              {group.timeEnd}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => startEditingGroup(index)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-md"
                          title="Editar grupo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWorkerGroup(index)}
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-md"
                          title="Eliminar grupo"
                        >
                          <HiTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Lista de trabajadores en el grupo */}
                    <div className="mt-3">
                      <h6 className="text-xs font-medium text-gray-700 mb-2">Trabajadores asignados:</h6>
                      <div className="flex flex-wrap gap-2">
                        {group.workers.map((id: number) => (
                          <div 
                            key={id}
                            className="flex items-center bg-white text-gray-800 text-xs px-2 py-1 rounded-md border border-gray-200 shadow-sm"
                          >
                            <span>{getWorkerNameById(id)}</span>
                            <button
                              type="button"
                              onClick={() => removeWorkerFromGroup(index, id)}
                              className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              title="Eliminar trabajador del grupo"
                            >
                              <HiX className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !showGroupForm && (
                <div className="py-8 text-center text-gray-500">
                  <HiOutlineUserGroup className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm">No hay grupos de trabajo definidos</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Crea un nuevo grupo utilizando el botón "Nuevo Grupo"
                  </p>
                </div>
              )
            )}
          </div>
          
          {/* Formulario para crear o editar grupo */}
          {showGroupForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
              <div className="p-3 bg-blue-50 border-b border-blue-200 flex justify-between items-center">
                <h4 className="font-medium text-blue-800">
                  {editingGroupIndex !== null ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
                </h4>
                <button
                  type="button"
                  onClick={cancelGroupEditing}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <HiX className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4">
                {/* Fechas y horas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={currentGroup.dateStart}
                      onChange={(e) => setCurrentGroup({...currentGroup, dateStart: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={currentGroup.timeStart}
                      onChange={(e) => setCurrentGroup({...currentGroup, timeStart: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Fecha Fin <span className="text-xs text-gray-400">(Opcional)</span>
                    </label>
                    <input
                      type="date"
                      value={currentGroup.dateEnd}
                      onChange={(e) => setCurrentGroup({...currentGroup, dateEnd: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Hora Fin <span className="text-xs text-gray-400">(Opcional)</span>
                    </label>
                    <input
                      type="time"
                      value={currentGroup.timeEnd}
                      onChange={(e) => setCurrentGroup({...currentGroup, timeEnd: e.target.value})}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                    />
                  </div>
                </div>
                
                {/* Trabajadores seleccionados para el grupo - mostrar primero si hay */}
                {currentGroup.workers.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <h5 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                      <HiOutlineUserGroup className="mr-1.5" />
                      Trabajadores seleccionados ({currentGroup.workers.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {currentGroup.workers.map(id => (
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
                
                {/* Buscar trabajadores para el grupo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seleccionar Trabajadores <span className="text-red-500">*</span>
                  </label>
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
                  
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      {workersForGroupSelection.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                          {workersForGroupSelection.map(worker => (
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
                                onChange={(e) => handleGroupWorkerSelection(worker.id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm truncate">{worker.name}</span>
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
                
                {/* Botones de acción */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={cancelGroupEditing}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition shadow-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={addOrUpdateWorkerGroup}
                    disabled={!currentGroup.dateStart || !currentGroup.timeStart || currentGroup.workers.length === 0}
                    className={`px-4 py-2 text-sm font-medium flex items-center rounded-lg transition shadow-sm ${
                      !currentGroup.dateStart || !currentGroup.timeStart || currentGroup.workers.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    <BsPersonPlus className="mr-2" />
                    {editingGroupIndex !== null ? "Actualizar Grupo" : "Crear Grupo"}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {errors.workers && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <span className="mr-2">•</span>
              {errors.workers}
            </p>
          )}
        </div>
      )}
    </div>
  );
}