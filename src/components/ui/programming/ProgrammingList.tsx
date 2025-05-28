import { useState, useEffect } from "react";
import { Programming } from "@/core/model/programming";
import {
  AiOutlineSearch,
  AiOutlineReload,
  AiOutlineFilter,
} from "react-icons/ai";
import {
  BsCheckCircle,
  BsXCircle,
  BsClockHistory,
  BsFunnel,
} from "react-icons/bs";
import { FaRegFileExcel, FaCalendarAlt } from "react-icons/fa";
import { DateFilter } from "@/components/custom/filter/DateFilterProps";
import { StatusFilter } from "@/components/custom/filter/StatusFilterProps";
import { formatDate } from "@/lib/utils/formatDate";
import { bg } from "date-fns/locale";

interface ProgrammingListProps {
  programmingData: Programming[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateFilter: string;
  setDateFilter: (date: string) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  onFiltersChange: (
    searchTerm: string,
    dateFilter: string,
    statusFilter?: string
  ) => Promise<void>; // ACTUALIZADO
  onClearFilters: () => Promise<void>;
}

export function ProgrammingList({
  programmingData,
  searchTerm,
  setSearchTerm,
  dateFilter,
  setDateFilter,
  isLoading,
  refreshData,
  onFiltersChange,
  onClearFilters,
}: ProgrammingListProps) {
  const [displayLimit, setDisplayLimit] = useState(50);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [searchInput, setSearchInput] = useState("");

  // Estados para formatear fecha del filtro
  const [formattedDateFilter, setFormattedDateFilter] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Efecto para inicializar la fecha de hoy
  useEffect(() => {
    if (dateFilter && !isInitialized) {
      try {
        console.log(
          "📅 ProgrammingList - Formateando fecha inicial:",
          dateFilter
        );
        const formattedDate = formatDate(dateFilter);
        console.log("Fecha formateada:", formattedDate);
        setFormattedDateFilter(formattedDate);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error formateando fecha inicial:", error);
      }
    }
  }, [dateFilter, isInitialized]);

  //Efecto para cambio de filtro de estado - ENVÍA AL SERVIDOR
  useEffect(() => {
    if (!isInitialized) return;

    console.log(
      "📊 ProgrammingList - Cambiando filtro de estado:",
      statusFilter
    );
    // Enviar inmediatamente al servidor cuando cambia el estado
    onFiltersChange(
      searchTerm,
      dateFilter,
      statusFilter !== "all" ? statusFilter : undefined
    );
  }, [statusFilter, isInitialized]);

  const handleSearchSubmit = async () => {
    console.log("🔍 ProgrammingList - Ejecutando búsqueda:", searchInput);
    setSearchTerm(searchInput);
    await onFiltersChange(
      searchInput,
      dateFilter,
      statusFilter !== "all" ? statusFilter : undefined
    );
  };

  // NUEVO: Manejar presionar Enter en el campo de búsqueda
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  // NUEVO: Manejar clic en el botón de búsqueda
  const handleSearchButtonClick = () => {
    handleSearchSubmit();
  };

  // Manejar cambio de fecha
  const handleDateChange = async (date: string) => {
    console.log("📅 ProgrammingList - Cambiando fecha:", date);
    setDateFilter(date);
    if (date) {
      try {
        const formattedDate = formatDate(date);
        setFormattedDateFilter(formattedDate);
        // Llamar al servidor inmediatamente cuando cambia la fecha
        await onFiltersChange(
          searchTerm,
          date,
          statusFilter !== "all" ? statusFilter : undefined
        );
      } catch (error) {
        console.error("Error formateando fecha:", error);
      }
    } else {
      setFormattedDateFilter("");
      await onFiltersChange(
        searchTerm,
        "",
        statusFilter !== "all" ? statusFilter : undefined
      );
    }
  };
  // Obtener configuración de estado
  const getStatusConfig = (status: string | undefined) => {
    switch (status) {
      case "COMPLETE":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
          icon: <BsCheckCircle className="w-4 h-4 mr-1.5 text-green-600" />,
          label: "Completado",
        };
      case "UNASSIGNED":
        return {
          bgColor: "bg-amber-100",
          textColor: "text-amber-800",
          borderColor: "border-amber-200",
          icon: <BsClockHistory className="w-4 h-4 mr-1.5 text-amber-600" />,
          label: "Incompleto",
        };
      case "ASSIGNED":
        return {
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
          icon: <BsCheckCircle className="w-4 h-4 mr-1.5 text-blue-600" />,
          label: "Asignado",
        };
      case "CANCELED":
        return {
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          borderColor: "border-red-200",
          icon: <BsXCircle className="w-4 h-4 mr-1.5 text-red-600" />,
          label: "Cancelado",
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
          icon: <BsClockHistory className="w-4 h-4 mr-1.5 text-gray-600" />,
          label: status || "Desconocido",
        };
    }
  };

