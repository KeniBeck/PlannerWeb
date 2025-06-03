import { useState, useEffect } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { ShipLoader } from "@/components/dialog/Loading";
import { format } from "date-fns";
import { useProgramming } from "@/contexts/ProgrammingContext";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { ImportSection } from "@/components/ui/programming/ImportSection";
import { ProgrammingList } from "@/components/ui/programming/ProgrammingList";
import { CreateProgrammingModal } from "@/components/ui/programming/CreateProgrammingModal";
import { useOverdueProgrammingNotifications } from "@/lib/hooks/useProgrammingNotifications";
import { Programming } from "@/core/model/programming";

export default function Containers() {
  // Usar el contexto de programación
  const {
    programming,
    createBulkProgramming,
    createProgramming,
    updateProgramming, // 🆕 Agregar función de actualización
    isLoading: isContextLoading,
    refreshProgramming,
    deleteProgramming,
  } = useProgramming();

  // Estados locales
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // 🆕 Estados para edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProgramming, setEditingProgramming] = useState<Programming | null>(null);
  
  useOverdueProgrammingNotifications();

  // Cargar datos SOLO cuando se monta este componente específico
  useEffect(() => {
    if (!hasInitialLoad) {
      loadInitialData();
      setHasInitialLoad(true);
    }
  }, [hasInitialLoad]);

  // Función para cargar datos iniciales con fecha de hoy
  const loadInitialData = async () => {
    try {
      console.log("📅 Containers - Cargando datos iniciales para hoy");
      const today = new Date();
      const todayFormatted = format(today, "yyyy-MM-dd");
      setDateFilter(todayFormatted);
      await refreshProgramming("", todayFormatted, "");
    } catch (error) {
      console.error(
        "❌ Containers - Error al cargar programación inicial:",
        error
      );
    }
  };

  // Manejar importación exitosa
  const handleImportSuccess = async () => {
    await refreshProgramming(searchTerm, dateFilter, statusFilter);
    setActiveTab("view");
    StatusSuccessAlert("Éxito", "Programación importada correctamente");
  };

  // función para manejar eliminación
  const handleDeleteProgramming = async (id: number) => {
    try {
      const success = await deleteProgramming(id);
      if (success) {
        // Refrescar datos después de eliminar
        await refreshProgramming(searchTerm, dateFilter, statusFilter);
      }
    } catch (error) {
      console.error("❌ Error al eliminar programación:", error);
    }
  };

  // 🆕 Función para manejar edición
  const handleEditProgramming = (programming: Programming) => {
    console.log("✏️ Containers - Iniciando edición:", programming);
    setEditingProgramming(programming);
    setShowEditModal(true);
  };

  // Función para crear programación
  const handleCreateProgramming = async (programmingData: any) => {
    try {
      setIsLoading(true);

      const success = await createProgramming(programmingData);

      if (success) {
        setShowCreateModal(false);
        // Refrescar datos después de crear
        await refreshProgramming(searchTerm, dateFilter, statusFilter);
        return true;
      } else {
        console.log("❌ Containers - Error al crear programación");
        return false;
      }
    } catch (error) {
      console.error("❌ Containers - Error al crear programación:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 Función para actualizar programación
  const handleUpdateProgramming = async (programmingData: any) => {
    if (!editingProgramming || !updateProgramming) return false;

    try {
      setIsLoading(true);
      console.log("🔄 Containers - Actualizando programación:", programmingData);

      const success = await updateProgramming(editingProgramming.id!, {
        ...programmingData,
        id: editingProgramming.id,
      });

      if (success) {
        setShowEditModal(false);
        setEditingProgramming(null);
        // Refrescar datos después de actualizar
        await refreshProgramming(searchTerm, dateFilter, statusFilter);
        return true;
      } else {
        console.log("❌ Containers - Error al actualizar programación");
        return false;
      }
    } catch (error) {
      console.error("❌ Containers - Error al actualizar programación:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar búsqueda y filtros
  const handleFiltersChange = async (
    newSearchTerm: string,
    newDateFilter: string,
    newStatusFilter?: string
  ) => {
    console.log("🔄 Containers - Cambiando filtros:", {
      newSearchTerm,
      newDateFilter,
      newStatusFilter: newStatusFilter || "(sin filtro de estado)",
    });

    setSearchTerm(newSearchTerm);
    setDateFilter(newDateFilter);
    setStatusFilter(newStatusFilter || "");

    await refreshProgramming(
      newSearchTerm,
      newDateFilter,
      newStatusFilter || ""
    );
  };

  // Función para limpiar filtros
  const handleClearFilters = async () => {
    console.log("🧹 Containers - Limpiando TODOS los filtros");

    setSearchTerm("");
    setDateFilter("");
    setStatusFilter("");

    await refreshProgramming("", "", "");
  };

  return (
    <>
      {(isLoading || isContextLoading) && <ShipLoader />}

      <div className="container mx-auto py-6 space-y-6">
        <div className="rounded-xl shadow-md">
          <SectionHeader
            title="Programación del Cliente"
            subtitle="Gestión de programación de servicios desde clientes"
            btnAddText="Nueva Programación"
            handleAddArea={() => setShowCreateModal(true)}
            refreshData={async () => {
              await refreshProgramming(searchTerm, dateFilter, statusFilter);
            }}
            loading={isLoading || isContextLoading}
            showAddButton={true}
            showDownloadButton={false}
          />

          {/* Tabs para alternar entre vista e importación */}
          <div className="bg-white p-6 rounded-b-xl shadow-sm">
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex -mb-px space-x-8">
                <button
                  onClick={() => setActiveTab("view")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "view"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Ver Programación
                </button>
                <button
                  onClick={() => setActiveTab("import")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "import"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Importar Desde Excel
                </button>
              </nav>
            </div>

            {activeTab === "view" ? (
              <ProgrammingList
                programmingData={programming}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                isLoading={isContextLoading}
                refreshData={async () => {
                  await refreshProgramming(
                    searchTerm,
                    dateFilter,
                    statusFilter
                  );
                }}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                onDelete={handleDeleteProgramming}
                onEdit={handleEditProgramming} // 🆕 Pasar función de edición
              />
            ) : (
              <ImportSection
                setIsLoading={setIsLoading}
                createBulkProgramming={createBulkProgramming}
                onImportSuccess={handleImportSuccess}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear programación */}
      <CreateProgrammingModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProgramming}
        isLoading={isLoading}
      />

      {/* 🆕 Modal para editar programación */}
      <CreateProgrammingModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProgramming(null);
        }}
        onSubmit={handleUpdateProgramming}
        isLoading={isLoading}
        initialData={editingProgramming} // 🆕 Pasar datos iniciales
        isEditMode={true} // 🆕 Indicar que es modo edición
      />
    </>
  );
}