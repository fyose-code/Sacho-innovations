import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  User,
  MoreVertical,
  Trash2,
  Edit3,
  ChevronRight,
  Tag,
  Flag,
  Activity
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, handleFirestoreError, OperationType, serverTimestamp, query, orderBy } from "@/src/firebase";

export default function AdminTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsubTasks = onSnapshot(q, (snapshot) => {
      const t = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(t);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "tasks"));

    const unsubTeam = onSnapshot(collection(db, "team"), (snapshot) => {
      const m = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(m);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "team"));

    return () => {
      unsubTasks();
      unsubTeam();
    };
  }, []);

  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const taskData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      assignedTo: formData.get("assignedTo") as string,
      priority: formData.get("priority") as string,
      dueDate: formData.get("dueDate") as string,
      status: editingTask?.status || "pending",
      createdAt: editingTask?.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingTask) {
        await updateDoc(doc(db, "tasks", editingTask.id), taskData);
      } else {
        await addDoc(collection(db, "tasks"), taskData);
      }
      setIsAddingTask(false);
      setEditingTask(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "tasks");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteDoc(doc(db, "tasks", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
      }
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "tasks", id), { status, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `tasks/${id}`);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">Task Manager</h1>
          <p className="text-gray-500 mt-1 text-sm">Assign and track progress across the team.</p>
        </div>
        <button
          onClick={() => setIsAddingTask(true)}
          className="bg-[#3473c8] hover:bg-[#3473c8]/90 text-white px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-[#3473c8]/20"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Pending", value: tasks.filter(t => t.status === "pending").length.toString(), color: "text-amber-500", icon: Clock },
          { label: "In Progress", value: tasks.filter(t => t.status === "in-progress").length.toString(), color: "text-[#3473c8]", icon: Activity },
          { label: "Completed", value: tasks.filter(t => t.status === "completed").length.toString(), color: "text-emerald-500", icon: CheckCircle2 },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-black/5 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className={cn("w-12 h-12 rounded-xl bg-[#f1f4f8] flex items-center justify-center", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1a1a1a]">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-black/5 p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl pl-10 pr-4 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-2 text-sm font-medium text-[#1a1a1a] focus:outline-none focus:border-[#3473c8]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-black/5 rounded-2xl p-6 hover:bg-[#f1f4f8]/50 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg truncate text-[#1a1a1a] group-hover:text-[#3473c8] transition-colors">{task.title}</h3>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    task.priority === "high" ? "bg-red-100 text-red-600" : 
                    task.priority === "medium" ? "bg-amber-100 text-amber-600" : 
                    "bg-blue-100 text-[#3473c8]"
                  )}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-1">{task.description}</p>
              </div>

              <div className="flex items-center gap-8 w-full lg:w-auto border-l border-black/5 pl-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#3473c8]/10 text-[#3473c8] flex items-center justify-center text-[10px] font-bold border border-black/5 uppercase">
                    {teamMembers.find(m => m.id === task.assignedTo)?.name.split(' ').map((n: string) => n[0]).join('') || "?"}
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Assigned To</div>
                    <div className="text-xs font-bold text-[#1a1a1a]">{teamMembers.find(m => m.id === task.assignedTo)?.name || "Unassigned"}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Due Date</div>
                  <div className="text-xs font-bold text-gray-600">{task.dueDate || "No date"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Status</div>
                  <select 
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className={cn(
                      "text-xs font-bold bg-transparent border-none p-0 focus:ring-0 cursor-pointer uppercase tracking-wider",
                      task.status === "completed" ? "text-emerald-600" : 
                      task.status === "in-progress" ? "text-[#3473c8]" : "text-amber-600"
                    )}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 w-full lg:w-auto">
                <button 
                  onClick={() => { setEditingTask(task); setIsAddingTask(true); }}
                  className="p-2.5 hover:bg-[#f1f4f8] rounded-xl text-gray-400 hover:text-[#3473c8] transition-all"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddingTask(false); setEditingTask(null); }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-black/10 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 text-[#1a1a1a]">{editingTask ? "Edit Task" : "Create New Task"}</h2>
              <form onSubmit={handleAddTask}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Task Title</label>
                    <input
                      name="title"
                      defaultValue={editingTask?.title}
                      required
                      type="text"
                      className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors"
                      placeholder="e.g., Implement Firebase Auth"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <textarea
                      name="description"
                      defaultValue={editingTask?.description}
                      rows={3}
                      className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors resize-none"
                      placeholder="Describe the task requirements..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Assign To</label>
                      <select name="assignedTo" defaultValue={editingTask?.assignedTo} className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors appearance-none">
                        <option value="">Select Member</option>
                        {teamMembers.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Priority</label>
                      <select name="priority" defaultValue={editingTask?.priority || "medium"} className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors appearance-none">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500">Due Date</label>
                      <input
                        name="dueDate"
                        defaultValue={editingTask?.dueDate}
                        type="date"
                        className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => { setIsAddingTask(false); setEditingTask(null); }}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="bg-[#3473c8] hover:bg-[#3473c8]/90 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#3473c8]/20">
                    {editingTask ? "Update Task" : "Assign Task"}
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
