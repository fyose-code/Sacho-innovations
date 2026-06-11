import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  CheckCircle2,
  Loader2,
  Send,
  Wand2,
  FileText,
  Layout,
  Smartphone,
  Shield,
  Cpu,
  Database,
  Network,
  Monitor
} from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from "@/src/lib/utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

type FormMode = "welcome" | "guided" | "ai";

interface ProjectFormData {
  // Client Info
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  contactMethod: string;
  clientType: string;
  
  // Project Scope
  services: string[];
  otherService: string;
  projectCategory: string;
  projectName: string;
  projectDescription: string;
  
  // Goals & Users
  problems: string[];
  outcomes: string[];
  otherGoal: string;
  targetUsers: string[];
  userCount: string;
  
  // Features & Platforms
  features: string[];
  specialFeatures: string;
  platforms: string[];
  crossPlatform: string;
  
  // Design
  designStyle: string[];
  brandingStatus: string;
  inspiration: string;
  
  // Existing System
  existingStatus: string;
  existingDetails: string;
  
  // Technical
  integrations: string[];
  integrationDetails: string;
  sensitivity: string;
  technicalRequirements: string[];
  
  // Timeline & Budget
  startTime: string;
  completionTime: string;
  urgency: string;
  budgetRange: string;
  paymentPreference: string;
  
  // Decision
  readiness: string;
  decisionMaker: string;
  additionalNotes: string;
}

