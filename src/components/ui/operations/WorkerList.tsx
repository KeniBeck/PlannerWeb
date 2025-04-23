import { Worker } from "@/core/model/worker";

interface WorkersListProps {
  workers: Worker[];
  selectedIds: number[];
  onSelectionChange: (id: number, selected: boolean) => void;
  searchTerm: string;
}

export const WorkersList: React.FC<WorkersListProps> = ({
  workers,
  selectedIds,
  onSelectionChange,
  searchTerm
}) => {
  return (
    <div className="max-h-58 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <h4 className="font-medium text-gray-700">
          Trabajadores Disponibles
        </h4>
      </div>
      
      <div className="p-1 max-h-64 overflow-y-auto">
        {workers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {workers.map(worker => (
              <label 
                key={worker.id} 
                className={`flex items-center p-3 rounded-lg transition cursor-pointer ${
                  selectedIds.includes(worker.id)
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(worker.id)}
                  onChange={(e) => onSelectionChange(worker.id, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3 flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{worker.name}</span>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            {searchTerm 
              ? "No se encontraron trabajadores con ese nombre" 
              : "No hay trabajadores disponibles"}
          </div>
        )}
      </div>
    </div>
  );
};