import { useEffect, useState } from 'react';
import { Operation } from '@/core/model/operation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaTools, FaCalendarAlt, FaMapMarkerAlt, FaShip } from 'react-icons/fa';
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
        // Aquí deberías llamar a tu API para obtener las operaciones del trabajador
        // Este es un ejemplo, ajústalo según tu API
        const response = await operationService.getOperationByIdWithWorkers(workerId);
        setOperations(response || []);
        setError(null);
      } catch (err) {
        console.error('Error al cargar las operaciones:', err);
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
        };
      case 'INPROGRESS':
        return {
          label: 'En curso',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
        };
      case 'COMPLETED':
        return {
          label: 'Finalizado',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
        };
      case 'CANCELED':
        return {
          label: 'Cancelado',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
        };
      default:
        return {
          label: 'Desconocido',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
        };
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
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center py-16">
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
      <h4 className="text-xl font-semibold text-gray-800 mb-4">
        Operaciones Asignadas
      </h4>

      <div className="grid grid-cols-1 gap-4">
        {operations.map((operation) => {
          const statusConfig = getStatusConfig(operation.status);
          
          return (
            <div 
              key={operation.id}
              className="bg-white rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h5 className="text-lg font-semibold mr-3">{operation.task.name || 'Operación sin título'}</h5>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaShip className="mr-2 text-blue-500" />
                      <span>{operation.motorShip || 'Sin embarcación'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-blue-500" />
                      <span>{operation.zone || 'Sin zona'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <span>
                        {operation.dateStart 
                          ? format(new Date(operation.dateStart), 'dd MMM yyyy', { locale: es })
                          : 'Fecha no definida'}
                      </span>
                    </div>
                    
                    {operation.jobArea && (
                      <div className="flex items-center">
                        <FaTools className="mr-2 text-blue-500" />
                        <span>{operation.jobArea.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-2xl font-bold text-blue-600">
                  #{operation.id}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}