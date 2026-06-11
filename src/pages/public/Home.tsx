import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  Cpu, 
  Smartphone, 
  Layout, 
  Database, 
  Lock, 
  Settings, 
  BarChart, 
  MessageSquare,
  Sparkles,
  Rocket,
  Code2,
  Terminal,
  MousePointer2,
  Layers,
  Activity,
  CheckCircle2,
  Video as VideoIcon,
  Monitor,
  PhoneOff,
  Users,
  Video,
  Mic,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { db, doc, onSnapshot, collection, handleFirestoreError, OperationType } from "@/src/firebase";
import confetti from "canvas-confetti";

const iconMap: { [key: string]: any } = {
  Smartphone,
  Database,
  Cpu,
  Lock,
  Settings,
  Layout,
  Globe,
  Zap,
  Shield,
  BarChart,
  MessageSquare
};

const Illustration: React.FC<{ type: "hero" | "ecosystem" | "collaboration" }> = ({ type }) => {
  if (type === "hero") {
    return (
      <div className="relative w-full h-[600px] flex items-center justify-center">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Abstract Curves inspired by logo */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.05, 1],
            borderRadius: ["40% 60% 70% 30%/40% 50% 60% 50%", "60% 40% 30% 70%/50% 60% 40% 50%", "40% 60% 70% 30%/40% 50% 60% 50%"]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-[550px] h-[550px] border-[1px] border-brand-blue/30 blur-[1px]"
        />
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.1, 1],
            borderRadius: ["60% 40% 30% 70%/50% 60% 40% 50%", "40% 60% 70% 30%/40% 50% 60% 50%", "60% 40% 30% 70%/50% 60% 40% 50%"]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-[450px] h-[450px] border-[1px] border-brand-yellow/30 blur-[1px]"
        />
        
        {/* Central Tech Hub */}
        <div className="relative z-10 grid grid-cols-3 gap-6 md:gap-10">
          {[
            { Icon: Smartphone, label: "Mobile", color: "blue" },
            { Icon: Database, label: "Data", color: "emerald" },
            { Icon: Cpu, label: "Systems", color: "purple" },
            { Icon: Globe, label: "Cloud", color: "cyan" },
            { Icon: Zap, label: "Fast", color: "yellow" },
            { Icon: Shield, label: "Secure", color: "red" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8, type: "spring" }}
              whileHover={{ 
                scale: 1.15, 
                rotate: i % 2 === 0 ? 8 : -8,
                boxShadow: "0 25px 50px -12px rgba(47, 128, 237, 0.25)"
              }}
              className="group relative w-24 h-24 md:w-32 md:h-32 bg-white/80 backdrop-blur-xl border border-black/5 rounded-[32px] flex flex-col items-center justify-center shadow-2xl transition-all cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]" />
              <item.Icon className="w-10 h-10 md:w-14 md:h-14 text-brand-blue group-hover:scale-110 transition-transform duration-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] mt-3 text-gray-400 group-hover:text-brand-blue transition-colors">
                {item.label}
              </span>
              
              {/* Decorative corner */}
              <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-brand-blue/20 group-hover:bg-brand-blue transition-colors" />
            </motion.div>
          ))}
        </div>

        {/* Floating Code Snippets */}
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 2, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 p-5 bg-brand-dark rounded-3xl border border-white/10 shadow-2xl hidden lg:block backdrop-blur-xl"
        >
          <div className="flex gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>
          <code className="text-[11px] text-brand-blue font-mono leading-relaxed">
            <span className="text-purple-400">const</span> sacho = <span className="text-yellow-400">new</span> <span className="text-emerald-400">Innovation</span>();<br/>
            sacho.<span className="text-blue-300">transform</span>(business);<br/>
            <span className="text-gray-500">// Status: Optimized</span>
          </code>
        </motion.div>

        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -2, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-0 p-5 bg-white rounded-3xl border border-black/5 shadow-2xl hidden lg:block backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                <motion.div 
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-full w-1/2 bg-brand-blue"
                />
              </div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Neural Network Syncing...</p>
            </div>
          </div>
        </motion.div>
        
        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -200, 0],
              x: [0, Math.random() * 200 - 100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className={cn(
              "absolute w-1.5 h-1.5 rounded-full blur-[1px]",
              i % 3 === 0 ? "bg-brand-blue" : i % 3 === 1 ? "bg-brand-yellow" : "bg-purple-400"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>
    );
  }
  return null;
};

