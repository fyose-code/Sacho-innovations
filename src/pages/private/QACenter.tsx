import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bug, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  MessageSquare, 
  ExternalLink, 
  ShieldCheck, 
  Activity, 
  X,
  MoreVertical,
  User,
  Calendar
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, addDoc, query, where, orderBy, handleFirestoreError, OperationType, serverTimestamp } from "@/src/firebase";
import { useAuth } from "@/src/context/AuthContext";

const issueTypes = [
  { id: "Bug", label: "Bug", icon: Bug, color: "text-red-400", bg: "bg-red-500/10" },
  { id: "UI", label: "UI/UX", icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "Performance", label: "Performance", icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "Security", label: "Security", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
];

const statusColors = {
  "Open": "bg-red-500/10 text-red-400",
  "In Progress": "bg-orange-500/10 text-orange-400",
  "Testing": "bg-blue-500/10 text-blue-400",
  "Resolved": "bg-emerald-500/10 text-emerald-400",
  "Closed": "bg-gray-500/10 text-gray-400",
};

export default function QACenter() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [isAddingIssue, setIsAddingIssue] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "Bug",
    title: "",
    description: "",
    projectId: "proj-1",
    priority: "Medium",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: ""
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "qaIssues"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIssues(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "qaIssues"));

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setIsSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "qaIssues"), {
        ...formData,
        reportedById: user?.uid,
        reportedByName: user?.displayName || user?.email,
        status: "Open",
        createdAt: serverTimestamp(),
      });
      setIsAddingIssue(false);
      setFormData({ type: "Bug", title: "", description: "", projectId: "proj-1", priority: "Medium", stepsToReproduce: "", expectedBehavior: "", actualBehavior: "" });
    } catch (err: any) {
      setError(err.message || "Failed to submit issue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIssues = issues.filter((i) => {
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || i.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QA & Testing Center</h1>
          <p className="text-gray-500 mt-2">Report bugs, track fixes, and sign off on project features.</p>
        </div>
        <button 
          onClick={() => setIsAddingIssue(true)}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Report Issue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Open Issues", value: issues.filter(i => i.status === "Open").length, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "In Progress", value: issues.filter(i => i.status === "In Progress").length, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Testing", value: issues.filter(i => i.status === "Testing").length, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Resolved", value: issues.filter(i => i.status === "Resolved").length, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((stat, idx) => (
          <div key={idx} className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[24px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{stat.label}</p>
            <h3 className={cn("text-3xl font-bold", stat.color)}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
        <div className="relative flex-1 w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {["All", ...issueTypes.map(t => t.id)].map((type) => (
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

      {/* Issues List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredIssues.map((issue, index) => (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-black/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 hover:border-red-500/30 transition-all duration-500 flex flex-col md:flex-row items-start md:items-center gap-6"
          >
            <div className={cn(
              "p-4 rounded-2xl flex-shrink-0",
              issueTypes.find(t => t.id === issue.type)?.bg || "bg-white/5"
            )}>
              {React.createElement(issueTypes.find(t => t.id === issue.type)?.icon || Bug, {
                className: cn("w-6 h-6", issueTypes.find(t => t.id === issue.type)?.color || "text-gray-400")
              })}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold truncate group-hover:text-red-400 transition-colors">{issue.title}</h3>
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", statusColors[issue.status as keyof typeof statusColors] || "bg-white/5 text-gray-400")}>
                  {issue.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-1">{issue.description}</p>
            </div>

            <div className="flex items-center gap-6 text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {issue.createdAt?.toDate ? issue.createdAt.toDate().toLocaleDateString() : "Pending"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                <span className="text-xs font-bold">4</span>
              </div>
              <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}

        {filteredIssues.length === 0 && (
          <div className="py-20 text-center bg-black/20 rounded-[32px] border border-dashed border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No issues found</h3>
            <p className="text-gray-500">Everything looks clean! Report an issue if you find one.</p>
          </div>
        )}
      </div>

      {/* Add Issue Modal */}
      <AnimatePresence>
        {isAddingIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingIssue(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-red-600/10 to-orange-600/10">
                <div>
                  <h2 className="text-2xl font-bold">Report Issue</h2>
                  <p className="text-gray-500 text-sm mt-1">Help us squash bugs and improve your experience.</p>
                </div>
                <button 
                  onClick={() => setIsAddingIssue(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Issue Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {issueTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.id })}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all",
                            formData.type === type.id 
                              ? "bg-red-600/10 border-red-500/50 text-red-400" 
                              : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
                          )}
                        >
                          <type.icon className="w-4 h-4" />
                          {type.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Priority</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Low", "Medium", "High", "Critical"].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: p })}
                          className={cn(
                            "p-3 rounded-xl border text-xs font-bold transition-all",
                            formData.priority === p 
                              ? "bg-red-600/10 border-red-500/50 text-red-400" 
                              : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Short summary of the issue"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Steps to Reproduce</label>
                  <textarea
                    rows={3}
                    value={formData.stepsToReproduce}
                    onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                    placeholder="1. Go to... 2. Click on... 3. See error..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Expected Behavior</label>
                    <textarea
                      rows={2}
                      value={formData.expectedBehavior}
                      onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Actual Behavior</label>
                    <textarea
                      rows={2}
                      value={formData.actualBehavior}
                      onChange={(e) => setFormData({ ...formData, actualBehavior: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingIssue(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Report Issue <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
