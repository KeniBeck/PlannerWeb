import { useState, useRef, useEffect } from 'react';
import { parseISO } from 'date-fns';

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
  // Estados para UI
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  // Referencias para almacenar valores anteriores
  const prevTypeFilterRef = useRef<string>("all");
  const prevStartDateRef = useRef<string>("");
  const prevEndDateRef = useRef<string>("");
  const initializedRef = useRef<boolean>(false);

  // Inicializar estados desde filtros existentes (solo una vez)
  useEffect(() => {
    if (!initializedRef.current && filters) {
      if (filters.search) setSearchTerm(filters.search);
      if (filters.type) setTypeFilter(filters.type);
      if (filters.startDate) setStartDateFilter(filters.startDate);
      if (filters.endDate) setEndDateFilter(filters.endDate);
      
      prevTypeFilterRef.current = filters.type || "all";
      prevStartDateRef.current = filters.startDate || "";
      prevEndDateRef.current = filters.endDate || "";
      
      initializedRef.current = true;
    }
  }, [filters]);

  // Efecto para aplicar filtros cuando cambian (similar a useOperationFilters)
  useEffect(() => {
    if (!initializedRef.current) return; // No aplicar en la inicialización

    // Verificar si algún filtro cambió para evitar bucles
    const typeChanged = typeFilter !== prevTypeFilterRef.current;
    const startDateChanged = startDateFilter !== prevStartDateRef.current;
    const endDateChanged = endDateFilter !== prevEndDateRef.current;

    if (typeChanged || startDateChanged || endDateChanged) {
      console.log("[FaultFilters] Cambios en filtros detectados");
      setIsSearching(true);

      // Actualizar referencias a valores anteriores
      prevTypeFilterRef.current = typeFilter;
      prevStartDateRef.current = startDateFilter;
      prevEndDateRef.current = endDateFilter;

      // Crear objeto de filtros limpio
      const newFilters: Filters = {};

      // Mantener el término de búsqueda actual
      if (searchTerm && searchTerm.trim()) {
        newFilters.search = searchTerm.trim();
      }

      // Aplicar filtro de tipo
      if (typeFilter && typeFilter !== "all") {
        console.log(`[FaultFilters] Aplicando filtro de tipo: ${typeFilter}`);
        newFilters.type = typeFilter;
      }

      // Aplicar filtro de fecha de inicio
      if (startDateFilter) {
        console.log(`[FaultFilters] Aplicando filtro de fecha inicio: ${startDateFilter}`);
        newFilters.startDate = startDateFilter;
      }

      // Aplicar filtro de fecha de fin
      if (endDateFilter) {
        console.log(`[FaultFilters] Aplicando filtro de fecha fin: ${endDateFilter}`);
        newFilters.endDate = endDateFilter;
      }

      // Aplicar los filtros y volver a página 1
      console.log("[FaultFilters] Aplicando filtros:", newFilters);
      setFilters(newFilters);
      setPage(1);

      // Ocultar spinner después de un momento
      setTimeout(() => {
        setIsSearching(false);
      }, 500);
    }
  }, [typeFilter, startDateFilter, endDateFilter, setFilters, setPage]);

  // Función específica para aplicar búsqueda por texto
  const applySearch = () => {
    setIsSearching(true);
    
    // Crear objeto de filtros integrando los actuales
    const newFilters: Filters = {};
    
    // Aplicar búsqueda
    if (searchTerm && searchTerm.trim()) {
      newFilters.search = searchTerm.trim();
    }
    
    // Mantener otros filtros actuales
    if (typeFilter && typeFilter !== "all") {
      newFilters.type = typeFilter;
    }
    
    if (startDateFilter) {
      newFilters.startDate = startDateFilter;
    }
    
    if (endDateFilter) {
      newFilters.endDate = endDateFilter;
    }
    
    console.log("[FaultFilters] Aplicando búsqueda:", newFilters);
    
    // Actualizar filtros y volver a página 1
    setFilters(newFilters);
    setPage(1);
    
    // Ocultar spinner después de un momento
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setIsSearching(true);
    
    // Actualizar referencias
    prevTypeFilterRef.current = "all";
    prevStartDateRef.current = "";
    prevEndDateRef.current = "";
    
    // Limpiar filtros y volver a página 1
    setFilters({});
    setPage(1);
    
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = 
    searchTerm.trim() !== "" || 
    typeFilter !== "all" || 
    startDateFilter !== "" || 
    endDateFilter !== "";

  return {
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    startDate: startDateFilter,
    setStartDate: setStartDateFilter,
    endDate: endDateFilter,
    setEndDate: setEndDateFilter,
    isSearching,
    hasActiveFilters,
    applyFilters: applySearch, // Mantener para compatibilidad
    clearAllFilters
  };
}