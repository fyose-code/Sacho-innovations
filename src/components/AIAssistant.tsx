import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Minimize2, Maximize2, MessageSquare, BarChart3, PieChart, Activity, Briefcase, CheckSquare, CreditCard, Users } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, collection, onSnapshot, query, where, handleFirestoreError, OperationType } from "@/src/firebase";

interface Message {
  role: "user" | "model";
  text: string;
}

interface QuickStats {
  projects: number;
  tasks: number;
  invoices: number;
  team?: number;
}

export const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "stats">("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hello! I'm Sacho's AI Project Assistant. How can I help you with your project today? I can summarize progress, explain technical updates, or help you draft requests." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [stats, setStats] = useState<QuickStats>({ projects: 0, tasks: 0, invoices: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user || !isOpen) return;

    // Fetch stats based on role
    const isAdmin = user.role === "admin" || user.role === "manager";

    const unsubProjects = onSnapshot(
      isAdmin ? collection(db, "projects") : query(collection(db, "projects"), where("clientId", "==", user.uid)),
      (snap) => setStats(prev => ({ ...prev, projects: snap.size })),
      (err) => handleFirestoreError(err, OperationType.LIST, "projects")
    );

    const unsubTasks = onSnapshot(
      isAdmin ? collection(db, "tasks") : query(collection(db, "tasks"), where("clientId", "==", user.uid)),
      (snap) => setStats(prev => ({ ...prev, tasks: snap.size })),
      (err) => handleFirestoreError(err, OperationType.LIST, "tasks")
    );

    const unsubInvoices = onSnapshot(
      isAdmin ? collection(db, "invoices") : query(collection(db, "invoices"), where("clientId", "==", user.uid)),
      (snap) => setStats(prev => ({ ...prev, invoices: snap.size })),
      (err) => handleFirestoreError(err, OperationType.LIST, "invoices")
    );

    let unsubTeam: any;
    if (isAdmin) {
      unsubTeam = onSnapshot(
        collection(db, "team"),
        (snap) => setStats(prev => ({ ...prev, team: snap.size })),
        (err) => handleFirestoreError(err, OperationType.LIST, "team")
      );
    }

    return () => {
      unsubProjects();
      unsubTasks();
      unsubInvoices();
      if (unsubTeam) unsubTeam();
    };
  }, [user, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const model = "gemini-3-flash-preview";
      
      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: `You are Sacho's AI Project Assistant. You help ${user?.role === 'admin' ? 'administrators' : 'clients'} understand their project progress. 
          Current Context:
          - Projects: ${stats.projects}
          - Tasks: ${stats.tasks}
          - Invoices: ${stats.invoices}
          ${user?.role === 'admin' ? `- Team Members: ${stats.team}` : ''}
          
          Be professional, helpful, and clear. If you don't know specific project details, explain that you are an assistant and they should contact their project manager for sensitive data.`,
        },
      });

      const response = await chat.sendMessage({ message: input });
      const aiMessage: Message = { role: "model", text: response.text || "I'm sorry, I couldn't process that request." };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages((prev) => [...prev, { role: "model", text: "I'm having some trouble connecting right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: isCompact ? "320px" : "400px",
              height: isCompact ? "450px" : "600px"
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-black/95 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col transition-all duration-300"
          >
            {/* Header */}
            <div className={cn(
              "border-b border-white/10 flex flex-col bg-gradient-to-r from-purple-600/30 to-blue-600/30 transition-all shrink-0",
              isCompact ? "p-3" : "p-4"
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "rounded-full bg-purple-600 flex items-center justify-center transition-all",
                    isCompact ? "w-6 h-6" : "w-8 h-8"
                  )}>
                    <Bot className={cn("text-white", isCompact ? "w-3 h-3" : "w-4 h-4")} />
                  </div>
                  <div>
                    <h3 className={cn("font-bold text-white transition-all", isCompact ? "text-xs" : "text-sm")}>Sacho AI</h3>
                    {!isCompact && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Online</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsCompact(!isCompact)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 transition-colors"
                    title={isCompact ? "Expand" : "Compact"}
                  >
                    {isCompact ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 transition-colors"
                  >
                    <X className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest pb-1 transition-all border-b-2",
                    activeTab === "chat" ? "text-purple-400 border-purple-400" : "text-gray-500 border-transparent hover:text-white"
                  )}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest pb-1 transition-all border-b-2",
                    activeTab === "stats" ? "text-purple-400 border-purple-400" : "text-gray-500 border-transparent hover:text-white"
                  )}
                >
                  Quick Stats
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {activeTab === "chat" ? (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={cn(
                      "flex-1 overflow-y-auto space-y-6 scrollbar-hide transition-all",
                      isCompact ? "p-4" : "p-6"
                    )}
                  >
                    {messages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "flex flex-col",
                          msg.role === "user" ? "items-end" : "items-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[85%] rounded-2xl transition-all",
                          isCompact ? "p-3 text-xs" : "p-4 text-sm",
                          msg.role === "user" 
                            ? "bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-600/20" 
                            : "bg-white/5 text-gray-200 border border-white/10 rounded-tl-none"
                        )}>
                          <div className="markdown-body">
                            <Markdown>{msg.text}</Markdown>
                          </div>
                        </div>
                        {!isCompact && (
                          <span className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">
                            {msg.role === "user" ? "You" : "Sacho AI"}
                          </span>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "bg-white/5 border border-white/10 rounded-2xl rounded-tl-none flex gap-1",
                          isCompact ? "p-2" : "p-4"
                        )}>
                          <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" />
                          <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-6 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <Briefcase className="w-4 h-4 text-blue-400 mb-2" />
                        <p className="text-xl font-bold">{stats.projects}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Projects</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <CheckSquare className="w-4 h-4 text-emerald-400 mb-2" />
                        <p className="text-xl font-bold">{stats.tasks}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Tasks</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <CreditCard className="w-4 h-4 text-orange-400 mb-2" />
                        <p className="text-xl font-bold">{stats.invoices}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Invoices</p>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <Users className="w-4 h-4 text-purple-400 mb-2" />
                          <p className="text-xl font-bold">{stats.team}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Team</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">System Status</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        All systems are operational. Your project data is being synchronized in real-time with Firebase.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input */}
            {activeTab === "chat" && (
              <div className={cn(
                "border-t border-white/10 bg-white/5 transition-all shrink-0",
                isCompact ? "p-3" : "p-4"
              )}>
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder={isCompact ? "Ask..." : "Ask me anything about your project..."}
                    className={cn(
                      "w-full bg-black/40 border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-purple-500/50 transition-colors",
                      isCompact ? "pl-3 pr-10 py-2" : "pl-4 pr-12 py-3"
                    )}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 rounded-xl text-white transition-all",
                      isCompact ? "right-1.5 p-1.5" : "right-2 p-2"
                    )}
                  >
                    <Send className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
                  </button>
                </div>
                {!isCompact && (
                  <p className="text-[9px] text-gray-600 text-center mt-3 uppercase tracking-widest font-bold">
                    Powered by Sacho Intelligence
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-2xl shadow-purple-600/40 transition-all relative",
          isOpen && "opacity-0 pointer-events-none"
        )}
      >
        <MessageSquare className="w-8 h-8" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-black rounded-full" />
      </motion.button>
    </div>
  );
};
