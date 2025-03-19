
import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/types/user";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  allowedRoles = [], 
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { user, isLoading, hasRole } = useAuth();
  
  // Still loading authentication state
  if (isLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Not authenticated
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Authenticated but role not allowed
  if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Authenticated and authorized
  return <Outlet />;
}
