import { useState } from "react";
import { useAreas } from "@/lib/hooks/useAreas";
import { Area } from "@/core/model/area";
import { AreasList } from "@/components/ui/AreaList";
import { AddAreaDialog } from "@/components/ui/AddAreaDialog";
import { AiOutlineSearch, AiOutlinePlusCircle, AiOutlineDownload, AiOutlineReload } from "react-icons/ai";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";

export default function Areas() {
  const { areas, loading, addArea, updateArea, deleteArea, refreshData } = useAreas();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);
  const [areaToEdit, setAreaToEdit] = useState<Area | undefined>(undefined);

  // Filtrar áreas según el término de búsqueda
  const filteredAreas = areas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    // Aquí podrías mostrar una confirmación antes de eliminar
    if (window.confirm("¿Estás seguro de que quieres eliminar esta área?")) {
      deleteArea(areaId);
      StatusSuccessAlert("Éxito", "Área eliminada correctamente");
    }
  };

  // Manejador de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Manejador para abrir diálogo de nueva área
  const handleAddArea = () => {
    setAreaToEdit(undefined); // Resetear el área a editar
    setIsAddAreaOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        {/* Header */}
        <header className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-md">
          <div>
            <h1 className="text-3xl font-bold">Áreas</h1>
            <p className="text-blue-100 mt-1 font-light">
              Administración de áreas de trabajo
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              title="Exportar datos"
              className="p-2 rounded-lg bg-blue-500 bg-opacity-30 hover:bg-opacity-50 text-white transition-all shadow-sm"
            >
              <AiOutlineDownload className="h-5 w-5" />
            </button>

            <button
              title="Actualizar datos"
              className="p-2 rounded-lg bg-blue-500 bg-opacity-30 hover:bg-opacity-50 text-white transition-all shadow-sm"
              onClick={() => refreshData()}
              disabled={loading}
            >
              <AiOutlineReload className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              className="bg-white text-blue-700 border-none hover:bg-blue-50 shadow-sm ml-2 rounded-md flex gap-1 items-center p-2 transition-all"
              onClick={handleAddArea}
            >
              <AiOutlinePlusCircle className="mr-2" /> Agregar Área
            </button>
          </div>
        </header>

        {/* Búsqueda */}
        <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
          <div className="flex gap-4 items-center p-2">
            <div>
              <div className="relative">
                <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de área"
                  className="p-2 pl-10 w-80 border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vista principal */}
      <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando áreas...</p>
              </div>
            </div>
          ) : (
            <AreasList 
              areas={filteredAreas} 
              onEdit={handleEditArea} 
              onDelete={handleDeleteArea} 
            />
          )}
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