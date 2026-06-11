import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckSquare,
  Files,
  MessageSquare,
  Calendar,
  CreditCard,
  ChevronLeft,
  Settings,
  MoreVertical,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  Download,
  Send,
  User,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, doc, onSnapshot, handleFirestoreError, OperationType, collection, query, where, orderBy, addDoc, serverTimestamp } from "@/src/firebase";

const tabs = [
  { id: "overview", name: "Overview", icon: LayoutDashboard },
  { id: "tasks", name: "Tasks", icon: CheckSquare },
  { id: "files", name: "Files", icon: Files },
  { id: "messages", name: "Messages", icon: MessageSquare },
  { id: "approvals", name: "Approvals", icon: Shield },
  { id: "billing", name: "Billing", icon: CreditCard },
];

const ProjectWorkspace: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || !user) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        projectId: id,
        projectName: project.name,
        text: newMessage.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "messages");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    // Fetch Project
    const unsubProject = onSnapshot(doc(db, "projects", id), (docSnap) => {
      if (docSnap.exists()) {
        setProject({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, `projects/${id}`));

    // Fetch Tasks
    const qTasks = query(collection(db, "tasks"), where("projectId", "==", id));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Files
    const qFiles = query(collection(db, "projectFiles"), where("projectId", "==", id));
    const unsubFiles = onSnapshot(qFiles, (snapshot) => {
      setFiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Messages
    const qMessages = query(collection(db, "messages"), where("projectId", "==", id), orderBy("timestamp", "asc"));
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Approvals (Change Requests)
    const qApprovals = query(collection(db, "changeRequests"), where("projectId", "==", id));
    const unsubApprovals = onSnapshot(qApprovals, (snapshot) => {
      setApprovals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Invoices
    const qInvoices = query(collection(db, "invoices"), where("projectId", "==", id));
    const unsubInvoices = onSnapshot(qInvoices, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubProject();
      unsubTasks();
      unsubFiles();
      unsubMessages();
      unsubApprovals();
      unsubInvoices();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <p className="text-gray-500 mb-8">The project you are looking for does not exist or you don't have access.</p>
        <Link to="/projects" className="px-6 py-3 bg-blue-600 rounded-xl font-bold">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link
            to="/projects"
            className="p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider">
                {project.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">{project.type} • Managed by {project.manager}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 transition-all">
            <Settings className="w-5 h-5" />
          </button>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Action
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Progress Card */}
                <div className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Project Progress</h3>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-400">{project.progress}%</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Overall Completion</p>
                    </div>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full overflow-hidden mb-8">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto] animate-gradient rounded-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { label: "Start Date", value: project.startDate || "TBD", icon: Calendar },
                      { label: "Due Date", value: project.dueDate || project.deadline || "TBD", icon: Clock },
                      { label: "Open Tasks", value: tasks.filter(t => t.status !== "Completed").length.toString(), icon: CheckSquare },
                      { label: "Files", value: files.length.toString(), icon: Files },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <item.icon className="w-3 h-3" />
                          <span className="text-[10px] uppercase tracking-widest font-bold">{item.label}</span>
                        </div>
                        <p className="text-sm font-bold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                  <h3 className="text-xl font-bold mb-6">Project Description</h3>
                  <p className="text-gray-400 leading-relaxed">{project.description}</p>
                </div>

                {/* Milestone Roadmap */}
                <div className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                  <h3 className="text-xl font-bold mb-8">Milestone Roadmap</h3>
                  <div className="space-y-8 relative">
                    {/* Vertical Line */}
                    <div className="absolute top-0 bottom-0 left-[15px] w-[1px] bg-white/10"></div>

                    {project.roadmap?.map((milestone: any, index: number) => (
                      <div key={milestone.name} className="flex items-start gap-6 relative z-10">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-black",
                          milestone.status === "completed" ? "bg-emerald-500 text-white" :
                          milestone.status === "active" ? "bg-blue-600 text-white animate-pulse" :
                          "bg-gray-800 text-gray-500"
                        )}>
                          {milestone.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> :
                           milestone.status === "active" ? <Zap className="w-4 h-4" /> :
                           <div className="w-2 h-2 bg-current rounded-full" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={cn(
                              "font-bold",
                              milestone.status === "completed" ? "text-white" :
                              milestone.status === "active" ? "text-blue-400" :
                              "text-gray-500"
                            )}>
                              {milestone.name}
                            </h4>
                            <span className="text-xs text-gray-500 font-medium">{milestone.date}</span>
                          </div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{milestone.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-8">
                {/* Team Card */}
                <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                  <h3 className="text-lg font-bold mb-6">Project Team</h3>
                  <div className="space-y-6">
                    {[
                      { name: "Sarah Jenkins", role: "Project Manager", avatar: "SJ" },
                      { name: "Mike Ross", role: "Lead Developer", avatar: "MR" },
                      { name: "David Lee", role: "UI/UX Designer", avatar: "DL" },
                    ].map((member) => (
                      <div key={member.name} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-sm">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{member.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{member.role}</p>
                        </div>
                        <button className="ml-auto p-2 hover:bg-white/5 rounded-lg text-gray-500">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                    View All Team
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-3xl">
                  <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "Upload File", icon: Files },
                      { name: "Add Task", icon: Plus },
                      { name: "Message", icon: MessageSquare },
                      { name: "Meeting", icon: Calendar },
                    ].map((action) => (
                      <button
                        key={action.name}
                        className="p-4 bg-black/40 hover:bg-black/60 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all group"
                      >
                        <action.icon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">{action.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Health Status */}
                <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Project Health</h3>
                    <div className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded uppercase">Healthy</div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Timeline", status: "On Track", color: "emerald" },
                      { label: "Budget", status: "Under Budget", color: "emerald" },
                      { label: "Resources", status: "Optimal", color: "emerald" },
                      { label: "Risks", status: "Low", color: "emerald" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{item.label}</span>
                        <span className={cn("text-xs font-bold", `text-${item.color}-400`)}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-6">
              {tasks.length > 0 ? tasks.map((task) => (
                <div key={task.id} className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      task.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                      {task.status === "Completed" ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold">{task.title}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{task.status} • {task.priority} Priority</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-bold">{task.dueDate}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Due Date</p>
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                  <CheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-2">No Tasks Found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    There are no tasks assigned to this project yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "files" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file, i) => (
                <div key={i} className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-blue-600/10 rounded-xl text-blue-400">
                      <Files className="w-6 h-6" />
                    </div>
                    <a href={file.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/5 rounded-lg text-gray-500 transition-colors">
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                  <h4 className="font-bold mb-1 truncate">{file.name}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{file.size} • {file.type}</p>
                    <p className="text-[10px] text-gray-500 font-bold">{file.createdAt}</p>
                  </div>
                </div>
              ))}
              <button className="p-6 border-2 border-dashed border-white/5 hover:border-blue-500/30 rounded-2xl flex flex-col items-center justify-center gap-4 group transition-all">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500 group-hover:text-blue-400 group-hover:scale-110 transition-all">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-gray-500 group-hover:text-white">Upload New File</span>
              </button>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="h-[600px] bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
                    {project.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold">{project.name} Chat</h4>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active Channel</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex flex-col", msg.senderId === user?.uid ? "items-end" : "items-start")}>
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-2xl text-sm",
                      msg.senderId === user?.uid ? "bg-blue-600 text-white rounded-tr-none" : "bg-white/5 text-gray-300 rounded-tl-none border border-white/10"
                    )}>
                      {msg.senderId !== user?.uid && <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">{msg.senderName || "Team Member"}</p>}
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 font-medium">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-white/5">
                <form onSubmit={handleSendMessage} className="relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isSending}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-16 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    <Send className={cn("w-4 h-4", isSending && "animate-pulse")} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "approvals" && (
            <div className="space-y-6">
              {approvals.length > 0 ? approvals.map((approval, i) => (
                <div key={i} className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col md:row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center",
                      approval.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                    )}>
                      <Shield className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{approval.title}</h4>
                      <p className="text-sm text-gray-500">{approval.status} • Requested on {approval.createdAt || "Recently"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {approval.status === "Approved" ? (
                      <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" /> Approved
                      </div>
                    ) : (
                      <>
                        <button className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all">
                          Request Revision
                        </button>
                        <button className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
                          Approve Now
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                  <Shield className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-2">No Approvals Pending</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    All set! There are no pending approvals or change requests at this time.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: "Total Contract", value: project.budget || "$0", icon: CreditCard },
                  { label: "Paid to Date", value: `$${invoices.filter(inv => inv.status === "Paid").reduce((acc, inv) => acc + inv.amount, 0).toLocaleString()}`, icon: CheckCircle2 },
                  { label: "Remaining", value: "TBD", icon: Clock },
                ].map((stat) => (
                  <div key={stat.label} className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400 mb-4">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                <h3 className="text-xl font-bold mb-8">Invoice History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">Invoice #</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">Description</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">Amount</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">Status</th>
                        <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">Date</th>
                        <th className="pb-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="group">
                          <td className="py-6 text-sm font-bold text-white">{inv.invoiceNumber}</td>
                          <td className="py-6 text-sm text-gray-400">{inv.description}</td>
                          <td className="py-6 text-sm font-bold text-white">${inv.amount.toLocaleString()}</td>
                          <td className="py-6">
                            <span className={cn(
                              "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                              inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                            )}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-6 text-sm text-gray-500">{inv.dueDate}</td>
                          <td className="py-6 text-right">
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {invoices.length === 0 && (
                    <div className="py-10 text-center text-gray-500">No invoices found for this project.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProjectWorkspace;
