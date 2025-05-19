import { useState, useEffect } from "react";
import { FiFilter, FiSearch } from "react-icons/fi";
import { FeedingFilterParams } from "@/services/interfaces/feedingDTO";
import { DateRangeFilter } from "@/components/custom/filter/DateFilterRanger";
import { MdRestaurantMenu } from "react-icons/md";
import { SearchFilter } from "@/components/custom/filter/SearchFilterProps";

interface FeedingFilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filters: FeedingFilterParams;
  setFilters: (filters: FeedingFilterParams) => void;
  applyTypeFilter?: (type: string) => void;
  applyDateFilters?: (startDate: string, endDate: string) => void;
  clearAllFilters?: () => void;
}

export function FeedingFilterBar({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  applyTypeFilter,
  applyDateFilters,
  clearAllFilters
}: FeedingFilterBarProps) {
  // Estados locales
  const [typeFilter, setTypeFilter] = useState(filters.type || "all");
  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");
  
  // Sincronizar estados locales cuando cambian los filtros globales
  useEffect(() => {
    setTypeFilter(filters.type || "all");
    setStartDate(filters.startDate || "");
    setEndDate(filters.endDate || "");
  }, [filters]);
  
  // Opciones para tipo de alimentación
  const typeOptions = [
    { value: "all", label: "Todos los tipos" },
    { value: "BREAKFAST", label: "Desayuno" },
    { value: "LUNCH", label: "Almuerzo" },
    { value: "DINNER", label: "Cena" },
    { value: "MIDNIGHT", label: "Media noche" },
  ];
  
  // Manejar cambio de tipo
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setTypeFilter(newValue);
    
    if (applyTypeFilter) {
      applyTypeFilter(newValue);
    } else {
      // Compatibilidad con implementación anterior
      if (newValue === "all") {
        const { type, ...restFilters } = filters;
        setFilters(restFilters);
      } else {
        setFilters({...filters, type: newValue});
      }
    }
  };
  
  // Manejar cambio de fecha inicial
  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    
    if (applyDateFilters) {
      applyDateFilters(value, endDate);
    } else {
      if (value) {
        setFilters({...filters, startDate: value});
      } else {
        const { startDate, ...restFilters } = filters;
        setFilters(restFilters);
      }
    }
  };
  
  // Manejar cambio de fecha final
  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    
    if (applyDateFilters) {
      applyDateFilters(startDate, value);
    } else {
      if (value) {
        setFilters({...filters, endDate: value});
      } else {
        const { endDate, ...restFilters } = filters;
        setFilters(restFilters);
      }
    }
  };
  
  // Aplicar búsqueda
  const handleSearch = () => {
    if (searchTerm.trim()) {
      setFilters({...filters, search: searchTerm.trim()});
    } else if (filters.search) {
      const { search, ...restFilters } = filters;
      setFilters(restFilters);
    }
  };
  
  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStartDate("");
    setEndDate("");
    
    if (clearAllFilters) {
      clearAllFilters();
    } else {
      setFilters({});
    }
  };
  
  // Detectar si hay filtros activos
  const hasActiveFilters = 
    searchTerm.trim() !== "" || 
    typeFilter !== "all" || 
    startDate !== "" || 
    endDate !== "";
  
  // Handler para aplicar búsqueda al presionar Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-2 w-full">
        {/* Buscador */}
          <SearchFilter
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por DNI o nombre de trabajador"
          className="w-full sm:w-80"
          onKeyDown={handleKeyDown}
        />
        
        {/* Filtro de tipo */}
         <div className="relative w-full sm:w-auto">
            <div className="absolute left-3 top-3">
              <MdRestaurantMenu className="h-5 w-5 text-blue-500" />
            </div>
            <select
              className="pl-10 pr-10 py-2.5 w-full sm:w-60 appearance-none border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm text-gray-700 font-medium"
              value={typeFilter}
              onChange={handleTypeChange}
              style={{
                backgroundImage: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
              }}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <svg
                className="h-5 w-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        
        {/* Filtro de rango de fechas */}
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          label="Rango de fechas"
          className="w-full sm:w-64"
        />
        
        {/* Botones de acción */}
        <div className="flex gap-2 w-full sm:w-auto">    
          {hasActiveFilters && (
            <button
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center"
              onClick={handleClearFilters}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
}