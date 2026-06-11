import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  ChevronRight, 
  LogIn, 
  LogOut,
  LayoutDashboard,
  Users,
  Home as HomeIcon,
  Info,
  Cpu,
  ShoppingBag,
  Briefcase,
  Zap,
  Mail,
  Sparkles
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";

const navItems = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "About", href: "/about", icon: Info },
  { name: "Services", href: "/services", icon: Cpu },
  { name: "Products", href: "/products", icon: ShoppingBag },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Team", href: "/team", icon: Users },
  { name: "Process", href: "/process", icon: Zap },
  { name: "Contact", href: "/contact", icon: Mail },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-black/5 py-3 shadow-2xl shadow-black/5"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-white font-black text-xl relative z-10">S</span>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-brand-dark font-black text-lg tracking-tighter leading-none group-hover:text-brand-blue transition-colors uppercase">
              SACHO
            </span>
            <span className="text-[9px] text-brand-blue font-black tracking-[0.3em] uppercase mt-0.5">Innovations</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center bg-white border border-brand-border rounded-2xl px-2 py-1.5 shadow-sm relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "relative px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2",
                  isActive ? "text-brand-blue" : "text-brand-secondary hover:text-brand-blue"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-brand-blue-soft border border-brand-blue/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {hoveredItem === item.name && !isActive && (
                  <motion.div
                    layoutId="nav-hover"
                    className="absolute inset-0 bg-brand-bg rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("w-3 h-3 transition-transform", isActive && "scale-110")} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                className="relative group overflow-hidden bg-white hover:bg-brand-bg border border-brand-border text-brand-dark px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
              >
                <LayoutDashboard className="w-3 h-3 text-brand-blue" />
                <span>Portal</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => logout()}
                className="p-2 hover:bg-red-50 text-brand-secondary hover:text-red-500 rounded-xl border border-brand-border hover:border-red-200 transition-all shadow-sm"
                title="Logout"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[10px] font-black uppercase tracking-widest text-brand-secondary hover:text-brand-blue transition-all flex items-center gap-2 px-3"
              >
                <LogIn className="w-3 h-3" /> 
                <span>Sign In</span>
              </Link>
              <Link
                to="/request-access"
                className="btn-primary !px-6 !py-2.5 !text-[10px] !uppercase !tracking-widest flex items-center gap-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Sparkles className="w-3 h-3 text-brand-yellow" />
                <span>Start Project</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="lg:hidden w-10 h-10 flex items-center justify-center bg-white border border-brand-border rounded-xl text-brand-dark shadow-sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white border-l border-black/5 z-50 p-8 flex flex-col lg:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center font-bold text-white">S</div>
                  <span className="font-black tracking-tighter text-[#1a1a1a] uppercase">SACHO</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-brand-bg rounded-lg">
                  <X className="w-6 h-6 text-[#1a1a1a]" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {navItems.map((item, i) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl transition-all",
                          isActive 
                            ? "bg-brand-blue/5 text-brand-blue border border-brand-blue/10" 
                            : "text-gray-400 hover:text-brand-blue hover:bg-brand-bg"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-lg font-black uppercase tracking-widest text-xs">{item.name}</span>
                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-blue shadow-[0_0_10px_rgba(52,115,200,0.5)]" />}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-auto pt-8 border-t border-black/5 space-y-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <Link
                      to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                      className="flex items-center justify-center gap-2 w-full bg-brand-blue hover:bg-brand-blue/90 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-brand-blue/20"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Go to Portal
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="flex items-center justify-center gap-2 w-full bg-red-50 hover:bg-red-100 text-red-500 p-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-red-200 shadow-xl shadow-red-500/5"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-2 w-full bg-white hover:bg-brand-bg text-[#1a1a1a] p-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-black/5 shadow-xl shadow-black/5"
                    >
                      <LogIn className="w-5 h-5 text-brand-blue" />
                      Sign In
                    </Link>
                    <Link
                      to="/request-access"
                      className="flex items-center justify-center gap-2 w-full bg-brand-blue hover:bg-brand-blue/90 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-brand-blue/20"
                    >
                      <Sparkles className="w-5 h-5 text-brand-yellow" />
                      Start Project
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
