import { Navigate, Outlet } from 'react-router-dom';
import { AuthLoading, useAuthStore } from '@/features/auth';
import type { Role } from '@/features/auth';

interface Props {
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  if (status === 'checking') {
    return <AuthLoading />;
  }
  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
