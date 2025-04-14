import { useMemo, useState } from "react";
import { Worker, WorkerStatus } from "@/core/model/worker";
import { Fault, FaultType } from "@/core/model/fault";
import { useWorkers } from "@/contexts/WorkerContext";
import { useWorkersFilter, WorkerViewTab } from "@/lib/hooks/useWorkersFilter";
import { useWorkersView } from "@/lib/hooks/useWorkersView";
import { AddWorkerDialog } from "@/components/ui/AddWorkerDialog";
import { AiOutlineSearch } from "react-icons/ai";
import { FiFilter } from "react-icons/fi";
import { BsPencil, BsTrash, BsEye } from "react-icons/bs";
import { DataTable, TableColumn, TableAction } from "@/components/ui/DataTable";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Workers() {
  const {
    workers,
    availableWorkers,
    assignedWorkers,
    deactivatedWorkers,
    incapacitatedWorkers,
    refreshWorkers,
  } = useWorkers();

  const [faults] = useState<Fault[]>([
    //datos de faltas o un arreglo vacío si las obtendrás de otro contexto
  ]);

  // Todas las distintas categorías de trabajadores
  const allWorkers = workers;

  // Hook para el filtrado y búsqueda
  const {
    searchTerm,
    activeTab,
    filteredAllWorkers,
    filteredAvailableWorkers,
    filteredAssignedWorkers,
    filteredDeactivatedWorkers,
    filteredIncapacitatedWorkers,
    filteredFaults,
    setSearchTerm,
    setActiveTab,
  } = useWorkersFilter<Worker, Fault>(
    allWorkers,
    availableWorkers,
    assignedWorkers,
    deactivatedWorkers,
    incapacitatedWorkers,
    faults
  );

  // Hook para la vista y acciones
  const {
    isAddWorkerOpen,
    setIsAddWorkerOpen,
    getCurrentView,
  } = useWorkersView(
    filteredAllWorkers,
    filteredAvailableWorkers,
    filteredAssignedWorkers,
    filteredDeactivatedWorkers,
    filteredIncapacitatedWorkers,
    filteredFaults,
    activeTab
  );

  const currentView = getCurrentView();

  // Manejadores de acciones para los trabajadores
  const handleEditWorker = (worker: Worker) => {
    // Implementación para editar un trabajador
    console.log("Editar trabajador:", worker);
  };

  const handleDeleteWorker = (workerId: number) => {
    // Implementación para eliminar un trabajador
    if (window.confirm("¿Estás seguro de que quieres dar de baja a este trabajador?")) {
      console.log("Dar de baja al trabajador:", workerId);
    }
  };

  // Manejador para detalles de faltas
  const handleViewFault = (fault: Fault) => {
    // Implementación para ver detalles de una falta
    console.log("Ver detalles de falta:", fault);
  };

  // Definir columnas para la tabla de trabajadores
  const workerColumns: TableColumn<Worker>[] = useMemo(() => [
    { 
      header: "Código", 
      accessor: "code", 
      className: "font-medium" 
    },
    { 
      header: "Nombre", 
      accessor: "name" 
    },
    { 
      header: "Teléfono", 
      accessor: "phone" 
    },
    { 
      header: "DNI", 
      accessor: "dni" 
    },
    { 
      header: "Fecha Inicio", 
      accessor: "createAt",
      cell: (worker) => worker.createAt 
        ? format(new Date(worker.createAt), "dd/MM/yyyy", { locale: es }) 
        : 'N/A'
    },
    { 
      header: "Área", 
      accessor: "jobArea.name",
      cell: (worker) => (
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
          {worker.jobArea?.name || "Sin área"}
        </div>
      )
    },
    { 
      header: "Estado", 
      accessor: "status",
      cell: (worker) => {
        let statusText = "";
        let bgColor = "";
        let textColor = "";
        
        switch(worker.status) {
          case WorkerStatus.AVAILABLE:
            statusText = "Disponible";
            bgColor = "bg-green-100";
            textColor = "text-green-800";
            break;
          case WorkerStatus.ASSIGNED:
            statusText = "Asignado";
            bgColor = "bg-blue-100";
            textColor = "text-blue-800";
            break;
          case WorkerStatus.DEACTIVATED:
            statusText = "Retirado";
            bgColor = "bg-gray-100";
            textColor = "text-gray-800";
            break;
          case WorkerStatus.UNAVAILABLE:
            statusText = "Deshabilitado";
            bgColor = "bg-red-100";
            textColor = "text-red-800";
            break;
          case WorkerStatus.INCAPACITATED:
            statusText = "Incapacitado";
            bgColor = "bg-yellow-100";
            textColor = "text-yellow-800";
            break;
          default:
            statusText = "Desconocido";
            bgColor = "bg-gray-100";
            textColor = "text-gray-800";
        }
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${bgColor} ${textColor}`}>
            {statusText}
          </span>
        );
      }
    },
  ], []);

  // Acciones para la tabla de trabajadores
  const workerActions: TableAction<Worker>[] = useMemo(() => [
    {
      label: "Editar",
      icon: <BsPencil className="h-4 w-4" />,
      onClick: handleEditWorker,
      className: "text-gray-700"
    },
    {
      label: "Dar de baja",
      icon: <BsTrash className="h-4 w-4" />,
      onClick: (worker) => handleDeleteWorker(worker.id),
      className: "text-red-600"
    }
  ], []);

  // Definir columnas para la tabla de faltas
  const faultColumns: TableColumn<Fault>[] = useMemo(() => [
    { 
      header: "Documento", 
      accessor: "worker.dni",
      className: "font-medium"
    },
    { 
      header: "Trabajador", 
      accessor: "worker.name" 
    },
    { 
      header: "Tipo", 
      accessor: "type",
      cell: (fault) => {
        let typeText = "";
        let bgColor = "";
        let textColor = "";
        
        switch(fault.type) {
          case FaultType.INASSISTANCE:
            typeText = "Ausencia";
            bgColor = "bg-red-100";
            textColor = "text-red-800";
            break;
          case FaultType.IRRESPECTFUL:
            typeText = "Irrespetuoso";
            bgColor = "bg-orange-100";
            textColor = "text-orange-800";
            break;
          case FaultType.ABANDONMENT:
            typeText = "Abandono";
            bgColor = "bg-gray-100";
            textColor = "text-gray-800";
            break;
          default:
            typeText = fault.type;
            bgColor = "bg-blue-100";
            textColor = "text-blue-800";
        }
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${bgColor} ${textColor}`}>
            {typeText}
          </span>
        );
      }
    },
    { 
      header: "Descripción", 
      accessor: "description",
      cell: (fault) => (
        <div className="max-w-xs truncate" title={fault.description}>
          {fault.description}
        </div>
      )
    },
    { 
      header: "Fecha", 
      accessor: "createdAt",
      cell: (fault) => format(new Date(fault.createdAt), "dd/MM/yyyy", { locale: es })
    }
  ], []);

  // Acciones para la tabla de faltas
  const faultActions: TableAction<Fault>[] = useMemo(() => [
    {
      label: "Ver detalles",
      icon: <BsEye className="h-4 w-4" />,
      onClick: handleViewFault,
      className: "text-blue-600"
    }
  ], []);
  
  // Definir columnas para exportar trabajadores
  const workerExportColumns: ExcelColumn[] = useMemo(() => [
    { header: 'Código', field: 'code' },
    { header: 'Nombre', field: 'name' },
    { header: 'Teléfono', field: 'phone' },
    { header: 'DNI', field: 'dni' },
    { 
      header: 'Fecha Inicio', 
      field: 'createAt',
      value: (worker) => worker.createAt 
        ? format(new Date(worker.createAt), "dd/MM/yyyy", { locale: es }) 
        : 'N/A'
    },
    { 
      header: 'Área', 
      field: 'jobArea.name'
    },
    { 
      header: 'Estado', 
      field: 'status',
      value: (worker) => {
        switch(worker.status) {
          case 'AVALIABLE': return 'Disponible';
          case 'ASSIGNED': return 'Asignado';
          case 'DEACTIVATED': return 'Retirado';
          case 'DISABLE': return 'Deshabilitado';
          case 'INCAPACITATED': return 'Incapacitado';
          default: return 'Desconocido';
        }
      }
    }
  ], []);

  // Definir columnas para exportar faltas
  const faultExportColumns: ExcelColumn[] = useMemo(() => [
    { header: 'Documento', field: 'worker.dni' },
    { header: 'Trabajador', field: 'worker.name' },
    { 
      header: 'Tipo', 
      field: 'type',
      value: (fault) => {
        switch(fault.type) {
          case 'INNASSISTENCE': return 'Ausencia';
          case 'IRRESPECTFUL': return 'Irrespetuoso';
          case 'OTHER': return 'Otro';
          default: return fault.type;
        }
      }
    },
    { header: 'Descripción', field: 'description' },
    { 
      header: 'Fecha', 
      field: 'createdAt',
      value: (fault) => format(new Date(fault.createdAt), "dd/MM/yyyy", { locale: es })
    }
  ], []);

  // Obtener las columnas correspondientes según la vista actual
  const currentExportColumns = useMemo(() => {
    return currentView.type === 'workers' ? workerExportColumns : faultExportColumns;
  }, [currentView.type, workerExportColumns, faultExportColumns]);

  // Controlador para el cambio de pestaña
  const handleTabChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveTab(e.target.value as WorkerViewTab);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        {/* Header mejorado con exportación personalizada */}
        <SectionHeader 
          title="Trabajadores"
          subtitle="Gestión de trabajadores y registro de faltas"
          btnAddText="Agregar Trabajador"
          handleAddArea={() => setIsAddWorkerOpen(true)}
          refreshData={() => Promise.resolve(refreshWorkers())}
          loading={false}
          exportData={currentView.items}
          exportFileName={`${currentView.type === 'workers' ? 'trabajadores' : 'faltas'}_${activeTab}`}
          exportColumns={currentExportColumns}
          currentView={currentView.type}
        />
        
        <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
          <div className="flex gap-4 items-center p-2">
            <div>
              <div className="relative">
                <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o cédula"
                  className="p-2 pl-10 w-80 border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative w-full">
                <div className="absolute left-3 top-3">
                  <FiFilter className="h-5 w-5 text-blue-500" />
                </div>
                <select
                  className="pl-10 pr-10 py-2.5 w-60 appearance-none border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm text-gray-700 font-medium"
                  value={activeTab}
                  onChange={handleTabChange}
                  style={{
                    backgroundImage: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                >
                  <option value="all">Todos</option>
                  <option value="assigned">Asignados</option>
                  <option value="available">Disponibles</option>
                  <option value="deactivated">Retirados</option>
                  <option value="incapacitated">Incapacitados</option>
                  <option value="faults">Faltas</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                  <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vista principal usando DataTable */}
      {activeTab && (
        <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-white p-4">
            {currentView.type === 'workers' ? (
              <DataTable
                data={currentView.items as Worker[]}
                columns={workerColumns}
                actions={workerActions}
                initialSort={{ key: 'code', direction: 'asc' }}
                itemsPerPage={10}
                itemName="trabajadores"
                emptyMessage="No se encontraron trabajadores"
              />
            ) : (
              <DataTable
                data={currentView.items as Fault[]}
                columns={faultColumns}
                actions={faultActions}
                initialSort={{ key: 'createdAt', direction: 'desc' }}
                itemsPerPage={5}
                itemName="faltas"
                emptyMessage="No se encontraron registros de faltas"
              />
            )}
          </div>
        </div>
      )}

      {/* Diálogos */}
      <AddWorkerDialog 
        open={isAddWorkerOpen} 
        onOpenChange={setIsAddWorkerOpen}
        areas={[{ id: 1, name: "Area 1" }, { id: 2, name: "Area 2" }]}
      />
    </div>
  );
}