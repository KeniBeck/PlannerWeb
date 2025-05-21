import { Worker } from "@/core/model/worker";
import { HiOutlineUserGroup } from "react-icons/hi";
import { useWorkersForm } from "@/lib/hooks/useWorkersForm";
import { WorkersTabHeader } from "./WorkersTabHeader";
import { IndividualWorkersTab } from "./IndividualWorkersTab";
import { GroupsWorkersTab } from "./GroupWorkersTab";

interface WorkersFormProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  availableWorkers: Worker[];
}

export default function WorkersForm({
  formData,
  setFormData,
  errors,
  availableWorkers
}: WorkersFormProps) {
  const {
    searchTerm,
    showGroupForm,
    selectedTab,
    currentGroup,
    workersForIndividualSelection,
    workersForGroupSelection,
    
    setSearchTerm,
    setSelectedTab,
    
    handleWorkerSelection,
    handleGroupWorkerSelection,
    removeWorkerFromGroup,
    startEditingGroup,
    addOrUpdateWorkerGroup,
    removeWorkerGroup,
    getWorkerNameById,
    editingGroupIndex,
    setEditingGroupIndex,
    setCurrentGroup,
    setShowGroupForm,
    cancelGroupEditing,
    duplicateWorkerGroup,
  } = useWorkersForm(formData, setFormData, availableWorkers);

  return (
    <div className="space-y-1">
      {/* Header con tabs */}
      <div className="flex flex-col space-y-2">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <HiOutlineUserGroup className="mr-2 text-blue-600" />
          Asignación de Personal
        </h3>
        
        <WorkersTabHeader 
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          workerIdsCount={formData.workerIds.length}
          groupsCount={formData.groups.length}
        />
      </div>
      
      {selectedTab === "individual" ? (
        <IndividualWorkersTab 
          formData={formData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleWorkerSelection={handleWorkerSelection}
          getWorkerNameById={getWorkerNameById}
          workersForIndividualSelection={workersForIndividualSelection}
          errors={errors}
        />
      ) : (
        <GroupsWorkersTab 
          formData={formData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showGroupForm={showGroupForm}
          currentGroup={currentGroup}
          editingGroupIndex={editingGroupIndex}
          workersForGroupSelection={workersForGroupSelection}
          getWorkerNameById={getWorkerNameById}
          setCurrentGroup={setCurrentGroup}
          setEditingGroupIndex={setEditingGroupIndex}
          setShowGroupForm={setShowGroupForm}
          handleGroupWorkerSelection={handleGroupWorkerSelection}
          removeWorkerFromGroup={removeWorkerFromGroup}
          startEditingGroup={startEditingGroup}
          addOrUpdateWorkerGroup={addOrUpdateWorkerGroup}
          removeWorkerGroup={removeWorkerGroup}
          cancelGroupEditing={cancelGroupEditing}
          errors={errors}
          duplicateWorkerGroup={duplicateWorkerGroup}
        />
      )}
    </div>
  );
}