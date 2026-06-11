import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Globe, Cpu, Smartphone, Layout, Database, Lock, Settings, BarChart, ChevronRight, CheckCircle2, ArrowRight, Search, Target, Rocket, Heart, Code, Eye, Layers, Cloud, MessageSquare, Files, Calendar, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const portalFeatures = [
  {
    title: "Real-time Progress Tracking",
    description: "Monitor every milestone and task as it happens. Gain full visibility into the project timeline and current status.",
    icon: BarChart,
    color: "blue",
  },
  {
    title: "Centralized Communication",
    description: "Direct access to our project managers and engineers. All discussions are organized and easily accessible.",
    icon: MessageSquare,
    color: "purple",
  },
  {
    title: "Secure File Management",
    description: "Upload, manage, and version all project assets in one secure, centralized location. Never lose a file again.",
    icon: Files,
    color: "emerald",
  },
  {
    title: "Digital Approval System",
    description: "Review and approve milestones, designs, and deliverables with a single click. Streamline the sign-off process.",
    icon: Shield,
    color: "red",
  },
  {
    title: "Integrated Billing & Invoicing",
    description: "View and manage all project-related financial documents, including proposals, invoices, and payment history.",
    icon: CreditCard,
    color: "orange",
  },
  {
    title: "Collaborative Calendar",
    description: "Stay aligned on key dates, meetings, and deadlines with a shared project calendar.",
    icon: Calendar,
    color: "cyan",
  },
];

const ClientPortalIntro: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-blue-400 text-sm font-medium mb-8 backdrop-blur-md">
              <Lock className="w-4 h-4 fill-blue-400" />
              <span>Secure. Transparent. Collaborative.</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
              Your <span className="text-blue-400">innovation</span> workspace.
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
              The Sacho Innovations Client Portal is a premium, secure environment designed to provide you with full visibility and control over your digital projects.
            </p>
            <div className="flex flex-col sm:row justify-center gap-6">
              <Link
                to="/login"
                className="px-10 py-5 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group"
              >
                Login to Portal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/request-access"
                className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xl font-bold transition-all backdrop-blur-md"
              >
                Request Access
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Portal Preview Image */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[40px] p-4 overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1500"
                alt="Client Portal Dashboard Preview"
                className="rounded-[32px] w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-end p-12">
                <p className="text-white font-bold text-2xl">A unified view of your innovation journey.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Portal Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Everything in one place.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our portal is built to streamline collaboration and provide you with the tools you need to manage your projects effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-10 bg-white/5 border border-white/10 rounded-[40px] hover:bg-white/[0.08] hover:border-blue-500/30 transition-all duration-500 group"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500",
                  feature.color === "blue" && "bg-blue-600/20 text-blue-400 shadow-blue-600/20",
                  feature.color === "purple" && "bg-purple-600/20 text-purple-400 shadow-purple-600/20",
                  feature.color === "emerald" && "bg-emerald-600/20 text-emerald-400 shadow-emerald-600/20",
                  feature.color === "red" && "bg-red-600/20 text-red-400 shadow-red-600/20",
                  feature.color === "orange" && "bg-orange-600/20 text-orange-400 shadow-orange-600/20",
                  feature.color === "cyan" && "bg-cyan-600/20 text-cyan-400 shadow-cyan-600/20",
                )}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="py-32 px-6 bg-black/40 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Enterprise-grade <span className="text-blue-400">security</span>.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Your data and intellectual property are our top priority. The Sacho Innovations Client Portal is built with the highest security standards to ensure your information remains protected.
            </p>
            <div className="space-y-6 mb-10">
              {[
                "256-bit SSL encryption for all data",
                "Multi-factor authentication (MFA)",
                "Secure, encrypted file storage",
                "Regular security audits & monitoring",
                "Role-based access control",
              ].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-blue-600/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-gray-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-[100px]"></div>
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-12 overflow-hidden shadow-2xl flex flex-col items-center justify-center text-center">
              <Shield className="w-24 h-24 text-blue-400 mb-8 animate-pulse" />
              <h3 className="text-3xl font-bold mb-4">Trusted Security</h3>
              <p className="text-gray-400 max-w-xs mx-auto">
                We use the same security protocols as leading global financial institutions to protect your project data.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-purple-700 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-600/20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Experience the future of collaboration.</h2>
            <p className="text-white/80 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Join the Sacho Innovations ecosystem and take full control of your digital transformation journey.
            </p>
            <div className="flex flex-col sm:row justify-center gap-6">
              <Link
                to="/login"
                className="px-10 py-5 bg-white text-blue-600 hover:bg-gray-100 rounded-full text-xl font-bold transition-all shadow-xl"
              >
                Login to Portal
              </Link>
              <Link
                to="/contact"
                className="px-10 py-5 bg-black/20 hover:bg-black/30 border border-white/20 rounded-full text-xl font-bold transition-all backdrop-blur-md"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClientPortalIntro;
