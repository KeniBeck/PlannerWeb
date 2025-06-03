export interface Programming {
  id?: number;
  service_request: string;
  service: string;
  dateStart: string;
  timeStart: string;
  ubication: string;
  client: string;
  status?: "COMPLETED" | "INCOMPLETE" | "UNASSIGNED" | "ASSIGNED";
  id_operation?: number;
  id_user?: number;
}
