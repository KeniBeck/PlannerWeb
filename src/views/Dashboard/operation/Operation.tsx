import { useState } from "react";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { AiOutlineSearch } from "react-icons/ai";
import { FiFilter } from "react-icons/fi";
import { OperationList } from "@/components/ui/OperationList";
import { useOperations } from "@/contexts/OperationContext";
import { Operation as OperationModel } from "@/core/model/operation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Operation() {
  // Estado para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Obtener datos de operaciones del contexto
  const {
    operations,
    isLoading,
    error, 
    refreshOperations,
    totalItems,
  } = useOperations();

  // Filtrar operaciones según término de búsqueda y filtro de estado
  const filteredOperations = operations.filter(operation => {
    // Filtrar por término de búsqueda (nombre, área, cliente, embarcación...)
    const searchMatch = !searchTerm || 
      operation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.jobArea?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.motorship?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.id?.toString().includes(searchTerm);
    
    // Filtrar por estado
    const statusMatch = statusFilter === "all" || operation.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  // Manejadores para ver, editar y eliminar operaciones
  const handleViewOperation = (operation: OperationModel) => {
    console.log("Ver detalles:", operation);
    // Implementar navegación a detalles o abrir modal
  };

  const handleEditOperation = (operation: OperationModel) => {
    console.log("Editar operación:", operation);
    // Implementar navegación o abrir modal de edición
  };

  const handleDeleteOperation = (operation: OperationModel) => {
    if (window.confirm(`¿Estás seguro de eliminar la operación "${operation.name}"?`)) {
      console.log("Eliminar operación:", operation.id);
      // Implementar eliminación
    }
  };

  // Columnas para exportación a Excel
  const exportColumns: ExcelColumn[] = [
    { header: "ID", field: "id" },
    { header: "Nombre", field: "name" },
    { header: "Área", field: "area.name", value: (op) => op.area?.name || "Sin área" },
    { header: "Cliente", field: "client.name", value: (op) => op.client?.name || "Sin cliente" },
    { header: "Fecha Inicio", field: "startDate", value: (op) => 
      op.startDate ? format(new Date(op.startDate), "dd/MM/yyyy", { locale: es }) : "N/A" },
    { header: "Hora Inicio", field: "startTime" },
    { header: "Fecha Fin", field: "endDate", value: (op) => 
      op.endDate ? format(new Date(op.endDate), "dd/MM/yyyy", { locale: es }) : "N/A" },
    { header: "Embarcación", field: "motorship", value: (op) => op.motorship || "N/A" },
    { header: "Estado", field: "status", value: (op) => {
      switch (op.status) {
        case "PENDING": return "Pendiente";
        case "INPROGRESS": return "En Curso";
        case "COMPLETED": return "Finalizado";
        case "CANCELED": return "Cancelado";
        default: return op.status || "Desconocido";
      }
    }}
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        <SectionHeader
          title="Operaciones"
          subtitle="Gestión de operaciones, agrega, edita o elimina operaciones"
          btnAddText="Agregar Operación"
          handleAddArea={() => {
            console.log("Abrir modal para agregar operación");
            // Implementar apertura de modal o navegación
          }}
          refreshData={() => Promise.resolve(refreshOperations())}
          loading={isLoading}
          exportData={filteredOperations}
          exportFileName="operaciones"
          exportColumns={exportColumns}
          currentView="operations"
        />
        <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
          <div className="flex gap-4 items-center p-2">
            <div>
              <div className="relative">
                <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, área, cliente o embarcación"
                  className="p-2 pl-10 w-80 border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Filtro por estado */}
            <div className="flex gap-3">
              <div className="relative w-full">
                <div className="absolute left-3 top-3">
                  <FiFilter className="h-5 w-5 text-blue-500" />
                </div>
                <select
                  className="pl-10 pr-10 py-2.5 w-60 appearance-none border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm text-gray-700 font-medium"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    backgroundImage: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                  }}
                >
                  <option value="all">Todos los estados</option>
                  <option value="PENDING">Pendientes</option>
                  <option value="INPROGRESS">En curso</option>
                  <option value="COMPLETED">Finalizadas</option>
                  <option value="CANCELED">Canceladas</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabla de operaciones */}
      <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-white">
          <OperationList
            filteredOperations={filteredOperations}
            searchTerm={searchTerm}
            onView={handleViewOperation}
            onEdit={handleEditOperation}
            onDelete={handleDeleteOperation}
          />
        </div>
      </div>
    </div>
  );
}