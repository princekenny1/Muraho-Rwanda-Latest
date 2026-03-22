/**
 * ProtectedRoute — Route guard for authenticated + role-restricted pages.
 *
 * Usage:
 *   <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
 *   <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth, User } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: User["role"] | User["role"][];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, role, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still loading — show fallback or spinner
  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      )
    );
  }

  // Not authenticated — redirect to auth page
  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Role check (if role prop specified)
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/home" replace />;
    }
  }

  return <>{children}</>;
}

/**
 * AdminRoute — Shorthand for admin-only pages.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute role="admin">{children}</ProtectedRoute>;
}

/**
 * AgencyRoute — Shorthand for agency operator pages.
 */
export function AgencyRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute role={["agency_admin", "admin"]}>
      {children}
    </ProtectedRoute>
  );
}
