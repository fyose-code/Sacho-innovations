import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckSquare,
  Clock,
  MessageSquare,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, collection, onSnapshot, query, where, handleFirestoreError, OperationType, orderBy, limit } from "@/src/firebase";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeProjects: 0,
    pendingTasks: 0,
    upcomingDeadlines: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    if (!user) return;

    // Fetch Active Projects
    const qProjects = query(
      collection(db, "projects"),
      where("clientId", "==", user.uid),
      where("status", "==", "Active")
    );
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveProjects(projects);
      setStats(prev => ({ ...prev, activeProjects: snapshot.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "projects"));

    // Fetch Tasks Count
    const qTasks = query(
      collection(db, "tasks"),
      where("clientId", "==", user.uid),
      where("status", "!=", "Completed")
    );
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setStats(prev => ({ ...prev, pendingTasks: snapshot.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "tasks"));

    // Fetch Recent Activity (Mocking from clientRequests and qaIssues for now as there's no activity log)
    const qRequests = query(
      collection(db, "clientRequests"),
      where("clientId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        type: "message",
        text: `Request: ${doc.data().title}`,
        time: doc.data().createdAt?.toDate ? new Date(doc.data().createdAt.toDate()).toLocaleTimeString() : "Just now",
        user: doc.data().clientName || "You"
      }));
      setRecentActivity(activities);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "clientRequests"));

    return () => {
      unsubProjects();
      unsubTasks();
      unsubRequests();
    };
  }, [user]);

  const chartData = [
    { name: "Jan", progress: 40 },
    { name: "Feb", progress: 55 },
    { name: "Mar", progress: 48 },
    { name: "Apr", progress: 70 },
    { name: "May", progress: 85 },
    { name: "Jun", progress: 92 },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight"
          >
            Welcome back, {user?.name.split(" ")[0]}!
          </motion.h1>
          <p className="text-gray-500 mt-2">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Schedule Meeting
          </button>
          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Projects", value: stats.activeProjects.toString(), icon: Briefcase, color: "blue" },
          { label: "Pending Tasks", value: stats.pendingTasks.toString(), icon: CheckSquare, color: "purple" },
          { label: "Upcoming Deadlines", value: stats.upcomingDeadlines.toString(), icon: Clock, color: "orange" },
          { label: "Unread Messages", value: stats.unreadMessages.toString(), icon: MessageSquare, color: "emerald" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-white/10 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                stat.color === "blue" && "bg-blue-500/10 text-blue-400",
                stat.color === "purple" && "bg-purple-500/10 text-purple-400",
                stat.color === "orange" && "bg-orange-500/10 text-orange-400",
                stat.color === "emerald" && "bg-emerald-500/10 text-emerald-400",
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Projects List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Projects</h2>
            <Link to="/projects" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activeProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group"
              >
                <div className="flex flex-col md:row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{project.name}</h3>
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">{project.type}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Project Progress</span>
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
                  </div>

                  <div className="flex flex-col justify-between items-end text-right">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Next Milestone</p>
                      <p className="text-sm font-medium text-white">{project.nextMilestone}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                      <Clock className="w-3 h-3" /> Due {project.dueDate}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Progress Chart */}
          <div className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold">Overall Progress</h3>
                <p className="text-sm text-gray-500">Consolidated progress across all active projects.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" /> +12% this month
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#000", border: "1px solid #ffffff10", borderRadius: "12px" }}
                    itemStyle={{ color: "#2563eb" }}
                  />
                  <Area type="monotone" dataKey="progress" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorProgress)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
            <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center",
                    activity.type === "file" && "bg-blue-500/10 text-blue-400",
                    activity.type === "message" && "bg-purple-500/10 text-purple-400",
                    activity.type === "milestone" && "bg-emerald-500/10 text-emerald-400",
                    activity.type === "task" && "bg-orange-500/10 text-orange-400",
                  )}>
                    {activity.type === "file" && <FileText className="w-4 h-4" />}
                    {activity.type === "message" && <MessageSquare className="w-4 h-4" />}
                    {activity.type === "milestone" && <CheckSquare className="w-4 h-4" />}
                    {activity.type === "task" && <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm text-white leading-tight">{activity.text}</p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">{activity.time} • {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
              View Full Feed
            </button>
          </div>

          {/* Upcoming Meetings */}
          <div className="p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Next Meeting</h3>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            </div>
            <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-white/5">
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-1">Today • 2:00 PM</p>
              <p className="text-sm font-bold text-white mb-2">Milestone Review: Design Phase</p>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-gray-500">+2 others</span>
              </div>
            </div>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20">
              Join Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
