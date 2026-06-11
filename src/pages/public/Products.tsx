import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Globe, Cpu, Smartphone, Layout, Database, Lock, Settings, BarChart, ChevronRight, CheckCircle2, ArrowRight, Rocket, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, handleFirestoreError, OperationType } from "@/src/firebase";

const iconMap: { [key: string]: any } = {
  Sparkles,
  Database,
  Shield,
  Smartphone,
  Cpu,
  Lock,
  Settings,
  Layout,
  Globe,
  Zap,
  BarChart,
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "products"));

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
              <Rocket className="w-3 h-3" />
              <span>Our Innovations. Your Future.</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] text-[#1a1a1a] uppercase">
              Building the <span className="text-brand-blue italic font-serif lowercase tracking-normal">next generation</span> of digital systems.
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-12 font-medium">
              Sacho Innovations is more than a service provider; we are a product lab. We build scalable, intelligent platforms that solve complex business problems and set new industry standards.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-32 px-6 relative z-10 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto space-y-32">
          {products.map((product, index) => {
            const Icon = iconMap[product.icon] || Sparkles;
            return (
              <motion.div
                key={product.id}
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
                  <h2 className="text-4xl font-black mb-2 text-[#1a1a1a] uppercase tracking-tight">{product.title}</h2>
                  <p className="text-brand-blue font-black uppercase tracking-widest text-[10px] mb-6">{product.tagline}</p>
                  <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium">{product.description}</p>
                  {product.features && product.features.length > 0 && (
                    <div className="space-y-4 mb-10">
                      {product.features.map((feature: string) => (
                        <div key={feature} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-brand-blue" />
                          <span className="text-gray-500 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-6">
                    <Link
                      to={`/products/${product.id}`}
                      className="px-8 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2 group w-full sm:w-auto shadow-xl shadow-brand-blue/20"
                    >
                      Learn More <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to="/contact"
                      className="px-8 py-4 bg-white border border-black/5 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto shadow-xl shadow-black/5"
                    >
                      Request Demo
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
                  <div className="relative bg-white border border-black/5 rounded-[40px] p-4 overflow-hidden shadow-2xl group">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1000"}
                      alt={product.title}
                      className="rounded-[32px] w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-12">
                      <p className="text-white font-black uppercase tracking-tight text-xl">{product.title} Interface Preview</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Upcoming Innovations */}
      <section className="py-32 px-6 bg-brand-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-[#1a1a1a] uppercase tracking-tighter">Upcoming Innovations</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
              Our lab is constantly working on new technologies to solve the challenges of tomorrow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "Sacho AI Engine", desc: "A proprietary AI engine designed for industrial and retail predictive analytics.", status: "In Development" },
              { title: "Smart Infrastructure Hub", desc: "A unified platform for managing smart city and large-scale industrial infrastructure.", status: "Research Phase" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-10 bg-white border border-black/5 rounded-[40px] relative overflow-hidden group hover:shadow-2xl hover:shadow-brand-blue/10 transition-all"
              >
                <div className="absolute top-0 right-0 p-6">
                  <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-[10px] font-black rounded uppercase tracking-widest border border-brand-blue/20">
                    {item.status}
                  </span>
                </div>
                <h3 className="text-2xl font-black mb-4 text-[#1a1a1a] uppercase tracking-tight group-hover:text-brand-blue transition-colors">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-8 font-medium">{item.desc}</p>
                <div className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest group-hover:text-[#1a1a1a] transition-colors">
                  Coming Soon <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
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
              Build your <span className="text-brand-blue italic font-serif lowercase tracking-normal">product</span> with us.
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
              Have a visionary product idea? Let's collaborate to bring it to life with our expertise in high-end software and systems.
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
                View Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
