import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Smartphone, Layout, Zap, Shield } from "lucide-react";

export default function FyoseSpotlight() {
  return (
    <section id="fyose" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            {/* Device Mockup Visualization */}
            <div className="relative z-10 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl aspect-[4/3] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              
              {/* Floating UI Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-48 h-64 bg-black/80 border border-white/10 rounded-2xl shadow-2xl p-4 z-20"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg" />
                  <div className="h-2 w-16 bg-white/20 rounded-full" />
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-white/5 rounded-full" />
                  <div className="h-2 w-full bg-white/5 rounded-full" />
                  <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                </div>
                <div className="mt-8 flex justify-between items-center">
                  <div className="h-4 w-12 bg-blue-500/20 rounded-full" />
                  <div className="w-6 h-6 bg-white/10 rounded-full" />
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 right-1/4 w-56 h-48 bg-black/80 border border-white/10 rounded-2xl shadow-2xl p-6 z-10"
              >
                <div className="text-white font-bold mb-2">Analytics</div>
                <div className="flex items-end gap-1 h-16 mb-4">
                  {[40, 70, 45, 90, 60, 80].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="flex-1 bg-blue-500/50 rounded-t-sm" 
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>Mon</span>
                  <span>Sat</span>
                </div>
              </motion.div>
            </div>
            
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase">
              Flagship Innovation
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Meet <span className="text-blue-400">Fyose</span>: The Future of Connected Business.
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              Fyose is Sacho Innovations' premier product ecosystem—a powerful, 
              interconnected system designed to simplify complex business processes 
              and enhance customer experiences.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: "Unified Interface", icon: Layout, desc: "One dashboard for everything." },
                { title: "Real-time Sync", icon: Zap, desc: "Instant data across all devices." },
                { title: "Mobile First", icon: Smartphone, desc: "Optimized for the modern workforce." },
                { title: "Enterprise Security", icon: Shield, desc: "Bank-grade protection for your data." },
              ].map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-bold mb-1">{feature.title}</div>
                    <div className="text-sm text-white/40">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-base font-bold transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2 group">
                Learn More About Fyose
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
