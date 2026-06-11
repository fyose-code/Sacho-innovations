import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
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
  Briefcase,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileText,
  Trash2,
  X,
  PlusCircle,
  MinusCircle
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, handleFirestoreError, OperationType, serverTimestamp, query, orderBy } from "@/src/firebase";

const AdminBilling: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form State for New Invoice
  const [newInvoice, setNewInvoice] = useState({
    clientId: "",
    projectId: "",
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
    taxRate: 15,
  });

  useEffect(() => {
    const unsubInvoices = onSnapshot(query(collection(db, "invoices"), orderBy("createdAt", "desc")), (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, "invoices"));

    const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubInvoices();
      unsubClients();
      unsubProjects();
    };
  }, []);

  const stats = {
    totalInvoiced: invoices.reduce((acc, inv) => acc + (inv.total || 0), 0),
    collected: invoices.filter(inv => inv.status === "Paid").reduce((acc, inv) => acc + (inv.total || 0), 0),
    outstanding: invoices.filter(inv => inv.status !== "Paid" && inv.status !== "Cancelled").reduce((acc, inv) => acc + (inv.total || 0), 0),
  };

  const filteredInvoices = invoices.filter((i) => {
    const client = clients.find(c => c.id === i.clientId);
    const matchesSearch = i.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (client?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || i.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: value,
      total: field === "quantity" ? value * updatedItems[index].unitPrice : 
             field === "unitPrice" ? value * updatedItems[index].quantity : 
             updatedItems[index].total
    };
    setNewInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateTotals = () => {
    const subtotal = newInvoice.items.reduce((acc, item) => acc + item.total, 0);
    const tax = (subtotal * newInvoice.taxRate) / 100;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.clientId || !newInvoice.projectId) {
      setError("Please select a client and project");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const { subtotal, tax, total } = calculateTotals();

    try {
      const invoiceData = {
        ...newInvoice,
        subtotal,
        tax,
        total,
        status: "Sent",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "invoices"), invoiceData);
      
      // Also create a transaction record
      await addDoc(collection(db, "transactions"), {
        type: "Revenue",
        amount: total,
        category: "Invoice",
        description: `Invoice ${newInvoice.invoiceNumber}`,
        date: new Date().toISOString(),
        clientId: newInvoice.clientId,
        projectId: newInvoice.projectId,
      });

      setIsAddingInvoice(false);
      setNewInvoice({
        clientId: "",
        projectId: "",
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
        taxRate: 15,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateInvoiceStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "invoices", id), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `invoices/${id}`);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await deleteDoc(doc(db, "invoices", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `invoices/${id}`);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">Financial System</h1>
          <p className="text-gray-500 mt-2">Manage billing, invoicing, and revenue tracking across all projects.</p>
        </div>
        <button 
          onClick={() => setIsAddingInvoice(true)}
          className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-brand-blue/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Invoice
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Total Invoiced", value: `$${stats.totalInvoiced.toLocaleString()}`, change: "+12.5%", trend: "up", icon: FileText, color: "blue" },
          { label: "Collected", value: `$${stats.collected.toLocaleString()}`, change: "+8.2%", trend: "up", icon: CheckCircle2, color: "emerald" },
          { label: "Outstanding", value: `$${stats.outstanding.toLocaleString()}`, change: "-2.4%", trend: "down", icon: Clock, color: "yellow" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-8 bg-white border border-black/5 rounded-[32px] shadow-sm relative overflow-hidden group"
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
              stat.color === "blue" && "bg-brand-blue/10 text-brand-blue",
              stat.color === "emerald" && "bg-emerald-500/10 text-emerald-600",
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
                stat.trend === "up" ? "text-emerald-600" : "text-red-500"
              )}>
                {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search invoices or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-black/10 rounded-xl pl-12 pr-4 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {["All", "Draft", "Sent", "Paid", "Overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                filterStatus === status
                  ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/30"
                  : "bg-white text-gray-500 border border-black/5 hover:border-black/10 hover:text-brand-blue"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-black/5 rounded-[32px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5">
                <th className="px-8 py-6 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Invoice</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Client</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Amount</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Due Date</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Status</th>
                <th className="px-8 py-6 text-[10px] text-gray-500 uppercase tracking-widest font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice, index) => {
                const client = clients.find(c => c.id === invoice.clientId);
                return (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-brand-blue/5 transition-colors border-b border-black/5 last:border-0"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1a1a1a]">{invoice.invoiceNumber}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            {invoice.createdAt?.toDate ? new Date(invoice.createdAt.toDate()).toLocaleDateString() : "Draft"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-[#1a1a1a]">{client?.name || "Unknown Client"}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{client?.company || "No Company"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-[#1a1a1a]">${(invoice.total || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">USD</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{invoice.dueDate}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        invoice.status === "Paid" ? "bg-emerald-500/10 text-emerald-600" :
                        invoice.status === "Sent" ? "bg-brand-blue/10 text-brand-blue" :
                        invoice.status === "Overdue" ? "bg-red-500/10 text-red-500" :
                        "bg-gray-100 text-gray-500"
                      )}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status !== "Paid" && (
                          <button 
                            onClick={() => updateInvoiceStatus(invoice.id, "Paid")}
                            className="p-2 hover:bg-emerald-500/10 rounded-lg text-gray-500 hover:text-emerald-600 transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 hover:bg-brand-blue/5 rounded-lg text-gray-500 hover:text-brand-blue transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#1a1a1a]">No invoices found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {isAddingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingInvoice(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white border border-black/5 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a1a1a]">Create New Invoice</h2>
                  <p className="text-sm text-gray-500 mt-1">Generate a professional invoice for your client.</p>
                </div>
                <button 
                  onClick={() => setIsAddingInvoice(false)}
                  className="p-2 hover:bg-brand-blue/5 rounded-full text-gray-500 hover:text-brand-blue transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateInvoice} className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Client</label>
                    <select
                      required
                      value={newInvoice.clientId}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, clientId: e.target.value }))}
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-brand-blue transition-colors appearance-none"
                    >
                      <option value="">Select Client</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Project</label>
                    <select
                      required
                      value={newInvoice.projectId}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, projectId: e.target.value }))}
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-brand-blue transition-colors appearance-none"
                    >
                      <option value="">Select Project</option>
                      {projects.filter(p => p.clientId === newInvoice.clientId).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-brand-blue transition-colors"
                    />
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Invoice Items</h3>
                    <button 
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs font-bold text-brand-blue hover:text-brand-blue/80 flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                  <div className="space-y-4">
                    {newInvoice.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-2xl border border-black/5">
                        <div className="md:col-span-6 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Description</label>
                          <input
                            required
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue transition-colors"
                            placeholder="Service description..."
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Qty</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value))}
                            className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue transition-colors"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Price</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value))}
                            className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue transition-colors"
                          />
                        </div>
                        <div className="md:col-span-1 text-right pb-3">
                          <p className="text-xs font-bold text-[#1a1a1a]">${item.total.toLocaleString()}</p>
                        </div>
                        <div className="md:col-span-1 flex justify-end pb-2">
                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            disabled={newInvoice.items.length === 1}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-500 transition-colors disabled:opacity-30"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="flex flex-col md:flex-row justify-between gap-8 pt-8 border-t border-black/5">
                  <div className="max-w-xs space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Tax Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newInvoice.taxRate}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                        className="w-full bg-white border border-black/10 rounded-xl px-4 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue transition-colors"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-64 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 uppercase tracking-widest font-bold">Subtotal</span>
                      <span className="font-bold text-[#1a1a1a]">${calculateTotals().subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 uppercase tracking-widest font-bold">Tax ({newInvoice.taxRate}%)</span>
                      <span className="font-bold text-[#1a1a1a]">${calculateTotals().tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl pt-4 border-t border-black/10">
                      <span className="font-bold text-[#1a1a1a] uppercase tracking-widest">Total</span>
                      <span className="font-bold text-brand-blue">${calculateTotals().total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingInvoice(false)}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-brand-blue transition-colors"
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
                    Generate & Send Invoice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBilling;
