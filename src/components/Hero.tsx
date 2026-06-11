import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Play, Sparkles } from "lucide-react";

export default function Hero({ onExploreClick }: { onExploreClick?: () => void }) {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505] pt-20"
    >
      {/* Animated Background Ornaments */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3 h-3" />
            Shaping the Future of Africa
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            Innovating <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-[length:200%_auto] animate-gradient">Intelligent</span> Systems for a Connected World.
          </h1>
          
          <p className="text-lg text-white/60 max-w-xl leading-relaxed">
            Sacho Innovations is the visionary parent company of <span className="text-white font-medium">Fyose</span>, 
            pioneering advanced digital solutions, industrial automation, and smart infrastructure 
            to transform how businesses and communities operate.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button 
              onClick={onExploreClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-base font-bold transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2 group"
            >
              Explore Our Solutions
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full text-base font-bold transition-all flex items-center gap-2 group">
              Discover Fyose
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="flex items-center gap-8 pt-8 border-t border-white/5">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-xs text-white/40 uppercase tracking-widest font-semibold">Systems Deployed</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">12+</div>
              <div className="text-xs text-white/40 uppercase tracking-widest font-semibold">Industries Served</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-xs text-white/40 uppercase tracking-widest font-semibold">System Reliability</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative hidden lg:block"
        >
          {/* Main Visual Component */}
          <div className="relative z-10 bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-1 rounded-[2.5rem] border border-white/10 backdrop-blur-sm shadow-2xl overflow-hidden aspect-square flex items-center justify-center group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Abstract Tech Illustration Placeholder */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute w-64 h-64 bg-blue-500/30 rounded-full blur-[80px] animate-pulse" />
              <div className="absolute w-48 h-48 bg-purple-500/30 rounded-full blur-[80px] animate-pulse delay-700" />
              
              <div className="relative z-10 grid grid-cols-2 gap-4 p-8 w-full h-full">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex flex-col justify-between shadow-xl"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-12 bg-blue-400/50 rounded-full" />
                    <div className="h-2 w-20 bg-white/20 rounded-full" />
                  </div>
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex flex-col justify-between shadow-xl mt-12"
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-12 bg-purple-400/50 rounded-full" />
                    <div className="h-2 w-20 bg-white/20 rounded-full" />
                  </div>
                </motion.div>
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex flex-col justify-between shadow-xl -mt-8"
                >
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-12 bg-emerald-400/50 rounded-full" />
                    <div className="h-2 w-20 bg-white/20 rounded-full" />
                  </div>
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl flex flex-col justify-between shadow-xl mt-4"
                >
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-12 bg-orange-400/50 rounded-full" />
                    <div className="h-2 w-20 bg-white/20 rounded-full" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-2xl z-20"
          >
            <div className="text-center">
              <div className="text-xl font-bold text-white leading-none">AI</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Powered</div>
            </div>
          </motion.div>
          
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/20 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl z-20"
          >
            <div className="text-center p-4">
              <div className="text-sm font-bold text-white mb-1">Fyose Ecosystem</div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="h-full bg-purple-400" 
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
