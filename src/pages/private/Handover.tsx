import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  ExternalLink, 
  Key, 
  BookOpen, 
  Video, 
  CheckCircle2, 
  Download, 
  Copy, 
  ShieldCheck, 
  Clock, 
  Search, 
  Filter,
  MoreVertical,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, query, where, orderBy, handleFirestoreError, OperationType } from "@/src/firebase";
import { useAuth } from "@/src/context/AuthContext";

const deliverableTypes = [
  { id: "File", label: "Final Files", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "Link", label: "Live Links", icon: ExternalLink, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { id: "Credential", label: "Credentials", icon: Key, color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "Manual", label: "User Manuals", icon: BookOpen, color: "text-orange-400", bg: "bg-orange-500/10" },
  { id: "Video", label: "Training Videos", icon: Video, color: "text-red-400", bg: "bg-red-500/10" },
];

export default function Handover() {
  const { user } = useAuth();
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    if (!user) return;
    // In a real app, we'd filter by projects the user belongs to
    const q = query(collection(db, "deliverables"), orderBy("title", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeliverables(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "deliverables"));

    return () => unsubscribe();
  }, [user]);

  const filteredDeliverables = deliverables.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || d.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Handover Center</h1>
          <p className="text-gray-500 mt-2">Access your final project assets, credentials, and documentation.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-bold">
          <ShieldCheck className="w-4 h-4" /> Secure Delivery Vault
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
        <div className="relative flex-1 w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {["All", ...deliverableTypes.map(t => t.id)].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                filterType === type
                  ? "bg-purple-600/10 text-purple-400 border border-purple-500/30"
                  : "bg-white/5 text-gray-500 border border-white/5 hover:border-white/10 hover:text-white"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDeliverables.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 hover:border-purple-500/30 transition-all duration-500 flex flex-col"
          >
            <div className="flex items-start justify-between mb-8">
              <div className={cn(
                "p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500",
                deliverableTypes.find(t => t.id === asset.type)?.bg || "bg-white/5"
              )}>
                {React.createElement(deliverableTypes.find(t => t.id === asset.type)?.icon || FileText, {
                  className: cn("w-6 h-6", deliverableTypes.find(t => t.id === asset.type)?.color || "text-gray-400")
                })}
              </div>
              {asset.isHandedOver && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Handed Over
                </div>
              )}
            </div>

            <div className="flex-1 mb-8">
              <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors mb-2">{asset.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{asset.description}</p>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Added Mar 20, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                {asset.type === "File" ? (
                  <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                ) : asset.type === "Credential" ? (
                  <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                    <Copy className="w-4 h-4" />
                  </button>
                ) : (
                  <a 
                    href={asset.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredDeliverables.length === 0 && (
          <div className="col-span-full py-20 text-center bg-black/20 rounded-[32px] border border-dashed border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No assets found</h3>
            <p className="text-gray-500">Assets will appear here once they are ready for handover.</p>
          </div>
        )}
      </div>

      {/* Handover Confirmation Banner */}
      <div className="p-8 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-white/10 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-600/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Handover Confirmation</h3>
            <p className="text-gray-400 text-sm mt-1">Sign off on the final deliverables to complete the project phase.</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-2xl font-bold transition-all flex items-center gap-2">
          Sign Confirmation <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
