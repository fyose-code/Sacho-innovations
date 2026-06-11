import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  CheckSquare,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Calendar,
  Layers,
  Zap,
  Package,
  Server,
  Activity
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, query, orderBy, limit, handleFirestoreError, OperationType } from "@/src/firebase";

const data = [
  { name: "Jan", revenue: 45000, projects: 4 },
  { name: "Feb", revenue: 52000, projects: 6 },
  { name: "Mar", revenue: 48000, projects: 5 },
  { name: "Apr", revenue: 61000, projects: 8 },
  { name: "May", revenue: 55000, projects: 7 },
  { name: "Jun", revenue: 67000, projects: 9 },
];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [activeTeamCount, setActiveTeamCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [caseStudiesCount, setCaseStudiesCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [revenueData, setRevenueData] = useState<any[]>(data);

  useEffect(() => {
    // Fetch Team Stats
    const unsubTeam = onSnapshot(collection(db, "team"), (snapshot) => {
      setTeamCount(snapshot.size);
      setActiveTeamCount(snapshot.docs.filter(doc => doc.data().status === "active").length);
    });

    // Fetch Services Count
    const unsubServices = onSnapshot(collection(db, "services"), (snapshot) => {
      setServicesCount(snapshot.size);
    });

    // Fetch Products Count
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProductsCount(snapshot.size);
    });

    // Fetch Case Studies Count
    const unsubCaseStudies = onSnapshot(collection(db, "caseStudies"), (snapshot) => {
      setCaseStudiesCount(snapshot.size);
    });

    // Fetch Projects Count
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      setProjectsCount(snapshot.size);
    });

    // Fetch Tasks Count
    const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
      setTasksCount(snapshot.size);
    });

    // Fetch Revenue Data from Invoices
    const unsubInvoices = onSnapshot(collection(db, "invoices"), (snapshot) => {
      const invoices = snapshot.docs.map(doc => doc.data());
      const monthlyRevenue: { [key: string]: number } = {};
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Initialize last 6 months
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthlyRevenue[months[d.getMonth()]] = 0;
      }

      invoices.forEach(inv => {
        if (inv.status === "Paid" && inv.createdAt?.toDate) {
          const date = inv.createdAt.toDate();
          const month = months[date.getMonth()];
          if (monthlyRevenue[month] !== undefined) {
            monthlyRevenue[month] += (inv.total || 0);
          }
        }
      });

      const chartData = Object.entries(monthlyRevenue).map(([name, revenue]) => ({
        name,
        revenue
      }));
      
      if (chartData.length > 0) {
        setRevenueData(chartData);
      }
    });

    // Fetch Recent Activity (Attendance)
    const qAttendance = query(collection(db, "attendance"), orderBy("timestamp", "desc"), limit(5));
    const unsubAttendance = onSnapshot(qAttendance, (snapshot) => {
      const activity = snapshot.docs.map(doc => ({
        id: doc.id,
        user: doc.data().memberName,
        action: doc.data().type === "in" ? "clocked in" : "clocked out",
        target: "System",
        time: doc.data().timestamp ? new Date(doc.data().timestamp.toDate()).toLocaleTimeString() : "Just now",
        project: "Attendance"
      }));
      setRecentActivity(activity);
    });

    return () => {
      unsubTeam();
      unsubServices();
      unsubProducts();
      unsubCaseStudies();
      unsubProjects();
      unsubTasks();
      unsubInvoices();
      unsubAttendance();
    };
  }, []);

  const dashboardStats = [
    { label: "Team Members", value: teamCount.toString(), change: `+${activeTeamCount} Active`, trend: "up", icon: Users, color: "blue" },
    { label: "Active Projects", value: projectsCount.toString(), change: "Live", trend: "up", icon: Briefcase, color: "yellow" },
    { label: "Pending Tasks", value: tasksCount.toString(), change: "In Progress", trend: "up", icon: CheckSquare, color: "emerald" },
    { label: "Case Studies", value: caseStudiesCount.toString(), change: "Published", trend: "up", icon: Layers, color: "blue" },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">Admin Console</h1>
          <p className="text-gray-500 mt-2">Welcome back. Here's what's happening across Sacho Innovations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-black/5 hover:bg-black/10 border border-black/10 rounded-xl text-sm font-bold transition-all text-gray-600">
            Download Report
          </button>
          <button className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-blue/20">
            System Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-8 bg-white border border-black/5 rounded-[32px] relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
              stat.color === "emerald" && "bg-emerald-500/10 text-emerald-600",
              stat.color === "blue" && "bg-brand-blue/10 text-brand-blue",
              stat.color === "yellow" && "bg-[#ffca0f]/10 text-[#b38e0a]",
            )}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold mb-1 text-[#1a1a1a]">{stat.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</p>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold mb-1",
                stat.trend === "up" ? "text-emerald-600" : "text-red-600"
              )}>
                {stat.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 bg-white border border-black/5 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-[#1a1a1a]">Revenue Growth</h3>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Monthly Earnings (Paid Invoices)</p>
            </div>
            <select className="bg-black/5 border border-black/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none text-[#1a1a1a]">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3473c8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3473c8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000005" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dx={-10}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#1a1a1a' }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3473c8" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 bg-white border border-black/5 rounded-[32px] shadow-sm">
          <h3 className="text-xl font-bold mb-8 text-[#1a1a1a]">System Health</h3>
          <div className="space-y-8">
            {[
              { label: "Server Load", value: 42, color: "emerald" },
              { label: "API Latency", value: 18, color: "blue" },
              { label: "Storage Usage", value: 65, color: "yellow" },
              { label: "Active Sessions", value: activeTeamCount > 0 ? Math.min(100, (activeTeamCount / teamCount) * 100) : 0, color: "blue" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{item.label}</span>
                  <span className="text-xs font-bold text-[#1a1a1a]">{Math.round(item.value)}%</span>
                </div>
                <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      item.color === "emerald" && "bg-emerald-500",
                      item.color === "blue" && "bg-brand-blue",
                      item.color === "yellow" && "bg-brand-yellow",
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 bg-brand-blue/5 border border-brand-blue/10 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1a1a]">All Systems Operational</p>
              <p className="text-[10px] text-brand-blue font-bold uppercase tracking-widest">Last Check: Just now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="p-8 bg-white border border-black/5 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#1a1a1a]">Global Activity</h3>
            <button className="text-xs font-bold text-brand-blue hover:text-brand-blue/80 transition-colors">View All</button>
          </div>
          <div className="space-y-6">
            {recentActivity.length > 0 ? recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-black/5 rounded-2xl transition-all group">
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-gray-500 group-hover:text-brand-blue transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-bold text-[#1a1a1a]">{activity.user}</span>
                    <span className="text-gray-500 mx-1">{activity.action}</span>
                    <span className="font-bold text-brand-blue">{activity.target}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{activity.project}</span>
                    <span className="text-[10px] text-gray-500">•</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{activity.time}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No recent activity recorded</p>
              </div>
            )}
          </div>
        </div>

        {/* Platform Overview */}
        <div className="p-8 bg-white border border-black/5 rounded-[32px] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#1a1a1a]">Platform Overview</h3>
            <button className="text-xs font-bold text-brand-blue hover:text-brand-blue/80 transition-colors">Manage Content</button>
          </div>
          <div className="space-y-6">
            {[
              { name: "Services", count: servicesCount, icon: Server, color: "blue" },
              { name: "Products", count: productsCount, icon: Package, color: "emerald" },
              { name: "Case Studies", count: caseStudiesCount, icon: Briefcase, color: "yellow" },
              { name: "Team Members", count: teamCount, icon: Users, color: "blue" },
            ].map((item) => (
              <div key={item.name} className="p-6 bg-black/5 border border-black/10 rounded-2xl group hover:border-brand-blue/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", 
                      item.color === "emerald" && "bg-emerald-500/10 text-emerald-600",
                      item.color === "blue" && "bg-brand-blue/10 text-brand-blue",
                      item.color === "yellow" && "bg-[#ffca0f]/10 text-[#b38e0a]",
                    )}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1a1a1a] group-hover:text-brand-blue transition-colors">{item.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{item.count} Items Published</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
