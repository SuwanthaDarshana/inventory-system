
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ProtectedRoute wraps routes that require authentication.
// - If not logged in → redirects to login page
// - If adminOnly=true and user isn't admin → redirects to dashboard
// - Otherwise → renders the child route via <Outlet />

interface Props {
  adminOnly?: boolean;
}

export default function ProtectedRoute({ adminOnly = false }: Props) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
