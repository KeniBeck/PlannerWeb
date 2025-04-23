export interface Client {
    id: number;
    name: string;
    status?: "ACTIVE" | "INACTIVE";
}