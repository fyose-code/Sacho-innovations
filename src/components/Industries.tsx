import React from "react";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Hotel, 
  Truck, 
  GraduationCap, 
  Factory, 
  Shield, 
  Briefcase, 
  Building2 
} from "lucide-react";

const industries = [
  { name: "Retail", icon: ShoppingBag, color: "blue" },
  { name: "Hospitality", icon: Hotel, color: "purple" },
  { name: "Transportation", icon: Truck, color: "emerald" },
  { name: "Education", icon: GraduationCap, color: "orange" },
  { name: "Industrial", icon: Factory, color: "cyan" },
  { name: "Security", icon: Shield, color: "indigo" },
  { name: "Service Business", icon: Briefcase, color: "rose" },
  { name: "Enterprise", icon: Building2, color: "amber" },
];

export default function Industries() {
  return (
    <section id="industries" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase"
          >
            Versatility
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white"
          >
            Solutions for Every <span className="text-blue-400">Sector</span>.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60"
          >
            Our technology ecosystem is designed to adapt to the unique challenges 
            of diverse industries.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {industries.map((industry, index) => (
            <motion.div
              key={industry.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mb-6 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-blue-600/20">
                <industry.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                {industry.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
