import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, UserRole } from "@/src/context/AuthContext";
import { NotificationProvider } from "@/src/context/NotificationContext";
import PublicLayout from "@/src/layouts/PublicLayout";
import PrivateLayout from "@/src/layouts/PrivateLayout";
import { motion, AnimatePresence } from "framer-motion";

// Lazy load pages
const Home = lazy(() => import("@/src/pages/public/Home"));
const About = lazy(() => import("@/src/pages/public/About"));
const Services = lazy(() => import("@/src/pages/public/Services"));
const Products = lazy(() => import("@/src/pages/public/Products"));
const Portfolio = lazy(() => import("@/src/pages/public/Portfolio"));
const ServiceDetail = lazy(() => import("@/src/pages/public/ServiceDetail"));
const Process = lazy(() => import("@/src/pages/public/Process"));
const Contact = lazy(() => import("@/src/pages/public/Contact"));
const ClientPortalIntro = lazy(() => import("@/src/pages/public/ClientPortalIntro"));
const Login = lazy(() => import("@/src/pages/public/Login"));
const RequestAccess = lazy(() => import("@/src/pages/public/RequestAccess"));

const Dashboard = lazy(() => import("@/src/pages/private/Dashboard"));
const Projects = lazy(() => import("@/src/pages/private/Projects"));
const ProjectWorkspace = lazy(() => import("@/src/pages/private/ProjectWorkspace"));
const Tasks = lazy(() => import("@/src/pages/private/Tasks"));
const Files = lazy(() => import("@/src/pages/private/Files"));
const Messages = lazy(() => import("@/src/pages/private/Messages"));
const Billing = lazy(() => import("@/src/pages/private/Billing"));
const Settings = lazy(() => import("@/src/pages/private/Settings"));
const Calendar = lazy(() => import("@/src/pages/private/Calendar"));
const Onboarding = lazy(() => import("@/src/pages/private/Onboarding"));
const RequestCenter = lazy(() => import("@/src/pages/private/RequestCenter"));
const Handover = lazy(() => import("@/src/pages/private/Handover"));
const QACenter = lazy(() => import("@/src/pages/private/QACenter"));
const WaitingOnClient = lazy(() => import("@/src/pages/private/WaitingOnClient"));
const Conference = lazy(() => import("@/src/pages/private/Conference"));
const Meetings = lazy(() => import("@/src/pages/private/Meetings"));
const Team = lazy(() => import("@/src/pages/private/Team"));

// Admin Pages
const AdminLayout = lazy(() => import("@/src/layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("@/src/pages/admin/AdminDashboard"));
const AdminCMS = lazy(() => import("@/src/pages/admin/AdminCMS"));
const AdminClients = lazy(() => import("@/src/pages/admin/AdminClients"));
const AdminProjects = lazy(() => import("@/src/pages/admin/AdminProjects"));
const AdminTasks = lazy(() => import("@/src/pages/admin/AdminTasks"));
const AdminBilling = lazy(() => import("@/src/pages/admin/AdminBilling"));
const AdminTeam = lazy(() => import("@/src/pages/admin/AdminTeam"));
const AdminMessages = lazy(() => import("@/src/pages/admin/AdminMessages"));
const AdminConference = lazy(() => import("@/src/pages/admin/AdminConference"));
const AdminProposals = lazy(() => import("@/src/pages/admin/AdminProposals"));

const TeamPage = lazy(() => import("@/src/pages/public/Team"));
const AdminTeamProfiles = lazy(() => import("@/src/pages/admin/AdminTeamProfiles"));

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full"
    />
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={(user.role === 'admin' || user.role === 'manager') ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/services/:id" element={<PublicLayout><ServiceDetail /></PublicLayout>} />
          <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
          <Route path="/portfolio" element={<PublicLayout><Portfolio /></PublicLayout>} />
          <Route path="/process" element={<PublicLayout><Process /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/team" element={<PublicLayout><TeamPage /></PublicLayout>} />
          <Route path="/client-portal" element={<PublicLayout><ClientPortalIntro /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/request-access" element={<PublicLayout><RequestAccess /></PublicLayout>} />

          {/* Private Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><PrivateLayout><Dashboard /></PrivateLayout></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><PrivateLayout><Projects /></PrivateLayout></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><PrivateLayout><ProjectWorkspace /></PrivateLayout></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><PrivateLayout><Tasks /></PrivateLayout></ProtectedRoute>} />
          <Route path="/files" element={<ProtectedRoute><PrivateLayout><Files /></PrivateLayout></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><PrivateLayout><Messages /></PrivateLayout></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute><PrivateLayout><Billing /></PrivateLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><PrivateLayout><Settings /></PrivateLayout></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><PrivateLayout><Calendar /></PrivateLayout></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><PrivateLayout><Onboarding /></PrivateLayout></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><PrivateLayout><RequestCenter /></PrivateLayout></ProtectedRoute>} />
          <Route path="/handover" element={<ProtectedRoute><PrivateLayout><Handover /></PrivateLayout></ProtectedRoute>} />
          <Route path="/qa" element={<ProtectedRoute><PrivateLayout><QACenter /></PrivateLayout></ProtectedRoute>} />
          <Route path="/action-items" element={<ProtectedRoute><PrivateLayout><WaitingOnClient /></PrivateLayout></ProtectedRoute>} />
          <Route path="/meetings" element={<ProtectedRoute><PrivateLayout><Meetings /></PrivateLayout></ProtectedRoute>} />
          <Route path="/dashboard/team" element={<ProtectedRoute><PrivateLayout><Team /></PrivateLayout></ProtectedRoute>} />
          <Route path="/conference/:id" element={<ProtectedRoute><PrivateLayout><Conference /></PrivateLayout></ProtectedRoute>} />
          <Route path="/conference" element={<Navigate to="/meetings" replace />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/cms" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminCMS /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/clients" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminClients /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/projects" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminProjects /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/proposals" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminProposals /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/tasks" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminTasks /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/billing" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminBilling /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/team" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminTeam /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/team-profiles" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminTeamProfiles /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminMessages /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/conference" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout><AdminConference /></AdminLayout></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
