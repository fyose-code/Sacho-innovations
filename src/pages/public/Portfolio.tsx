import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Globe, Cpu, Smartphone, Layout, Database, Lock, Settings, BarChart, ChevronRight, CheckCircle2, ArrowRight, Filter, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, handleFirestoreError, OperationType } from "@/src/firebase";

const categories = ["All", "Mobile Apps", "ERP Systems", "Automation", "Security", "Infrastructure"];

const Portfolio: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [caseStudies, setCaseStudies] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "caseStudies"), (snapshot) => {
      const caseStudiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCaseStudies(caseStudiesData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "caseStudies"));

    return () => unsubscribe();
  }, []);

  const filteredCaseStudies = caseStudies.filter((cs) => {
    const matchesCategory = activeCategory === "All" || cs.category === activeCategory;
    const matchesSearch = (cs.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                          (cs.client?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    return matchesCategory && matchesSearch;
  });

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
              <BarChart className="w-3 h-3" />
              <span>Our Work. Proven Results.</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] text-[#1a1a1a] uppercase">
              Selected <span className="text-brand-blue italic font-serif lowercase tracking-normal">case studies</span> of innovation.
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-12 font-medium">
              Explore how we've helped leading organizations transform their operations and achieve their goals through intelligent technology solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 p-6 bg-white border border-black/5 rounded-[32px] shadow-2xl shadow-brand-blue/5">
          <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-4 md:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                    : "bg-brand-bg text-gray-400 hover:bg-gray-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search case studies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-bg border border-black/5 rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-brand-blue/50 transition-colors font-medium"
            />
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-20 px-6 relative z-10 bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredCaseStudies.map((cs, index) => (
                <motion.div
                  key={cs.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group bg-brand-bg border border-black/5 rounded-[40px] overflow-hidden hover:shadow-2xl hover:shadow-brand-blue/10 transition-all duration-500 flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={cs.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000"}
                      alt={cs.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md border border-black/5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#1a1a1a]">
                        {cs.industry}
                      </span>
                    </div>
                  </div>
                  <div className="p-10 flex-1 flex flex-col">
                    <div className="mb-8">
                      <p className="text-brand-blue font-black uppercase tracking-widest text-[10px] mb-2">{cs.category}</p>
                      <h3 className="text-2xl font-black mb-4 text-[#1a1a1a] uppercase tracking-tight group-hover:text-brand-blue transition-colors leading-tight">{cs.title}</h3>
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Client: {cs.client}</p>
                    </div>
                    
                    <div className="space-y-6 mb-10 flex-1">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-2">The Challenge</p>
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 font-medium">{cs.challenge}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-brand-blue uppercase tracking-widest font-black mb-2">The Outcome</p>
                        <p className="text-sm text-gray-500 font-bold leading-relaxed line-clamp-3">{cs.outcome}</p>
                      </div>
                    </div>

                    <Link
                      to={`/portfolio/${cs.id}`}
                      className="w-full py-4 bg-white border border-black/5 hover:bg-brand-blue hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 group/btn shadow-xl shadow-black/5"
                    >
                      View Case Study <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredCaseStudies.length === 0 && (
            <div className="py-40 text-center">
              <div className="w-20 h-20 bg-white border border-black/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/5">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-tight mb-2">No case studies found</h3>
              <p className="text-gray-500 font-medium">Try adjusting your filters or search query.</p>
            </div>
          )}
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
              Ready to be our next <span className="text-brand-blue italic font-serif lowercase tracking-normal">success</span> story?
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
              Let's collaborate to build an intelligent system that solves your unique business challenges and delivers proven results.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-8">
              <Link
                to="/contact"
                className="px-12 py-6 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl text-xl font-bold transition-all shadow-2xl shadow-brand-blue/40 flex items-center justify-center gap-3"
              >
                Start a Project
              </Link>
              <Link
                to="/services"
                className="px-12 py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xl font-bold transition-all backdrop-blur-md text-white flex items-center justify-center gap-3"
              >
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
