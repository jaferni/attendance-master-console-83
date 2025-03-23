
import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

interface RequireAuthProps {
  children: React.ReactNode;
  role?: "teacher" | "student" | "superadmin";
}

export function RequireAuth({ children, role }: RequireAuthProps) {
  const { user, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is specified, check if user has the required role
  if (role && user.role !== role) {
    // Redirect to dashboard if authenticated but doesn't have the required role
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
