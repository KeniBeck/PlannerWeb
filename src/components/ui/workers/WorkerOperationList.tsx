import { useEffect, useState } from 'react';
import { Operation } from '@/core/model/operation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaTools, FaCalendarAlt, FaMapMarkerAlt, FaShip, FaTasks, FaList } from 'react-icons/fa';
import { operationService } from '@/services/operationService';
import axios from 'axios';

interface WorkerOperationsListProps {
  workerId: number;
}

export function WorkerOperationsList({ workerId }: WorkerOperationsListProps) {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        setLoading(true);
        const response = await operationService.getOperationByIdWithWorkers(workerId);
        setOperations(response || []);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setOperations([]);
          setError(null);
        } else {
          setError('No se pudieron cargar las operaciones. Intente nuevamente.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
  }, [workerId]);

  // Configuración de estados de operación para estilos
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Pendiente',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: <FaCalendarAlt className="text-yellow-500" />
        };
      case 'INPROGRESS':
        return {
          label: 'En curso',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          icon: <FaTools className="text-blue-500" />
        };
      case 'COMPLETED':
        return {
          label: 'Finalizado',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: <FaCalendarAlt className="text-green-500" />
        };
      case 'CANCELED':
        return {
          label: 'Cancelado',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: <FaCalendarAlt className="text-red-500" />
        };
      default:
        return {
          label: 'Desconocido',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: <FaCalendarAlt className="text-gray-500" />
        };
    }
  };

  // Función para obtener color de fondo según el índice o tipo de operación
  const getCardBackgroundColor = (operation: Operation, index: number) => {
    // Colores base para alternar entre las tarjetas
    const baseColors = [
      'from-blue-50 to-indigo-50', 
      'from-purple-50 to-pink-50', 
      'from-emerald-50 to-teal-50', 
      'from-amber-50 to-orange-50',
      'from-sky-50 to-cyan-50',
      'from-lime-50 to-green-50',
      'from-fuchsia-50 to-violet-50',
      'from-rose-50 to-red-50'
    ];
    
    return baseColors[index % baseColors.length];
  };

  // Obtener color de borde según el estado
  const getBorderColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'border-yellow-200';
      case 'INPROGRESS':
        return 'border-blue-200';
      case 'COMPLETED':
        return 'border-green-200';
      case 'CANCELED':
        return 'border-red-200';
      default:
        return 'border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl shadow-md border border-gray-100 text-center py-16">
        <FaTools className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h4 className="text-xl font-medium text-gray-500 mb-2">Sin operaciones asignadas</h4>
        <p className="text-gray-400">
          Este trabajador no tiene operaciones asignadas actualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado de la sección con estilo similar a las secciones de información personal */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100">
        <h4 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-blue-200 flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3 shadow-sm">
            <FaTasks className="text-blue-600" />
          </div>
          <span>Operaciones Asignadas</span>
        </h4>

        <div className="space-y-4">
          {operations.map((operation, index) => {
            const statusConfig = getStatusConfig(operation.status);
            const gradientColors = getCardBackgroundColor(operation, index);
            const borderColor = getBorderColor(operation.status);
            
            return (
              <div 
                key={operation.id}
                className={`bg-gradient-to-r ${gradientColors} rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border ${borderColor}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h5 className="text-lg font-semibold mr-3 text-gray-800">{operation.task?.name || operation.client?.name || 'Operación sin título'}</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} border border-opacity-20 shadow-sm flex items-center`}>
                        {statusConfig.icon}
                        <span className="ml-1">{statusConfig.label}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                      {/* Embarcación */}
                      <div className="flex">
                        <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                          <FaShip className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700 mb-1">Embarcación</p>
                          <p className="text-gray-800 font-semibold">{operation.motorShip || 'Sin embarcación'}</p>
                        </div>
                      </div>
                      
                      {/* Zona */}
                      <div className="flex">
                        <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                          <FaMapMarkerAlt className="text-violet-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-violet-700 mb-1">Zona</p>
                          <p className="text-gray-800 font-semibold">{operation.zone || 'Sin zona'}</p>
                        </div>
                      </div>
                      
                      {/* Fecha */}
                      <div className="flex">
                        <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                          <FaCalendarAlt className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-700 mb-1">Fecha</p>
                          <p className="text-gray-800 font-semibold">
                            {operation.dateStart 
                              ? format(new Date(operation.dateStart), 'dd MMM yyyy', { locale: es })
                              : 'Fecha no definida'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Área */}
                      {operation.jobArea && (
                        <div className="flex">
                          <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                            <FaTools className="text-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-amber-700 mb-1">Área</p>
                            <p className="text-gray-800 font-semibold">{operation.jobArea.name}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xl font-bold text-blue-600 bg-white px-3 py-1 rounded-full shadow-sm border border-blue-100 flex items-center justify-center min-w-[48px] h-[48px]">
                    #{operation.id}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}