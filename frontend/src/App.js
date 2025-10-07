import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import DezhurFak from './pages/DezhurFak';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import DezhurAkad from './pages/DezhurAkad';
import ProtectedRoute from './utils/ProtectedRoute';
import PrivateRoute from './utils/PrivateRoute';
import PublicRoute from './utils/PublicRoute';
import { useAuth } from './context/AuthContext';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div>Загрузка...</div>;

  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />

      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole="is_superuser">
          <AdminPanel />
        </ProtectedRoute>
      } />

        <Route
          path="/redirect"
          element={
            user ? (
              user.username === "Дежурный по академии" ? (
                <Navigate to="/DezhurAkad" replace />
              ) : user.is_superuser ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/DezhurFak" replace />
              )
            ) : (
              <div className="fullscreen-loader">
                <div className="spinner"></div>
                <p>Загрузка...</p>
              </div>
            )
          }
        />


        <Route path="/DezhurFak" element={
          <PrivateRoute>
            <DezhurFak />
          </PrivateRoute>
        } />

        <Route path="/DezhurAkad" element={
          <ProtectedRoute >
            <DezhurAkad />
          </ProtectedRoute>
        } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
