import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
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
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Activity
} from "lucide-react";
import { db, doc, getDoc, handleFirestoreError, OperationType } from "@/src/firebase";
import { cn } from "@/src/lib/utils";

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

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      try {
        const docRef = doc(db, "services", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setService({ id: docSnap.id, ...docSnap.data() });
        } else {
          navigate("/services");
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `services/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!service) return null;

  const Icon = iconMap[service.icon] || Settings;

  return (
    <div className="relative overflow-hidden bg-brand-bg">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-yellow/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Link 
            to="/services" 
            className="inline-flex items-center gap-2 text-brand-blue font-bold uppercase tracking-widest text-[10px] mb-12 hover:gap-4 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Services
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/5 rounded-full text-brand-blue text-[10px] font-black uppercase tracking-widest mb-8 shadow-xl shadow-brand-blue/5">
                <Icon className="w-3 h-3" />
                <span>{service.category || "Service Detail"}</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] text-[#1a1a1a] uppercase">
                {service.title}
              </h1>
              <p className="text-xl text-gray-500 leading-relaxed mb-12 font-medium">
                {service.description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="px-8 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-lg font-bold transition-all shadow-xl shadow-brand-blue/20"
                >
                  Consult with Us
                </Link>
                <button className="px-8 py-4 bg-white border border-black/5 hover:bg-black/5 text-[#1a1a1a] rounded-2xl text-lg font-bold transition-all">
                  Download Brochure
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-brand-blue/5 rounded-full blur-[120px] animate-pulse"></div>
              <div className="relative bg-white border border-black/5 rounded-[48px] p-4 overflow-hidden shadow-2xl">
                <img
                  src={service.imageUrl || `https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1000`}
                  alt={service.title}
                  className="rounded-[40px] w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features & Benefits */}
      <section className="py-32 px-6 bg-white border-y border-black/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
            <div className="lg:col-span-2 space-y-16">
              <div>
                <h2 className="text-4xl font-black mb-8 text-[#1a1a1a] uppercase tracking-tight">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {service.features?.map((feature: string, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-8 bg-brand-bg border border-black/5 rounded-3xl group hover:shadow-xl hover:shadow-brand-blue/5 transition-all"
                    >
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6 text-brand-blue" />
                      </div>
                      <h3 className="text-lg font-black mb-2 text-[#1a1a1a] uppercase tracking-tight">{feature}</h3>
                      <p className="text-gray-500 text-sm font-medium">Advanced implementation of {feature.toLowerCase()} for your business needs.</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-4xl font-black mb-8 text-[#1a1a1a] uppercase tracking-tight">The Impact</h2>
                <div className="p-12 bg-brand-bg border border-black/5 rounded-[40px] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                  <Sparkles className="w-12 h-12 text-brand-yellow mb-8" />
                  <p className="text-2xl text-gray-500 italic font-medium leading-relaxed">
                    "{service.benefits}"
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="p-10 bg-brand-dark rounded-[40px] text-white shadow-2xl">
                <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">Technical Specs</h3>
                <div className="space-y-6">
                  {[
                    { label: "Deployment", value: "Cloud / On-Premise" },
                    { label: "Scalability", value: "Enterprise Ready" },
                    { label: "Security", value: "End-to-End Encryption" },
                    { label: "Support", value: "24/7 Priority" },
                  ].map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{spec.label}</span>
                      <span className="text-sm font-bold">{spec.value}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-10 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl font-bold transition-all">
                  Request Technical Specs
                </button>
              </div>

              <div className="p-10 bg-brand-bg border border-black/5 rounded-[40px]">
                <h3 className="text-xl font-black mb-6 uppercase tracking-tight text-[#1a1a1a]">Related Services</h3>
                <div className="space-y-4">
                  {["Digital Transformation", "Cloud Infrastructure", "AI Integration"].map((item) => (
                    <Link key={item} to="/services" className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl hover:border-brand-blue/30 transition-all group">
                      <span className="text-sm font-bold text-gray-500 group-hover:text-brand-blue transition-colors">{item}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-blue transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
              Ready to <span className="text-brand-blue italic font-serif lowercase tracking-normal">transform</span>?
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
              Let's discuss how {service.title} can be tailored to your specific business requirements.
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

export default ServiceDetail;
