import React from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Monitor, 
  Database, 
  ShieldCheck, 
  Cpu, 
  Network,
  ChevronRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const services = [
  {
    title: "Mobile App Development",
    description: "Crafting intuitive, high-performance mobile experiences for iOS and Android.",
    icon: Smartphone,
    color: "blue",
    deliverables: ["Native & Hybrid Apps", "UI/UX Design", "API Integration"]
  },
  {
    title: "Desktop Software",
    description: "Powerful, scalable desktop applications tailored for enterprise workflows.",
    icon: Monitor,
    color: "purple",
    deliverables: ["Cross-platform Apps", "System Integration", "Legacy Migration"]
  },
  {
    title: "ERP Systems",
    description: "Comprehensive business management systems that unify your operations.",
    icon: Database,
    color: "emerald",
    deliverables: ["Custom Modules", "Real-time Analytics", "Cloud Hosting"]
  },
  {
    title: "Security Systems",
    description: "Advanced surveillance and access control systems for total peace of mind.",
    icon: ShieldCheck,
    color: "orange",
    deliverables: ["AI Surveillance", "Biometric Access", "Remote Monitoring"]
  },
  {
    title: "Industrial Automation",
    description: "Smart control systems that optimize production and reduce operational costs.",
    icon: Cpu,
    color: "cyan",
    deliverables: ["PLC Programming", "SCADA Systems", "Robotics Integration"]
  },
  {
    title: "Infrastructure Management",
    description: "Resilient, scalable IT infrastructure designed for the modern enterprise.",
    icon: Network,
    color: "indigo",
    deliverables: ["Network Design", "Server Management", "Cybersecurity"]
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase"
          >
            Our Ecosystem
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white"
          >
            Comprehensive <span className="text-blue-400">Technology</span> Solutions.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60"
          >
            Sacho Innovations provides an integrated suite of professional services 
            designed to solve complex business challenges through technology.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                service.color === "blue" && "bg-blue-500/20 text-blue-400",
                service.color === "purple" && "bg-purple-500/20 text-purple-400",
                service.color === "emerald" && "bg-emerald-500/20 text-emerald-400",
                service.color === "orange" && "bg-orange-500/20 text-orange-400",
                service.color === "cyan" && "bg-cyan-500/20 text-cyan-400",
                service.color === "indigo" && "bg-indigo-500/20 text-indigo-400"
              )}>
                <service.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                {service.title}
              </h3>
              <p className="text-white/60 mb-6 leading-relaxed">
                {service.description}
              </p>
              
              <ul className="space-y-3 mb-8">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <button className="flex items-center gap-2 text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                Request Service
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
