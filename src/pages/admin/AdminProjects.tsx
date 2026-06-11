import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  MoreVertical,
  ChevronRight,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  LayoutGrid,
  List,
  X,
  Trash2,
  Edit3
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, handleFirestoreError, OperationType, serverTimestamp, query, orderBy } from "@/src/firebase";

const AdminProjects: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubProjects = onSnapshot(query(collection(db, "projects"), orderBy("name", "asc")), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "projects"));

    const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubTeam = onSnapshot(collection(db, "team"), (snapshot) => {
      setTeam(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubProjects();
      unsubClients();
      unsubTeam();
    };
  }, []);

  const handleSaveProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const projectData = {
      name: formData.get("name") as string,
      clientId: formData.get("clientId") as string,
      managerId: formData.get("managerId") as string,
      status: formData.get("status") as string,
      health: formData.get("health") as string,
      progress: parseInt(formData.get("progress") as string) || 0,
      budget: formData.get("budget") as string,
      deadline: formData.get("deadline") as string,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingProject) {
        await updateDoc(doc(db, "projects", editingProject.id), projectData);
      } else {
        await addDoc(collection(db, "projects"), {
          ...projectData,
          createdAt: serverTimestamp(),
        });
      }
      setIsAddingProject(false);
      setEditingProject(null);
    } catch (err: any) {
      setError(err.message || "Failed to save project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const client = clients.find(c => c.id === p.clientId);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (client?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (client?.company || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">All Projects</h1>
          <p className="text-gray-500 mt-2">Oversee all active and pending projects across the entire ecosystem.</p>
        </div>
        <button 
          onClick={() => setIsAddingProject(true)}
          className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-blue/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Project
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/5 border border-black/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue/50 transition-colors text-[#1a1a1a]"
            />
          </div>
          <div className="flex items-center bg-black/5 border border-black/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "grid" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-gray-500 hover:text-[#1a1a1a]"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "list" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-gray-500 hover:text-[#1a1a1a]"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {["All", "Active", "On Hold", "Completed", "Maintenance"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                filterStatus === status
                  ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/30"
                  : "bg-black/5 text-gray-500 border border-black/5 hover:border-black/10 hover:text-[#1a1a1a]"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => {
            const client = clients.find(c => c.id === project.clientId);
            const manager = team.find(t => t.id === project.managerId);
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white border border-black/5 rounded-[32px] p-8 hover:border-brand-blue/30 transition-all duration-500 flex flex-col shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="p-4 bg-brand-blue/10 rounded-2xl text-brand-blue group-hover:scale-110 transition-transform duration-500">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider",
                      project.health === "Healthy" ? "bg-emerald-500/10 text-emerald-600" :
                      project.health === "At Risk" ? "bg-[#ffca0f]/10 text-[#b38e0a]" :
                      "bg-red-500/10 text-red-600"
                    )}>
                      {project.health}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => { setEditingProject(project); setIsAddingProject(true); }}
                        className="p-2 hover:bg-black/5 rounded-lg text-gray-500 hover:text-[#1a1a1a] transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 hover:bg-red-500/5 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-8 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      project.health === "Healthy" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                      project.health === "At Risk" ? "bg-[#ffca0f] shadow-[0_0_10px_rgba(255,202,15,0.5)]" :
                      "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    )} />
                    <h3 className="text-xl font-bold text-[#1a1a1a] group-hover:text-brand-blue transition-colors">{project.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 mb-6">
                    <Building2 className="w-3 h-3" />
                    <span className="text-xs font-bold uppercase tracking-widest">{client?.company || "No Company"}</span>
                  </div>

                  {/* Project Manager Section */}
                  <div className="mb-6 p-4 bg-black/5 rounded-2xl border border-black/5 group-hover:border-brand-blue/20 transition-colors">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">Project Lead</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-blue-400 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-brand-blue/20">
                        {manager?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1a1a1a]">{manager?.name || "Unassigned"}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{manager?.role || "No Role"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-500">
                      <span>Progress</span>
                      <span className="text-[#1a1a1a]">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-blue rounded-full" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-black/5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Budget</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">{project.budget}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Deadline</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">{project.deadline}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project, index) => {
            const client = clients.find(c => c.id === project.clientId);
            const manager = team.find(t => t.id === project.managerId);
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 bg-white border border-black/5 rounded-2xl hover:border-brand-blue/30 transition-all group flex items-center gap-8 shadow-sm"
              >
                <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue flex-shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      project.health === "Healthy" ? "bg-emerald-500" :
                      project.health === "At Risk" ? "bg-[#ffca0f]" :
                      "bg-red-500"
                    )} />
                    <h3 className="text-sm font-bold truncate text-[#1a1a1a] group-hover:text-brand-blue transition-colors">{project.name}</h3>
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{client?.company || "No Company"}</p>
                </div>

                <div className="hidden lg:block w-48">
                  <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    <span>Progress</span>
                    <span className="text-[#1a1a1a]">{project.progress}%</span>
                  </div>
                  <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue rounded-full" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div className="hidden md:block w-32">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Manager</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center text-[8px] font-bold text-white">
                      {manager?.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                    </div>
                    <span className="text-xs font-bold text-gray-500">{manager?.name || "Unassigned"}</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-gray-500 w-32">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs font-bold text-[#1a1a1a]">{project.deadline}</span>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => { setEditingProject(project); setIsAddingProject(true); }}
                    className="p-2 hover:bg-black/5 rounded-lg text-gray-500 hover:text-[#1a1a1a] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-2 hover:bg-red-500/5 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Project Modal */}
      <AnimatePresence>
        {isAddingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddingProject(false); setEditingProject(null); }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-black/10 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#1a1a1a]">{editingProject ? "Edit Project" : "Create New Project"}</h2>
                <button 
                  onClick={() => { setIsAddingProject(false); setEditingProject(null); }}
                  className="p-2 hover:bg-black/5 rounded-full text-gray-500 hover:text-[#1a1a1a] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSaveProject} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Project Name</label>
                    <input
                      name="name"
                      defaultValue={editingProject?.name}
                      required
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                      placeholder="e.g., Mobile App Development"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Client</label>
                    <select
                      name="clientId"
                      defaultValue={editingProject?.clientId}
                      required
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors appearance-none text-[#1a1a1a]"
                    >
                      <option value="">Select Client</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Project Lead</label>
                    <select
                      name="managerId"
                      defaultValue={editingProject?.managerId}
                      required
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors appearance-none text-[#1a1a1a]"
                    >
                      <option value="">Select Manager</option>
                      {team.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Status</label>
                    <select
                      name="status"
                      defaultValue={editingProject?.status || "Active"}
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors appearance-none text-[#1a1a1a]"
                    >
                      <option value="Active">Active</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Health</label>
                    <select
                      name="health"
                      defaultValue={editingProject?.health || "Healthy"}
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors appearance-none text-[#1a1a1a]"
                    >
                      <option value="Healthy">Healthy</option>
                      <option value="At Risk">At Risk</option>
                      <option value="Delayed">Delayed</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Progress (%)</label>
                    <input
                      name="progress"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={editingProject?.progress || 0}
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Budget</label>
                    <input
                      name="budget"
                      defaultValue={editingProject?.budget}
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                      placeholder="e.g., $45,000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Deadline</label>
                    <input
                      name="deadline"
                      defaultValue={editingProject?.deadline}
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                      placeholder="e.g., Apr 15, 2026"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsAddingProject(false); setEditingProject(null); }}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-brand-blue hover:bg-brand-blue/90 disabled:bg-brand-blue/50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-blue/20 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : null}
                    {editingProject ? "Update Project" : "Create Project"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {filteredProjects.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-[#1a1a1a]">No projects found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
