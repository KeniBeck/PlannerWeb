import { FilterTag } from "@/components/custom/filter/FilterTagProps";
import { getStatusLabel, formatDisplayDate } from "@/lib/utils/operationHelpers";

interface ActiveFiltersProps {
  hasActiveFilters: boolean;
  statusFilter: string;
  areaFilter: string;
  supervisorFilter: string;
  startDateFilter: string;
  endDateFilter: string;
  clearAllFilters: () => void;
  setStatusFilter: (value: string) => void;
  setAreaFilter: (value: string) => void;
  setSupervisorFilter: (value: string) => void;
  setStartDateFilter: (value: string) => void;
  setEndDateFilter: (value: string) => void;
  getAreaName: (id: string) => string;
  getSupervisorName: (id: string) => string;
}

export function ActiveFilters({
  hasActiveFilters,
  statusFilter,
  areaFilter,
  supervisorFilter,
  startDateFilter,
  endDateFilter,
  clearAllFilters,
  setStatusFilter,
  setAreaFilter,
  setSupervisorFilter,
  setStartDateFilter,
  setEndDateFilter,
  getAreaName,
  getSupervisorName
}: ActiveFiltersProps) {
  if (!hasActiveFilters) return null;

  return (
    <div className="text-sm text-blue-600 flex items-center flex-wrap gap-2">
      <div className="font-semibold">Filtros activos:</div>

      {statusFilter !== "all" && (
        <FilterTag
          label="Estado"
          value={getStatusLabel(statusFilter)}
          onRemove={() => setStatusFilter("all")}
        />
      )}

      {areaFilter !== "all" && (
        <FilterTag
          label="Área"
          value={getAreaName(areaFilter)}
          onRemove={() => setAreaFilter("all")}
        />
      )}

      {supervisorFilter !== "all" && (
        <FilterTag
          label="Supervisor"
          value={getSupervisorName(supervisorFilter)}
          onRemove={() => setSupervisorFilter("all")}
        />
      )}

      {startDateFilter && (
        <FilterTag
          label="Desde"
          value={formatDisplayDate(startDateFilter)}
          onRemove={() => setStartDateFilter("")}
        />
      )}

      {endDateFilter && (
        <FilterTag
          label="Hasta"
          value={formatDisplayDate(endDateFilter)}
          onRemove={() => setEndDateFilter("")}
        />
      )}

      <button
        className="ml-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
        onClick={clearAllFilters}
      >
        Limpiar todos
      </button>
    </div>
  );
}