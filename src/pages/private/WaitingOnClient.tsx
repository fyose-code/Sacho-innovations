import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  FileText, 
  MessageSquare, 
  ArrowRight,
  User,
  MoreVertical,
  AlertCircle
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, query, where, orderBy, handleFirestoreError, OperationType } from "@/src/firebase";
import { useAuth } from "@/src/context/AuthContext";

const statusColors = {
  "Pending": "bg-orange-500/10 text-orange-400",
  "Overdue": "bg-red-500/10 text-red-400",
  "Resolved": "bg-emerald-500/10 text-emerald-400",
};

export default function WaitingOnClient() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "waitingOnClient"), orderBy("dueDate", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "waitingOnClient"));

    return () => unsubscribe();
  }, [user]);

  const filteredItems = items.filter((i) => {
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || i.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Action Items</h1>
          <p className="text-gray-500 mt-2">Items requiring your attention to keep the project moving forward.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 text-sm font-bold">
          <AlertTriangle className="w-4 h-4" /> {items.filter(i => i.status !== "Resolved").length} Pending Actions
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
        <div className="relative flex-1 w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search action items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {["All", "Pending", "Overdue", "Resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                filterStatus === status
                  ? "bg-purple-600/10 text-purple-400 border border-purple-500/30"
                  : "bg-white/5 text-gray-500 border border-white/5 hover:border-white/10 hover:text-white"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Action Items List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 hover:border-orange-500/30 transition-all duration-500 overflow-hidden"
          >
            {/* Status Indicator Bar */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-1.5",
              item.status === "Overdue" ? "bg-red-500" : item.status === "Pending" ? "bg-orange-500" : "bg-emerald-500"
            )} />

            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", statusColors[item.status as keyof typeof statusColors] || "bg-white/5 text-gray-400")}>
                    {item.status}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Due {item.dueDate?.toDate ? item.dueDate.toDate().toLocaleDateString() : "TBD"}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold group-hover:text-orange-400 transition-colors mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>

              <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                        {i === 1 ? "JD" : "PM"}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Assigned to you</span>
                </div>
                <button className="w-full md:w-auto px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                  Take Action <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-20 text-center bg-black/20 rounded-[32px] border border-dashed border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">All caught up!</h3>
            <p className="text-gray-500">There are no items currently waiting for your action.</p>
          </div>
        )}
      </div>

      {/* Critical Blocker Alert */}
      {items.some(i => i.status === "Overdue") && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[24px] flex items-center gap-6 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-red-400 font-bold">Critical Blockers Detected</h4>
            <p className="text-red-400/70 text-sm">One or more items are overdue and may delay project delivery. Please review them immediately.</p>
          </div>
        </div>
      )}
    </div>
  );
}
