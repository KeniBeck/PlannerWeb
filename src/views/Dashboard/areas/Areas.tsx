import { useState, useMemo } from "react";
import { Area } from "@/core/model/area";
import { AiOutlineSearch } from "react-icons/ai";
import { BsPencil, BsTrash } from "react-icons/bs";
import { HiOutlineBan, HiOutlineRefresh } from "react-icons/hi";
import { DataTable, TableColumn, TableAction } from "@/components/ui/DataTable";
import { AddAreaDialog } from "@/components/ui/areas/AddAreaDialog";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { useAreas } from "@/contexts/AreasContext";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { useWorkers } from "@/contexts/WorkerContext";
import { ActivateItemAlert, DeactivateItemAlert, DeleteItemAlert,  } from "@/components/dialog/CommonAlertActive"; 

export default function Areas() {
  const { areas, loading, addArea, updateArea, deleteArea, refreshData } = useAreas();
  const { workers, isLoading: workersLoading } = useWorkers();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState<Area | undefined>(undefined);
  
  // Estados para los diálogos de confirmación
  const [areaToActivate, setAreaToActivate] = useState<Area | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);

  // Filtrar áreas según el término de búsqueda
  const filteredAreas = useMemo(() => 
    areas.filter(area => 
      area.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [areas, searchTerm]
  );

  // Calcular el conteo de trabajadores por área
  const workerCountByArea = useMemo(() => {
    const counts: Record<number, number> = {};
    
    // Inicializar contadores en 0 para todas las áreas
    areas.forEach(area => {
      counts[area.id] = 0;
    });
    
    // Contar trabajadores por área
    workers.forEach(worker => {
      if (worker.jobArea && worker.jobArea.id) {
        counts[worker.jobArea.id] = (counts[worker.jobArea.id] || 0) + 1;
      }
    });
    
    return counts;
  }, [areas, workers]);

  // Manejar la edición de un área
  const handleEditArea = (area: Area) => {
    setAreaToEdit(area);
    setIsAddAreaOpen(true);
  };

  // Manejar guardar un área (nueva o editada)
  const handleSaveArea = (area: Omit<Area, "id"> & { id?: number }) => {
    // Agregar nueva área
    addArea(area);
    StatusSuccessAlert("Éxito", "Área agregada correctamente");
  };

  // Manejar el click en la acción de eliminar área (abre diálogo)
  const handleDeleteClick = (area: Area) => {
    setAreaToDelete(area);
  };

  // Confirmar la eliminación de un área
  const confirmDeleteArea = () => {
    if (!areaToDelete) return;
    
    updateArea({
      ...areaToDelete,
      status: "INACTIVE"
    });
    StatusSuccessAlert("Éxito", "Área eliminada correctamente");
  };

  // Manejar el click en la acción de activar área (abre diálogo)
  const handleActivateClick = (area: Area) => {
    setAreaToActivate(area);
  };

  // Confirmar la activación de un área
  const confirmActivateArea = () => {
    if (!areaToActivate) return;
    
    updateArea({
      ...areaToActivate,
      status: "ACTIVE"
    });
    StatusSuccessAlert("Éxito", "Área activada correctamente");
  };

  // Manejador para abrir diálogo de nueva área
  const handleAddArea = () => {
    setAreaToEdit(undefined); // Resetear el área a editar
    setIsAddAreaOpen(true);
  };

  // Definir las columnas para la tabla
  const columns: TableColumn<Area>[] = useMemo(() => [
    { 
      header: "ID", 
      accessor: "id", 
      className: "font-medium"
    },
    { 
      header: "Nombre", 
      accessor: "name" 
    },
    {
      header: "Estado",
      accessor: "status",
      cell: (area) => {
        const isActive = area.status === "ACTIVE";
        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${isActive 
              ? "bg-green-100 text-green-800 border border-green-300" 
              : "bg-orange-100 text-orange-600 border border-orange-300"}`}
          >
            <span className="flex items-center">
              <span className={`h-2 w-2 mr-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-orange-500"}`}></span>
              {isActive ? "Activo" : "Inactivo"}
            </span>
          </span>
        );
      }
    },
    {
      header: "Total Trabajadores",
      accessor: "id",
      sortable: false,
      cell: (area) => {
        const count = workerCountByArea[area.id] || 0;
        const badgeColor = count > 0 ? "bg-blue-500" : "bg-gray-300";
        
        return (
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full ${badgeColor} mr-2`}></div>
            <span className="text-gray-600">
              {count} {count === 1 ? "trabajador" : "trabajadores"}
            </span>
          </div>
        );
      }
    }
  ], [workerCountByArea]);

  // Definir acciones de la tabla
  const actions: TableAction<Area>[] = useMemo(() => [
    {
      label: "Editar",
      icon: <BsPencil className="h-4 w-4" />,
      onClick: handleEditArea,
      className: "text-blue-600 hover:bg-blue-50"
    },
    {
      label: (area) => area.status === "ACTIVE" ? "Eliminar" : "Activar",
      icon: (area) => area.status === "ACTIVE" 
        ? <HiOutlineBan className="h-4 w-4" /> 
        : <HiOutlineRefresh className="h-4 w-4" />,
      onClick: (area) => area.status === "ACTIVE" 
        ? handleDeleteClick(area) 
        : handleActivateClick(area),
      className: (area) => area.status === "ACTIVE" 
        ? "text-orange-600 hover:bg-red-50" 
        : "text-green-600 hover:bg-green-50"
    }
  ], []);

  // Definir las columnas para exportar áreas
  const areaExportColumns: ExcelColumn[] = useMemo(() => [
    { header: 'ID', field: 'id' },
    { header: 'Nombre', field: 'name' },
    { header: 'Estado', field: 'status' }
  ], []);

  return (
    <>
      <div className="container mx-auto py-6 space-y-6">
        <div className="rounded-xl shadow-md">
          {/* Header */}
          <SectionHeader
            title="Áreas"
            subtitle="Gestión de áreas"
            btnAddText="Agregar Área"
            handleAddArea={handleAddArea}
            refreshData={refreshData}
            loading={loading}
            exportData={filteredAreas}
            exportFileName="areas"
            exportColumns={areaExportColumns}
            currentView="areas"
          />
          
          {/* Filtros */}
          <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
            <div className="flex gap-4 items-center p-2">
              <div>
                <div className="relative">
                  <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre"
                    className="p-2 pl-10 w-80 border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla principal */}
        <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-white p-4">
            <DataTable
              data={filteredAreas}
              columns={columns}
              actions={actions}
              isLoading={loading}
              itemsPerPage={10}
              itemName="áreas"
              initialSort={{ key: 'id', direction: 'asc' }}
              emptyMessage="No se encontraron áreas"
            />
          </div>
        </div>

        {/* Diálogo para agregar/editar área */}
        <AddAreaDialog
          open={isAddAreaOpen}
          onOpenChange={setIsAddAreaOpen}
          area={areaToEdit}
          onSave={handleSaveArea}
        />
      </div>

      {/* Diálogos de confirmación */}
      <ActivateItemAlert
        open={!!areaToActivate}
        onOpenChange={(open: any) => !open && setAreaToActivate(null)}
        onConfirm={confirmActivateArea}
        itemName="área"
        isLoading={loading}
      />

      <DeactivateItemAlert
        open={!!areaToDelete}
        onOpenChange={(open : any) => !open && setAreaToDelete(null)}
        onConfirm={confirmDeleteArea}
        itemName="área"
        isLoading={loading}
      />
    </>
  );
}