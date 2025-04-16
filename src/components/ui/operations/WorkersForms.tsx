import { useState, useEffect } from "react";
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

  // Filtrado de trabajadores por búsqueda
  const filteredWorkers = availableWorkers.filter(worker => 
    worker.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredWorkers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {filteredWorkers.map(worker => (
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
        <div className="space-y-2">
          {/* Grupos existentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h4 className="font-medium text-gray-700">
                Grupos de Trabajo ({formData.groups.length})
              </h4>
              <button
                type="button"
                onClick={() => setShowGroupForm(true)}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <HiPlus className="mr-1.5" />
                Nuevo Grupo
              </button>
            </div>
            
            <div className="p-4 max-h-72 overflow-y-auto">
              {formData.groups.length > 0 ? (
                <div className="space-y-3">
                  {formData.groups.map((group: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-800">Grupo {index + 1}</h5>
                          <div className="mt-1 text-sm text-gray-600 flex items-center">
                            <BsCalendarEvent className="mr-1.5" />
                            {group.dateStart}
                            {group.dateEnd && ` - ${group.dateEnd}`}
                          </div>
                          <div className="mt-1 text-sm text-gray-600 flex items-center">
                            <BsClock className="mr-1.5" />
                            {group.timeStart}
                            {group.timeEnd && ` - ${group.timeEnd}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWorkerGroup(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <HiX className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs uppercase font-semibold text-gray-500 mb-2">
                          Trabajadores ({group.workerIds.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.workerIds.map((workerId: number) => (
                            <span 
                              key={workerId} 
                              className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md"
                            >
                              {getWorkerNameById(workerId)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No hay grupos de trabajo definidos
                </div>
              )}
            </div>
          </div>
          
          {/* Formulario para crear un nuevo grupo */}
          {showGroupForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <h4 className="font-medium text-gray-700">Crear Nuevo Grupo</h4>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Fechas y horas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={currentGroup.dateStart}
                      onChange={(e) => setCurrentGroup({...currentGroup, dateStart: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition"
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
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Fecha Fin <span className="text-xs text-gray-400">(Opcional)</span>
                    </label>
                    <input
                      type="date"
                      value={currentGroup.dateEnd}
                      onChange={(e) => setCurrentGroup({...currentGroup, dateEnd: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Hora Fin <span className="text-xs text-gray-400">(Opcional)</span>
                    </label>
                    <input
                      type="time"
                      value={currentGroup.timeEnd}
                      onChange={(e) => setCurrentGroup({...currentGroup, timeEnd: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>
                </div>
                
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
                      className="pl-10 pr-4 py-2 w-full rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                    />
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredWorkers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {filteredWorkers.map(worker => (
                          <label 
                            key={worker.id} 
                            className={`flex items-center p-2 border-b border-gray-100 transition cursor-pointer ${
                              currentGroup.workerIds.includes(worker.id)
                                ? "bg-blue-50"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={currentGroup.workerIds.includes(worker.id)}
                              onChange={(e) => handleGroupWorkerSelection(worker.id, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm">{worker.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-gray-500">
                        No se encontraron trabajadores
                      </div>
                    )}
                  </div>
                  
                  {currentGroup.workerIds.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {currentGroup.workerIds.length} trabajadores seleccionados
                    </div>
                  )}
                </div>
                
                {/* Botones de acción */}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowGroupForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={addWorkerGroup}
                    disabled={!currentGroup.dateStart || !currentGroup.timeStart || currentGroup.workerIds.length === 0}
                    className={`px-4 py-2 flex items-center rounded-lg transition ${
                      !currentGroup.dateStart || !currentGroup.timeStart || currentGroup.workerIds.length === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    <BsPersonPlus className="mr-1.5" />
                    Crear Grupo
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {errors.workers && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center">
              <span className="mr-1.5">•</span>
              {errors.workers}
            </p>
          )}
        </div>
      )}
    </div>
  );
}