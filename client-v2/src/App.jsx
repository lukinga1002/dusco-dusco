import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import VerifyOtp from '@/pages/VerifyOtp';
import { DuscoAuthProvider } from '@/lib/DuscoAuthContext';
import DuscoProtectedRoute from '@/components/dusco/DuscoProtectedRoute';
import AppShell from '@/components/dusco/AppShell';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import Bahashas from '@/pages/Bahashas';
import AddMoney from '@/pages/AddMoney';
import SendMoney from '@/pages/SendMoney';
import Groups from '@/pages/Groups';
import GroupDetail from '@/pages/GroupDetail';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Settings from '@/pages/Settings';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminShell from '@/components/admin/AdminShell';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminUserDetail from '@/pages/admin/AdminUserDetail';
import AdminTransactions from '@/pages/admin/AdminTransactions';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/verify-otp" element={<VerifyOtp />} />
    <Route path="/admin" element={<AdminLogin />} />
    <Route element={<AdminShell />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/users/:id" element={<AdminUserDetail />} />
      <Route path="/admin/transactions" element={<AdminTransactions />} />
    </Route>
    <Route element={<DuscoProtectedRoute />}>
      <Route path="/app" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="bahashas" element={<Bahashas />} />
        <Route path="add-money" element={<AddMoney />} />
        <Route path="send" element={<SendMoney />} />
        <Route path="groups" element={<Groups />} />
        <Route path="groups/:id" element={<GroupDetail />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Route>
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />
        <DuscoAuthProvider>
          <AppRoutes />
        </DuscoAuthProvider>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
