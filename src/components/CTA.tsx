import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA({ onStartClick }: { onStartClick?: () => void }) {
  return (
    <section id="contact" className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 p-12 md:p-24 text-center space-y-8 shadow-2xl"
        >
          {/* Background Ornaments */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-white/10 rounded-full blur-[120px] animate-pulse" />
          </div>

          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3 h-3" />
              Ready to Innovate?
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Let's Build the Future of Your Business Together.
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Whether you're a startup looking to disrupt or an enterprise looking 
              to optimize, Sacho Innovations has the expertise to bring your 
              vision to life.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
              <button 
                onClick={onStartClick}
                className="bg-white text-blue-600 hover:bg-white/90 px-10 py-5 rounded-full text-lg font-bold transition-all shadow-2xl flex items-center gap-2 group"
              >
                Start a Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onStartClick}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-5 rounded-full text-lg font-bold transition-all flex items-center gap-2 group"
              >
                Book a Consultation
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
