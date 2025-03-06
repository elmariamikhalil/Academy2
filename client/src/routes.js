import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// User Pages
import ProfilePage from './pages/user/ProfilePage';
import LearningPage from './pages/user/LearningPage';
import CourseContentPage from './pages/user/CourseContentPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminCoursesPage from './pages/admin/CoursesPage';
import AdminCourseContentPage from './pages/admin/CourseContentPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminEvaluationsPage from './pages/admin/EvaluationsPage';
import AdminReportsPage from './pages/admin/ReportsPage';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/courses" element={<MainLayout><CoursesPage /></MainLayout>} />
      <Route path="/courses/:id" element={<MainLayout><CourseDetailPage /></MainLayout>} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      
      {/* User Routes */}
      <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
      <Route path="/learning" element={<ProtectedRoute><MainLayout><LearningPage /></MainLayout></ProtectedRoute>} />
      <Route path="/learning/:courseId" element={<ProtectedRoute><MainLayout><CourseContentPage /></MainLayout></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboardPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/courses" element={<AdminRoute><AdminLayout><AdminCoursesPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/courses/:id/content" element={<AdminRoute><AdminLayout><AdminCourseContentPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsersPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/evaluations" element={<AdminRoute><AdminLayout><AdminEvaluationsPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminLayout><AdminReportsPage /></AdminLayout></AdminRoute>} />
      
      {/* 404 Route */}
      <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
    </Routes>
  );
};

export default AppRoutes;