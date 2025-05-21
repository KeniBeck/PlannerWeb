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

// Estructura para mostrar solo los campos necesarios desde Excel
interface ContainerProgramItem {
  solicitudServicio: string;
  servicio: string;
  fechaInicio: string;
  ubicacion: string;
  cliente: string;
}

export default function Containers() {
  // Usar el contexto de programación
  const { programming, createBulkProgramming, isLoading: isContextLoading, refreshProgramming } = useProgramming();
  
  // Estados locales
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("view"); // "view" o "import"
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar datos al iniciar
  useEffect(() => {
    loadInitialData();
  }, []);

  // Función para cargar datos iniciales
  const loadInitialData = async () => {
    try {
      await refreshProgramming();
    } catch (error) {
      console.error("Error al cargar programación inicial:", error);
    }
  };

  // Filtrar programaciones por término de búsqueda
  const filteredProgramming = programming.filter(item => 
    item.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.service_request?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ubication?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar importación exitosa
  const handleImportSuccess = async () => {
    await refreshProgramming();
    setActiveTab("view");
    StatusSuccessAlert("Éxito", "Programación importada correctamente");
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
            refreshData={refreshProgramming}
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
                programmingData={filteredProgramming} 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isLoading={isContextLoading}
                refreshData={refreshProgramming}
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