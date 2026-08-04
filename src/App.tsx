import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LoadingScreen from '@/components/features/LoadingScreen';
import { Toaster } from '@/components/features/Toaster';
import { useAuth } from '@/hooks/useAuth';
import { preloadHome, preloadServices, preloadAgents, preloadAbout, preloadContact, preloadProcess } from '@/lib/routePreload';

const Home = lazy(preloadHome);
const Services = lazy(preloadServices);
const About = lazy(preloadAbout);
const Contact = lazy(preloadContact);
const Process = lazy(preloadProcess);
const Agents = lazy(preloadAgents);
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
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/process" element={<Process />} />
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
