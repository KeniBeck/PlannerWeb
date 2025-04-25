import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaExclamationTriangle, FaCalendarAlt, FaInfoCircle, FaUserClock } from 'react-icons/fa';
import { faultService } from '@/services/faultService';

export interface Incidence {
  id: number;
  type: string;
  description: string;
  createAt: string;
}

interface WorkerIncidencesListProps {
  workerId: number;
}

export function WorkerIncidencesList({ workerId }: WorkerIncidencesListProps) {
  const [incidences, setIncidences] = useState<Incidence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncidences = async () => {
      try {
        setLoading(true);
        const response = await faultService.getFaultByIdWorker(workerId);
        setIncidences(response || []);
        setError(null);
      } catch (err) {
        console.error('Error al cargar las incidencias:', err);
        setError('No se pudieron cargar las incidencias. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    // Comentado para evitar errores si aún no existe el endpoint
    fetchIncidences();
    
  }, [workerId]);

  // Función para obtener el tipo de incidencia en español
  const getIncidenceType = (type: string) => {
    switch (type) {
      case 'INASSISTANCE':
        return {
          label: 'Inasistencia',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: <FaUserClock className="h-5 w-5" />
        };
      case 'IRRESPECTFUL':
        return {
          label: 'Irrespeto',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          icon: <FaExclamationTriangle className="h-5 w-5" />
        };
      case 'OTHER':
        return {
          label: 'Otro',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: <FaInfoCircle className="h-5 w-5" />
        };
      default:
        return {
          label: 'Desconocido',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: <FaInfoCircle className="h-5 w-5" />
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

  if (incidences.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center py-16">
        <FaExclamationTriangle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h4 className="text-xl font-medium text-gray-500 mb-2">Sin incidencias registradas</h4>
        <p className="text-gray-400">
          Este trabajador no tiene faltas o incidencias registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h4 className="text-xl font-semibold text-gray-800 mb-4">
        Faltas e Incidencias
      </h4>

      <div className="space-y-4">
        {incidences.map((incidence) => {
          const incidenceType = getIncidenceType(incidence.type);
          
          return (
            <div 
              key={incidence.id}
              className="bg-white rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start">
                <div className={`rounded-full p-3 ${incidenceType.bgColor} ${incidenceType.color} mr-4`}>
                  {incidenceType.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-lg font-semibold">{incidenceType.label}</h5>
                    <span className="text-sm text-gray-500 flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      {format(new Date(incidence.createAt), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                  
                  <p className="text-gray-600">
                    {incidence.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}