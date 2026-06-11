import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, Shield, Cpu, Globe, Users, BarChart3, Rocket } from "lucide-react";

const pillars = [
  { title: "Innovation-First", icon: Rocket, desc: "We don't just follow trends; we set them through continuous R&D." },
  { title: "Systems Thinking", icon: Cpu, desc: "End-to-end integration across software, hardware, and automation." },
  { title: "Enterprise Grade", icon: Shield, desc: "Scalable, secure, and reliable solutions built for high-stakes environments." },
  { title: "African Rooted", icon: Globe, desc: "Deep understanding of the local landscape with a global competitive edge." },
  { title: "Expert Engineering", icon: Users, desc: "A multidisciplinary team of world-class designers and engineers." },
  { title: "Data Driven", icon: BarChart3, desc: "Intelligent analytics that turn raw data into actionable business insights." },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase">
              The Sacho Advantage
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Why Leaders <span className="text-blue-400">Trust</span> Sacho Innovations.
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              We combine deep technical expertise with a visionary mindset to deliver 
              solutions that don't just solve today's problems, but anticipate 
              tomorrow's challenges.
            </p>
            
            <div className="space-y-4">
              {[
                "100% Custom-Built Solutions",
                "Dedicated 24/7 Technical Support",
                "Agile Development Methodology",
                "Seamless System Integration",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-white/80">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group"
              >
                <pillar.icon className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
