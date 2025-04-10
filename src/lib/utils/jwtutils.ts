import { UserRole } from "./interfaces/role";
import { DecodedToken } from "./interfaces/TokenInterface";

export const decodeToken = (token: string | null): DecodedToken | null => {
  if (!token) return null;
  
  try {
    // Dividir el token en sus partes (header, payload, signature)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decodificar la parte del payload (segunda parte)
    const payload = parts[1];
    
    // Convertir la base64Url a base64 estándar
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decodificar base64 a string y luego parsear como JSON
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando el token:', error);
    return null;
  }
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // La fecha de expiración en segundos vs tiempo actual en segundos
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

export const getTokenRole = (token: string | null): string | null => {
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

// Función para verificar si un rol tiene acceso a una ruta protegida
export const hasRequiredRole = (
  userRole: string | null, 
  requiredRoles?: UserRole[]
): boolean => {
  // Si no se requieren roles específicos, se permite el acceso
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  
  // Si se requieren roles pero el usuario no tiene ninguno
  if (!userRole) {
    return false;
  }
  
  // Verificar si el rol del usuario está entre los permitidos
  return requiredRoles.includes(userRole as UserRole);
};