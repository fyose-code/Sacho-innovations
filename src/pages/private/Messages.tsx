import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Filter,
  Plus,
  Send,
  MoreVertical,
  User,
  Clock,
  CheckCircle2,
  ChevronRight,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp, handleFirestoreError, OperationType } from "@/src/firebase";

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (!user) return;

    // Fetch all messages where the user is a participant (or just all messages for their projects)
    // For simplicity, let's fetch all messages for now and filter by projectId if needed
    // In a real app, you'd have a 'participants' array or similar.
    const q = query(
      collection(db, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "messages"));

    return () => unsub();
  }, [user]);

  // Group messages by projectId to create "chats"
  const chatsMap = messages.reduce((acc: any, msg) => {
    const projectId = msg.projectId || "general";
    if (!acc[projectId]) {
      acc[projectId] = {
        id: projectId,
        name: msg.projectName || (projectId === "general" ? "General Chat" : `Project ${projectId}`),
        lastMessage: msg.text,
        time: msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
        messages: []
      };
    }
    acc[projectId].messages.push(msg);
    acc[projectId].lastMessage = msg.text;
    acc[projectId].time = msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now";
    return acc;
  }, {});

  const chats: any[] = Object.values(chatsMap);

  useEffect(() => {
    if (chats.length > 0 && !activeChatId) {
      setActiveChatId(chats[0].id);
    }
  }, [chats, activeChatId]);

  const currentChat = chats.find((c: any) => c.id === activeChatId);
  const currentMessages = currentChat?.messages || [];

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChatId || !user) return;

    try {
      await addDoc(collection(db, "messages"), {
        projectId: activeChatId,
        projectName: currentChat?.name,
        senderId: user.uid,
        senderName: user.displayName || user.email,
        text: messageText,
        timestamp: serverTimestamp(),
      });
      setMessageText("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "messages");
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">Messages</h1>
            <button className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all shadow-lg shadow-blue-600/20">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chats.map((chat: any) => (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={cn(
                "w-full p-6 flex items-center gap-4 hover:bg-white/5 transition-all text-left relative group",
                activeChatId === chat.id && "bg-white/5"
              )}
            >
              {activeChatId === chat.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
              )}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-lg">
                  {chat.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                {chat.status === "online" && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-black rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold truncate group-hover:text-blue-400 transition-colors">{chat.name}</h3>
                  <span className="text-[10px] text-gray-500 font-medium">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-lg">
              {currentChat?.name.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div>
              <h2 className="text-lg font-bold">{currentChat?.name}</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{currentChat?.role || "Project Group"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-3 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-3 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-3 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {currentMessages.map((msg: any) => (
            <div key={msg.id} className={cn("flex flex-col", msg.senderId === user?.uid ? "items-end" : "items-start")}>
              <div className="flex items-center gap-3 mb-2">
                {msg.senderId !== user?.uid && <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{msg.senderName}</span>}
                <span className="text-[10px] text-gray-600 font-medium">
                  {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                </span>
                {msg.senderId === user?.uid && <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Me</span>}
              </div>
              <div className={cn(
                "max-w-[70%] p-5 rounded-[24px] text-sm leading-relaxed shadow-xl",
                msg.senderId === user?.uid ? "bg-blue-600 text-white rounded-tr-none shadow-blue-600/10" : "bg-white/5 text-gray-300 rounded-tl-none border border-white/10"
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          <div className="flex justify-center">
            <span className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Today
            </span>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-8 border-t border-white/5 bg-black/20 backdrop-blur-md">
          <div className="relative flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button className="p-3 hover:bg-white/5 rounded-xl text-gray-500 hover:text-blue-400 transition-all">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-3 hover:bg-white/5 rounded-xl text-gray-500 hover:text-blue-400 transition-all">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button className="p-3 hover:bg-white/5 rounded-xl text-gray-500 hover:text-blue-400 transition-all">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-6 pr-16 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all shadow-lg shadow-blue-600/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
