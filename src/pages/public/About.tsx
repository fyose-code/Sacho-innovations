import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Globe, Cpu, Smartphone, Layout, Database, Lock, Settings, BarChart, Users, Target, Rocket, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { db, doc, onSnapshot, handleFirestoreError, OperationType } from "@/src/firebase";

const values = [
  {
    title: "Visionary Innovation",
    description: "We don't just follow trends; we anticipate the future of technology to build systems that stand the test of time.",
    icon: Rocket,
    color: "blue",
  },
  {
    title: "Uncompromising Quality",
    description: "Every line of code and every hardware installation is executed with precision and a commitment to excellence.",
    icon: Shield,
    color: "purple",
  },
  {
    title: "Human-Centric Design",
    description: "Technology should serve people. We prioritize usability and intuitive experiences in everything we build.",
    icon: Heart,
    color: "red",
  },
  {
    title: "Strategic Partnership",
    description: "We view our clients as partners, working closely to understand their unique challenges and goals.",
    icon: Target,
    color: "emerald",
  },
];

const About: React.FC = () => {
  const [aboutContent, setAboutContent] = useState({
    title: "We are the architects of intelligent digital ecosystems.",
    description: "Sacho Innovations was founded with a single mission: to bridge the gap between complex technology and human-centric business solutions. We are a team of visionaries, engineers, and designers dedicated to building the future of enterprise technology.",
    mission: "To empower businesses with intelligent, scalable, and secure digital systems that drive innovation, efficiency, and growth in an ever-evolving technological landscape.",
    vision: "To be the global leader in digital transformation, setting the standard for how technology integrates into the fabric of modern enterprise and society."
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "content", "about"), (doc) => {
      if (doc.exists()) {
        setAboutContent(doc.data() as any);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, "content/about"));

    return () => unsubscribe();
  }, []);

  return (
    <div className="relative overflow-hidden bg-brand-bg">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-yellow/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-full text-brand-blue text-[10px] font-black uppercase tracking-widest mb-8 shadow-xl shadow-brand-blue/5">
              <Zap className="w-3 h-3" />
              <span>Our Story. Our Vision.</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] text-[#1a1a1a] uppercase">
              {aboutContent.title.split(" ").map((word, i) => (
                <span key={i} className={cn(word.toLowerCase() === "intelligent" ? "text-brand-blue italic font-serif lowercase tracking-normal" : "")}>
                  {word}{" "}
                </span>
              ))}
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-12 font-medium">
              {aboutContent.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-32 px-6 relative z-10 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-12 bg-brand-bg border border-black/5 rounded-[40px] relative overflow-hidden group shadow-2xl shadow-brand-blue/5"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-blue/10 transition-all duration-700"></div>
            <h2 className="text-4xl font-black mb-8 flex items-center gap-4 text-[#1a1a1a] uppercase tracking-tight">
              <Target className="w-8 h-8 text-brand-blue" /> Our Mission
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              {aboutContent.mission}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-12 bg-brand-bg border border-black/5 rounded-[40px] relative overflow-hidden group shadow-2xl shadow-brand-yellow/5"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-yellow/10 transition-all duration-700"></div>
            <h2 className="text-4xl font-black mb-8 flex items-center gap-4 text-[#1a1a1a] uppercase tracking-tight">
              <Globe className="w-8 h-8 text-brand-yellow" /> Our Vision
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              {aboutContent.vision}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-32 px-6 bg-brand-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-[#1a1a1a] uppercase tracking-tighter">Our Core Values</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
              The principles that guide every project we undertake and every decision we make.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-10 bg-white border border-black/5 rounded-[40px] hover:shadow-2xl hover:shadow-brand-blue/10 transition-all duration-500 group"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-6",
                  value.color === "blue" && "bg-brand-blue/10 text-brand-blue",
                  value.color === "purple" && "bg-purple-500/10 text-purple-500",
                  value.color === "red" && "bg-red-500/10 text-red-500",
                  value.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                )}>
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-[#1a1a1a] uppercase tracking-tight">{value.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder / Mindset Section */}
      <section className="py-40 px-6 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-brand-blue/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="relative bg-white border border-black/5 rounded-[48px] p-4 overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000"
                alt="Innovation Mindset"
                className="rounded-[40px] w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl md:text-8xl font-black mb-10 leading-[0.85] text-[#1a1a1a] uppercase tracking-tighter">
              Innovation is a <span className="text-brand-blue italic font-serif lowercase tracking-normal">mindset</span>, not just a department.
            </h2>
            <p className="text-gray-500 text-xl leading-relaxed mb-10 font-medium">
              At Sacho Innovations, we believe that true progress comes from a relentless pursuit of better solutions. We don't settle for "good enough." We push the boundaries of what's possible to deliver systems that are not only functional but transformative.
            </p>
            <p className="text-gray-500 text-xl leading-relaxed mb-12 font-medium">
              Our culture is built on curiosity, collaboration, and a shared passion for building things that matter. We are more than just a software company; we are your partners in the future.
            </p>
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-brand-blue rounded-3xl flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-brand-blue/20">S</div>
              <div>
                <p className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight">Sacho Innovations Team</p>
                <p className="text-brand-blue font-bold italic font-serif">Visionaries & Engineers</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 bg-brand-bg">
        <div className="max-w-6xl mx-auto bg-[#1a1a1a] rounded-[60px] p-16 md:p-32 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-blue/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-yellow/10 rounded-full blur-[100px]"></div>
          
          <div className="relative z-10">
            <h2 className="text-5xl md:text-8xl font-black mb-10 leading-[0.85] text-white uppercase tracking-tighter">
              Join our <span className="text-brand-blue italic font-serif lowercase tracking-normal">journey</span>.
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
              Whether you're a potential client or a visionary talent, we'd love to connect and build the future together.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-8">
              <Link
                to="/contact"
                className="px-12 py-6 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-xl font-bold transition-all shadow-2xl shadow-brand-blue/40 flex items-center justify-center gap-3"
              >
                Start a Project
              </Link>
              <Link
                to="/login"
                className="px-12 py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xl font-bold transition-all backdrop-blur-md text-white flex items-center justify-center gap-3"
              >
                Client Portal <Lock className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
