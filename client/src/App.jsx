import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/AppShell';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import SetupBahashas from './pages/SetupBahashas';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Manage from './pages/Manage';
import Earnings from './pages/Earnings';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import GroupCreate from './pages/GroupCreate';
import GroupDashboard from './pages/GroupDashboard';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';

function ProtectedRoute({ children, shell = true }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-3 border-dusco border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (shell) return <AppShell>{children}</AppShell>;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  // Admin routes — separate from main app
  if (location.pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* Onboarding (no shell) */}
      <Route path="/setup-bahashas" element={<ProtectedRoute shell={false}><div className="min-h-screen bg-white max-w-md mx-auto flex flex-col"><SetupBahashas /></div></ProtectedRoute>} />

      {/* App (with shell) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
      <Route path="/groups/create" element={<ProtectedRoute><GroupCreate /></ProtectedRoute>} />
      <Route path="/groups/:id" element={<ProtectedRoute><GroupDashboard /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/manage" element={<ProtectedRoute><Manage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
