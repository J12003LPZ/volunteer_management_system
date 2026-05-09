import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import type { Role } from '@/types';

export function ProtectedRoute({ role }: { role?: Role }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return <Outlet />;
}
