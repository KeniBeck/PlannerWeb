export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserData;
}

export interface UserData {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role?: string;
}