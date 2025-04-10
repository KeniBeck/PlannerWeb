export interface DecodedToken {
    id: number;
    username: string;
    role: string;
    dni: string;
    occupation: string;
    phone: string;
    iat: number;
    exp: number;
    [key: string]: any;
  }