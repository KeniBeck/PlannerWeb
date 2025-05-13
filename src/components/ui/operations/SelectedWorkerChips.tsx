import { HiOutlineUserGroup, HiX } from "react-icons/hi";

interface SelectedWorkerChipsProps {
  selectedWorkerIds: number[];
  getWorkerNameById: (id: number) => string;
  onRemove: (id: number) => void;
  bgColor?: string;
}

export const SelectedWorkerChips: React.FC<SelectedWorkerChipsProps> = ({
  selectedWorkerIds,
  getWorkerNameById,
  onRemove,
  bgColor = "bg-blue-50"
}) => {
  return (
    <div className={`${bgColor} rounded-lg p-3 border border-blue-100`}>
      <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
        <HiOutlineUserGroup className="mr-1.5" />
        Trabajadores Seleccionados ({selectedWorkerIds.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {selectedWorkerIds.map((id: number) => (
          <div 
            key={id}
            className="flex items-center bg-white text-blue-800 text-sm px-2.5 py-1 rounded-md border border-blue-200 shadow-sm"
          >
            <span>{getWorkerNameById(id)}</span>
            <button
              type="button"
              onClick={() => onRemove(id)}
              className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors"
              title="Eliminar trabajador"
            >
              <HiX className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};