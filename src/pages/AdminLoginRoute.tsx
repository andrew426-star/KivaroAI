import AdminLogin from '@/pages/AdminLogin';
import { PublicOnlyRoute } from '@/components/admin/RouteGuards';

export default function AdminLoginRoute() {
  return (
    <PublicOnlyRoute>
      <AdminLogin />
    </PublicOnlyRoute>
  );
}