const Home: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const [aboutContent, setAboutContent] = useState({
    title: "Innovating the Future of Digital Ecosystems",
    description: "Sacho Innovations delivers high-end software, automation, and intelligent systems designed for reliability, scalability, and enterprise-level impact."
  });
  const [siteSettings, setSiteSettings] = useState({
    projectsDelivered: "250+",
    clientSatisfaction: "99%",
    linesOfCode: "5M+",
    globalReach: "15+"
  });
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeAbout = onSnapshot(doc(db, "content", "about"), (doc) => {
      if (doc.exists()) {
        setAboutContent(doc.data() as any);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, "content/about"));

    const unsubscribeSettings = onSnapshot(doc(db, "content", "settings"), (doc) => {
      if (doc.exists()) {
        setSiteSettings(doc.data() as any);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, "content/settings"));

    const unsubscribeServices = onSnapshot(collection(db, "services"), (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "services"));

    return () => {
      unsubscribeAbout();
      unsubscribeSettings();
      unsubscribeServices();
    };
  }, []);

  const handleCTAClick = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#2F80ED", "#F2C94C", "#FFFFFF"]
    });
  };

  return (
    <div className="relative overflow-hidden bg-brand-bg">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-32 px-6 overflow-hidden">
        {/* Abstract Curves Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <path d="M0,1000 C300,800 400,1000 1000,800 L1000,0 L0,0 Z" fill="url(#hero-gradient)" />
            <defs>
              <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-brand-blue)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-brand-yellow/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <motion.div 
          style={{ opacity, scale }}
          className="max-w-7xl mx-auto relative z-10 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-white border border-brand-border rounded-full text-brand-blue text-xs font-bold mb-10 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-brand-yellow" />
            <span className="uppercase tracking-[0.2em]">Innovation • Energy • Reliability</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1] text-brand-dark"
          >
            {aboutContent.title.split(" ").map((word, i) => (
              <span key={i} className={cn(
                "inline-block",
                word.toLowerCase() === "future" ? "text-brand-blue" : ""
              )}>
                {word}{" "}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-brand-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            {aboutContent.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              to="/contact"
              onClick={handleCTAClick}
              className="btn-primary flex items-center gap-3 group"
            >
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              to="/portfolio"
              className="btn-secondary flex items-center gap-3"
            >
              View Solutions <Layers className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Illustration */}
        <div className="mt-20 w-full max-w-4xl relative z-10">
          <Illustration type="hero" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-brand-border bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Projects Delivered", value: siteSettings.projectsDelivered, icon: Rocket },
              { label: "Client Satisfaction", value: siteSettings.clientSatisfaction, icon: CheckCircle2 },
              { label: "Lines of Code", value: siteSettings.linesOfCode, icon: Code2 },
              { label: "Global Reach", value: siteSettings.globalReach, icon: Globe },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="w-5 h-5 text-brand-blue" />
                  <span className="text-4xl font-bold text-brand-dark">{stat.value}</span>
                </div>
                <p className="text-xs text-brand-secondary uppercase tracking-widest font-semibold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue-soft border border-brand-blue/10 rounded-full text-brand-blue text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3" /> Our Expertise
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-brand-dark mb-6">
              Transformative <span className="text-brand-blue">Solutions</span>
            </h2>
            <p className="text-brand-secondary max-w-2xl mx-auto text-lg">
              We build robust digital ecosystems that empower businesses to scale with confidence and efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon] || Settings;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card-base card-accent-blue p-10 group"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-brand-blue-soft text-brand-blue group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-brand-dark">{service.title}</h3>
                  <p className="text-brand-secondary text-sm leading-relaxed mb-8">{service.description}</p>
                  <Link to="/services" className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:gap-4 transition-all">
                    Explore Service <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fyose Spotlight */}
      <section className="py-40 px-6 relative overflow-hidden bg-brand-blue-soft/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-yellow-soft border border-brand-yellow/20 rounded-full text-brand-dark text-xs font-bold uppercase tracking-widest mb-10">
              <Sparkles className="w-3 h-3 text-brand-yellow" /> Flagship Platform
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-brand-dark">
              Meet <span className="text-brand-blue">Fyose</span>.
            </h2>
            <p className="text-brand-secondary text-xl leading-relaxed mb-10">
              Our revolutionary commerce ecosystem that unifies retail, logistics, and engagement. Built for the modern enterprise.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/products/fyose"
                className="btn-primary flex items-center justify-center gap-3"
              >
                Discover Fyose <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="btn-secondary flex items-center justify-center gap-3"
              >
                Request Demo <Terminal className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="card-base p-4 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=2000"
                alt="Fyose Platform"
                className="rounded-[12px] w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-yellow rounded-2xl flex items-center justify-center shadow-xl rotate-6">
              <Zap className="w-16 h-16 text-brand-dark" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto bg-brand-dark rounded-[32px] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-blue/20 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-bold mb-8 text-white">
              Ready to <span className="text-brand-yellow">Innovate?</span>
            </h2>
            <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-12">
              Partner with Sacho Innovations to build the intelligent systems your business needs to lead the market.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/contact"
                onClick={handleCTAClick}
                className="btn-accent flex items-center justify-center gap-3 text-lg px-10"
              >
                Start Your Project <MousePointer2 className="w-6 h-6" />
              </Link>
              <Link
                to="/login"
                className="px-10 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-lg font-semibold transition-all text-white flex items-center justify-center gap-3"
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

export default Home;
