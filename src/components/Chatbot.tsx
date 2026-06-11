import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Image as ImageIcon, Film, Minimize2, Maximize2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { cn } from "@/src/lib/utils";

interface Message {
  role: "user" | "model";
  text: string;
  type?: "text" | "video";
  videoUrl?: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hello! I'm the Sacho Innovations assistant. How can I help you today? I can also generate videos from your images using Veo!" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const chat = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction: "You are a helpful assistant for Sacho Innovations, a technology company. You should be professional, visionary, and knowledgeable about their services: Mobile apps, Desktop software, ERP systems, Security systems, Industrial automation, and Infrastructure management. Sacho Innovations is the parent company of Fyose.",
        },
      });

      const response = await chat.sendMessage({ message: input });
      const modelMessage: Message = { role: "model", text: response.text || "I'm sorry, I couldn't process that." };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "model", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      const base64Content = base64Data.split(",")[1];
      
      setMessages((prev) => [...prev, { role: "user", text: "Generate a video from this image." }]);
      setIsGeneratingVideo(true);
      setIsLoading(true);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: 'Animate this scene with cinematic motion, high quality, futuristic tech style',
          image: {
            imageBytes: base64Content,
            mimeType: file.type,
          },
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
          }
        });

        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          operation = await ai.operations.getVideosOperation({ operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
          const videoResponse = await fetch(downloadLink, {
            method: 'GET',
            headers: {
              'x-goog-api-key': process.env.GEMINI_API_KEY || "",
            },
          });
          const blob = await videoResponse.blob();
          const videoUrl = URL.createObjectURL(blob);
          
          setMessages((prev) => [...prev, { 
            role: "model", 
            text: "Here is your generated video using Veo!", 
            type: "video",
            videoUrl 
          }]);
        }
      } catch (error) {
        console.error("Video generation error:", error);
        setMessages((prev) => [...prev, { role: "model", text: "Sorry, I couldn't generate the video. Please check your API key and try again." }]);
      } finally {
        setIsGeneratingVideo(false);
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/40 transition-all hover:scale-110 active:scale-95 group"
      >
        <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
      </button>

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
            className="fixed bottom-28 right-8 z-50 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300"
          >
            {/* Header */}
            <div className={cn(
              "border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-600/20 to-purple-600/20 transition-all",
              isCompact ? "p-3" : "p-6"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "bg-blue-600 rounded-xl flex items-center justify-center transition-all",
                  isCompact ? "w-8 h-8" : "w-10 h-10"
                )}>
                  <Bot className={cn("text-white", isCompact ? "w-4 h-4" : "w-6 h-6")} />
                </div>
                <div>
                  <div className={cn("text-white font-bold transition-all", isCompact ? "text-sm" : "text-base")}>Sacho AI</div>
                  {!isCompact && (
                    <div className="text-emerald-400 text-xs flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Online • Gemini Powered
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCompact(!isCompact)}
                  className="text-white/40 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
                  title={isCompact ? "Expand" : "Compact"}
                >
                  {isCompact ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/40 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg"
                >
                  <X className={cn(isCompact ? "w-4 h-4" : "w-6 h-6")} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className={cn(
                "flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10 transition-all",
                isCompact ? "p-3" : "p-6"
              )}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === "user" ? "bg-purple-600" : "bg-blue-600"
                  )}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                  </div>
                  <div className={cn(
                    "rounded-2xl text-sm leading-relaxed transition-all",
                    isCompact ? "p-2.5 text-xs" : "p-4",
                    msg.role === "user"
                      ? "bg-purple-600/20 text-white border border-purple-500/20"
                      : "bg-blue-600/20 text-white border border-blue-500/20"
                  )}>
                    {msg.text}
                    {msg.type === "video" && msg.videoUrl && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                        <video src={msg.videoUrl} controls className="w-full" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-blue-600/20 p-4 rounded-2xl border border-blue-500/20 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-sm text-blue-400">
                      {isGeneratingVideo ? "Generating video with Veo..." : "Thinking..."}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className={cn(
              "border-t border-white/10 transition-all",
              isCompact ? "p-3" : "p-6"
            )}>
              {!isCompact && (
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 p-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Film className="w-4 h-4" />
                    Generate Video (Veo)
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              )}
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={isCompact ? "Ask..." : "Ask about Sacho Innovations..."}
                  className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all pr-14",
                    isCompact ? "px-4 py-2.5" : "px-6 py-4"
                  )}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-white/5 text-white rounded-xl flex items-center justify-center transition-all",
                    isCompact ? "w-8 h-8" : "w-10 h-10"
                  )}
                >
                  <Send className={cn(isCompact ? "w-3 h-3" : "w-4 h-4")} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
