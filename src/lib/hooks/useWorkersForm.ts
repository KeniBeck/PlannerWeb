import { useState, useMemo } from "react";
import { Worker } from "@/core/model/worker";

export function useWorkersForm(formData: any, setFormData: any, availableWorkers: Worker[]) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [selectedTab, setSelectedTab] = useState("individual");
    const [currentGroup, setCurrentGroup] = useState({
      workers: [] as number[],
      dateStart: "",
      dateEnd: "",
      timeStart: "",
      timeEnd: "",
      id_task: null as number | null,
    });
    const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(null);
  
    // Obtener todos los trabajadores ya asignados a grupos
    const workersInGroups = useMemo(() => {
      const ids = new Set<number>();
      formData.groups.forEach((group: any) => {
        if (Array.isArray(group.workers)) {
          group.workers.forEach((id: number) => {
            ids.add(id);
          });
        }
      });
      return ids;
    }, [formData.groups]);
    
    // Trabajadores disponibles para selección individual (excluye a los que están en grupos)
    const workersForIndividualSelection = useMemo(() => {
      return availableWorkers.filter(worker => 
        worker.name.toLowerCase().includes(searchTerm.toLowerCase())  
        // && !workersInGroups.has(worker.id)
      );
    }, [availableWorkers, searchTerm, workersInGroups]);
    
    // Trabajadores disponibles para grupos (Modificado para incluir todos los trabajadores)
    const workersForGroupSelection = useMemo(() => {
      return availableWorkers.filter(worker => 
        worker.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [availableWorkers, searchTerm]);
  
    // Manejar selección de trabajadores individuales
    const handleWorkerSelection = (workerId: number, selected: boolean) => {
      const newWorkerIds = selected 
        ? [...formData.workerIds, workerId]
        : formData.workerIds.filter((id: number) => id !== workerId);
      
      setFormData({ ...formData, workerIds: newWorkerIds });
    };
  
    // Manejar selección de trabajadores para un grupo
    const handleGroupWorkerSelection = (workerId: number, selected: boolean) => {
      if (selected) {
        if (!currentGroup.workers.includes(workerId)) {
          setCurrentGroup({
            ...currentGroup,
            workers: [...currentGroup.workers, workerId]
          });
        }
      } else {
        setCurrentGroup({
          ...currentGroup,
          workers: currentGroup.workers.filter(id => id !== workerId)
        });
      }
    };
  
    // Remover un trabajador específico de un grupo existente
    const removeWorkerFromGroup = (groupIndex: number, workerId: number) => {
      const newGroups = [...formData.groups];
      
      // Quitar el trabajador del grupo
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        workers: newGroups[groupIndex].workers.filter((id: number) => id !== workerId)
      };
      
      // Comprobar si este trabajador estaba originalmente en la operación
      const originalWorkerIds = formData.originalWorkerIds || [];
      const removedWorkerIds = formData.removedWorkerIds || [];
      
      // Si estaba en los originales y no está ya en los eliminados, añadirlo
      if (originalWorkerIds.includes(workerId) && !removedWorkerIds.includes(workerId)) {
        // Actualizar el estado con los nuevos grupos y añadir el ID a los trabajadores a eliminar
        setFormData({
          ...formData,
          groups: newGroups,
          removedWorkerIds: [...removedWorkerIds, workerId]
        });
      } else {
        // Si no estaba en los originales, solo actualizar los grupos
        setFormData({ ...formData, groups: newGroups });
      }
    };

    const duplicateWorkerGroup = (index: number) => {
      const groupToDuplicate = { ...formData.groups[index] };
      
      // Si el grupo tiene workers como array de objetos, asegúrate de hacer una copia profunda
      const duplicatedGroup = {
        ...groupToDuplicate,
        workers: [...groupToDuplicate.workers], // Copia el array de workers
        // Opcionalmente puedes modificar algún dato si lo deseas
        // dateStart: "nueva fecha", // Si quieres cambiar algún valor
      };
      
      // Añadir el grupo duplicado a la lista de grupos
      setFormData({
        ...formData,
        groups: [...formData.groups, duplicatedGroup]
      });
    };
  
    // Iniciar la edición de un grupo existente
    const startEditingGroup = (groupIndex: number) => {
      const group = formData.groups[groupIndex];
      setCurrentGroup({
        workers: [...group.workers],
        dateStart: group.dateStart || "",
        dateEnd: group.dateEnd || "",
        timeStart: group.timeStart || "",
        timeEnd: group.timeEnd || "",
        id_task: group.id_task || null,
      });
      setEditingGroupIndex(groupIndex);
      setShowGroupForm(true);
    };
  
  
    const addOrUpdateWorkerGroup = () => {
      if (currentGroup.workers.length > 0 && currentGroup.dateStart && currentGroup.timeStart) {
        const newGroups = [...formData.groups];
        
        // Asegurar el formato consistente para el nuevo grupo
        const formattedGroup = {
          workers: [...currentGroup.workers],
          workerIds: [...currentGroup.workers], // Asegurar que ambos formatos existen
          dateStart: currentGroup.dateStart,
          dateEnd: currentGroup.dateEnd || null,
          timeStart: currentGroup.timeStart,
          timeEnd: currentGroup.timeEnd || null,
          id_task: currentGroup.id_task || null,
          // No incluir groupId para grupos nuevos, solo para los que estamos editando
          ...(editingGroupIndex !== null && formData.groups[editingGroupIndex]?.groupId 
              ? {groupId: formData.groups[editingGroupIndex].groupId} 
              : {})
        };
        
        if (editingGroupIndex !== null) {
          // Actualizar grupo existente
          newGroups[editingGroupIndex] = formattedGroup;
        } else {
          // Crear nuevo grupo - no incluir groupId
          newGroups.push(formattedGroup);
        }
        
        setFormData({
          ...formData,
          groups: newGroups
        });
        
        
        // Resetear el formulario
        setCurrentGroup({
          workers: [],
          dateStart: "",
          dateEnd: "",
          timeStart: "",
          timeEnd: "",
          id_task: null,
        });
        setShowGroupForm(false);
        setEditingGroupIndex(null);
      }
    };
  
         // Eliminar un grupo completo y añadir sus trabajadores al array removedWorkerIds
      const removeWorkerGroup = (index: number) => {
        const newGroups = [...formData.groups];
        
        // Guardar los IDs de los trabajadores del grupo antes de eliminarlo
        const workersInGroup = newGroups[index].workers || [];
        
        
        // Eliminar el grupo
        newGroups.splice(index, 1);
        
        // Obtener los IDs de trabajadores originales y los ya marcados para eliminar
        const originalWorkerIds = Array.isArray(formData.originalWorkerIds) ? formData.originalWorkerIds : [];
        const removedWorkerIds = Array.isArray(formData.removedWorkerIds) ? formData.removedWorkerIds : [];
        
        // Verificar qué trabajadores del grupo eliminado estaban en la operación original
        // y agregarlos al array de removedWorkerIds si no están ya incluidos
        const newRemovedWorkerIds = [...removedWorkerIds];
        
        workersInGroup.forEach((workerId: number) => {
          if (originalWorkerIds.includes(workerId) && !newRemovedWorkerIds.includes(workerId)) {
            newRemovedWorkerIds.push(workerId);
          }
        });
        
        // Actualizar el estado con los nuevos grupos y los trabajadores a eliminar
        setFormData({
          ...formData,
          groups: newGroups,
          removedWorkerIds: newRemovedWorkerIds
        });
        
      };
    // Obtener nombre de trabajador por ID
    const getWorkerNameById = (id: number) => {
      const worker = availableWorkers.find(w => w.id === id);
      return worker ? worker.name : `Trabajador ${id}`;
    };
  
    // Cancelar edición de grupo
    const cancelGroupEditing = () => {
      setCurrentGroup({
        workers: [],
        dateStart: "",
        dateEnd: "",
        timeStart: "",
        timeEnd: "",
        id_task: null,
      });
      setShowGroupForm(false);
      setEditingGroupIndex(null);
    };

  return {
    // Estado
    searchTerm,
    showGroupForm, 
    selectedTab,
    currentGroup,
    editingGroupIndex,
    workersForIndividualSelection,
    workersForGroupSelection,
    
    // Setters
    setSearchTerm,
    setShowGroupForm,
    setSelectedTab,
    setCurrentGroup,
    setEditingGroupIndex,
    cancelGroupEditing,    
    // Acciones
    handleWorkerSelection,
    handleGroupWorkerSelection,
    removeWorkerFromGroup,
    startEditingGroup,
    addOrUpdateWorkerGroup,
    removeWorkerGroup,
    getWorkerNameById,
    duplicateWorkerGroup,
  };
}