import { useState, useEffect } from "react";
import { Programming } from "@/core/model/programming";
import { AiOutlineSearch, AiOutlineReload, AiOutlineFilter } from "react-icons/ai";
import { BsCheckCircle, BsXCircle, BsClockHistory, BsFunnel } from "react-icons/bs";
import { FaRegFileExcel, FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateFilter } from "@/components/custom/filter/DateFilterProps";
import { StatusFilter } from "@/components/custom/filter/StatusFilterProps";

interface ProgrammingListProps {
  programmingData: Programming[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

export function ProgrammingList({ 
  programmingData, 
  searchTerm, 
  setSearchTerm,
  isLoading,
  refreshData
}: ProgrammingListProps) {
  const [displayLimit, setDisplayLimit] = useState(50);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Estados para formatear fecha del filtro
  const [formattedDateFilter, setFormattedDateFilter] = useState<string>("");
  
  // Efecto para inicializar la fecha de hoy
  useEffect(() => {
    // Establecer la fecha de hoy como valor inicial para el filtro de fecha
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");
    setDateFilter(formattedDate);
    setFormattedDateFilter(format(today, "dd/MM/yyyy", { locale: es }));
  }, []);

  // Función para formatear fecha
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "N/A";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };
  
  // Manejar cambio de fecha
  const handleDateChange = (date: string) => {
    setDateFilter(date);
    if (date) {
      try {
        const formattedDate = format(new Date(date), "dd/MM/yyyy", { locale: es });
        setFormattedDateFilter(formattedDate);
      } catch (error) {
        console.error("Error formateando fecha:", error);
      }
    } else {
      setFormattedDateFilter("");
    }
  };

  // Obtener configuración de estado
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETE":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
          icon: <BsCheckCircle className="w-4 h-4 mr-1.5 text-green-600" />,
          label: "Completado"
        };
      case "INCOMPLETE":
        return {
          bgColor: "bg-amber-100",
          textColor: "text-amber-800", 
          borderColor: "border-amber-200",
          icon: <BsClockHistory className="w-4 h-4 mr-1.5 text-amber-600" />,
          label: "Incompleto"
        };
      case "CANCELED":
        return {
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
          icon: <BsXCircle className="w-4 h-4 mr-1.5 text-red-600" />,
          label: "Cancelado"
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          icon: <BsClockHistory className="w-4 h-4 mr-1.5 text-gray-600" />,
          label: status || "Desconocido"
        };
    }
  };
  
  // Filtrar programación por todos los criterios (búsqueda, fecha y estado)
  const filteredData = programmingData.filter(item => {
    // Filtro por término de búsqueda
    const matchesSearch = 
      !searchTerm || 
      item.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.service_request?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ubication?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por fecha
    const matchesDate = 
      !dateFilter || 
      item.dateStart === dateFilter;
    
    // Filtro por estado
    const matchesStatus = 
      statusFilter === "all" || 
      item.status === statusFilter;
    
    return matchesSearch && matchesDate && matchesStatus;
  });
  
  // Verificar si hay filtros activos
  const hasActiveFilters = Boolean(dateFilter || statusFilter !== "all");
  
  // Limpiar filtros
  const clearFilters = () => {
    setDateFilter("");
    setFormattedDateFilter("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Panel de búsqueda y filtros */}
      <div className="flex flex-wrap gap-4 items-start mb-6">
        {/* Búsqueda */}
        <div className="relative w-full md:w-80">
          <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por servicio, cliente o ubicación..."
            className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filtro de fecha */}
        <div className="flex flex-col">
          {/* <label className="block text-xs font-medium text-gray-700 mb-1">Filtrar por fecha</label> */}
          <div className="relative">
            <DateFilter 
              label="Filtrar por fecha" 
              onChange={handleDateChange} 
              value={dateFilter}
            />
          </div>
        </div>
        
        {/* Filtro de estado */}
        <div className="flex flex-col">
          {/* <label className="block text-xs font-medium text-gray-700 mb-1">Filtrar por estado</label> */}
         <StatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "Todos", value: "all" },
            { label: "Completado", value: "COMPLETE" },
            { label: "Incompleto", value: "INCOMPLETE" },
            { label: "Cancelado", value: "CANCELED" }
          ]}
          />
        </div>
        
    
        
        {/* Botón para limpiar filtros - Solo visible si hay filtros activos */}
        {hasActiveFilters && (
          <div className="flex items-end h-full">
            <button
              onClick={clearFilters}
              className="flex items-center justify-center h-10 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              title="Limpiar filtros"
            >
              <AiOutlineFilter className="h-5 w-5 mr-1.5" />
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
      
      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
          <span className="font-medium">Filtros activos:</span>
          
          {dateFilter && (
            <div className="flex items-center bg-white px-2 py-1 rounded-full border border-blue-200">
              <FaCalendarAlt className="mr-1.5 text-blue-500 text-xs" />
              <span>{formattedDateFilter}</span>
              <button 
                className="ml-1.5 text-gray-400 hover:text-red-500"
                onClick={() => {
                  setDateFilter("");
                  setFormattedDateFilter("");
                }}
              >
                ✕
              </button>
            </div>
          )}
          
          {statusFilter !== "all" && (
            <div className="flex items-center bg-white px-2 py-1 rounded-full border border-blue-200">
              <BsFunnel className="mr-1.5 text-blue-500 text-xs" />
              <span>
                {statusFilter === "COMPLETE" ? "Completado" : 
                 statusFilter === "INCOMPLETE" ? "Incompleto" : 
                 statusFilter === "CANCELED" ? "Cancelado" : statusFilter}
              </span>
              <button 
                className="ml-1.5 text-gray-400 hover:text-red-500"
                onClick={() => setStatusFilter("all")}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tabla de programación */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <FaRegFileExcel className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay programación</h3>
            <p className="text-gray-500">
              {hasActiveFilters || searchTerm
                ? "No se encontraron resultados con los filtros aplicados"
                : "Aún no hay programación registrada. Importe desde Excel para comenzar."}
            </p>
            
            {(hasActiveFilters || searchTerm) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitud</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.slice(0, displayLimit).map((item) => {
                  const statusConfig = getStatusConfig(item.status);
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-[150px] truncate">{item.service_request || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.service}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(item.dateStart)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.timeStart || "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-[150px] truncate">{item.ubication}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-[150px] truncate">{item.client}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredData.length > displayLimit && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{Math.min(displayLimit, filteredData.length)}</span> de <span className="font-medium">{filteredData.length}</span> registros
                </p>
                <button
                  onClick={() => setDisplayLimit(prev => prev + 50)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cargar más
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}