import { FiFilter } from "react-icons/fi";
import { SearchFilter } from "./SearchFilterProps";
import { StatusFilter } from "./StatusFilterProps";
import { FaultType } from "@/core/model/fault";
import { FaultDateRangeFilter } from "./FaultDateRangeFilter";

interface FaultFilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  isSearching: boolean;
  applyFilters: () => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  // Nuevas propiedades para fechas
  startDate?: string;
  endDate?: string;
  setStartDate?: (value: string) => void;
  setEndDate?: (value: string) => void;
}

export const FaultFilterBar = ({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  isSearching,
  applyFilters,
  clearAllFilters,
  hasActiveFilters,
  // Nuevas propiedades con valores predeterminados
  startDate = "",
  endDate = "",
  setStartDate = () => {},
  setEndDate = () => {},
}: FaultFilterBarProps) => {
  // Opciones para el tipo de falta
  const typeOptions = [
    { value: "all", label: "Todos los tipos" },
    { value: FaultType.INASSISTANCE, label: "Inasistencia" },
    { value: FaultType.IRRESPECTFUL, label: "Irrespeto" },
    { value: FaultType.ABANDONMENT, label: "Abandono" },
  ];

  // Handler para el enter en la búsqueda
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFilters();
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
      <div className="flex gap-4 items-center p-2 flex-wrap w-full">
        {/* Filtro de búsqueda reutilizando SearchFilter */}
        <SearchFilter
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por DNI o nombre de trabajador"
          className="w-80"
          onKeyDown={handleKeyDown}
          loading={isSearching}
        />

        {/* Filtro de tipo de falta reutilizando StatusFilter */}
        <StatusFilter
          value={typeFilter}
          onChange={setTypeFilter}
          options={typeOptions}
          className="w-60"
        />

        {/* Filtro de rango de fechas - NUEVO */}
        <FaultDateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          label="Rango de fechas"
          className="w-64"
        />
        {/* Botón para limpiar todos los filtros */}
        {hasActiveFilters && (
          <button
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center ml-auto"
            onClick={clearAllFilters}
          >
            <FiFilter className="mr-2" /> Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};
