import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaExclamationTriangle, FaCalendarAlt, FaInfoCircle, FaUserClock, FaExclamationCircle } from 'react-icons/fa';
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
          icon: <FaUserClock className="h-5 w-5" />,
          gradient: 'from-red-50 to-rose-50',
          border: 'border-red-200'
        };
      case 'IRRESPECTFUL':
        return {
          label: 'Irrespeto',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          icon: <FaExclamationTriangle className="h-5 w-5" />,
          gradient: 'from-orange-50 to-amber-50',
          border: 'border-orange-200'
        };
      case 'OTHER':
        return {
          label: 'Otro',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: <FaInfoCircle className="h-5 w-5" />,
          gradient: 'from-blue-50 to-sky-50',
          border: 'border-blue-200'
        };
      default:
        return {
          label: 'Desconocido',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: <FaInfoCircle className="h-5 w-5" />,
          gradient: 'from-gray-50 to-slate-50',
          border: 'border-gray-200'
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
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl shadow-md border border-gray-100 text-center py-16">
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
      {/* Encabezado de la sección con estilo similar a las secciones de información personal */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-50 p-6 rounded-xl shadow-md border border-gray-100">
        <h4 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
          <div className="bg-rose-100 p-2 rounded-full mr-3 shadow-sm">
            <FaExclamationCircle className="text-rose-600" />
          </div>
          <span>Faltas e Incidencias</span>
        </h4>

        <div className="space-y-4">
          {incidences.map((incidence) => {
            const incidenceType = getIncidenceType(incidence.type);
            
            return (
              <div 
                key={incidence.id}
                className={`bg-gradient-to-r ${incidenceType.gradient} rounded-lg shadow-md border ${incidenceType.border} p-4 hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start">
                  <div className="min-w-[40px] h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                    <span className={incidenceType.color}>{incidenceType.icon}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                      <h5 className="text-lg font-semibold text-gray-800 mr-3">{incidenceType.label}</h5>
                      <span className="text-sm text-gray-500 flex items-center mt-1 sm:mt-0">
                        <div className="min-w-[24px] h-6 bg-white rounded-full flex items-center justify-center mr-2 shadow-sm">
                          <FaCalendarAlt className="text-purple-500 text-xs" />
                        </div>
                        {format(new Date(incidence.createAt), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                    
                    <div className="bg-white/60 rounded-lg p-3 border border-gray-100 shadow-sm mt-2">
                      <p className="text-gray-700">
                        {incidence.description}
                      </p>
                    </div>
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