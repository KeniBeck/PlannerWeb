import { useState, useMemo } from "react";
import { Area } from "@/core/model/area";
import { AiOutlineSearch } from "react-icons/ai";
import { BsPencil, BsTrash } from "react-icons/bs";
import { DataTable, TableColumn, TableAction } from "@/components/ui/DataTable";
import { AddAreaDialog } from "@/components/ui/AddAreaDialog";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { useAreas } from "@/contexts/AreasContext";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";

export default function Areas() {
  const { areas, loading, addArea, updateArea, deleteArea, refreshData } = useAreas();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState<Area | undefined>(undefined);

  // Filtrar áreas según el término de búsqueda
  const filteredAreas = useMemo(() => 
    areas.filter(area => 
      area.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [areas, searchTerm]
  );

  // Manejar la edición de un área
  const handleEditArea = (area: Area) => {
    setAreaToEdit(area);
    setIsAddAreaOpen(true);
  };

  // Manejar guardar un área (nueva o editada)
  const handleSaveArea = (area: Omit<Area, "id"> & { id?: number }) => {
    if (area.id) {
      // Actualizar área existente
      updateArea(area as Area);
      StatusSuccessAlert("Éxito", "Área actualizada correctamente");
    } else {
      // Agregar nueva área
      addArea(area);
      StatusSuccessAlert("Éxito", "Área agregada correctamente");
    }
  };

  // Manejar la eliminación de un área
  const handleDeleteArea = (areaId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta área?")) {
      deleteArea(areaId);
      StatusSuccessAlert("Éxito", "Área eliminada correctamente");
    }
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
      header: "Total Trabajadores",
      accessor: "id",
      sortable: false,
      cell: (area) => (
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
          {Math.floor(Math.random() * 20)} trabajadores {/* Ejemplo - reemplazar con datos reales */}
        </div>
      )
    }
  ], []);

  // Definir acciones de la tabla
  const actions: TableAction<Area>[] = useMemo(() => [
    {
      label: "Editar",
      icon: <BsPencil className="h-4 w-4" />,
      onClick: handleEditArea,
      className: "text-gray-700"
    },
    {
      label: "Eliminar",
      icon: <BsTrash className="h-4 w-4" />,
      onClick: (area) => handleDeleteArea(area.id),
      className: "text-red-600"
    }
  ], []);

  // Definir las columnas para exportar áreas
  const areaExportColumns: ExcelColumn[] = useMemo(() => [
    { header: 'ID', field: 'id' },
    { header: 'Nombre', field: 'name' }
  ], []);

  return (
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
  );
}