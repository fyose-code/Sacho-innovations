import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  User,
  Calendar,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, collection, onSnapshot, query, where, handleFirestoreError, OperationType } from "@/src/firebase";

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"board" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("clientId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "tasks"));

    return () => unsub();
  }, [user]);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.project?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-gray-500 mt-2">Manage and track all project-related tasks.</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Task
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:row justify-between items-center gap-6 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode("board")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "board" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-500 hover:text-white"
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
          {["All", "Pending", "In Progress", "In Review", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                filterStatus === status
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-gray-500 border border-white/5 hover:border-white/10 hover:text-white"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Display */}
      {viewMode === "list" ? (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group flex items-center gap-8"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                task.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" :
                task.status === "In Progress" ? "bg-blue-500/10 text-blue-400" :
                task.status === "In Review" ? "bg-purple-500/10 text-purple-400" :
                "bg-gray-500/10 text-gray-500"
              )}>
                {task.status === "Completed" ? <CheckCircle2 className="w-5 h-5" /> :
                 task.status === "In Progress" ? <Zap className="w-5 h-5" /> :
                 task.status === "In Review" ? <Clock className="w-5 h-5" /> :
                 <AlertCircle className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate group-hover:text-blue-400 transition-colors">{task.title}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{task.project}</p>
              </div>

              <div className="hidden lg:block w-32">
                <span className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                  task.priority === "High" ? "bg-red-500/10 text-red-400" :
                  task.priority === "Medium" ? "bg-orange-500/10 text-orange-400" :
                  "bg-blue-500/10 text-blue-400"
                )}>
                  {task.priority} Priority
                </span>
              </div>

              <div className="hidden md:flex items-center gap-3 w-40">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                  {task.assignee.split(" ").map(n => n[0]).join("")}
                </div>
                <span className="text-xs font-bold text-gray-400">{task.assignee}</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-gray-500 w-32">
                <Calendar className="w-3 h-3" />
                <span className="text-xs font-bold">{task.dueDate}</span>
              </div>

              <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {["Pending", "In Progress", "In Review", "Completed"].map((status) => (
            <div key={status} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">{status}</h3>
                <span className="px-2 py-0.5 bg-white/5 text-gray-500 text-[10px] font-bold rounded-full">
                  {filteredTasks.filter(t => t.status === status).length}
                </span>
              </div>
              <div className="space-y-4">
                {filteredTasks.filter(t => t.status === status).map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                        task.priority === "High" ? "bg-red-500/10 text-red-400" :
                        task.priority === "Medium" ? "bg-orange-500/10 text-orange-400" :
                        "bg-blue-500/10 text-blue-400"
                      )}>
                        {task.priority}
                      </span>
                      <MoreVertical className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold mb-2 group-hover:text-blue-400 transition-colors">{task.title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-6">{task.project}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-bold">
                          {task.assignee.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold">{task.assignee.split(" ")[0]}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                        <Calendar className="w-3 h-3" /> {task.dueDate.split(",")[0]}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <button className="w-full py-4 border-2 border-dashed border-white/5 hover:border-blue-500/30 rounded-2xl text-xs font-bold text-gray-500 hover:text-white transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckSquare className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">No tasks found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
