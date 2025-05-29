import { useState, useEffect } from "react";
import { Programming } from "@/core/model/programming";
import { formatDate } from "@/lib/utils/formatDate";

interface UseProgrammingListProps {
  dateFilter: string;
  setDateFilter: (date: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onFiltersChange: (searchTerm: string, dateFilter: string, statusFilter?: string) => Promise<void>;
  onClearFilters: () => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

export function useProgrammingList({
  dateFilter,
  setDateFilter,
  searchTerm,
  setSearchTerm,
  onFiltersChange,
  onClearFilters,
  onDelete,
}: UseProgrammingListProps) {
  // Estados locales
  const [displayLimit, setDisplayLimit] = useState(50);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [formattedDateFilter, setFormattedDateFilter] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Estados para modal de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Efecto para inicializar fecha
  useEffect(() => {
    if (dateFilter && !isInitialized) {
      try {
        console.log("📅 ProgrammingList - Formateando fecha inicial:", dateFilter);
        const formattedDate = formatDate(dateFilter);
        console.log("Fecha formateada:", formattedDate);
        setFormattedDateFilter(formattedDate);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error formateando fecha inicial:", error);
      }
    }
  }, [dateFilter, isInitialized]);

  // Efecto para cambio de filtro de estado
  useEffect(() => {
    if (!isInitialized) return;

    console.log("📊 ProgrammingList - Cambiando filtro de estado:", statusFilter);
    onFiltersChange(
      searchTerm,
      dateFilter,
      statusFilter !== "all" ? statusFilter : undefined
    );
  }, [statusFilter, isInitialized]);

  // Funciones
  const handleSearchSubmit = async () => {
    console.log("🔍 ProgrammingList - Ejecutando búsqueda:", searchInput);
    setSearchTerm(searchInput);
    await onFiltersChange(
      searchInput,
      dateFilter,
      statusFilter !== "all" ? statusFilter : undefined
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleDelete = async (item: Programming) => {
    setItemToDelete({
      id: item.id!,
      name: `${item.service} - ${item.client}`,
    });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleDateChange = async (date: string) => {
    console.log("📅 ProgrammingList - Cambiando fecha:", date);
    setDateFilter(date);
    if (date) {
      try {
        const formattedDate = formatDate(date);
        setFormattedDateFilter(formattedDate);
        await onFiltersChange(
          searchTerm,
          date,
          statusFilter !== "all" ? statusFilter : undefined
        );
      } catch (error) {
        console.error("Error formateando fecha:", error);
      }
    } else {
      setFormattedDateFilter("");
      await onFiltersChange(
        searchTerm,
        "",
        statusFilter !== "all" ? statusFilter : undefined
      );
    }
  };

  const clearFilters = async () => {
    console.log("🧹 ProgrammingList - Limpiando todos los filtros");
    setStatusFilter("all");
    setSearchTerm("");
    setSearchInput("");
    setDateFilter("");
    setFormattedDateFilter("");
    await onClearFilters();
  };

  const hasActiveFilters = Boolean(
    dateFilter || statusFilter !== "all" || searchTerm
  );

  return {
    // Estados
    displayLimit,
    setDisplayLimit,
    statusFilter,
    setStatusFilter,
    searchInput,
    setSearchInput,
    formattedDateFilter,
    hasActiveFilters,
    
    // Estados del modal
    deleteModalOpen,
    setDeleteModalOpen,
    itemToDelete,
    isDeleting,
    
    // Funciones
    handleSearchSubmit,
    handleKeyPress,
    handleDelete,
    confirmDelete,
    cancelDelete,
    handleDateChange,
    clearFilters,
  };
}