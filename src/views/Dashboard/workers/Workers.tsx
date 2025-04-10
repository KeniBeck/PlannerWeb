import { useWorkers } from "@/lib/hooks/useWorkers";
import { AddWorkerDialog } from "@/components/ui/AddWorkerDialog";
import { AiOutlineSearch, AiOutlineUserAdd, AiOutlineDownload, AiOutlineReload } from "react-icons/ai";
import { FiFilter } from "react-icons/fi";
import { useWorkersFilter, WorkerViewTab } from "@/lib/hooks/useWorkersFilter";
import { useWorkersView } from "@/lib/hooks/useWorkersView";
import { WorkersList } from "@/components/ui/WorkerList";
import { FaultsList } from "@/components/ui/FaultList";
import { Worker } from "@/core/model/worker";
import { Fault } from "@/core/model/fault";

export default function Workers() {
    const {
        allWorkers,
        availableWorkers,
        assignedWorkers,
        deactivatedWorkers,
        incapacitatedWorkers,
        faults
    } = useWorkers();

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

    // Controlador para el cambio de pestaña
    const handleTabChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setActiveTab(e.target.value as WorkerViewTab);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="rounded-xl shadow-md">
                {/* Header mejorado y moderno */}
                <header className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-md">
                    <div>
                        <h1 className="text-3xl font-bold">Trabajadores</h1>
                        <p className="text-blue-100 mt-1 font-light">
                            Gestión de personal y registro de faltas
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
                        >
                            <AiOutlineReload className="h-5 w-5" />
                        </button>

                        <button
                            className="bg-white text-blue-700 border-none hover:bg-blue-50 shadow-sm ml-2 rounded-md flex gap-1 items-center p-2 transition-all"
                            onClick={() => setIsAddWorkerOpen(true)}
                        >
                            <AiOutlineUserAdd className="mr-2" /> Agregar Trabajador
                        </button>
                    </div>
                </header>

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
            {/* Vista principal */}
            {activeTab && (
                <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
                    <div className="bg-white">
                        {currentView.type === 'workers' ? (
                            <WorkersList workers={currentView.items as Worker[]} />
                        ) : (
                            <FaultsList faults={currentView.items as Fault[]} />
                        )}
                    </div>
                </div>
            )}

            <AddWorkerDialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen} />
        </div>
    );
}