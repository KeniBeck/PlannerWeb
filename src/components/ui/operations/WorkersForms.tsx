import { useState, useEffect, useMemo } from "react";
import { Worker } from "@/core/model/worker";
import { HiOutlineUserGroup, HiOutlineSearch, HiPlus, HiX } from "react-icons/hi";
import { BsCalendarEvent, BsClock, BsPersonPlus } from "react-icons/bs";

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
    workerIds: [] as number[],
    dateStart: "",
    dateEnd: "",
    timeStart: "",
    timeEnd: ""
  });

    // Obtener todos los trabajadores ya asignados a grupos
    const workersInGroups = useMemo(() => {
      const ids = new Set<number>();
      console.log("formData.groups", formData.groups);
      formData.groups.forEach((group: any) => {
        group.workers.forEach((data: {
          id: number;
          name: string;
        }) => {
          ids.add(data.id);
        });
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
  
  // Trabajadores disponibles para grupos (excluye a los seleccionados individualmente)
  const workersForGroupSelection = useMemo(() => {
    // Excluir los que ya están en selección individual o en otros grupos
    const excludedIds = new Set<number>([...formData.workerIds]);
    
    // No excluir los del grupo actual que estamos editando
    const availableForCurrentGroup = availableWorkers.filter(worker => 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (!excludedIds.has(worker.id) || currentGroup.workerIds.includes(worker.id))
    );
    
    return availableForCurrentGroup;
  }, [availableWorkers, searchTerm, formData.workerIds, currentGroup.workerIds]);


  const handleWorkerSelection = (workerId: number, selected: boolean) => {
    const newWorkerIds = selected 
      ? [...formData.workerIds, workerId]
      : formData.workerIds.filter((id: number) => id !== workerId);
    
    setFormData({ ...formData, workerIds: newWorkerIds });
  };


  const handleGroupWorkerSelection = (workerId: number, selected: boolean) => {
    const newWorkerIds = selected 
      ? [...currentGroup.workerIds, workerId]
      : currentGroup.workerIds.filter(id => id !== workerId);
    
    setCurrentGroup({ ...currentGroup, workerIds: newWorkerIds });
  };

  const addWorkerGroup = () => {
    if (currentGroup.workerIds.length > 0 && currentGroup.dateStart && currentGroup.timeStart) {
      setFormData({
        ...formData,
        groups: [...formData.groups, { ...currentGroup }]
      });
      setCurrentGroup({
        workerIds: [],
        dateStart: "",
        dateEnd: "",
        timeStart: "",
        timeEnd: ""
      });
      setShowGroupForm(false);
    }
  };

  const removeWorkerGroup = (index: number) => {
    const newGroups = [...formData.groups];
    newGroups.splice(index, 1);
    setFormData({ ...formData, groups: newGroups });
  };

  const getWorkerNameById = (id: number) => {
    const worker = availableWorkers.find(w => w.id === id);
    return worker ? worker.name : "Trabajador";
  };

  return (
    <div className="space-y-2">
      {/* Header con tabs */}
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
            </button>
          </div>
        </div>
      </div>
      
      {selectedTab === "individual" ? (
        <div className="space-y-2">
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <h4 className="font-medium text-gray-700">
                Seleccione los trabajadores ({formData.workerIds.length} seleccionados)
              </h4>
            </div>
            
            <div className="p-1 max-h-52 overflow-y-auto">
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
                  No se encontraron trabajadores con ese nombre
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
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pb-4">
    {/* Grupos existentes - Diseño más compacto */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <h4 className="font-medium text-gray-700">
          Grupos de Trabajo ({formData.groups.length})
        </h4>
        <button
          type="button"
          onClick={() => setShowGroupForm(true)}
          className="inline-flex items-center px-2 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <HiPlus className="mr-1" />
          Nuevo Grupo
        </button>
      </div>
      
      <div className="p-1 max-h-56 overflow-y-auto">
        {formData.groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-1">
            {formData.groups.map((group: any, index: number) => (
              <div key={index} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800 text-sm">Grupo {index + 1}</h5>
                    <div className="flex gap-2 text-xs text-gray-600 mt-1 flex-wrap">
                      <span className="flex items-center">
                        <BsCalendarEvent className="mr-1 text-blue-600" />
                        {group.dateStart}
                      </span>
                      <span className="flex items-center">
                        <BsClock className="mr-1 text-blue-600" />
                        {group.timeStart}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeWorkerGroup(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <HiX className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1">
                  <div className="flex flex-wrap gap-1 mt-1">
                    {group.workers.map((data: {
                      id: number;
                      name: string;
                    }) => (
                      <span 
                        key={data.id} 
                        className="inline-flex items-center px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-md"
                      >
                        {data.name}
                      </span>
                    ))}
                 
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500 text-sm">
            No hay grupos de trabajo definidos
          </div>
        )}
      </div>
    </div>
    
    {/* Formulario para crear un nuevo grupo - Versión más compacta */}
    {showGroupForm && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h4 className="font-medium text-gray-700 text-sm">Crear Nuevo Grupo</h4>
          <button
            type="button"
            onClick={() => setShowGroupForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <HiX className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-2">
          {/* Fechas y horas en formato más compacto */}
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-700">
                Fecha Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={currentGroup.dateStart}
                onChange={(e) => setCurrentGroup({...currentGroup, dateStart: e.target.value})}
                className="w-full px-2 py-1 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-700">
                Hora Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={currentGroup.timeStart}
                onChange={(e) => setCurrentGroup({...currentGroup, timeStart: e.target.value})}
                className="w-full px-2 py-1 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-500">
                Fecha Fin <span className="text-xs text-gray-400">(Opcional)</span>
              </label>
              <input
                type="date"
                value={currentGroup.dateEnd}
                onChange={(e) => setCurrentGroup({...currentGroup, dateEnd: e.target.value})}
                className="w-full px-2 py-1 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-500">
                Hora Fin <span className="text-xs text-gray-400">(Opcional)</span>
              </label>
              <input
                type="time"
                value={currentGroup.timeEnd}
                onChange={(e) => setCurrentGroup({...currentGroup, timeEnd: e.target.value})}
                className="w-full px-2 py-1 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Buscar trabajadores para el grupo - Formato más compacto */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Seleccionar Trabajadores <span className="text-red-500">*</span>
            </label>
            <div className="relative mb-1">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <HiOutlineSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar trabajadores..."
                className="pl-7 pr-2 py-1.5 w-full text-sm rounded-lg bg-white border border-gray-300 focus:ring-1 focus:ring-blue-200"
              />
            </div>
            
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
              {workersForGroupSelection.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                  {workersForGroupSelection.map(worker => (
                    <label 
                      key={worker.id} 
                      className={`flex items-center p-1.5 border-b border-gray-100 transition cursor-pointer ${
                        currentGroup.workerIds.includes(worker.id)
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={currentGroup.workerIds.includes(worker.id)}
                        onChange={(e) => handleGroupWorkerSelection(worker.id, e.target.checked)}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-1.5 text-xs truncate">{worker.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="py-2 text-center text-gray-500 text-xs">
                  No se encontraron trabajadores
                </div>
              )}
            </div>
            
            {/* Mostrar chips de trabajadores seleccionados */}
            {currentGroup.workerIds.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {currentGroup.workerIds.map(id => (
                  <div 
                    key={id}
                    className="flex items-center bg-blue-50 text-blue-700 text-xs rounded px-1.5 py-0.5"
                  >
                    <span className="truncate max-w-[100px]">{getWorkerNameById(id)}</span>
                    <button
                      type="button"
                      onClick={() => handleGroupWorkerSelection(id, false)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <HiX className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setShowGroupForm(false)}
              className="px-2 py-1 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={addWorkerGroup}
              disabled={!currentGroup.dateStart || !currentGroup.timeStart || currentGroup.workerIds.length === 0}
              className={`px-2 py-1 text-xs flex items-center rounded-lg transition ${
                !currentGroup.dateStart || !currentGroup.timeStart || currentGroup.workerIds.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <BsPersonPlus className="mr-1" />
              Crear Grupo
            </button>
          </div>
        </div>
      </div>
    )}
    
    {errors.workers && (
      <p className="mt-1 text-xs text-red-500 flex items-center">
        <span className="mr-1">•</span>
        {errors.workers}
      </p>
    )}
  </div>
      )}
    </div>
  );
}