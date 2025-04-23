export interface User {
    id: number;
    name: string;
    phone: string;
    dni: string;
    occupation: string;
    role?: string;
    username: string;
    password?: string;
    status?: "ACTIVE" | "INACTIVE";
}