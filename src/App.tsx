import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoadingScreen from '@/components/features/LoadingScreen';
import { Toaster } from '@/components/features/Toaster';
import { useAuth } from '@/hooks/useAuth';

const Home = lazy(() => import('@/pages/Home'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Old multi-page routes now redirect into the single-page's
              matching section, preserving SEO equity for anything that
              still links to them. vercel.json's redirects handle this at
              the HTTP layer for production; these are the client-side
              fallback for local dev/preview where that config isn't applied. */}
          <Route path="/services" element={<Navigate to="/#agents" replace />} />
          <Route path="/agents" element={<Navigate to="/#agents" replace />} />
          <Route path="/process" element={<Navigate to="/#deploy" replace />} />
          <Route path="/about" element={<Navigate to="/#trust" replace />} />
          <Route path="/contact" element={<Navigate to="/#deploy" replace />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route
            path="/admin/login"
            element={
              <PublicOnlyRoute>
                <AdminLogin />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
