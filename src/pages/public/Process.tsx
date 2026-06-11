import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Globe, Cpu, Smartphone, Layout, Database, Lock, Settings, BarChart, ChevronRight, CheckCircle2, ArrowRight, Search, Target, Rocket, Heart, Code, Eye, Layers, Cloud } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const steps = [
  {
    step: "01",
    title: "Discovery & Strategy",
    description: "We begin by deeply understanding your business goals, challenges, and user needs. This phase involves workshops, research, and strategic planning to define the project roadmap.",
    icon: Search,
    color: "blue",
    details: ["Stakeholder Interviews", "User Research", "Competitive Analysis", "Technical Feasibility Study"],
  },
  {
    step: "02",
    title: "Design & Prototyping",
    description: "Our designers create intuitive and beautiful experiences. We build high-fidelity prototypes that allow you to visualize and test the product before a single line of code is written.",
    icon: Layout,
    color: "purple",
    details: ["Wireframing & UX Flow", "High-Fidelity UI Design", "Interactive Prototyping", "Design System Creation"],
  },
  {
    step: "03",
    title: "Engineering & Development",
    description: "Our engineers build robust, scalable, and secure systems using the latest technologies. We follow agile methodologies and maintain high standards of code quality and performance.",
    icon: Code,
    color: "emerald",
    details: ["Agile Development Sprints", "Continuous Integration (CI/CD)", "Security-First Architecture", "Performance Optimization"],
  },
  {
    step: "04",
    title: "Quality Assurance",
    description: "Rigorous testing is performed to ensure every feature works perfectly across all devices and platforms. We leave no stone unturned in our pursuit of excellence.",
    icon: Shield,
    color: "red",
    details: ["Automated & Manual Testing", "Security Vulnerability Scans", "User Acceptance Testing (UAT)", "Cross-Browser Compatibility"],
  },
  {
    step: "05",
    title: "Deployment & Launch",
    description: "We manage the entire deployment process, ensuring a smooth transition to the live environment. Our team provides comprehensive support during the launch phase.",
    icon: Rocket,
    color: "orange",
    details: ["Cloud Infrastructure Setup", "Database Migration", "Launch Monitoring", "Go-Live Support"],
  },
  {
    step: "06",
    title: "Optimization & Growth",
    description: "Post-launch, we continue to monitor, maintain, and optimize your system. We use data-driven insights to suggest improvements and support your long-term growth.",
    icon: BarChart,
    color: "cyan",
    details: ["Performance Monitoring", "User Analytics Analysis", "Ongoing Maintenance", "Feature Enhancements"],
  },
];

const Process: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-brand-bg">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-yellow/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-full text-brand-blue text-[10px] font-black uppercase tracking-widest mb-8 shadow-xl shadow-brand-blue/5">
              <Layers className="w-3 h-3" />
              <span>Our Methodology. Your Excellence.</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] text-[#1a1a1a] uppercase">
              A <span className="text-brand-blue italic font-serif lowercase tracking-normal">proven</span> path to innovation.
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-12 font-medium">
              We follow a structured, transparent, and highly collaborative process to ensure that every project we undertake is delivered with precision and achieves its strategic goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-32 px-6 relative z-10 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto space-y-40">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={cn(
                "grid grid-cols-1 lg:grid-cols-2 gap-20 items-center",
                index % 2 !== 0 && "lg:flex-row-reverse"
              )}
            >
              <div className={cn(index % 2 !== 0 && "lg:order-2")}>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-[120px] font-black text-brand-blue/10 leading-none select-none">{step.step}</span>
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl bg-brand-bg border border-black/5",
                    step.color === "blue" && "text-brand-blue shadow-brand-blue/10",
                    step.color === "purple" && "text-purple-600 shadow-purple-600/10",
                    step.color === "emerald" && "text-emerald-600 shadow-emerald-600/10",
                    step.color === "red" && "text-red-600 shadow-red-600/10",
                    step.color === "orange" && "text-orange-600 shadow-orange-600/10",
                    step.color === "cyan" && "text-cyan-600 shadow-cyan-600/10",
                  )}>
                    <step.icon className="w-8 h-8" />
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-[#1a1a1a] uppercase tracking-tight mb-6">{step.title}</h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium">{step.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {step.details.map((detail) => (
                    <div key={detail} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                      <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cn(
                "relative",
                index % 2 !== 0 && "lg:order-1"
              )}>
                <div className={cn(
                  "absolute -inset-4 rounded-[40px] blur-[100px]",
                  step.color === "blue" && "bg-brand-blue/10",
                  step.color === "purple" && "bg-purple-600/10",
                  step.color === "emerald" && "bg-emerald-600/10",
                  step.color === "red" && "bg-red-600/10",
                  step.color === "orange" && "bg-orange-600/10",
                  step.color === "cyan" && "bg-cyan-600/10",
                )}></div>
                <div className="relative bg-white border border-black/5 rounded-[40px] p-4 overflow-hidden shadow-2xl shadow-black/5">
                  <div className="aspect-video bg-brand-bg rounded-2xl flex items-center justify-center border border-black/5 group overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${index === 0 ? '1552664730-d307ca884978' : index === 1 ? '1586717791821-3f44a563eb4c' : index === 2 ? '1555066931-4365d14bab8c' : index === 3 ? '1516321318423-f06f85e504b3' : index === 4 ? '1451187580459-43490279c0fa' : '1551288049-bebda4e38f71'}?auto=format&fit=crop&q=80&w=1000`}
                      alt={step.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Transparency & Collaboration */}
      <section className="py-40 px-6 bg-brand-bg border-t border-black/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[0.85] text-[#1a1a1a] uppercase tracking-tighter">
              Transparency is our <span className="text-brand-blue italic font-serif lowercase tracking-normal">foundation</span>.
            </h2>
            <p className="text-gray-500 text-xl leading-relaxed mb-8 font-medium">
              We believe that the best results are achieved through open communication and constant collaboration. That's why we provide our clients with direct access to our project management ecosystem.
            </p>
            <div className="space-y-6 mb-10">
              {[
                "Real-time progress tracking",
                "Direct communication with the team",
                "Transparent milestone approvals",
                "Centralized file & asset management",
              ].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-brand-blue/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue" />
                  </div>
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">{item}</span>
                </div>
              ))}
            </div>
            <Link
              to="/contact"
              className="px-12 py-6 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-xl font-bold transition-all shadow-2xl shadow-brand-blue/40 flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              Start a Project <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-brand-blue/10 rounded-full blur-[100px]"></div>
            <div className="relative bg-white border border-black/5 rounded-[40px] p-4 overflow-hidden shadow-2xl shadow-black/5">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1000"
                alt="Collaboration"
                className="rounded-[32px] w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-6xl mx-auto bg-[#1a1a1a] rounded-[60px] p-16 md:p-32 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-blue/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-yellow/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10">
            <h2 className="text-5xl md:text-8xl font-black mb-10 leading-[0.85] text-white uppercase tracking-tighter">
              Ready to start your <span className="text-brand-blue italic font-serif lowercase tracking-normal">journey</span>?
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
              Experience our proven process firsthand. Contact us today to discuss your project and discover how we can build the future together.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-8">
              <Link
                to="/contact"
                className="px-12 py-6 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-xl font-bold transition-all shadow-2xl shadow-brand-blue/40 flex items-center justify-center gap-3"
              >
                Start a Project
              </Link>
              <Link
                to="/portfolio"
                className="px-12 py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xl font-bold transition-all backdrop-blur-md text-white flex items-center justify-center gap-3"
              >
                View Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Process;
