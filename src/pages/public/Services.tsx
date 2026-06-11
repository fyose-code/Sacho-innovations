import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Globe, Cpu, Smartphone, Layout, Database, Lock, Settings, BarChart, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, handleFirestoreError, OperationType } from "@/src/firebase";

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
};

const Services: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "services"), (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "services"));

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

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-full text-brand-blue text-[10px] font-black uppercase tracking-widest mb-8 shadow-xl shadow-brand-blue/5">
              <Zap className="w-3 h-3" />
              <span>Our Capabilities. Your Success.</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] text-[#1a1a1a] uppercase">
              Comprehensive <span className="text-brand-blue italic font-serif lowercase tracking-normal">technology</span> solutions.
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-12 font-medium">
              We provide a wide range of specialized services designed to address the unique challenges of modern businesses. From mobile apps to industrial automation, we build the systems that power your growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-32 px-6 relative z-10 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto space-y-32">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Settings;
            return (
              <motion.div
                key={service.id}
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
                  <div className={cn(
                    "w-20 h-20 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl",
                    "bg-brand-blue/10 text-brand-blue shadow-brand-blue/10"
                  )}>
                    <Icon className="w-10 h-10" />
                  </div>
                  <h2 className="text-4xl font-black mb-6 text-[#1a1a1a] uppercase tracking-tight">{service.title}</h2>
                  <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium">{service.description}</p>
                  {service.features && service.features.length > 0 && (
                    <div className="space-y-4 mb-10">
                      {service.features.map((feature: string) => (
                        <div key={feature} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-brand-blue" />
                          <span className="text-gray-500 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {service.benefits && (
                    <div className="p-6 bg-brand-bg border border-black/5 rounded-3xl mb-10">
                      <p className="text-[10px] text-brand-blue font-black uppercase tracking-widest mb-2">The Benefit</p>
                      <p className="text-gray-500 italic font-medium">"{service.benefits}"</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/contact"
                      className="px-8 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2 group w-full sm:w-auto shadow-xl shadow-brand-blue/20"
                    >
                      Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to={`/services/${service.id}`}
                      className="px-8 py-4 bg-white border border-black/5 hover:bg-black/5 text-[#1a1a1a] rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2 group w-full sm:w-auto shadow-xl shadow-black/5"
                    >
                      Learn More <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                <div className={cn(
                  "relative",
                  index % 2 !== 0 && "lg:order-1"
                )}>
                  <div className={cn(
                    "absolute -inset-4 rounded-[40px] blur-[100px]",
                    "bg-brand-blue/5"
                  )}></div>
                  <div className="relative bg-white border border-black/5 rounded-[40px] p-4 overflow-hidden shadow-2xl">
                    <img
                      src={service.imageUrl || `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1000`}
                      alt={service.title}
                      className="rounded-[32px] w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Process Preview */}
      <section className="py-32 px-6 bg-brand-bg">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8 text-[#1a1a1a] uppercase tracking-tighter">Our Delivery Process</h2>
          <p className="text-gray-500 max-w-2xl mx-auto mb-20 text-lg font-medium">
            We follow a structured, transparent process to ensure every project is delivered on time and to the highest standards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Discovery", desc: "Understanding your goals and requirements." },
              { step: "02", title: "Design", desc: "Creating intuitive and beautiful experiences." },
              { step: "03", title: "Develop", desc: "Building robust and scalable systems." },
              { step: "04", title: "Deploy", desc: "Launching and supporting your innovation." },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 bg-white border border-black/5 rounded-3xl text-center group hover:shadow-2xl hover:shadow-brand-blue/10 transition-all"
              >
                <span className="text-4xl font-black text-brand-blue/20 group-hover:text-brand-blue/40 transition-colors mb-4 block">{item.step}</span>
                <h3 className="text-xl font-black mb-4 text-[#1a1a1a] uppercase tracking-tight">{item.title}</h3>
                <p className="text-gray-500 text-sm font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-20">
            <Link
              to="/process"
              className="inline-flex items-center gap-2 text-brand-blue font-black uppercase tracking-widest text-sm hover:gap-4 transition-all"
            >
              Learn more about our process <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
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
              Ready to <span className="text-brand-blue italic font-serif lowercase tracking-normal">get started</span>?
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
              Contact us today to discuss your project and discover how our technology solutions can transform your business.
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
                View Case Studies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
