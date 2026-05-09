import { Outlet } from 'react-router-dom';

export function ProtectedRoute({ role: _role }: { role?: string }) {
  return <Outlet />;
}
