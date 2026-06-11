import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Globe, Cpu, Zap } from "lucide-react";

export default function InnovationVision() {
  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3 h-3" />
            Our Vision
          </div>
          <h2 className="text-5xl md:text-8xl font-bold text-white leading-tight tracking-tighter">
            Shaping the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-[length:200%_auto] animate-gradient">Intelligent</span> Future.
          </h2>
          <p className="text-xl md:text-2xl text-white/60 max-w-4xl mx-auto leading-relaxed font-light italic">
            "We aren't just building digital products; we're architecting the 
            interconnected systems that will define Africa's role in the 
            global technology landscape."
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 pt-12">
          {[
            { title: "Digital Transformation", icon: Zap, desc: "Empowering businesses to thrive in a digital-first world." },
            { title: "Connected Systems", icon: Globe, desc: "Bridging software and hardware for seamless operations." },
            { title: "Scalable Innovation", icon: Cpu, desc: "Building solutions that grow with your vision and impact." },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 mx-auto shadow-xl">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="text-white/40">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
