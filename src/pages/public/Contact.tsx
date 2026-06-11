import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, addDoc, handleFirestoreError, OperationType } from "@/src/firebase";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "contactMessages"), {
        ...formData,
        status: "new",
        createdAt: new Date().toISOString(),
      });
      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "contactMessages");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <MessageSquare className="w-3 h-3" />
              <span>Get in Touch. Start a Conversation.</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] text-[#1a1a1a] uppercase">
              Let's build the <span className="text-brand-blue italic font-serif lowercase tracking-normal">future</span> together.
            </h1>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-12 font-medium">
              Have a project in mind or want to learn more about our services? Reach out to our team of experts and let's discuss how we can help you innovate.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-4xl font-black mb-12 text-[#1a1a1a] uppercase tracking-tight">Contact Information</h2>
              <div className="space-y-8">
                {[
                  { icon: Mail, label: "Email Us", value: "support@sachoinnovations.com", sub: "Support & Inquiries" },
                  { icon: Phone, label: "Call Us", value: "+260967233897", sub: "Mon-Fri, 9am-6pm CAT" },
                  { icon: MapPin, label: "Visit Us", value: "Innovation Hub, Lusaka, Zambia", sub: "Global Headquarters" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-6 group">
                    <div className="w-14 h-14 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all duration-500 shadow-lg shadow-brand-blue/5">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">{item.label}</p>
                      <p className="text-xl font-black text-[#1a1a1a] mb-1">{item.value}</p>
                      <p className="text-sm text-gray-500 font-medium">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-white border border-black/5 rounded-[40px] relative overflow-hidden group shadow-2xl shadow-brand-blue/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-blue/10 transition-all duration-700"></div>
              <h3 className="text-2xl font-black mb-6 flex items-center gap-4 text-[#1a1a1a] uppercase tracking-tight">
                <Globe className="w-6 h-6 text-brand-blue" /> Global Service Delivery
              </h3>
              <p className="text-gray-500 leading-relaxed mb-8 font-medium">
                While our physical headquarters are in <strong>Lusaka, Zambia</strong>, we offer our full suite of digital transformation and software engineering services to clients in <strong>any country</strong>. Our remote-first methodology ensures seamless collaboration across all time zones.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                {["Lusaka (HQ)", "London", "Tokyo", "Berlin", "New York", "Dubai"].map((city) => (
                  <span key={city} className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-brand-blue/30" />
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white border border-black/5 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
              
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 text-[#1a1a1a] uppercase tracking-tight">Message Sent!</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mb-10 leading-relaxed font-medium">
                    Thank you for reaching out. Our team will review your message and get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="px-8 py-4 bg-brand-bg hover:bg-gray-100 border border-black/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-[#1a1a1a]"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-brand-bg border border-black/5 rounded-2xl px-6 py-4 text-[#1a1a1a] focus:outline-none focus:border-brand-blue/50 transition-colors font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full bg-brand-bg border border-black/5 rounded-2xl px-6 py-4 text-[#1a1a1a] focus:outline-none focus:border-brand-blue/50 transition-colors font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Project Inquiry"
                      className="w-full bg-brand-bg border border-black/5 rounded-2xl px-6 py-4 text-[#1a1a1a] focus:outline-none focus:border-brand-blue/50 transition-colors font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Message</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your project..."
                      className="w-full bg-brand-bg border border-black/5 rounded-2xl px-6 py-4 text-[#1a1a1a] focus:outline-none focus:border-brand-blue/50 transition-colors resize-none font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 bg-brand-blue hover:bg-brand-blue/90 disabled:bg-brand-blue/50 rounded-2xl text-lg font-black text-white transition-all shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-2 group uppercase tracking-tight"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Send Message <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section Preview */}
      <section className="py-32 px-6 bg-white border-t border-black/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-12 text-[#1a1a1a] uppercase tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-6 text-left">
            {[
              { q: "How do I start a project with Sacho?", a: "You can start by filling out our project request form or contacting us directly. Our team will review your requirements and schedule a discovery call." },
              { q: "What industries do you specialize in?", a: "We have extensive experience in retail, logistics, manufacturing, finance, and technology sectors." },
              { q: "Do you offer ongoing support?", a: "Yes, we provide comprehensive maintenance and support packages to ensure your systems remain secure and up-to-date." },
            ].map((item, i) => (
              <div key={i} className="p-8 bg-brand-bg border border-black/5 rounded-3xl">
                <h4 className="text-lg font-black mb-4 text-brand-blue uppercase tracking-tight">{item.q}</h4>
                <p className="text-gray-500 leading-relaxed font-medium">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <button className="text-gray-400 font-black hover:text-brand-blue transition-colors flex items-center gap-2 mx-auto uppercase tracking-widest text-[10px]">
              View All FAQs <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
