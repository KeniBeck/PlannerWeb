import { FiFilter } from "react-icons/fi";
import { SearchFilter } from "./SearchFilterProps";
import { StatusFilter } from "./StatusFilterProps";
import { DateFilter } from "./DateFilterProps";
import { AreaFilter } from "./AreaFilter";
import { use } from "react";
import { DateRangeFilter } from "./DateFilterRanger";

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  startDateFilter: string;
  setStartDateFilter: (value: string) => void;
  endDateFilter: string;
  areaFilter: string;
  setAreaFilter: (value: string) => void;
  setEndDateFilter: (value: string) => void;
  statusOptions: Array<{ value: string; label: string }>;
  areaOptions: Array<{ value: string; label: string }>;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  useDateRangeFilter?: boolean; // Prop opcional para usar el filtro de rango de fechas
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
  areaOptions,
  clearAllFilters,
  hasActiveFilters,
  useDateRangeFilter = false,
}: FilterBarProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
      <div className="flex gap-4 items-center p-2 flex-wrap w-full">
        <SearchFilter
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por area o cliente"
          className="w-80"
        />

        <AreaFilter
          value={areaFilter}
          onChange={setAreaFilter}
          options={areaOptions}
          className="w-60"
        />

        <StatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          className="w-60"
        />

        <DateRangeFilter
          startDate={startDateFilter}
          endDate={endDateFilter}
          onStartDateChange={setStartDateFilter}
          onEndDateChange={setEndDateFilter}
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
