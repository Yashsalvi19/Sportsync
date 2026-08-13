import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { MainLayout } from '../components/Layout/MainLayout.jsx';
import { AdminDashboard } from '../pages/AdminDashboard.jsx';
import { CoachDashboard } from '../pages/CoachDashboard.jsx';
import { StudentDashboard } from '../pages/StudentDashboard.jsx';
import { Students } from '../pages/Students.jsx';
import { Coaches } from '../pages/Coaches.jsx';
import { Attendance } from '../pages/Attendance.jsx';
import { Fees } from '../pages/Fees.jsx';
import { Tournaments } from '../pages/Tournaments.jsx';
import { Login } from '../pages/Login.jsx';
import { Signup } from '../pages/Signup.jsx';
import { Profile } from '../pages/Profile.jsx';
import { useAuthStore } from '../store/authStore';

// ProtectedRoute wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AppRoutes = () => {
  const { user, isInitialized } = useAuthStore();
  const currentUserRole = (user?.user_metadata?.role || 'STUDENT').toUpperCase();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

      {/* Protected Routes inside MainLayout */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        <Route path="dashboard" element={
          currentUserRole === 'ADMIN' ? <AdminDashboard /> :
          currentUserRole === 'COACH' ? <CoachDashboard /> :
          <StudentDashboard />
        } />

        <Route path="coaches" element={<Coaches />} />
        <Route path="students" element={<Students />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="fees" element={<Fees />} />
        <Route path="tournaments" element={<Tournaments />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};
