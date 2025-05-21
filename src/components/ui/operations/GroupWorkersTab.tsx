import { Worker } from "@/core/model/worker";
import { GroupsList } from "./GroupList";
import { GroupForm } from "./GroupForm";

interface GroupsWorkersTabProps {
  formData: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showGroupForm: boolean;
  currentGroup: any;
  editingGroupIndex: number | null;
  workersForGroupSelection: Worker[];
  getWorkerNameById: (id: number) => string;
  setCurrentGroup: (group: any) => void;
  setEditingGroupIndex: (index: number | null) => void;
  setShowGroupForm: (show: boolean) => void;
  handleGroupWorkerSelection: (id: number, selected: boolean) => void;
  removeWorkerFromGroup: (groupIndex: number, workerId: number) => void;
  startEditingGroup: (index: number) => void;
  addOrUpdateWorkerGroup: () => void;
  removeWorkerGroup: (index: number) => void;
  cancelGroupEditing: () => void;
  duplicateWorkerGroup: (index: number) => void;
  errors: any;
}

export const GroupsWorkersTab: React.FC<GroupsWorkersTabProps> = ({
  formData,
  searchTerm,
  setSearchTerm,
  showGroupForm,
  currentGroup,
  editingGroupIndex,
  workersForGroupSelection,
  getWorkerNameById,
  setCurrentGroup,
  setEditingGroupIndex,
  setShowGroupForm,
  handleGroupWorkerSelection,
  removeWorkerFromGroup,
  startEditingGroup,
  addOrUpdateWorkerGroup,
  removeWorkerGroup,
  cancelGroupEditing,
  duplicateWorkerGroup,
  errors
}) => {
  return (
    <div className="space-y-3 max-h-[70vh]  pb-4">
      {/* Lista de grupos */}
      <GroupsList 
        groups={formData.groups}
        showGroupForm={showGroupForm}
        getWorkerNameById={getWorkerNameById}
        startEditingGroup={startEditingGroup}
        removeWorkerGroup={removeWorkerGroup}
        removeWorkerFromGroup={removeWorkerFromGroup}
        duplicateWorkerGroup={duplicateWorkerGroup}
        onCreateGroup={() => {
          setCurrentGroup({
            workers: [],
            dateStart: "",
            dateEnd: "",
            timeStart: "",
            timeEnd: ""
          });
          setEditingGroupIndex(null);
          setShowGroupForm(true);
        }}
      />
      
      {/* Formulario para crear o editar grupo */}
      {showGroupForm && (
        <GroupForm 
          currentGroup={currentGroup}
          editingGroupIndex={editingGroupIndex}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          workersForGroupSelection={workersForGroupSelection}
          getWorkerNameById={getWorkerNameById}
          setCurrentGroup={setCurrentGroup}
          handleGroupWorkerSelection={handleGroupWorkerSelection}
          addOrUpdateWorkerGroup={addOrUpdateWorkerGroup}
          cancelGroupEditing={cancelGroupEditing}
        />
      )}
      
      {errors.workers && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <span className="mr-2">•</span>
          {errors.workers}
        </p>
      )}
    </div>
  );
};