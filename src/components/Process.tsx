import React from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Map, 
  PenTool, 
  Code, 
  Layers, 
  Rocket, 
  Settings 
} from "lucide-react";

const steps = [
  { title: "Discovery", icon: Search, desc: "We dive deep into your business needs and market landscape." },
  { title: "Planning", icon: Map, desc: "Defining the roadmap, architecture, and system requirements." },
  { title: "Design", icon: PenTool, desc: "Creating intuitive UI/UX and system interface prototypes." },
  { title: "Development", icon: Code, desc: "Writing clean, scalable code and building core functionality." },
  { title: "Integration", icon: Layers, desc: "Connecting systems and ensuring seamless data flow." },
  { title: "Deployment", icon: Rocket, desc: "Launching your solution with zero-downtime strategies." },
  { title: "Optimization", icon: Settings, desc: "Continuous monitoring, support, and feature updates." },
];

export default function Process() {
  return (
    <section id="process" className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase"
          >
            Our Methodology
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white"
          >
            A <span className="text-blue-400">Structured</span> Path to Innovation.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60"
          >
            Our proven process ensures every project is delivered with precision, 
            scalability, and excellence.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 hidden lg:block -translate-y-1/2" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-7 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-blue-600/20 relative">
                  <step.icon className="w-7 h-7" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-black">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
