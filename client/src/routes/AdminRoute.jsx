import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ADMIN_ROLES = ["super_admin", "moderator", "event_coordinator", "job_poster"];

// Blocks access to admin pages unless the user holds an elevated role.
export default function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return ADMIN_ROLES.includes(user.role) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