const initialData: ProjectFormData = {
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  contactMethod: "Email",
  clientType: "",
  services: [],
  otherService: "",
  projectCategory: "",
  projectName: "",
  projectDescription: "",
  problems: [],
  outcomes: [],
  otherGoal: "",
  targetUsers: [],
  userCount: "",
  features: [],
  specialFeatures: "",
  platforms: [],
  crossPlatform: "",
  designStyle: [],
  brandingStatus: "",
  inspiration: "",
  existingStatus: "",
  existingDetails: "",
  integrations: [],
  integrationDetails: "",
  sensitivity: "",
  technicalRequirements: [],
  startTime: "",
  completionTime: "",
  urgency: "",
  budgetRange: "",
  paymentPreference: "",
  readiness: "",
  decisionMaker: "",
  additionalNotes: "",
};

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectForm({ isOpen, onClose }: ProjectFormProps) {
  const [mode, setMode] = useState<FormMode>("welcome");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>(initialData);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 18; // Guided steps

  const updateData = (updates: Partial<ProjectFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Analyze this project brief and generate a structured project request in JSON format. 
        Brief: "${aiPrompt}"
        
        The JSON should match this structure:
        {
          "projectName": "string",
          "projectDescription": "string",
          "services": ["string"],
          "projectCategory": "string",
          "targetUsers": ["string"],
          "features": ["string"],
          "platforms": ["string"],
          "integrations": ["string"],
          "urgency": "string",
          "budgetRange": "string"
        }`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text);
      setFormData(prev => ({
        ...prev,
        ...result,
        projectName: result.projectName || prev.projectName,
        projectDescription: result.projectDescription || prev.projectDescription,
      }));
      setMode("guided");
      setStep(5); // Jump to summary review
    } catch (error) {
      console.error("AI Generation error:", error);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1: // Client Info
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Client Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Full Name</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={e => updateData({ fullName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Company Name</label>
                <input 
                  type="text" 
                  value={formData.companyName}
                  onChange={e => updateData({ companyName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => updateData({ email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => updateData({ phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  placeholder="+260 ..."
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm text-white/60">Client Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Individual", "Startup", "Small Business", "Medium Business", "Large Company", "Institution", "Government", "NGO"].map(type => (
                  <button
                    key={type}
                    onClick={() => updateData({ clientType: type })}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm transition-all",
                      formData.clientType === type 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Services
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">What do you need?</h3>
            <p className="text-white/60">Select all that apply to your project.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Mobile App Development", icon: Smartphone },
                { name: "Website Development", icon: Globe },
                { name: "Desktop Software", icon: Monitor },
                { name: "ERP System", icon: Database },
                { name: "Security Systems", icon: Shield },
                { name: "Industrial Automation", icon: Cpu },
                { name: "Infrastructure Management", icon: Network },
                { name: "UI/UX Design", icon: Layout },
              ].map(service => (
                <button
                  key={service.name}
                  onClick={() => {
                    const services = formData.services.includes(service.name)
                      ? formData.services.filter(s => s !== service.name)
                      : [...formData.services, service.name];
                    updateData({ services });
                  }}
                  className={cn(
                    "p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all text-center",
                    formData.services.includes(service.name)
                      ? "bg-blue-600/20 border-blue-600 text-white shadow-lg shadow-blue-600/10"
                      : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                  )}
                >
                  <service.icon className={cn("w-8 h-8", formData.services.includes(service.name) ? "text-white" : "text-white/40")} />
                  <span className="font-bold text-sm">{service.name}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3: // Project Category
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Project Category</h3>
            <div className="grid gap-3">
              {[
                "New project from scratch",
                "Upgrade an existing system",
                "Redesign an old system",
                "Add features to an existing system",
                "Replace manual process with digital",
                "Install and configure smart system",
                "Consultation first"
              ].map(cat => (
                <button
                  key={cat}
                  onClick={() => updateData({ projectCategory: cat })}
                  className={cn(
                    "w-full px-6 py-4 rounded-xl border text-left flex items-center justify-between transition-all",
                    formData.projectCategory === cat
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                  )}
                >
                  {cat}
                  {formData.projectCategory === cat && <CheckCircle2 className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 4: // Summary
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Project Summary</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Project Name</label>
                <input 
                  type="text" 
                  value={formData.projectName}
                  onChange={e => updateData({ projectName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g. Fyose Logistics"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Describe your project</label>
                <textarea 
                  value={formData.projectDescription}
                  onChange={e => updateData({ projectDescription: e.target.value })}
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none resize-none"
                  placeholder="Explain what you want to build..."
                />
              </div>
            </div>
          </div>
        );

      case 5: // Features
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Required Features</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "User Login", "Admin Dashboard", "Payments", "Real-time Chat", 
                "Analytics", "Inventory", "GPS/Maps", "QR Codes", 
                "Notifications", "Cloud Sync", "Offline Mode", "CCTV Integration"
              ].map(feature => (
                <button
                  key={feature}
                  onClick={() => {
                    const features = formData.features.includes(feature)
                      ? formData.features.filter(f => f !== feature)
                      : [...formData.features, feature];
                    updateData({ features });
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full border text-sm transition-all",
                    formData.features.includes(feature)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                  )}
                >
                  {feature}
                </button>
              ))}
            </div>
            <textarea 
              value={formData.specialFeatures}
              onChange={e => updateData({ specialFeatures: e.target.value })}
              placeholder="Any other special features?"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none h-32"
            />
          </div>
        );

      case 18: // Final Review
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-bold text-white">Final Review</h3>
              <p className="text-white/40">Please check your details before submitting.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs">Client Details</h4>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Name</span>
                    <span className="text-white">{formData.fullName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Company</span>
                    <span className="text-white">{formData.companyName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Email</span>
                    <span className="text-white">{formData.email || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs">Project Scope</h4>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Name</span>
                    <span className="text-white">{formData.projectName || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Services</span>
                    <span className="text-white text-right">{formData.services.join(", ") || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Budget</span>
                    <span className="text-white">{formData.budgetRange || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-white/40">
            <Sparkles className="w-12 h-12 mb-4 opacity-20" />
            <p>Step {step} content coming soon...</p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto"
        >
          <div className="max-w-5xl w-full min-h-[80vh] bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Sidebar Progress */}
            <div className="w-full md:w-80 bg-gradient-to-b from-blue-600/10 to-purple-600/10 p-12 border-r border-white/5 hidden md:flex flex-col justify-between">
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">S</span>
                  </div>
                  <span className="text-white font-bold tracking-tight">PROJECT FORM</span>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 1, label: "Client Info" },
                    { id: 2, label: "Services" },
                    { id: 3, label: "Category" },
                    { id: 4, label: "Summary" },
                    { id: 5, label: "Features" },
                    { id: 18, label: "Review" },
                  ].map((s) => (
                    <div key={s.id} className="flex items-center gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        step >= s.id ? "bg-blue-600 text-white" : "bg-white/5 text-white/20 border border-white/10"
                      )}>
                        {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                      </div>
                      <span className={cn(
                        "text-sm font-medium transition-all",
                        step >= s.id ? "text-white" : "text-white/20"
                      )}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">Need Help?</div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Our AI assistant can help structure your project brief automatically.
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-12 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center space-y-6"
                    >
                      <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">Request Sent!</h3>
                      <p className="text-white/60 max-w-md">
                        Thank you. Your project request has been sent to Sacho Innovations. 
                        Our team will review it and contact you shortly.
                      </p>
                      <button 
                        onClick={onClose}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-white/90 transition-all"
                      >
                        Back to Website
                      </button>
                    </motion.div>
                  ) : mode === "welcome" ? (
                    <motion.div
                      key="welcome"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full flex flex-col justify-center space-y-12"
                    >
                      <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-white">Start Your Project.</h2>
                        <p className="text-xl text-white/60 max-w-2xl">
                          Tell us what you want to build, improve, automate, or install. 
                          Choose how you'd like to provide your project details.
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <button
                          onClick={() => setMode("guided")}
                          className="group p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all text-left space-y-6"
                        >
                          <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                            <FileText className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white mb-2">Guided Project Form</h4>
                            <p className="text-sm text-white/40 leading-relaxed">
                              Best for users who want to answer step-by-step questions and provide detailed specs.
                            </p>
                          </div>
                        </button>

                        <button
                          onClick={() => setMode("ai")}
                          className="group p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-600/5 transition-all text-left space-y-6"
                        >
                          <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                            <Wand2 className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white mb-2">Describe With AI</h4>
                            <p className="text-sm text-white/40 leading-relaxed">
                              Best for users who have a rough idea and want AI to help turn it into a structured request.
                            </p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  ) : mode === "ai" ? (
                    <motion.div
                      key="ai"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full flex flex-col justify-center space-y-8"
                    >
                      <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold tracking-wider uppercase">
                          <Sparkles className="w-3 h-3" />
                          AI Assistant
                        </div>
                        <h2 className="text-4xl font-bold text-white">Describe Your Idea Briefly.</h2>
                        <p className="text-white/60">Tell us what you want to build, improve, automate, or install.</p>
                      </div>

                      <div className="space-y-4">
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="e.g. I want a mobile app for booking buses and tracking tickets in real-time..."
                          className="w-full h-48 bg-white/5 border border-white/10 rounded-3xl p-8 text-white text-lg focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                        />
                        <div className="flex flex-wrap gap-2">
                          {["Mobile App", "ERP System", "Security System", "Industrial Automation"].map(tag => (
                            <button 
                              key={tag}
                              onClick={() => setAiPrompt(prev => prev + (prev ? " " : "") + tag)}
                              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 hover:text-white hover:border-white/30 transition-all"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <button 
                          onClick={() => setMode("welcome")}
                          className="text-white/40 hover:text-white transition-colors flex items-center gap-2"
                        >
                          <ChevronLeft className="w-5 h-5" />
                          Back
                        </button>
                        <button
                          onClick={handleAiGenerate}
                          disabled={!aiPrompt.trim() || isAiGenerating}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-purple-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                          {isAiGenerating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Generating Draft...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate Full Request
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="guided"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col"
                    >
                      {renderStep()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Controls */}
              {mode === "guided" && !isSubmitted && (
                <div className="p-12 border-t border-white/5 flex items-center justify-between bg-black/20">
                  <button
                    onClick={step === 1 ? () => setMode("welcome") : prevStep}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {step === 1 ? "Back to Mode Selection" : "Previous Step"}
                  </button>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-white/20 uppercase tracking-widest font-bold">
                      Step {step} of {totalSteps}
                    </span>
                    {step === totalSteps ? (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-emerald-600/20 flex items-center gap-2 transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Request
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={nextStep}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-blue-600/20 flex items-center gap-2 transition-all group"
                      >
                        Continue
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
