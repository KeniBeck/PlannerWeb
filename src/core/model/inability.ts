export interface Inability {
  id?: number;
  dateDisableStart?: string;
  dateDisableEnd?: string;
  type?: TypeDisability;
  cause?: CauseDisability;
  id_worker?: number;
  worker?: Worker;
}
interface Worker {
  name: string;
  dni: string;
}

export enum TypeDisability {
  INITIAL = "INITIAL",
  EXTENSION = "EXTENSION",
}

export enum CauseDisability {
  LABOR = "LABOR",
  TRANSIT = "TRANSIT",
  DISEASE = "DISEASE",
}
