import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Files,
  MessageSquare,
  Calendar,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Search,
  ChevronRight,
  User,
  HelpCircle,
  Rocket,
  PlusCircle,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Globe,
  Users,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { AIAssistant } from "@/src/components/AIAssistant";
import { useNotifications } from "@/src/context/NotificationContext";

const sidebarLinks = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "My Projects", path: "/projects", icon: Briefcase },
  { name: "Action Items", path: "/action-items", icon: AlertTriangle },
  { name: "Requests", path: "/requests", icon: PlusCircle },
  { name: "Handover", path: "/handover", icon: ShieldCheck },
  { name: "QA Center", path: "/qa", icon: Activity },
  { name: "Onboarding", path: "/onboarding", icon: Rocket },
  { name: "Tasks", path: "/tasks", icon: CheckSquare },
  { name: "Files", path: "/files", icon: Files },
  { name: "Messages", path: "/messages", icon: MessageSquare },
  { name: "Calendar", path: "/calendar", icon: Calendar },
  { name: "Billing", path: "/billing", icon: CreditCard },
  { name: "Team", path: "/team", icon: Users },
  { name: "Boardroom", path: "/conference", icon: Globe },
];

const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-brand-bg text-[#1a1a1a] font-sans flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white/80 backdrop-blur-2xl border-r border-black/5 transition-all duration-500 z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex-shrink-0 flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight leading-none text-brand-blue">SACHO</span>
                <span className="text-[10px] text-brand-yellow font-medium tracking-[0.2em] uppercase">Portal</span>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group",
                location.pathname === link.path
                  ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                  : "text-gray-500 hover:bg-brand-blue/5 hover:text-brand-blue"
              )}
            >
              <link.icon className={cn("w-5 h-5", location.pathname === link.path ? "text-white" : "text-gray-400 group-hover:text-brand-blue")} />
              {isSidebarOpen && <span className="font-medium text-sm">{link.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5 space-y-2">
          <Link
            to="/settings"
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group text-gray-500 hover:bg-brand-blue/5 hover:text-brand-blue",
              location.pathname === "/settings" && "bg-brand-blue/5 text-brand-blue"
            )}
          >
            <Settings className="w-5 h-5 group-hover:text-brand-blue" />
            {isSidebarOpen && <span className="font-medium text-sm">Settings</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group text-gray-500 hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-500" />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/40 backdrop-blur-xl border-b border-black/5 px-6 flex items-center justify-between z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex p-2 hover:bg-black/5 rounded-lg text-gray-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-black/5 rounded-lg text-gray-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, tasks..."
                className="bg-black/5 border border-black/10 rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-brand-blue/50 transition-colors text-[#1a1a1a]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-black/5 rounded-full text-gray-500 relative transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-brand-blue rounded-full border-2 border-white"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white border border-black/10 rounded-2xl shadow-2xl z-20 overflow-hidden"
                    >
                      <div className="p-4 border-b border-black/5 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-[#1a1a1a]">Notifications</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => markAllAsRead()}
                            className="text-[10px] text-brand-blue hover:text-brand-blue/80 font-bold uppercase tracking-wider"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id}
                              onClick={() => {
                                markAsRead(notif.id);
                                if (notif.link) navigate(notif.link);
                                setIsNotificationsOpen(false);
                              }}
                              className={cn(
                                "p-4 border-b border-black/5 hover:bg-black/5 transition-colors cursor-pointer relative",
                                !notif.read && "bg-brand-blue/5"
                              )}
                            >
                              {!notif.read && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-blue rounded-full" />
                              )}
                              <p className="text-xs font-bold mb-1 text-[#1a1a1a]">{notif.title}</p>
                              <p className="text-[10px] text-gray-500 line-clamp-2">{notif.message}</p>
                              <p className="text-[8px] text-gray-400 mt-2 uppercase tracking-widest font-bold">
                                {notif.timestamp?.toDate ? notif.timestamp.toDate().toLocaleString() : "Just now"}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                            <p className="text-xs text-gray-400">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      <Link 
                        to="/settings" 
                        onClick={() => setIsNotificationsOpen(false)}
                        className="p-3 text-center block text-[10px] text-gray-500 hover:text-brand-blue font-bold uppercase tracking-widest bg-black/5 transition-colors"
                      >
                        Notification Settings
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-[1px] bg-black/10 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none text-[#1a1a1a]">{user?.name}</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-yellow p-[1px]">
                <div className="w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden">
                  <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* AI Assistant */}
        <AIAssistant />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-[70] lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">S</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight leading-none text-brand-blue">SACHO</span>
                    <span className="text-[10px] text-brand-yellow font-medium tracking-[0.2em] uppercase">Portal</span>
                  </div>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-brand-blue transition-colors">
                  <X />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300",
                      location.pathname === link.path
                        ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                        : "text-gray-500 hover:bg-brand-blue/5 hover:text-brand-blue"
                    )}
                  >
                    <link.icon className={cn("w-5 h-5", location.pathname === link.path ? "text-white" : "text-gray-400 group-hover:text-brand-blue")} />
                    <span className="font-medium text-sm">{link.name}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-6 border-t border-black/5 space-y-2">
                <Link
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group text-gray-500 hover:bg-brand-blue/5 hover:text-brand-blue",
                    location.pathname === "/settings" && "bg-brand-blue/5 text-brand-blue"
                  )}
                >
                  <Settings className="w-5 h-5 group-hover:text-brand-blue" />
                  <span className="font-medium text-sm">Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium text-sm">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrivateLayout;
