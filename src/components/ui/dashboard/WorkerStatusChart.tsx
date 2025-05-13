interface WorkerStatusChartProps {
  availableWorkers: number;
  assignedWorkers: number;
  incapacitatedWorkers: number;
  totalWorkers: number;
}

export const WorkerStatusChart = ({
  availableWorkers,
  assignedWorkers,
  incapacitatedWorkers,
  totalWorkers,
}: WorkerStatusChartProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="font-bold text-lg text-gray-800 mb-6">
        Estado de Trabajadores
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Disponibles</span>
          <span className="text-sm font-medium">{availableWorkers}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{
              width: totalWorkers > 0 ? `${(availableWorkers / totalWorkers) * 100}%` : '0%',
            }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Asignados</span>
          <span className="text-sm font-medium">{assignedWorkers}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{
              width: totalWorkers > 0 ? `${(assignedWorkers / totalWorkers) * 100}%` : '0%',
            }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Incapacitados</span>
          <span className="text-sm font-medium">
            {incapacitatedWorkers}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-yellow-500 h-2.5 rounded-full"
            style={{
              width: totalWorkers > 0 ? `${(incapacitatedWorkers / totalWorkers) * 100}%` : '0%',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};