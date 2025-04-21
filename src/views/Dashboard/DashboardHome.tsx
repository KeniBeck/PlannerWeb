import { useState, useEffect } from "react";
import { useWorkers } from "@/contexts/WorkerContext";
import { useOperations } from "@/contexts/OperationContext";
import { useAreas } from "@/contexts/AreasContext";
import { useClients } from "@/contexts/ClientsContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import { 
  AiOutlineTeam, 
  AiOutlineBarChart, 
  AiOutlineRise, 
  AiOutlineFall,
  AiOutlineClockCircle
} from "react-icons/ai";
import { MdAssignment } from "react-icons/md";
import { PiMapPinSimpleAreaBold } from "react-icons/pi";
import { BsBuildingsFill } from "react-icons/bs";
import { WorkerStatus } from "@/core/model/worker";
import { OperationStatus } from "@/core/model/operation";

export default function DashboardHome() {
  const { workers } = useWorkers();
  const { operations } = useOperations();
  const { areas } = useAreas();
  const { clients } = useClients();
  const [greeting, setGreeting] = useState("");

  // Get current time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Buenos días");
    else if (hour < 18) setGreeting("Buenas tardes");
    else setGreeting("Buenas noches");
  }, []);

  // Get today's date in Spanish format
  const today = format(new Date(), "EEEE dd 'de' MMMM, yyyy", { locale: es });
  
  // Calculate key metrics
  const availableWorkers = workers.filter(w => w.status === WorkerStatus.AVAILABLE).length;
  const assignedWorkers = workers.filter(w => w.status === WorkerStatus.ASSIGNED).length;
  const incapacitatedWorkers = workers.filter(w => w.status === WorkerStatus.INCAPACITATED).length;
  
  const pendingOperations = operations.filter(op => op.status === OperationStatus.PENDING).length;
  const inProgressOperations = operations.filter(op => op.status === OperationStatus.INPROGRESS).length;
  const completedOperations = operations.filter(op => op.status === OperationStatus.COMPLETED).length;
  
  // Get recent operations (last 5)
  const recentOperations = [...operations]
    .sort((a, b) => new Date(b.dateStart || 0).getTime() - new Date(a.dateStart || 0).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{greeting}</h1>
          <p className="text-gray-500 capitalize">{today}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-blue-600">
          <AiOutlineClockCircle />
          <span className="font-medium">{format(new Date(), "hh:mm a")}</span>
        </div>
      </div>
      
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Workers Card */}
        <Link to="/dashboard/workers" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium">Trabajadores</p>
              <h3 className="text-3xl font-bold mt-2">{workers.length}</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-green-600 flex items-center text-sm">
                  <AiOutlineRise />
                  {availableWorkers} disponibles
                </span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <AiOutlineTeam className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Link>
        
        {/* Operations Card */}
        <Link to="/dashboard/operations" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium">Operaciones</p>
              <h3 className="text-3xl font-bold mt-2">{operations.length}</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-orange-500 flex items-center text-sm">
                  <AiOutlineClockCircle className="mr-1" />
                  {inProgressOperations} en curso
                </span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <MdAssignment className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Link>
        
        {/* Areas Card */}
        <Link to="/dashboard/areas" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-teal-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium">Áreas</p>
              <h3 className="text-3xl font-bold mt-2">{areas.length}</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-teal-600 flex items-center text-sm">
                  <AiOutlineTeam className="mr-1" /> 
                  {assignedWorkers} trabajadores asignados
                </span>
              </div>
            </div>
            <div className="bg-teal-100 p-3 rounded-lg">
              <PiMapPinSimpleAreaBold className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </Link>
        
        {/* Clients Card */}
        <Link to="/dashboard/clients" className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium">Clientes</p>
              <h3 className="text-3xl font-bold mt-2">{clients.length}</h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-amber-600 flex items-center text-sm">
                  <AiOutlineRise className="mr-1" />
                  {clients.length} activos
                </span>
              </div>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <BsBuildingsFill className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Link>
      </div>
      
      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operation Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-800">Estado de Operaciones</h3>
            <Link to="/dashboard/reports" className="text-blue-600 text-sm flex items-center hover:underline">
              Ver Reportes <AiOutlineBarChart className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <span className="text-2xl font-bold text-blue-600">{pendingOperations}</span>
              <p className="text-gray-600 text-sm mt-1">Pendientes</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <span className="text-2xl font-bold text-orange-500">{inProgressOperations}</span>
              <p className="text-gray-600 text-sm mt-1">En curso</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <span className="text-2xl font-bold text-green-600">{completedOperations}</span>
              <p className="text-gray-600 text-sm mt-1">Completadas</p>
            </div>
          </div>
          
          <div className="mt-4 relative pt-2">
            <div className="flex w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full" 
                style={{ width: `${(pendingOperations / operations.length) * 100}%` }}
              ></div>
              <div 
                className="bg-orange-500 h-full" 
                style={{ width: `${(inProgressOperations / operations.length) * 100}%` }}
              ></div>
              <div 
                className="bg-green-500 h-full" 
                style={{ width: `${(completedOperations / operations.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Worker Status Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold text-lg text-gray-800 mb-6">Estado de Trabajadores</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Disponibles</span>
              <span className="text-sm font-medium">{availableWorkers}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${(availableWorkers / workers.length) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Asignados</span>
              <span className="text-sm font-medium">{assignedWorkers}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${(assignedWorkers / workers.length) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Incapacitados</span>
              <span className="text-sm font-medium">{incapacitatedWorkers}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className="bg-yellow-500 h-2.5 rounded-full" 
                style={{ width: `${(incapacitatedWorkers / workers.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Operations */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-gray-800">Operaciones Recientes</h3>
          <Link to="/dashboard/operations" className="text-blue-600 text-sm hover:underline">
            Ver todas
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Área
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOperations.map((operation) => (
                <tr key={operation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{operation.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{operation.jobArea?.name || "Sin área"}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{operation.client?.name || "Sin cliente"}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {operation.dateStart 
                        ? format(new Date(operation.dateStart), "dd/MM/yyyy", { locale: es })
                        : "Sin fecha"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${operation.status === OperationStatus.PENDING ? "bg-blue-100 text-blue-800" : 
                         operation.status === OperationStatus.INPROGRESS ? "bg-orange-100 text-orange-800" :
                         operation.status === OperationStatus.COMPLETED ? "bg-green-100 text-green-800" :
                         "bg-red-100 text-red-800"}
                    `}>
                      {operation.status === OperationStatus.PENDING ? "Pendiente" : 
                       operation.status === OperationStatus.INPROGRESS ? "En curso" :
                       operation.status === OperationStatus.COMPLETED ? "Completada" : "Cancelada"}
                    </span>
                  </td>
                </tr>
              ))}
              
              {recentOperations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No hay operaciones recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}