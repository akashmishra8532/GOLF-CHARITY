import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

export function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Array<"User" | "Admin">;
}) {
  const { token, user } = useSelector((s: RootState) => s.auth);

  if (!token) return <Navigate to="/login" replace />;
  if (roles && roles.length && user?.role && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

