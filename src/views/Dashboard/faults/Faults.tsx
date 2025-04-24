import { useMemo, useState } from "react";
import { Fault, FaultType } from "@/core/model/fault";
import { AiOutlineSearch } from "react-icons/ai";
import { FiFilter } from "react-icons/fi";
import { BsEye, BsPencil, BsTrash } from "react-icons/bs";
import { TableAction } from "@/components/ui/DataTable";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FaultsList } from "@/components/ui/faults/FaultList";
import { useFaults } from "@/contexts/FaultContext";
import { useWorkers } from "@/contexts/WorkerContext";
import Swal from "sweetalert2";
import { faultService } from "@/services/faultService";
import { AddFaultDialog } from "@/components/ui/faults/AddFaultDialog";

export default function Faults() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isAddFaultOpen, setIsAddFaultOpen] = useState(false);
  
  const { faults, refreshFaults, isLoading } = useFaults();
  const { workers } = useWorkers();

  // Filtrar faltas basadas en la búsqueda y el filtro de tipo
  const filteredFaults = useMemo(() => {
    return faults.filter((fault) => {
      // Filtrar por término de búsqueda
      const matchesSearch =
        !searchTerm ||
        (fault.worker?.name && 
          fault.worker.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fault.worker?.dni && 
          fault.worker.dni.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fault.description &&
          fault.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtrar por tipo
      const matchesType = 
        typeFilter === "all" || 
        fault.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [faults, searchTerm, typeFilter]);

  // Manejadores para las acciones
  const handleViewFault = (fault: Fault) => {
    Swal.fire({
      title: 'Detalle de la Falta',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Trabajador:</strong> ${fault.worker?.name || 'No disponible'}</p>
          <p class="mb-2"><strong>DNI:</strong> ${fault.worker?.dni || 'No disponible'}</p>
          <p class="mb-2"><strong>Tipo:</strong> ${getFaultTypeLabel(fault.type)}</p>
          <p class="mb-2"><strong>Fecha:</strong> ${format(new Date(fault.createAt), 'dd/MM/yyyy', { locale: es })}</p>
          <p class="mb-2"><strong>Descripción:</strong></p>
          <p class="p-2 bg-gray-100 rounded">${fault.description || 'Sin descripción'}</p>
        </div>
      `,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3085d6'
    });
  };
  
  const handleEditFault = (fault: Fault) => {
    console.log("Editar falta:", fault);
    // Implementar lógica de edición
  };
  
  const handleDeleteFault = async (fault: Fault) => {
    const result = await Swal.fire({
      title: '¿Eliminar registro de falta?',
      text: `¿Estás seguro de eliminar la falta de ${fault.worker?.name || 'este trabajador'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });
    
    if (result.isConfirmed) {
      try {
        await faultService.deleteFault(fault.id);
        await refreshFaults();
        Swal.fire(
          'Eliminada',
          'La falta ha sido eliminada correctamente',
          'success'
        );
      } catch (error) {
        console.error("Error al eliminar falta:", error);
        Swal.fire(
          'Error',
          'No se pudo eliminar la falta',
          'error'
        );
      }
    }
  };

  // Función para obtener etiqueta de tipo de falta
  const getFaultTypeLabel = (type: string): string => {
    switch (type) {
      case FaultType.INASSISTANCE:
        return "Inasistencia";
      case FaultType.IRRESPECTFUL:
        return "Irrespeto";
      case FaultType.ABANDONMENT:
        return "Abandono";
      default:
        return type || "Desconocido";
    }
  };

  // Manejador para guardar una nueva falta
  const handleSaveFault = async (faultData: any) => {
    try {
      await faultService.createFault(faultData);
      await refreshFaults();
      setIsAddFaultOpen(false);
      Swal.fire({
        icon: 'success',
        title: 'Falta registrada',
        text: 'Se ha registrado la falta correctamente'
      });
    } catch (error) {
      console.error('Error al registrar la falta:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar la falta. Intente nuevamente.'
      });
    }
  };

  // Definir columnas para exportación
  const faultExportColumns: ExcelColumn[] = useMemo(
    () => [
      { header: "Documento", field: "worker.dni" },
      { header: "Trabajador", field: "worker.name" },
      {
        header: "Tipo",
        field: "type",
        value: (fault) => getFaultTypeLabel(fault.type),
      },
      { header: "Descripción", field: "description" },
      {
        header: "Fecha",
        field: "createAt",
        value: (fault) =>
          format(new Date(fault.createAt), "dd/MM/yyyy", { locale: es }),
      },
    ],
    []
  );

  // Acciones para la tabla de faltas
  const faultActions: TableAction<Fault>[] = useMemo(
    () => [
      {
        label: "Ver detalles",
        icon: <BsEye className="h-4 w-4" />,
        onClick: handleViewFault,
        className: "text-blue-600",
      },
      {
        label: "Editar",
        icon: <BsPencil className="h-4 w-4" />,
        onClick: handleEditFault,
        className: "text-gray-700",
      },
      {
        label: "Eliminar",
        icon: <BsTrash className="h-4 w-4" />,
        onClick: handleDeleteFault,
        className: "text-red-600",
      },
    ],
    []
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        {/* Encabezado */}
        <SectionHeader
          title="Registro de Faltas"
          subtitle="Gestión de faltas y amonestaciones de trabajadores"
          btnAddText="Registrar Nueva Falta"
          handleAddArea={() => setIsAddFaultOpen(true)}
          refreshData={() => Promise.resolve(refreshFaults())}
          loading={isLoading}
          exportData={filteredFaults}
          exportFileName="registro_faltas"
          exportColumns={faultExportColumns}
          currentView="faults"
        />

        {/* Barra de filtros */}
        <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
          <div className="flex flex-wrap gap-4 items-center p-2 w-full">
            <div className="flex-grow max-w-md">
              <div className="relative">
                <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de trabajador o DNI"
                  className="p-2 pl-10 w-full border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute left-3 top-3">
                  <FiFilter className="h-5 w-5 text-blue-500" />
                </div>
                <select
                  className="pl-10 pr-10 py-2.5 w-60 appearance-none border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm text-gray-700 font-medium"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    backgroundImage: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                  }}
                >
                  <option value="all">Todos los tipos</option>
                  <option value={FaultType.INASSISTANCE}>Inasistencias</option>
                  <option value={FaultType.IRRESPECTFUL}>Irrespeto</option>
                  <option value={FaultType.ABANDONMENT}>Abandono</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
            
            {(searchTerm || typeFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                }}
                className="text-sm flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de faltas */}
      <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-white">
          <FaultsList
            filteredFaults={filteredFaults}
            searchTerm={searchTerm}
          />
        </div>
      </div>
      
      {/* Diálogo para añadir nueva falta */}
      <AddFaultDialog 
        open={isAddFaultOpen}
        onOpenChange={setIsAddFaultOpen}
        onSave={handleSaveFault}
        workers={workers}
      />
    </div>
  );
}