import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Globe, Users } from "lucide-react";

const stats = [
  { label: "Visionary Projects", value: "150+", icon: Globe },
  { label: "Expert Engineers", value: "45+", icon: Users },
  { label: "System Uptime", value: "99.9%", icon: Zap },
  { label: "Secure Deployments", value: "100%", icon: Shield },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold tracking-wider uppercase">
              Our Story
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Building the <span className="text-blue-400">Digital Backbone</span> of Tomorrow's Africa.
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              Sacho Innovations was founded with a single mission: to bridge the gap between 
              visionary ideas and real-world implementation. As the parent company of 
              <span className="text-white font-medium"> Fyose</span>, we've evolved into a 
              multidisciplinary technology powerhouse.
            </p>
            <p className="text-lg text-white/60 leading-relaxed">
              We don't just write code; we build ecosystems. From complex ERP systems to 
              industrial automation and high-security infrastructure, our work is defined by 
              technical excellence and a human-centered approach to innovation.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors group"
                >
                  <stat.icon className="w-6 h-6 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/40 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl aspect-[4/5] lg:aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000" 
                alt="Innovation Lab" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    S
                  </div>
                  <div>
                    <div className="text-white font-bold">Sacho Innovations</div>
                    <div className="text-white/40 text-sm">Founded 2020 • Visionary Tech</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-[60px] animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/20 rounded-full blur-[60px] animate-pulse delay-1000" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
