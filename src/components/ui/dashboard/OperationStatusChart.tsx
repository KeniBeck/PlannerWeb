import { Link } from "react-router-dom";
import { AiOutlineBarChart } from "react-icons/ai";

interface OperationStatusChartProps {
  totalPending: number;
  totalInProgress: number;
  totalCompleted: number;
}

export const OperationStatusChart = ({ 
  totalPending, 
  totalInProgress, 
  totalCompleted 
}: OperationStatusChartProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-800">
          Estado de Operaciones
        </h3>
        <Link
          to="/dashboard/reports"
          className="text-blue-600 text-sm flex items-center hover:underline"
        >
          Ver Reportes <AiOutlineBarChart className="ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <span className="text-2xl font-bold text-blue-600">
            {totalPending}
          </span>
          <p className="text-gray-600 text-sm mt-1">Pendientes</p>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <span className="text-2xl font-bold text-orange-500">
            {totalInProgress}
          </span>
          <p className="text-gray-600 text-sm mt-1">En curso</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <span className="text-2xl font-bold text-green-600">
            {totalCompleted}
          </span>
          <p className="text-gray-600 text-sm mt-1">Completadas</p>
        </div>
      </div>

      <div className="mt-4 relative pt-2">
        <div className="flex w-full h-4 bg-gray-100 rounded-full overflow-hidden">
          {(() => {
            const displayedTotal = totalPending + totalInProgress + totalCompleted;
            
            // Si no hay operaciones en los tres estados principales, mostramos partes iguales
            if (displayedTotal === 0) {
              return (
                <>
                  <div className="bg-blue-500 h-full" style={{ width: '33.33%' }}></div>
                  <div className="bg-orange-500 h-full" style={{ width: '33.33%' }}></div>
                  <div className="bg-green-500 h-full" style={{ width: '33.34%' }}></div>
                </>
              );
            }
            
            // Calculamos porcentajes ajustados para que sumen 100%
            const pendingPercentage = (totalPending / displayedTotal) * 100;
            const inProgressPercentage = (totalInProgress / displayedTotal) * 100;
            const completedPercentage = (totalCompleted / displayedTotal) * 100;
            
            return (
              <>
                {/* Pendientes (azul) */}
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${pendingPercentage}%` }}
                ></div>
                
                {/* En curso (naranja) */}
                <div
                  className="bg-orange-500 h-full"
                  style={{ width: `${inProgressPercentage}%` }}
                ></div>
                
                {/* Completadas (verde) */}
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${completedPercentage}%` }}
                ></div>
              </>
            );
          })()}
        </div>
        
        {/* Leyenda con espaciado proporcional */}
        <div className="flex mt-3 text-xs text-gray-500">
          {(() => {
            const displayedTotal = totalPending + totalInProgress + totalCompleted;
            
            // Si no hay operaciones, mostramos partes iguales
            if (displayedTotal === 0) {
              return (
                <>
                  <div className="flex items-center" style={{ width: '33.33%', minWidth: '60px' }}>
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1 flex-shrink-0"></div>
                    <span className="truncate">Pendientes</span>
                  </div>
                  <div className="flex items-center" style={{ width: '33.33%', minWidth: '60px' }}>
                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-1 flex-shrink-0"></div>
                    <span className="truncate">En curso</span>
                  </div>
                  <div className="flex items-center" style={{ width: '33.34%', minWidth: '60px' }}>
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1 flex-shrink-0"></div>
                    <span className="truncate">Completadas</span>
                  </div>
                </>
              );
            }
            
            // Calculamos porcentajes ajustados para la leyenda
            const pendingPercentage = (totalPending / displayedTotal) * 100;
            const inProgressPercentage = (totalInProgress / displayedTotal) * 100;
            const completedPercentage = (totalCompleted / displayedTotal) * 100;
            
            return (
              <>
                <div className="flex items-center" style={{ width: `${pendingPercentage}%`, minWidth: '60px' }}>
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-1 flex-shrink-0"></div>
                  <span className="truncate">Pendientes</span>
                </div>
                <div className="flex items-center" style={{ width: `${inProgressPercentage}%`, minWidth: '60px' }}>
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-1 flex-shrink-0"></div>
                  <span className="truncate">En curso</span>
                </div>
                <div className="flex items-center" style={{ width: `${completedPercentage}%`, minWidth: '60px' }}>
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1 flex-shrink-0"></div>
                  <span className="truncate">Completadas</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};