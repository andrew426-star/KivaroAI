import { Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/features/LoadingScreen';
import { useAuth } from '@/hooks/useAuth';

// Only the admin pages import these, so the auth hook and the Supabase
// client load with them and not with the public site.
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
