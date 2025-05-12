import { useEffect, useState } from 'react';
import { FaUtensils, FaTimes, FaUserCheck, FaCheck } from 'react-icons/fa';
import { feedingService } from '@/services/feedingService';
import { determineEligibleFoods } from '@/lib/utils/feedingutils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';

interface FeedingOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: any;
}

export function FeedingOperationDialog({
  open,
  onOpenChange,
  operation
}: FeedingOperationDialogProps) {
  const [feedings, setFeedings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWorkers, setCurrentWorkers] = useState<any[]>([]);
  const [eligibleFood, setEligibleFood] = useState<string>("");
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  
  useEffect(() => {
    if (open && operation) {
      loadData();
    }
  }, [open, operation]);
  
 const loadData = async () => {
  setLoading(true);
  try {
    // Cargar alimentaciones existentes
    const feedingsData = await feedingService.getOperationFeedings(operation.id);
    setFeedings(feedingsData);
    
    // Determinar comida elegible actual
    const foods = determineEligibleFoods(
      operation.timeStrat || operation.timeStart, 
      operation.timeEnd
    );
    
    // Obtener el tipo de comida elegible actual
    const currentEligibleFood = foods[0] !== "Sin alimentación" && 
                               foods[0] !== "Sin alimentación actual" ? 
                               foods[0] : "";
    
    setEligibleFood(currentEligibleFood);
    
    
    const workers: any[] = [];
    if (currentEligibleFood && operation.workerGroups && Array.isArray(operation.workerGroups)) {
      operation.workerGroups.forEach((group: any) => {
        if (group.workers && Array.isArray(group.workers)) {
          group.workers.forEach((worker: any) => {
            // Verificar si este trabajador ya recibió la comida actual
            // ⚠️ Cambiado: usar id_worker en lugar de workerId
            const alreadyReceived = feedingsData.some(
              f => f.type === currentEligibleFood && f.id_worker === worker.id
            );
            
            if (!alreadyReceived) {
              workers.push(worker);
            }
          });
        }
      });
    }
    
    setCurrentWorkers(workers);
  } catch (error) {
    console.error("Error cargando datos de alimentación:", error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron cargar los datos de alimentación',
      icon: 'error'
    });
  } finally {
    setLoading(false);
  }
};
  
  const handleAssignFeeding = async () => {
    if (!selectedWorkerId || !eligibleFood) return;
    
    setLoading(true);
    try {
      const result = await feedingService.assignFeeding(
       {
        operationId: operation.id, 
        workerId: selectedWorkerId, 
        type: eligibleFood
       });
      
      if (result) {
        await loadData(); // Recargar datos
        Swal.fire({
          title: 'Éxito',
          text: `Alimentación asignada correctamente`,
          icon: 'success'
        });
        setSelectedWorkerId(null);
      }
    } catch (error) {
      console.error("Error asignando alimentación:", error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo asignar la alimentación',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!open) return null;


  function getFeedingType(type: string) {
    switch (type) {
      case 'BREAKFAST':
        return 'Desayuno';
      case 'LUNCH':
        return 'Almuerzo';
      case 'DINNER':
        return 'Cena';
      case 'SNACK':
        return 'Media noche';
      default:
        return '';
    }
  }

  
  const getWorkerNameById = (workerId: number): string => {
    // Buscar trabajador en todos los grupos
    if (operation.workerGroups && Array.isArray(operation.workerGroups)) {
      for (const group of operation.workerGroups) {
        if (group.workers && Array.isArray(group.workers)) {
          const worker = group.workers.find((w: any) => w.id === workerId);
          if (worker) return worker.name;
        }
      }
    }
    return `Trabajador #${workerId}`;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl transform transition-all mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center">
                <FaUtensils className="mr-2" />
                Alimentación - Operación #{operation.id}
              </h3>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-white hover:text-amber-200 focus:outline-none"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
            
              {/* Comida elegible actual */}
              {eligibleFood ? (
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-green-800 flex items-center">
                        <FaUtensils className="mr-2" /> 
                        Comida Elegible: {getFeedingType(eligibleFood)}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">Puede asignar esta comida a los trabajadores de la operación</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-600">No hay comidas elegibles en este momento</h4>
                  <p className="text-sm text-gray-500 mt-1">La operación no califica para alimentación actualmente</p>
                </div>
              )}


                       
            {/* Comidas ya asignadas */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Alimentación Asignada</h4>
              
              {feedings.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      {/* Eliminar este console.log */}
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trabajador</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {feedings.map((feeding) => (
                        <tr key={feeding.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{getFeedingType(feeding.type)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
  {feeding.id_worker ? getWorkerNameById(feeding.id_worker) : 'No asignado'}
</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {/* Usar createAt en lugar de dateFeeding */}
                            {feeding.createAt ? format(new Date(feeding.createAt), "dd/MM/yyyy HH:mm", { locale: es }) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">No hay registros de alimentación para esta operación</p>
                </div>
              )}
            </div>
              {/* Asignar alimentación */}
              {eligibleFood && currentWorkers.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Asignar {getFeedingType(eligibleFood)}</h4>
                  
                  <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="worker-select">
                        Seleccionar Trabajador
                      </label>
                      <select
                        id="worker-select"
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        value={selectedWorkerId || ''}
                        onChange={(e) => setSelectedWorkerId(Number(e.target.value))}
                      >
                        <option value="">Seleccione un trabajador</option>
                        {currentWorkers.map((worker) => (
                          <option key={worker.id} value={worker.id}>
                            {worker.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="sm:self-end">
                      <button
                        type="button"
                        onClick={handleAssignFeeding}
                        disabled={!selectedWorkerId || loading}
                        className={`w-full sm:w-auto px-5 py-2 rounded-md text-white font-medium flex items-center justify-center 
                          ${!selectedWorkerId || loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-amber-600 hover:bg-amber-700'}`}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Procesando...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FaUserCheck className="mr-2" />
                            Asignar Alimentación
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {eligibleFood && currentWorkers.length === 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <p className="text-yellow-800">
                    Todos los trabajadores de esta operación ya han recibido su {eligibleFood}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-all focus:outline-none"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}