import { Navigate, useLocation } from '../../navigation';
import useAuthStore from '../../stores/useAuthStore';
import LoadingSkeleton from './LoadingSkeleton';

function homeForRole(role) {
  if (role === 'master_admin') return '/master-admin/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/dashboard';
}

export default function RoleGuard({ roles, children }) {
  const { user, loading, revoked } = useAuthStore();
  const location = useLocation();

  if (loading) return <LoadingSkeleton label="Checking session" />;
  if (revoked) return <Navigate to="/access-revoked" replace />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />;
  return children;
}
