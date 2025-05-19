import { useState, useRef, useEffect } from 'react';
import { parseISO } from 'date-fns';

interface OperationFiltersProps {
  setFilters: (filters: any) => void;
  setPage: (page: number) => void;
  filters: any;
}

export function useOperationFilters(OperationFiltersProps: OperationFiltersProps) {
  const { setFilters, setPage, filters } = OperationFiltersProps;
  
  // Inicializar searchTerm con el valor desde los filtros existentes (si existe)
  const [searchTerm, setSearchTermState] = useState(filters?.search || "");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [supervisorFilter, setSupervisorFilter] = useState<string>("all");

  // Referencias para almacenar valores anteriores
  const prevSearchTermRef = useRef<string>("");
  const prevStatusFilterRef = useRef<string>("all");
  const prevStartDateRef = useRef<string>("");
  const prevEndDateRef = useRef<string>("");
  const prevAreaFilterRef = useRef<string>("all");
  const prevSupervisorFilterRef = useRef<string>("all");

  // Función personalizada para actualizar searchTerm y aplicar al filtro
  const setSearchTerm = (value: string) => {
    setSearchTermState(value);
    
    // Actualizar directamente los filtros con el término de búsqueda
    const newFilters = { ...filters };
    
    if (value && value.trim() !== "") {
      newFilters.search = value.trim();
    } else if ("search" in newFilters) {
      delete newFilters.search;
    }
    
    setFilters(newFilters);
    setPage(1); // Volver a la primera página con cada búsqueda
  };

  // Efecto para aplicar filtros cuando cambian
  useEffect(() => {
    // Verificar si algún filtro cambió realmente para evitar bucles
    const searchChanged = searchTerm !== prevSearchTermRef.current;
    const statusChanged = statusFilter !== prevStatusFilterRef.current;
    const startDateChanged = startDateFilter !== prevStartDateRef.current;
    const endDateChanged = endDateFilter !== prevEndDateRef.current;
    const areaChanged = areaFilter !== prevAreaFilterRef.current;
    const supervisorChanged = supervisorFilter !== prevSupervisorFilterRef.current;

    if (statusChanged || startDateChanged || endDateChanged || areaChanged || supervisorChanged) {
      console.log("[Operation] Cambios en filtros detectados");

      // Actualizar referencias a valores anteriores
      prevSearchTermRef.current = searchTerm;
      prevStatusFilterRef.current = statusFilter;
      prevStartDateRef.current = startDateFilter;
      prevEndDateRef.current = endDateFilter;
      prevAreaFilterRef.current = areaFilter;
      prevSupervisorFilterRef.current = supervisorFilter;

      // Crear una copia del objeto de filtros actual
      const newFilters = { ...filters };

      // Aplicar filtro de búsqueda
      if (searchTerm && searchTerm.trim() !== "") {
        console.log(`[Operation] Aplicando filtro de búsqueda: ${searchTerm}`);
        newFilters.search = searchTerm.trim();
      } else if ("search" in newFilters) {
        delete newFilters.search;
        console.log("[Operation] Quitando filtro de búsqueda");
      }

      // Aplicar filtro de estado
      if (statusFilter && statusFilter !== "all") {
        console.log(`[Operation] Aplicando filtro de estado: ${statusFilter}`);
        newFilters.status = [statusFilter as any];
      } else if ("status" in newFilters) {
        delete newFilters.status;
        console.log("[Operation] Quitando filtro de estado");
      }

      // Aplicar filtro de supervisor
      if (supervisorFilter && supervisorFilter !== "all") {
        console.log(`[Operation] Aplicando filtro de supervisor: ${supervisorFilter}`);
        newFilters.inChargedId = parseInt(supervisorFilter);
      } else if ("inChargedId" in newFilters) {
        delete newFilters.inChargedId;
        console.log("[Operation] Quitando filtro de supervisor");
      }

      // Aplicar filtro de área
      if (areaFilter && areaFilter !== "all") {
        console.log(`[Operation] Aplicando filtro de área: ${areaFilter}`);
        newFilters.jobAreaId = parseInt(areaFilter);
      } else if ("jobAreaId" in newFilters) {
        delete newFilters.jobAreaId;
        console.log("[Operation] Quitando filtro de área");
      }

      // Aplicar filtro de fecha de inicio
      if (startDateFilter) {
        console.log(`[Operation] Aplicando filtro de fecha inicio: ${startDateFilter}`);
        newFilters.dateStart = parseISO(startDateFilter);
      } else if ("dateStart" in newFilters) {
        delete newFilters.dateStart;
        console.log("[Operation] Quitando filtro de fecha inicio");
      }

      // Aplicar filtro de fecha de fin
      if (endDateFilter) {
        console.log(`[Operation] Aplicando filtro de fecha fin: ${endDateFilter}`);
        newFilters.dateEnd = parseISO(endDateFilter);
      } else if ("dateEnd" in newFilters) {
        delete newFilters.dateEnd;
        console.log("[Operation] Quitando filtro de fecha fin");
      }

      // Aplicar los filtros y volver a página 1
      setFilters(newFilters);
      setPage(1);
    }
  }, [searchTerm, statusFilter, startDateFilter, endDateFilter, areaFilter, supervisorFilter, setFilters, setPage, filters]);

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTermState(""); // Limpiar también el término de búsqueda
    setStatusFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setAreaFilter("all");
    setSupervisorFilter("all");
  };

  // Verificar si hay filtros activos (incluir searchTerm)
  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    startDateFilter !== "" ||
    endDateFilter !== "" ||
    supervisorFilter !== "all" ||
    areaFilter !== "all";

  return {
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
    supervisorFilter,
    setSupervisorFilter,
    clearAllFilters,
    hasActiveFilters
  };
}