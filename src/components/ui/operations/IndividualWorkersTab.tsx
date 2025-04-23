import { HiOutlineUserGroup, HiOutlineSearch, HiX } from "react-icons/hi";
import { Worker } from "@/core/model/worker";
import { WorkersList } from "./WorkerList";
import { SelectedWorkerChips } from "./SelectedWorkerChips";

interface IndividualWorkersTabProps {
  formData: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleWorkerSelection: (id: number, selected: boolean) => void;
  getWorkerNameById: (id: number) => string;
  workersForIndividualSelection: Worker[];
  errors: any;
}

export const IndividualWorkersTab: React.FC<IndividualWorkersTabProps> = ({
  formData,
  searchTerm,
  setSearchTerm,
  handleWorkerSelection,
  getWorkerNameById,
  workersForIndividualSelection,
  errors
}) => {
  return (
    <div className="space-y-3">
      {/* Lista de trabajadores individuales ya seleccionados */}
      {formData.workerIds.length > 0 && (
        <SelectedWorkerChips 
          selectedWorkerIds={formData.workerIds}
          getWorkerNameById={getWorkerNameById}
          onRemove={(id) => handleWorkerSelection(id, false)}
        />
      )}

      {/* Buscador de trabajadores */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiOutlineSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar trabajadores..."
          className="pl-10 pr-4 py-2.5 w-full rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
        />
      </div>
      
      {/* Lista de trabajadores */}
      <WorkersList 
        workers={workersForIndividualSelection}
        selectedIds={formData.workerIds}
        onSelectionChange={handleWorkerSelection}
        searchTerm={searchTerm}
      />
      
      {errors.workers && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center">
          <span className="mr-1.5">•</span>
          {errors.workers}
        </p>
      )}
    </div>
  );
};