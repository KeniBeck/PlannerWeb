import { useState } from "react";
import { User } from "@/core/model/user";
import { HiOutlineUserGroup, HiOutlineSearch, HiCheck, HiUserCircle } from "react-icons/hi";
import { FaUserTie } from "react-icons/fa";

interface SupervisorsFormProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  supervisors: User[];
}

export default function SupervisorsForm({
  formData,
  setFormData,
  errors,
  supervisors
}: SupervisorsFormProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSupervisorSelection = (supervisorId: number, selected: boolean) => {
    const newSupervisorIds = selected
      ? [...formData.inChargedIds, supervisorId]
      : formData.inChargedIds.filter((id: number) => id !== supervisorId);
    
    setFormData({ ...formData, inChargedIds: newSupervisorIds });
  };

  // Filtrar supervisores según término de búsqueda
  const filteredSupervisors = supervisors.filter(supervisor => 
    supervisor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FaUserTie className="mr-2 text-blue-600" />
          Asignación de Supervisores
        </h3>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
          {formData.inChargedIds.length} seleccionados
        </div>
      </div>
      
      {/* Barra de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiOutlineSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar supervisores..."
          className="pl-10 pr-4 py-2.5 w-full rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
        />
      </div>
      
      {/* Lista de supervisores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h4 className="font-medium text-gray-700">
            Seleccione los supervisores para esta operación
          </h4>
        </div>
        
        {filteredSupervisors.length > 0 ? (
          <div className="max-h-52 overflow-y-auto p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredSupervisors.map(supervisor => (
                <div 
                  key={supervisor.id} 
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${formData.inChargedIds.includes(supervisor.id) 
                      ? "bg-blue-50 border border-blue-200" 
                      : "hover:bg-gray-50 border border-gray-100"}
                  `}
                  onClick={() => handleSupervisorSelection(
                    supervisor.id, 
                    !formData.inChargedIds.includes(supervisor.id)
                  )}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-lg
                        ${formData.inChargedIds.includes(supervisor.id)
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"}
                      `}>
                        <HiUserCircle />
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">{supervisor.name}</p>
                        {formData.inChargedIds.includes(supervisor.id) && (
                          <HiCheck className="text-blue-600 h-5 w-5" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {supervisor.occupation || "Sin cargo especificado"}
                      </p>
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No se encontraron supervisores con ese nombre
          </div>
        )}
      </div>
      
      {/* Seleccionados */}
      {formData.inChargedIds.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Supervisores seleccionados:</h5>
          <div className="flex flex-wrap gap-2">
            {formData.inChargedIds.map((id: number) => {
              const supervisor = supervisors.find(s => s.id === id);
              return (
                <div 
                  key={id}
                  className="bg-white border border-gray-200 rounded-full px-3 py-1 flex items-center text-sm"
                >
                  <span className="text-gray-800">{supervisor?.name}</span>
                  <button
                    type="button"
                    onClick={() => handleSupervisorSelection(id, false)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {errors.inCharged && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center">
          <span className="mr-1.5">•</span>
          {errors.inCharged}
        </p>
      )}
    </div>
  );
}