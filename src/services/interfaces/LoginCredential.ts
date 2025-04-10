export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: UserData;
  statusCode: number;
}

export interface UserData {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role?: string;
}