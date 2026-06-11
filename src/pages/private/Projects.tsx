import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Search,
  Filter,
  ChevronRight,
  Clock,
  CheckSquare,
  MessageSquare,
  Plus,
  LayoutGrid,
  List,
  ArrowUpRight,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, collection, onSnapshot, query, where, handleFirestoreError, OperationType } from "@/src/firebase";

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "projects"),
      where("clientId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "projects"));

    return () => unsub();
  }, [user]);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-gray-500 mt-2">Manage and track all your active innovation projects.</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Start New Project
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:row justify-between items-center gap-6 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "grid" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-500 hover:text-white"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "list" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-500 hover:text-white"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {["All", "Mobile", "ERP", "Automation", "Security"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                filterCategory === cat
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-gray-500 border border-white/5 hover:border-white/10 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden hover:border-blue-500/30 transition-all duration-500 flex flex-col"
            >
              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-400">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <button className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider">
                      {project.status}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{project.type}</span>
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{project.name}</h3>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-bold">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Next Milestone</p>
                    <p className="text-xs font-bold text-white truncate">{project.nextMilestone}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Due Date</p>
                    <p className="text-xs font-bold text-white">{project.dueDate}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.team.map((member, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-black bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[10px] font-bold"
                        title={member}
                      >
                        {member.split(" ").map((n) => n[0]).join("")}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-gray-500">
                    <div className="flex items-center gap-1 text-xs">
                      <CheckSquare className="w-3 h-3" /> 12
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <MessageSquare className="w-3 h-3" /> 5
                    </div>
                  </div>
                </div>
              </div>

              <Link
                to={`/projects/${project.id}`}
                className="w-full py-5 bg-white/5 hover:bg-blue-600 text-white text-sm font-bold uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 group/btn"
              >
                Enter Workspace <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group flex items-center gap-8"
            >
              <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold truncate group-hover:text-blue-400 transition-colors">{project.name}</h3>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider">
                    {project.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{project.type}</p>
              </div>

              <div className="hidden lg:block w-48">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-500 uppercase tracking-widest font-bold">Progress</span>
                  <span className="text-white font-bold">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="hidden md:block text-right w-40">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Next Milestone</p>
                <p className="text-xs font-bold text-white truncate">{project.nextMilestone}</p>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-gray-500 w-24">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-bold">{project.dueDate.split(",")[0]}</span>
              </div>

              <Link
                to={`/projects/${project.id}`}
                className="p-3 bg-white/5 hover:bg-blue-600 rounded-xl transition-all group/btn"
              >
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">No projects found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Projects;
