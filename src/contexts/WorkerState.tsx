import { Worker } from "@/core/model/worker"; 

interface WorkerState {
  workers: Worker[];
  lastUpdated: Date | null;
  dataFetched: boolean;
}

// Singleton para mantener el estado entre renderizaciones
class WorkersStateManager {
  private static instance: WorkersStateManager;
  private state: WorkerState = {
    workers: [],
    lastUpdated: null,
    dataFetched: false
  };

  private readonly DATA_EXPIRY_TIME = 30 * 60 * 1000;

  private constructor() {}

  public static getInstance(): WorkersStateManager {
    if (!WorkersStateManager.instance) {
      WorkersStateManager.instance = new WorkersStateManager();
    }
    return WorkersStateManager.instance;
  }

  getState(): WorkerState {
    if (this.isDataExpired()) {
        this.state.dataFetched = false;
      }
    return this.state;
  }

  setState(newState: Partial<WorkerState>) {
    this.state = { ...this.state, ...newState };
  }

  reset() {
    this.state = {
      workers: [],
      lastUpdated: null,
      dataFetched: false
    };
  }

  private isDataExpired(): boolean {
    if (!this.state.lastUpdated) return true;
    
    const now = new Date().getTime();
    const lastUpdate = this.state.lastUpdated.getTime();
    
    return now - lastUpdate > this.DATA_EXPIRY_TIME;
  }
}

export const workersState = WorkersStateManager.getInstance();