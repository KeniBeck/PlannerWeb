import { Worker } from "./worker";

interface Fault {
  id: number;
  description: string;
  type: FaultType;
  worker: Worker;
  createAt: string;
}


enum FaultType {
  INASSISTANCE = "INASSISTANCE",
  IRRESPECTFUL = "IRRESPECTFUL",
  ABANDONMENT = "ABANDONMENT",
}

interface PaginatedResponse {
  pagination: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  items: Fault[];
}

// Interfaz para el contexto
interface FaultContextType {
  faults: Fault[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  refreshFaults: () => Promise<void>;
  lastUpdated: Date | null;
}

export { FaultType };
export type { Fault, PaginatedResponse, FaultContextType };
