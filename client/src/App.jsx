import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import Dashboard from "./pages/student/Dashboard.jsx";
import Academic from "./pages/student/Academic.jsx";
import Events from "./pages/student/Events.jsx";
import Jobs from "./pages/student/Jobs.jsx";
import JobDetail from "./pages/student/JobDetail.jsx";
import Marketplace from "./pages/student/Marketplace.jsx";
import LostFound from "./pages/student/LostFound.jsx";
import TeamFinder from "./pages/student/TeamFinder.jsx";
import Feedback from "./pages/student/Feedback.jsx";
import Profile from "./pages/student/Profile.jsx";
import Settings from "./pages/student/Settings.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import AcademicManagement from "./pages/admin/AcademicManagement.jsx";
import JobManagement from "./pages/admin/JobManagement.jsx";
import EventManagement from "./pages/admin/EventManagement.jsx";
import MarketplaceModeration from "./pages/admin/MarketplaceModeration.jsx";
import LostFoundModeration from "./pages/admin/LostFoundModeration.jsx";
import FeedbackManagement from "./pages/admin/FeedbackManagement.jsx";
import NotificationCompose from "./pages/admin/NotificationCompose.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/academic" element={<Academic />} />
          <Route path="/events" element={<Events />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/team-finder" element={<TeamFinder />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/academic" element={<AcademicManagement />} />
            <Route path="/admin/jobs" element={<JobManagement />} />
            <Route path="/admin/events" element={<EventManagement />} />
            <Route path="/admin/marketplace" element={<MarketplaceModeration />} />
            <Route path="/admin/lost-found" element={<LostFoundModeration />} />
            <Route path="/admin/feedback" element={<FeedbackManagement />} />
            <Route path="/admin/notifications" element={<NotificationCompose />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
