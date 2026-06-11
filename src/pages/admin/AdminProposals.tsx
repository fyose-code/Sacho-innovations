import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  ChevronRight, 
  Zap, 
  DollarSign, 
  Calendar, 
  User, 
  X,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, addDoc, query, orderBy, handleFirestoreError, OperationType, serverTimestamp, doc, updateDoc } from "@/src/firebase";

const statusColors = {
  "Draft": "bg-gray-100 text-gray-600",
  "Sent": "bg-brand-blue/10 text-brand-blue",
  "Approved": "bg-emerald-100 text-emerald-600",
  "Rejected": "bg-red-100 text-red-600",
  "Converted": "bg-purple-100 text-purple-600",
};

export default function AdminProposals() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [isAddingProposal, setIsAddingProposal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    clientId: "",
    amount: "",
    description: "",
    scope: "",
    timeline: ""
  });

  useEffect(() => {
    const q = query(collection(db, "proposals"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProposals(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "proposals"));

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.clientName) return;

    setIsSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "proposals"), {
        ...formData,
        status: "Draft",
        createdAt: serverTimestamp(),
      });
      setIsAddingProposal(false);
      setFormData({ title: "", clientName: "", clientId: "", amount: "", description: "", scope: "", timeline: "" });
    } catch (err: any) {
      setError(err.message || "Failed to create proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertToProject = async (proposal: any) => {
    if (proposal.status !== "Approved") {
      alert("Only approved proposals can be converted to projects.");
      return;
    }

    try {
      // 1. Create the project
      await addDoc(collection(db, "projects"), {
        name: proposal.title,
        clientId: proposal.clientId,
        clientName: proposal.clientName,
        status: "Active",
        health: "Healthy",
        description: proposal.description,
        scope: proposal.scope,
        timeline: proposal.timeline,
        budget: proposal.amount,
        createdAt: serverTimestamp(),
      });

      // 2. Update proposal status
      await updateDoc(doc(db, "proposals", proposal.id), {
        status: "Converted",
        convertedAt: serverTimestamp(),
      });

      alert("Proposal successfully converted to a live project!");
    } catch (err: any) {
      console.error("Conversion Error:", err);
      alert("Failed to convert proposal to project.");
    }
  };

  const filteredProposals = proposals.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">Proposals</h1>
          <p className="text-gray-500 mt-2">Manage project proposals, quotations, and conversions.</p>
        </div>
        <button 
          onClick={() => setIsAddingProposal(true)}
          className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-brand-blue/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Proposal
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
        <div className="relative flex-1 w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-bg border border-black/5 rounded-xl pl-12 pr-4 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {["All", "Draft", "Sent", "Approved", "Converted"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                filterStatus === status
                  ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/30"
                  : "bg-brand-bg text-gray-500 border border-black/5 hover:border-black/10 hover:text-[#1a1a1a]"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProposals.map((proposal, index) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white border border-black/5 rounded-[24px] p-6 hover:border-[#3473c8]/30 transition-all duration-500 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm hover:shadow-md"
          >
            <div className="p-4 rounded-2xl bg-brand-bg flex-shrink-0">
              <FileText className="w-6 h-6 text-brand-blue" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold truncate text-[#1a1a1a] group-hover:text-brand-blue transition-colors">{proposal.title}</h3>
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", statusColors[proposal.status as keyof typeof statusColors] || "bg-gray-100 text-gray-500")}>
                  {proposal.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-brand-blue" /> {proposal.clientName}
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-brand-yellow" /> {proposal.amount}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {proposal.status === "Approved" && (
                <button 
                  onClick={() => convertToProject(proposal)}
                  className="px-4 py-2 bg-brand-yellow hover:bg-brand-yellow/90 text-black rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                >
                  <Zap className="w-3 h-3" /> Convert to Project
                </button>
              )}
              <button className="p-2 hover:bg-brand-bg rounded-lg text-gray-400 hover:text-[#1a1a1a] transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}

        {filteredProposals.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-black/10">
            <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#1a1a1a]">No proposals found</h3>
            <p className="text-gray-500">Create your first proposal to start the pipeline.</p>
          </div>
        )}
      </div>

      {/* Add Proposal Modal */}
      <AnimatePresence>
        {isAddingProposal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingProposal(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-black/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-black/5 flex items-center justify-between bg-gradient-to-r from-brand-blue/5 to-brand-yellow/5">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1a]">New Proposal</h2>
                  <p className="text-gray-500 text-sm mt-1">Draft a new project proposal for a client.</p>
                </div>
                <button 
                  onClick={() => setIsAddingProposal(false)}
                  className="p-2 hover:bg-black/5 rounded-xl text-gray-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Proposal Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. E-commerce Platform Redesign"
                      className="w-full bg-brand-bg border border-black/5 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Client Name</label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-brand-bg border border-black/5 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Amount ($)</label>
                    <input
                      type="text"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="e.g. 15,000"
                      className="w-full bg-brand-bg border border-black/5 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Timeline</label>
                    <input
                      type="text"
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      placeholder="e.g. 3 Months"
                      className="w-full bg-brand-bg border border-black/5 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief project overview..."
                    className="w-full bg-brand-bg border border-black/5 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue/50 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Scope of Work</label>
                  <textarea
                    rows={4}
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                    placeholder="List deliverables and key milestones..."
                    className="w-full bg-brand-bg border border-black/5 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue/50 transition-colors resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingProposal(false)}
                    className="flex-1 px-6 py-3 bg-brand-bg hover:bg-black/5 rounded-xl text-sm font-bold text-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Create Proposal <ChevronRight className="w-4 h-4" /></>
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
