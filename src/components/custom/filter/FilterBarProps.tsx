import { FiFilter } from "react-icons/fi";
import { SearchFilter } from "./SearchFilterProps";
import { StatusFilter } from "./StatusFilterProps";
import { AreaFilter } from "./AreaFilter";
import { DateRangeFilter } from "./DateFilterRanger";
import { SupervisorFilter } from "./SupervisorFilter";
import { DateFilter } from "./DateFilterProps";

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  startDateFilter: string;
  setStartDateFilter: (value: string) => void;
  endDateFilter: string;
  areaFilter: string;
  supervisorFilter?: string;
  setSupervisorFilter?: (value: string) => void;
  supervisorOptions?: Array<{ value: string; label: string }>;
  setAreaFilter: (value: string) => void;
  setEndDateFilter: (value: string) => void;
  statusOptions: Array<{ value: string; label: string }>;
  areaOptions?: Array<{ value: string; label: string }>;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  useDateRangeFilter?: boolean;
  searchPlaceholder?: string;
  onSearchSubmit?: () => void;
}

export const FilterBar = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  areaFilter,
  setAreaFilter,
  statusOptions,
  areaOptions = [],
  supervisorFilter = "all",
  setSupervisorFilter,
  supervisorOptions = [],
  clearAllFilters,
  hasActiveFilters,
  useDateRangeFilter = true,
  searchPlaceholder = "Buscar por area o cliente",
  onSearchSubmit,
}: FilterBarProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
      <div className="flex gap-4 items-center p-2 flex-wrap w-full">
        <SearchFilter
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={searchPlaceholder}
          className="w-80"
          onSubmit={onSearchSubmit}
        />

        {/* Filtro de area - Usar filtro de area si se especifica */}
        {areaOptions && areaOptions.length > 0 && (
          <AreaFilter
            value={areaFilter}
            onChange={setAreaFilter}
            options={areaOptions}
            className="w-60"
          />
        )}

        <StatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          className="w-60"
        />

        {/* Filtro de Supervisor - Solo se muestra si se proporcionan las opciones */}
        {setSupervisorFilter &&
          supervisorOptions &&
          supervisorOptions.length > 0 && (
            <SupervisorFilter
              value={supervisorFilter}
              onChange={setSupervisorFilter}
              options={supervisorOptions}
              className="w-60"
            />
          )}

        {/* Filtro de fecha - Condicional según useDateRangeFilter */}
        {useDateRangeFilter ? (
          <DateRangeFilter
            startDate={startDateFilter}
            endDate={endDateFilter}
            onStartDateChange={setStartDateFilter}
            onEndDateChange={setEndDateFilter}
            className="w-60"
          />
        ) : (
          <DateFilter
            label="Filtrar por fecha"
            value={startDateFilter}
            onChange={setStartDateFilter}
            className="w-60"
          />
        )}

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
