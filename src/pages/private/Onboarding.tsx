import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ChevronLeft, 
  Rocket, 
  FileText, 
  Target, 
  Users, 
  Palette, 
  MessageSquare,
  Sparkles,
  Upload,
  ArrowRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, doc, onSnapshot, setDoc, handleFirestoreError, OperationType, serverTimestamp } from "@/src/firebase";

const onboardingSteps = [
  { id: "welcome", label: "Welcome", icon: Rocket, description: "Let's get started with your project journey." },
  { id: "goals", label: "Business Goals", icon: Target, description: "Define what success looks like for you." },
  { id: "contacts", label: "Project Contacts", icon: Users, description: "Who are the key people on your team?" },
  { id: "assets", label: "Brand Assets", icon: Palette, description: "Upload logos, fonts, and style guides." },
  { id: "communication", label: "Communication", icon: MessageSquare, description: "How do you prefer to stay in touch?" },
  { id: "documents", label: "Documents", icon: FileText, description: "Upload any required legal or technical docs." },
];

export default function Onboarding() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    goals: "",
    contacts: "",
    commStyle: "Slack",
    brandAssets: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "onboarding", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompletedSteps(data.completedSteps || []);
        setFormData(prev => ({ ...prev, ...data.formData }));
        // Set current step to the first uncompleted step
        const firstUncompleted = onboardingSteps.findIndex(s => !data.completedSteps?.includes(s.id));
        if (firstUncompleted !== -1) {
          setCurrentStep(firstUncompleted);
        }
      }
      setIsLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, `onboarding/${user.uid}`));

    return () => unsub();
  }, [user]);

  const saveProgress = async (newCompletedSteps: string[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "onboarding", user.uid), {
        clientId: user.uid,
        completedSteps: newCompletedSteps,
        formData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `onboarding/${user.uid}`);
    }
  };

  const handleNext = async () => {
    const stepId = onboardingSteps[currentStep].id;
    let newCompletedSteps = completedSteps;
    if (!completedSteps.includes(stepId)) {
      newCompletedSteps = [...completedSteps, stepId];
      setCompletedSteps(newCompletedSteps);
      await saveProgress(newCompletedSteps);
    }
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (completedSteps.length / onboardingSteps.length) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3" /> Client Onboarding
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Welcome to Sacho</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          We're excited to work with you! Complete this quick onboarding to help us hit the ground running.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Overall Progress</span>
          <span className="text-xl font-bold text-white">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar Steps */}
        <div className="lg:col-span-4 space-y-4">
          {onboardingSteps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={cn(
                "w-full p-6 rounded-[24px] border text-left transition-all flex items-center gap-4",
                currentStep === idx 
                  ? "bg-white/5 border-purple-500/50 shadow-xl shadow-purple-600/5" 
                  : "bg-transparent border-white/5 hover:border-white/10"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                completedSteps.includes(step.id) ? "bg-emerald-500/10 text-emerald-400" : currentStep === idx ? "bg-purple-600 text-white" : "bg-white/5 text-gray-500"
              )}>
                {completedSteps.includes(step.id) ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <div>
                <h3 className={cn("text-sm font-bold", currentStep === idx ? "text-white" : "text-gray-500")}>{step.label}</h3>
                <p className="text-[10px] text-gray-600 mt-1 line-clamp-1">{step.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-10 min-h-[500px] flex flex-col"
          >
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-400">
                  {React.createElement(onboardingSteps[currentStep].icon, { className: "w-8 h-8" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{onboardingSteps[currentStep].label}</h2>
                  <p className="text-gray-500">{onboardingSteps[currentStep].description}</p>
                </div>
              </div>

              {/* Step Specific Content */}
              {currentStep === 0 && (
                <div className="space-y-6 py-10 text-center">
                  <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Rocket className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold">Ready for Liftoff?</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    We've set up your workspace and we're ready to start building. This onboarding will help us align on your vision.
                  </p>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">What are your primary goals for this project?</label>
                  <textarea 
                    rows={8}
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    placeholder="e.g. Increase conversion by 20%, Modernize our brand identity..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="p-12 border-2 border-dashed border-white/10 rounded-[32px] text-center hover:border-purple-500/30 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="font-bold mb-2">Drop your brand assets here</h4>
                    <p className="text-sm text-gray-500">Logos, style guides, fonts, etc. (Max 50MB)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {["logo-v1.svg", "brand-guide.pdf"].map((file, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold">{file}</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-10 border-t border-white/5">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-500 hover:text-white disabled:opacity-0 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-xl text-sm font-bold transition-all"
              >
                {currentStep === onboardingSteps.length - 1 ? "Finish Onboarding" : "Continue"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
