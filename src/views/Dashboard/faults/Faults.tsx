import { useMemo } from "react";
import { Fault, FaultType } from "@/core/model/fault";
import SectionHeader, { ExcelColumn } from "@/components/ui/SectionHeader";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FaultsList } from "@/components/ui/faults/FaultList";
import { useFaults } from "@/contexts/FaultContext";
import { useWorkers } from "@/contexts/WorkerContext";
import Swal from "sweetalert2";
import { faultService } from "@/services/faultService";
import { AddFaultDialog } from "@/components/ui/faults/AddFaultDialog";
import { FaultFilterBar } from "@/components/custom/filter/FaultFilterBar";
import { useFaultFilters } from "@/lib/hooks/useFaultsFilters";
import { ActiveFaultFilters } from "@/components/custom/filter/ActivatedFaultFiltes";
import { useState } from "react";

export default function Faults() {
  // Obtener funciones y datos del contexto
  const {
    faults,
    refreshFaults,
    isLoading,
    filters,
    setFilters: originalSetFilters,
    setPage,
  } = useFaults();

  const { workers } = useWorkers();

  // Adapter function to handle type conversion
  const setFiltersAdapter = (faultFilterDTO: any) => {
    // Convert the type from array to string if needed
    const adaptedFilters = {
      ...faultFilterDTO,
      type: Array.isArray(faultFilterDTO.type)
        ? faultFilterDTO.type[0] // Take the first element if it's an array
        : faultFilterDTO.type,
    };
    originalSetFilters(adaptedFilters);
  };

  // Adaptar los filtros antes de pasarlos al hook
  const adaptFilters = (filtersToAdapt: any) => {
    if (!filtersToAdapt) return filtersToAdapt;

    return {
      ...filtersToAdapt,
      type: Array.isArray(filtersToAdapt.type)
        ? filtersToAdapt.type[0] // Tomar el primer elemento si es un array
        : filtersToAdapt.type,
    };
  };

  // Usar el custom hook para gestionar los filtros
  const {
    searchTerm,
    setSearchTerm,
    typeFilter,
    startDate,
    endDate,
    setEndDate,
    setStartDate,
    setTypeFilter,
    isSearching,
    hasActiveFilters,
    applyFilters,
    clearAllFilters,
  } = useFaultFilters({
    setFilters: setFiltersAdapter,
    setPage,
    filters: adaptFilters(filters),
  });

  // Estado para el diálogo de añadir falta
  const [isAddFaultOpen, setIsAddFaultOpen] = useState(false);

  // Manejador para ver detalles de una falta
  const handleViewFault = (fault: Fault) => {
    Swal.fire({
      title: "Detalle de la Falta",
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Trabajador:</strong> ${
            fault.worker?.name || "No disponible"
          }</p>
          <p class="mb-2"><strong>DNI:</strong> ${
            fault.worker?.dni || "No disponible"
          }</p>
          <p class="mb-2"><strong>Tipo:</strong> ${getFaultTypeLabel(
            fault.type
          )}</p>
          <p class="mb-2"><strong>Fecha:</strong> ${format(
            new Date(fault.createAt),
            "dd/MM/yyyy",
            { locale: es }
          )}</p>
          <p class="mb-2"><strong>Descripción:</strong></p>
          <p class="p-2 bg-gray-100 rounded">${
            fault.description || "Sin descripción"
          }</p>
        </div>
      `,
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#3085d6",
    });
  };

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

  // Manejador para guardar una nueva falta
  const handleSaveFault = async (faultData: any) => {
    try {
      await faultService.createFault(faultData);
      await refreshFaults();
      setIsAddFaultOpen(false);
      Swal.fire({
        icon: "success",
        title: "Falta registrada",
        text: "Se ha registrado la falta correctamente",
      });
    } catch (error) {
      console.error("Error al registrar la falta:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo registrar la falta. Intente nuevamente.",
      });
    }
  };

  // Definir columnas para exportación
  const faultExportColumns: ExcelColumn[] = useMemo(
    () => [
      { header: "Documento", field: "worker.dni" },
      { header: "Trabajador", field: "worker.name" },
      {
        header: "Tipo",
        field: "type",
        value: (fault) => getFaultTypeLabel(fault.type),
      },
      { header: "Descripción", field: "description" },
      {
        header: "Fecha",
        field: "createAt",
        value: (fault) =>
          format(new Date(fault.createAt), "dd/MM/yyyy", { locale: es }),
      },
    ],
    []
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        {/* Encabezado */}
        <SectionHeader
          title="Registro de Faltas"
          subtitle="Gestión de faltas y amonestaciones de trabajadores"
          btnAddText="Registrar Nueva Falta"
          handleAddArea={() => setIsAddFaultOpen(true)}
          refreshData={() => Promise.resolve(refreshFaults())}
          loading={isLoading}
          exportData={faults} // Usar los datos del contexto para exportación
          exportFileName="registro_faltas"
          exportColumns={faultExportColumns}
          currentView="faults"
        />

        {/* Barra de filtros */}
        <FaultFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          startDate={startDate} // Añadir estas propiedades
          endDate={endDate} // para las fechas
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          isSearching={isSearching}
          applyFilters={applyFilters}
          clearAllFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Tabla de faltas */}
      <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-white">
          <FaultsList
            filteredFaults={faults} // Pasar los datos del contexto (ya filtrados por el backend)
            searchTerm={searchTerm}
          />
        </div>
      </div>

      {/* Indicador de filtros activos */}
      <ActiveFaultFilters
        hasActiveFilters={hasActiveFilters}
        searchTerm={searchTerm}
        typeFilter={typeFilter}
        clearAllFilters={clearAllFilters}
        setSearchTerm={setSearchTerm}
        setTypeFilter={setTypeFilter}
        startDateFilter={startDate} // Mapear propiedades del hook a los
        endDateFilter={endDate} // nombres esperados por ActiveFaultFilters
        setStartDateFilter={setStartDate}
        setEndDateFilter={setEndDate}
      />

      {/* Diálogo para añadir nueva falta */}
      <AddFaultDialog
        open={isAddFaultOpen}
        onOpenChange={setIsAddFaultOpen}
        onSave={handleSaveFault}
        workers={workers}
      />
    </div>
  );
}
