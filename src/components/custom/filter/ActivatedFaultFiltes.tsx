import { FilterTag } from "@/components/custom/filter/FilterTagProps";
import { FaultType } from "@/core/model/fault";
import { formatDisplayDate } from "@/lib/utils/operationHelpers";

interface ActiveFaultFiltersProps {
  hasActiveFilters: boolean;
  searchTerm: string;
  typeFilter: string;
  clearAllFilters: () => void;
  setSearchTerm: (value: string) => void;
  setTypeFilter: (value: string) => void;
  startDateFilter: string;
  endDateFilter: string;
  setStartDateFilter: (value: string) => void;
  setEndDateFilter: (value: string) => void;
}

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

export function ActiveFaultFilters({
  hasActiveFilters,
  searchTerm,
  typeFilter,
  clearAllFilters,
  setSearchTerm,
  setTypeFilter,
  startDateFilter,
  endDateFilter,
  setStartDateFilter,
  setEndDateFilter,
}: ActiveFaultFiltersProps) {
  if (!hasActiveFilters) return null;

  return (
    <div className="text-sm text-blue-600 flex items-center flex-wrap gap-2">
      <div className="font-semibold">Filtros activos:</div>

      {searchTerm.trim() !== "" && (
        <FilterTag
          label="Búsqueda"
          value={searchTerm}
          onRemove={() => setSearchTerm("")}
        />
      )}

      {typeFilter !== "all" && (
        <FilterTag
          label="Tipo"
          value={getFaultTypeLabel(typeFilter)}
          onRemove={() => setTypeFilter("all")}
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
