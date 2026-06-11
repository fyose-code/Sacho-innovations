import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  Download,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  DollarSign,
  FileText,
  Calendar,
  Wallet,
  Shield,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, collection, onSnapshot, query, where, handleFirestoreError, OperationType, doc } from "@/src/firebase";

const Billing: React.FC = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "invoices"),
      where("clientId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvoices(invoicesData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "invoices"));

    const unsubSettings = onSnapshot(doc(db, "settings", user.uid), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `settings/${user.uid}`));

    return () => {
      unsub();
      unsubSettings();
    };
  }, [user]);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || inv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalContractValue = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const paidToDate = invoices.filter(inv => inv.status === "Paid").reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const outstandingBalance = totalContractValue - paidToDate;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-gray-500 mt-2">Manage your project finances, invoices, and payment history.</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Payment Method
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Total Contract Value", value: `$${totalContractValue.toLocaleString()}`, icon: Wallet, color: "blue" },
          { label: "Paid to Date", value: `$${paidToDate.toLocaleString()}`, icon: CheckCircle2, color: "emerald" },
          { label: "Outstanding Balance", value: `$${outstandingBalance.toLocaleString()}`, icon: Clock, color: "orange" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px] relative overflow-hidden group"
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
              stat.color === "blue" && "bg-blue-500/10 text-blue-400",
              stat.color === "emerald" && "bg-emerald-500/10 text-emerald-400",
              stat.color === "orange" && "bg-orange-500/10 text-orange-400",
            )}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</p>
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-5 h-5 text-gray-600" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invoices List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:row justify-between items-center gap-6 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
            <div className="relative flex-1 w-full md:w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {["All", "Paid", "Due", "Overdue"].map((status) => (
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

          <div className="space-y-4">
            {filteredInvoices.map((inv, index) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group flex items-center gap-8"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-400" :
                  inv.status === "Due" ? "bg-blue-500/10 text-blue-400" :
                  "bg-red-500/10 text-red-400"
                )}>
                  <FileText className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-bold truncate group-hover:text-blue-400 transition-colors">{inv.id}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                      inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-400" :
                      inv.status === "Due" ? "bg-blue-500/10 text-blue-400" :
                      "bg-red-500/10 text-red-400"
                    )}>
                      {inv.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium truncate">{inv.description}</p>
                </div>

                <div className="hidden lg:block w-32">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Project</p>
                  <p className="text-xs font-bold text-white truncate">{inv.projectName}</p>
                </div>

                <div className="hidden md:block text-right w-24">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Amount</p>
                  <p className="text-sm font-bold text-white">${inv.amount?.toLocaleString()}</p>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-gray-500 w-24">
                  <Calendar className="w-3 h-3" />
                  <span className="text-xs font-bold">{inv.dueDate?.toDate ? inv.dueDate.toDate().toLocaleDateString() : inv.dueDate}</span>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-blue-400 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">No invoices found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Payment Methods */}
          <div className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px]">
            <h3 className="text-lg font-bold mb-8">Payment Methods</h3>
            <div className="space-y-4">
              {(settings?.billing?.paymentMethods || [
                { type: "Visa", last4: "4242", expiry: "12/28", isDefault: true },
                { type: "Mastercard", last4: "8888", expiry: "05/27", isDefault: false },
              ]).map((card: any) => (
                <div key={card.last4} className="p-6 bg-white/5 border border-white/10 rounded-2xl relative group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <CreditCard className="w-8 h-8 text-blue-400" />
                    {card.isDefault && (
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold rounded uppercase tracking-wider">Default</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-white mb-1">•••• •••• •••• {card.last4}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Expires {card.expiry}</p>
                </div>
              ))}
              <button className="w-full py-4 border-2 border-dashed border-white/5 hover:border-blue-500/30 rounded-2xl text-xs font-bold text-gray-500 hover:text-white transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add New Card
              </button>
            </div>
          </div>

          {/* Billing Support */}
          <div className="p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-[32px]">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">Billing Support</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-8">
              Have questions about your invoices or payments? Our finance team is here to help.
            </p>
            <button className="w-full py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all shadow-xl">
              Contact Finance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
