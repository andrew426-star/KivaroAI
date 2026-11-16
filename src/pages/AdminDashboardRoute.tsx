import AdminDashboard from '@/pages/AdminDashboard';
import { ProtectedRoute } from '@/components/admin/RouteGuards';

export default function AdminDashboardRoute() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
