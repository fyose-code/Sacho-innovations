import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Bug, 
  Zap, 
  RefreshCw, 
  HelpCircle, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  MoreVertical, 
  ChevronRight, 
  MessageSquare,
  User,
  Calendar,
  X
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, addDoc, query, where, orderBy, handleFirestoreError, OperationType, serverTimestamp } from "@/src/firebase";
import { useAuth } from "@/src/context/AuthContext";

const requestTypes = [
  { id: "Bug", label: "Bug Report", icon: Bug, color: "text-red-400", bg: "bg-red-500/10" },
  { id: "Feature", label: "Feature Request", icon: Zap, color: "text-purple-400", bg: "bg-purple-500/10" },
  { id: "Change", label: "Change Request", icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: "Support", label: "Support Request", icon: HelpCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { id: "Urgent", label: "Urgent Issue", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
];

const statusColors = {
  "New": "bg-blue-500/10 text-blue-400",
  "In Review": "bg-purple-500/10 text-purple-400",
  "Planned": "bg-emerald-500/10 text-emerald-400",
  "In Progress": "bg-orange-500/10 text-orange-400",
  "Resolved": "bg-gray-500/10 text-gray-400",
};

export default function RequestCenter() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isAddingRequest, setIsAddingRequest] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "Feature",
    title: "",
    description: "",
    projectId: "",
    priority: "Medium"
  });

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "clientRequests"), 
      where("clientId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(requestList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "clientRequests"));

    const projectsQ = query(
      collection(db, "projects"),
      where("clientId", "==", user.uid)
    );
    const unsubscribeProjects = onSnapshot(projectsQ, (snapshot) => {
      const projectsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsList);
      if (projectsList.length > 0 && !formData.projectId) {
        setFormData(prev => ({ ...prev, projectId: projectsList[0].id }));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, "projects"));

    return () => {
      unsubscribe();
      unsubscribeProjects();
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.projectId) return;

    setIsSubmitting(true);
    setError("");

    const selectedProject = projects.find(p => p.id === formData.projectId);

    try {
      await addDoc(collection(db, "clientRequests"), {
        ...formData,
        projectName: selectedProject?.title || "Unknown Project",
        clientId: user?.uid,
        clientName: user?.displayName || user?.email,
        status: "New",
        createdAt: serverTimestamp(),
      });
      setIsAddingRequest(false);
      setFormData({ type: "Feature", title: "", description: "", projectId: projects[0]?.id || "", priority: "Medium" });
    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || r.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Request Center</h1>
          <p className="text-gray-500 mt-2">Submit and track feature requests, bug reports, and support needs.</p>
        </div>
        <button 
          onClick={() => setIsAddingRequest(true)}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
        <div className="relative flex-1 w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {["All", ...requestTypes.map(t => t.id)].map((type) => (
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

      {/* Requests List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-black/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 hover:border-purple-500/30 transition-all duration-500 flex flex-col md:flex-row items-start md:items-center gap-6"
          >
            <div className={cn(
              "p-4 rounded-2xl flex-shrink-0",
              requestTypes.find(t => t.id === request.type)?.bg || "bg-white/5"
            )}>
              {React.createElement(requestTypes.find(t => t.id === request.type)?.icon || HelpCircle, {
                className: cn("w-6 h-6", requestTypes.find(t => t.id === request.type)?.color || "text-gray-400")
              })}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold truncate group-hover:text-purple-400 transition-colors">{request.title}</h3>
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", statusColors[request.status as keyof typeof statusColors] || "bg-white/5 text-gray-400")}>
                  {request.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-1">{request.description}</p>
            </div>

            <div className="flex items-center gap-6 text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {request.createdAt?.toDate ? request.createdAt.toDate().toLocaleDateString() : "Pending"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                <span className="text-xs font-bold">2</span>
              </div>
              <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="py-20 text-center bg-black/20 rounded-[32px] border border-dashed border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No requests found</h3>
            <p className="text-gray-500">Submit your first request to get started.</p>
          </div>
        )}
      </div>

      {/* Add Request Modal */}
      <AnimatePresence>
        {isAddingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingRequest(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-600/10 to-blue-600/10">
                <div>
                  <h2 className="text-2xl font-bold">New Request</h2>
                  <p className="text-gray-500 text-sm mt-1">Tell us what you need and we'll get right on it.</p>
                </div>
                <button 
                  onClick={() => setIsAddingRequest(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Request Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {requestTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: type.id })}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all",
                            formData.type === type.id 
                              ? "bg-purple-600/10 border-purple-500/50 text-purple-400" 
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
                              ? "bg-purple-600/10 border-purple-500/50 text-purple-400" 
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
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Project</label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
                  >
                    <option value="" disabled className="bg-zinc-900">Select a project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id} className="bg-zinc-900">{p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief summary of your request"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide as much detail as possible..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingRequest(false)}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Submit Request <ChevronRight className="w-4 h-4" /></>
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
