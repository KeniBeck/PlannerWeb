import { HiOutlineUserGroup, HiPlus, HiX, HiTrash } from "react-icons/hi";
import { BsCalendarEvent } from "react-icons/bs";
import { FaRegClock } from "react-icons/fa";
import { FaTools } from "react-icons/fa"; // Importar ícono para el servicio
import { useServices } from "@/contexts/ServicesContext"; // Importar el contexto de servicios

interface GroupsListProps {
  groups: any[];
  showGroupForm: boolean;
  getWorkerNameById: (id: number) => string;
  startEditingGroup: (index: number) => void;
  removeWorkerGroup: (index: number) => void;
  removeWorkerFromGroup: (groupIndex: number, workerId: number) => void;
  onCreateGroup: () => void;
}

export const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  showGroupForm,
  getWorkerNameById,
  startEditingGroup,
  removeWorkerGroup,
  removeWorkerFromGroup,
  onCreateGroup
}) => {
  // Obtener los servicios del contexto
  const { services } = useServices();
  
  // Función para obtener el nombre del servicio por su ID
  const getServiceNameById = (id_task: number | null) => {
    if (!id_task) return "Sin servicio asignado";
    const service = services.find(s => s.id === id_task);
    return service ? service.name : "Servicio no encontrado";
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <h4 className="font-medium text-gray-700 flex items-center">
          <span className="mr-2">Grupos de Trabajo</span>
          {groups.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              {groups.length}
            </span>
          )}
        </h4>
        <button
          type="button"
          onClick={onCreateGroup}
          className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
        >
          <HiPlus className="mr-1.5" />
          Nuevo Grupo
        </button>
      </div>
      
      {groups.length > 0 && !showGroupForm ? (
        <div className="p-3">
          {groups.map((group: any, index: number) => (
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
                    {/* Añadir el servicio aquí */}
                    {group.id_task && (
                      <span className="flex items-center px-2 py-1 bg-white rounded-md border border-gray-200">
                        <FaTools className="mr-1.5 text-blue-600" />
                        <span className="font-medium mr-1">Servicio:</span>
                        <span className="text-blue-700">{getServiceNameById(group.id_task)}</span>
                      </span>
                    )}
                    
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
  );
};