import { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { MdRestaurantMenu } from "react-icons/md";

import { FeedingFilterParams } from "@/services/feedingService";
import { DateRangeFilter } from "@/components/custom/filter/DateFilterRanger";

interface FeedingFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: FeedingFilterParams;
  setFilters: (filters: FeedingFilterParams) => void;
}

export function FeedingFilterBar({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
}: FeedingFilterBarProps) {
  // Estados locales para cada filtro
  const [startDate, setStartDate] = useState<string>(filters.startDate || "");
  const [endDate, setEndDate] = useState<string>(filters.endDate || "");
  const [type, setType] = useState<string>(filters.type || "");

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

 
// Función reemplazada para manejar el cambio de tipo de alimentación
const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const newValue = e.target.value;
  setType(newValue);
  
  // El valor "all" debe enviarse como undefined para remover el filtro
  let apiValue;
  if (newValue === "all") {
    apiValue = undefined;
  } else if (newValue === "Desayuno") {
    apiValue = "BREAKFAST";
  } else if (newValue === "Almuerzo") {
    apiValue = "LUNCH";
  } else if (newValue === "Cena") {
    apiValue = "DINNER";
  } else if (newValue === "Media noche") {
    apiValue = "MIDNIGHT"; // No SNACK
  } else {
    apiValue = newValue;
  }
  
  // Importante: Crear un nuevo objeto para garantizar que React detecte el cambio
  console.log(`Aplicando filtro tipo: ${apiValue}`);
  setFilters({...filters, type: apiValue});
};

// Funciones reemplazadas para manejar fechas
const handleStartDateChange = (value: string) => {
  setStartDate(value);
  console.log(`Aplicando filtro startDate: ${value || undefined}`);
  setFilters({...filters, startDate: value || undefined});
};

const handleEndDateChange = (value: string) => {
  setEndDate(value);
  console.log(`Aplicando filtro endDate: ${value || undefined}`);
  setFilters({...filters, endDate: value || undefined});
};

// Función para limpiar todos los filtros
const handleClearFilters = () => {
  setStartDate("");
  setEndDate("");
  setType("all");
  console.log("Limpiando todos los filtros");
  setFilters({}); // Importante: objeto vacío, no undefined
};

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setType("");
    setFilters({});
  };

  // Comprobar si hay filtros activos
  const hasActiveFilters = !!filters.startDate || !!filters.endDate || !!filters.type;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white border border-gray-100 rounded-b-md">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-2 w-full sm:w-auto">
        {/* Buscador */}
        <div className="relative w-full sm:w-80">
          <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, área, cliente..."
            className="p-2 pl-10 w-full border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Filtro por tipo de comida */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute left-3 top-3">
              <MdRestaurantMenu className="h-5 w-5 text-blue-500" />
            </div>
            <select
              className="pl-10 pr-10 py-2.5 w-full sm:w-60 appearance-none border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm text-gray-700 font-medium"
              value={type}
              onChange={handleTypeChange}
              style={{
                backgroundImage: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
              }}
            >
              <option value="all">Todos los tipos de comida</option>
              <option value="Desayuno">Desayuno</option>
              <option value="Almuerzo">Almuerzo</option>
              <option value="Cena">Cena</option>
              <option value="Media noche">Media noche</option>
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

          {/* Filtro por fechas */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <DateRangeFilter 
          label="Rango de fechas"
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          />
          </div>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      {hasActiveFilters && (
        <button 
          onClick={clearFilters}
          className="text-sm flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md mt-3 sm:mt-0"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}