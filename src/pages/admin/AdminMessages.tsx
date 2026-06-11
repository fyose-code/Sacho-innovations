import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  Circle,
  User,
  Hash,
  Plus,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, handleFirestoreError, OperationType, serverTimestamp, query, orderBy, limit } from "@/src/firebase";
import { useAuth } from "@/src/context/AuthContext";

export default function AdminMessages() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch team members
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "team"), (snapshot) => {
      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(members);
      if (!selectedChat && members.length > 0) {
        setSelectedChat({ ...members[0], type: 'dm' });
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, "team"));

    return () => unsubscribe();
  }, []);

  // Fetch channels
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "channels"), (snapshot) => {
      const c = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChannels(c);
      // If no channels exist, create default ones
      if (snapshot.empty) {
        const defaultChannels = ["general", "development", "design", "marketing"];
        defaultChannels.forEach(name => {
          addDoc(collection(db, "channels"), { name, type: 'channel', createdAt: serverTimestamp() });
        });
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, "channels"));

    return () => unsubscribe();
  }, []);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;

    const chatId = selectedChat.type === 'channel' ? selectedChat.id : [user?.uid, selectedChat.id].sort().join('_');
    const q = query(
      collection(db, "messages", chatId, "chat"),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const m = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(m);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `messages/${chatId}/chat`));

    return () => unsubscribe();
  }, [selectedChat, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;

    const chatId = selectedChat.type === 'channel' ? selectedChat.id : [user?.uid, selectedChat.id].sort().join('_');
    
    try {
      await addDoc(collection(db, "messages", chatId, "chat"), {
        uid: user.uid,
        name: user.displayName || "Anonymous",
        text: newMessage,
        timestamp: serverTimestamp(),
        avatar: user.displayName?.split(' ').map(n => n[0]).join('') || "U"
      });
      setNewMessage("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `messages/${chatId}/chat`);
    }
  };

  const filteredMembers = teamMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white border border-black/5 rounded-3xl overflow-hidden shadow-sm">
      {/* Sidebar */}
      <aside className="w-80 border-r border-black/5 flex flex-col bg-[#f1f4f8]">
        <div className="p-6 border-b border-black/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-blue/50 transition-colors text-[#1a1a1a]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4">
            <div className="flex items-center justify-between px-2 mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Channels</h3>
              <button className="p-1 hover:bg-black/5 rounded-lg text-gray-400">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChat({ ...channel, type: 'channel' })}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm group",
                    selectedChat?.id === channel.id ? "bg-brand-blue/10 text-brand-blue" : "text-gray-500 hover:bg-white hover:text-[#1a1a1a]"
                  )}
                >
                  <Hash className={cn("w-4 h-4", selectedChat?.id === channel.id ? "text-brand-blue" : "text-gray-400")} />
                  {channel.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-black/5">
            <div className="flex items-center justify-between px-2 mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Direct Messages</h3>
              <button className="p-1 hover:bg-black/5 rounded-lg text-gray-400">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedChat({ ...member, type: 'dm' })}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative",
                    selectedChat?.id === member.id ? "bg-brand-blue/10 text-brand-blue" : "text-gray-500 hover:bg-white hover:text-[#1a1a1a]"
                  )}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-blue-400 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                      {member.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                      member.status === "active" ? "bg-emerald-500" : member.status === "away" ? "bg-[#ffca0f]" : "bg-gray-400"
                    )} />
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm truncate text-[#1a1a1a]">{member.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">{member.role}</p>
                  </div>
                  {selectedChat?.id === member.id && (
                    <motion.div
                      layoutId="active-chat"
                      className="absolute left-0 w-1 h-6 bg-brand-blue rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <header className="h-20 border-b border-black/5 px-8 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold border border-brand-blue/20 uppercase">
                  {selectedChat.type === 'channel' ? <Hash className="w-5 h-5" /> : selectedChat.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none text-[#1a1a1a]">{selectedChat.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      selectedChat.status === "active" ? "bg-emerald-500" : "bg-gray-400"
                    )} />
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                      {selectedChat.type === 'channel' ? `${teamMembers.length} Members` : (selectedChat.status === "active" ? "Active Now" : "Offline")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 hover:bg-black/5 rounded-xl text-gray-400 hover:text-[#1a1a1a] transition-all">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2.5 hover:bg-black/5 rounded-xl text-gray-400 hover:text-[#1a1a1a] transition-all">
                  <Video className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-black/5 mx-2" />
                <button className="p-2.5 hover:bg-black/5 rounded-xl text-gray-400 hover:text-[#1a1a1a] transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#f1f4f8]/30">
              {messages.map((msg, i) => {
                const isMe = msg.uid === user?.uid;
                const prevMsg = messages[i - 1];
                const showAvatar = !prevMsg || prevMsg.uid !== msg.uid;

                return (
                  <div key={msg.id} className={cn("flex gap-4 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                    {showAvatar ? (
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 border uppercase",
                        isMe ? "bg-brand-blue text-white border-brand-blue" : "bg-white text-brand-blue border-black/10"
                      )}>
                        {msg.avatar}
                      </div>
                    ) : (
                      <div className="w-8 shrink-0" />
                    )}
                    <div className={cn("space-y-1", isMe ? "text-right" : "")}>
                      <div className={cn(
                        "p-4 text-sm leading-relaxed rounded-2xl shadow-sm",
                        isMe 
                          ? "bg-brand-blue text-white rounded-tr-none shadow-brand-blue/10" 
                          : "bg-white border border-black/5 text-[#1a1a1a] rounded-tl-none"
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-500 px-2 font-medium">
                        {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <footer className="p-6 bg-white border-t border-black/5">
              <form onSubmit={handleSendMessage} className="bg-[#f1f4f8] border border-black/5 rounded-2xl p-2 flex items-end gap-2 focus-within:border-brand-blue/50 transition-colors">
                <div className="flex items-center gap-1 pb-1">
                  <button type="button" className="p-2 hover:bg-black/5 rounded-xl text-gray-400 hover:text-[#1a1a1a] transition-all">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button type="button" className="p-2 hover:bg-black/5 rounded-xl text-gray-400 hover:text-[#1a1a1a] transition-all">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <textarea
                  rows={1}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  placeholder={`Message ${selectedChat.name}...`}
                  className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 text-sm resize-none max-h-32 custom-scrollbar text-[#1a1a1a]"
                />
                <button type="submit" className="p-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl transition-all shadow-lg shadow-brand-blue/20 mb-1">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#f1f4f8]/30">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
