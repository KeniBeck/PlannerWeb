import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { AiOutlineUpload, AiOutlineDelete, AiOutlineSave, AiOutlineSearch } from "react-icons/ai";
import { FaRegFileExcel, FaClock } from "react-icons/fa";
import { BsCheckCircle, BsXCircle, BsClockHistory } from "react-icons/bs";
import SectionHeader from "@/components/ui/SectionHeader";
import { ShipLoader } from "@/components/dialog/Loading";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { excelDateToJSDate } from "@/lib/utils/formatDate";
import { useProgramming } from "@/contexts/ProgrammingContext";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { Programming } from "@/core/model/programming";
import Swal from "sweetalert2";
import { ImportSection } from "@/components/ui/programming/ImportSection";
import { ProgrammingList } from "@/components/ui/programming/ProgrammingList";


export default function Containers() {
  // Usar el contexto de programación
  const { programming, createBulkProgramming, isLoading: isContextLoading, refreshProgramming } = useProgramming();
  
  // Estados locales
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("view"); // "view" o "import"
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Nuevo estado para filtro de estado
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

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
      console.error("❌ Containers - Error al cargar programación inicial:", error);
    }
  };

  // Manejar importación exitosa
  const handleImportSuccess = async () => {
    await refreshProgramming(searchTerm, dateFilter, statusFilter);
    setActiveTab("view");
    StatusSuccessAlert("Éxito", "Programación importada correctamente");
  };

  // Función para manejar búsqueda y filtros - ACTUALIZADA
  const handleFiltersChange = async (newSearchTerm: string, newDateFilter: string, newStatusFilter?: string) => {
    console.log("🔄 Containers - Cambiando filtros:", { 
      newSearchTerm, 
      newDateFilter, 
      newStatusFilter: newStatusFilter || "(sin filtro de estado)" 
    });
    
    setSearchTerm(newSearchTerm);
    setDateFilter(newDateFilter);
    setStatusFilter(newStatusFilter || "");
    
    await refreshProgramming(newSearchTerm, newDateFilter, newStatusFilter || "");
  };

  // Función para limpiar filtros - ACTUALIZADA
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
            btnAddText=""
            handleAddArea={() => {}}
            refreshData={async () => { await refreshProgramming(searchTerm, dateFilter, statusFilter); }}
            loading={isLoading || isContextLoading}
            showAddButton={false}
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
                refreshData={async () => { await refreshProgramming(searchTerm, dateFilter, statusFilter); }}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
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
    </>
  );
}