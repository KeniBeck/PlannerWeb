import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";
import { isLoadingAlert } from "@/components/dialog/AlertsLogin";
import { UserRole } from "@/lib/utils/interfaces/role";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        isLoadingAlert(true);

        const hasRequiredRole = authService.hasRole(requiredRoles);

        // Si no tiene los roles requeridos, denegar acceso
        if (!hasRequiredRole) {
          setIsAuthenticated(true);
          setHasAccess(false);
          setIsCheckingAuth(false);
          isLoadingAlert(false);
          return;
        }
        const isAuth = await authService.isAuthenticated();
        setIsAuthenticated(isAuth);
        setHasAccess(isAuth && hasRequiredRole);
        isLoadingAlert(false);

        return isAuth;
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsAuthenticated(false);
        setHasAccess(false);
      } finally {
        setIsCheckingAuth(false);
        isLoadingAlert(false);
      }
    };

    checkAuthentication();
  }, []);

  // Mientras verifica, no renderiza nada o muestra un indicador de carga
  if (isCheckingAuth) {
    return null;
  }

  // Si no está autenticado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado pero no tiene los roles requeridos
  if (!hasAccess) {
    return <Navigate to="/forbidden" replace />;
  }

  // Si está autenticado, renderiza los componentes hijos
  return <>{children}</>;
}