  // CAMBIADO: Ya no filtrar localmente, el servidor ya envía los datos filtrados
  const filteredData = programmingData; // Los datos ya vienen filtrados del servidor

  // Verificar si hay filtros activos
  const hasActiveFilters = Boolean(
    dateFilter || statusFilter !== "all" || searchTerm
  );

  // Limpiar filtros
  const clearFilters = async () => {
    console.log("🧹 ProgrammingList - Limpiando todos los filtros");
    setStatusFilter("all");
    setSearchTerm("");
    setSearchInput("");
    setDateFilter("");
    setFormattedDateFilter("");
    await onClearFilters();
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Filtro de fecha */}
        <div className="flex flex-col">
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
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter} // Esto disparará el useEffect
            options={[
              { label: "Todos", value: "all" },
              { label: "Completado", value: "COMPLETE" },
              { label: "Incompleto", value: "UNASSIGNED" },
              { label: "Asignado", value: "ASSIGNED" },
              { label: "Cancelado", value: "CANCELED" },
            ]}
          />
        </div>

        {/* Botón para limpiar filtros */}
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

          {searchTerm && (
            <div className="flex items-center bg-white px-2 py-1 rounded-full border border-blue-200">
              <AiOutlineSearch className="mr-1.5 text-blue-500 text-xs" />
              <span>"{searchTerm}"</span>
              <button
                className="ml-1.5 text-gray-400 hover:text-red-500"
                onClick={() => {
                  setSearchTerm("");
                  setSearchInput("");
                  onFiltersChange(
                    "",
                    dateFilter,
                    statusFilter !== "all" ? statusFilter : undefined
                  );
                }}
              >
                ✕
              </button>
            </div>
          )}

          {dateFilter && (
            <div className="flex items-center bg-white px-2 py-1 rounded-full border border-blue-200">
              <FaCalendarAlt className="mr-1.5 text-blue-500 text-xs" />
              <span>{formattedDateFilter}</span>
              <button
                className="ml-1.5 text-gray-400 hover:text-red-500"
                onClick={() => handleDateChange("")}
              >
                ✕
              </button>
            </div>
          )}

          {statusFilter !== "all" && (
            <div className="flex items-center bg-white px-2 py-1 rounded-full border border-blue-200">
              <BsFunnel className="mr-1.5 text-blue-500 text-xs" />
              <span>
                {statusFilter === "COMPLETE"
                  ? "Completado"
                  : statusFilter === "UNASSIGNED"
                  ? "Incompleto"
                  : statusFilter === "ASSIGNED"
                  ? "Asignado"
                  : statusFilter === "CANCELED"
                  ? "Cancelado"
                  : statusFilter}
              </span>
              <button
                className="ml-1.5 text-gray-400 hover:text-red-500"
                onClick={() => setStatusFilter("all")} // Esto disparará el useEffect
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resto del componente igual... */}
      {/* Tabla de programación */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <FaRegFileExcel className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No hay programación
            </h3>
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
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Solicitud
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Servicio
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hora
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ubicación
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Cliente
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.slice(0, displayLimit).map((item) => {
                  const statusConfig = getStatusConfig(item.status);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-[150px] truncate">
                        {item.service_request || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.service}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.dateStart)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.timeStart || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-[150px] truncate">
                        {item.ubication}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 max-w-[150px] truncate">
                        {item.client}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}
                        >
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
                  Mostrando{" "}
                  <span className="font-medium">
                    {Math.min(displayLimit, filteredData.length)}
                  </span>{" "}
                  de <span className="font-medium">{filteredData.length}</span>{" "}
                  registros
                </p>
                <button
                  onClick={() => setDisplayLimit((prev) => prev + 50)}
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
