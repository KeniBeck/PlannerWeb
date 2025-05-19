import { useState, useRef, useEffect } from 'react';

interface Filters {
  search?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

interface FaultFiltersProps {
  setFilters: (filters: Filters) => void;
  setPage: (page: number) => void;
  filters: Filters;
}

export function useFaultFilters({ setFilters, setPage, filters = {} }: FaultFiltersProps) {
  // Estados para UI - Simplificado
  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const [typeFilter, setTypeFilter] = useState<string>(filters?.type || "all");
  const [startDateFilter, setStartDateFilter] = useState<string>(filters?.startDate || "");
  const [endDateFilter, setEndDateFilter] = useState<string>(filters?.endDate || "");
  const [isSearching, setIsSearching] = useState(false);
  
  // Flag para evitar aplicar filtros automáticamente en el primer render
  const initialLoadRef = useRef(false);
  
  // Referencia para almacenar el valor actual del input de búsqueda
  const inputSearchRef = useRef(searchTerm);

  // Manejar cambios en el input de búsqueda - Solo actualiza la referencia
  const handleSearchInputChange = (value: string) => {
    inputSearchRef.current = value;
    setSearchTerm(value); // Actualizamos el estado visual pero NO aplicamos filtros
  };

  // Función unificada para aplicar todos los filtros
  const applyFilters = (applyingFromSearch = false) => {
    setIsSearching(true);
    
    // Crear nuevo objeto de filtros
    const newFilters: Filters = {};
    
    // Si estamos aplicando desde la búsqueda, usar el valor de la referencia
    // Si no, usar el estado actual
    const currentSearchTerm = applyingFromSearch ? inputSearchRef.current : searchTerm;
    
    if (currentSearchTerm && currentSearchTerm.trim()) {
      newFilters.search = currentSearchTerm.trim();
    }
    
    if (typeFilter !== "all") {
      newFilters.type = typeFilter;
    }
    
    if (startDateFilter) {
      newFilters.startDate = startDateFilter;
    }
    
    if (endDateFilter) {
      newFilters.endDate = endDateFilter;
    }
    
    console.log("[FaultFilters] Aplicando filtros:", newFilters);
    setFilters(newFilters);
    setPage(1);
    
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  // Cuando cambian los filtros de tipo o fechas, aplicamos automáticamente
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      return;
    }
    
    // Solo aplicar para cambios en tipo o fechas
    applyFilters(false);
  }, [typeFilter, startDateFilter, endDateFilter]);

  // Función específica para la búsqueda (cuando presiona Enter)
  const applySearch = () => {
    // Actual y explícitamente aplicamos los filtros desde el valor actual del input
    applyFilters(true);
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm("");
    inputSearchRef.current = "";
    setTypeFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setIsSearching(true);
    
    // Limpiar filtros
    setFilters({});
    setPage(1);
    
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = 
    searchTerm.trim() !== "" || 
    typeFilter !== "all" || 
    startDateFilter !== "" || 
    endDateFilter !== "";

  return {
    searchTerm,
    setSearchTerm: handleSearchInputChange,
    typeFilter,
    setTypeFilter,
    startDate: startDateFilter, 
    setStartDate: setStartDateFilter,
    endDate: endDateFilter,
    setEndDate: setEndDateFilter,
    isSearching,
    hasActiveFilters,
    applySearch,
    applyFilters: applySearch,
    clearAllFilters
  };
}