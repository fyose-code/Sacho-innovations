import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  UserPlus,
  Building2,
  Globe,
  Trash2,
  Edit3,
  X,
  Lock
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, handleFirestoreError, OperationType, serverTimestamp, query, orderBy, secondaryAuth, createUserWithEmailAndPassword, setDoc } from "@/src/firebase";
import { useAuth } from "@/src/context/AuthContext";

const AdminClients: React.FC = () => {
  const { user: adminUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [clients, setClients] = useState<any[]>([]);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "clients"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(clientList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "clients"));

    return () => unsubscribe();
  }, []);

  const handleAddClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const location = formData.get("location") as string;

    const clientData = {
      name,
      email,
      company,
      location,
      status: formData.get("status") as string || "Active",
      projects: parseInt(formData.get("projects") as string) || 0,
      revenue: formData.get("revenue") as string || "$0",
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingClient) {
        await updateDoc(doc(db, "clients", editingClient.id), clientData);
        // Also update users collection
        await updateDoc(doc(db, "users", editingClient.id), {
          name,
          email,
          role: "client",
        });
      } else {
        if (!password) {
          setError("Password is required for new accounts.");
          setIsSubmitting(false);
          return;
        }

        // 1. Create Auth User using secondaryAuth
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const uid = userCredential.user.uid;

        // 2. Create Client Document
        await setDoc(doc(db, "clients", uid), {
          ...clientData,
          uid,
          createdAt: serverTimestamp(),
        });

        // 3. Create User Document for AuthContext
        await setDoc(doc(db, "users", uid), {
          name,
          email,
          role: "client",
          createdAt: serverTimestamp(),
        });
      }
      setIsAddingClient(false);
      setEditingClient(null);
    } catch (err: any) {
      let errorMessage = err.message || "Failed to save client.";
      if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Email/Password sign-in is not enabled in the Firebase Console. Please enable it in the Authentication tab.";
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteDoc(doc(db, "clients", id));
        // Note: We don't delete from Auth or users collection here for safety, 
        // but in a real app you might want to disable the user.
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `clients/${id}`);
      }
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">Clients</h1>
          <p className="text-gray-500 mt-2">Manage all client accounts, access levels, and relationships.</p>
        </div>
        <button 
          onClick={() => setIsAddingClient(true)}
          className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-blue/20 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add New Client
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/5 border border-black/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-blue/50 transition-colors text-[#1a1a1a]"
          />
        </div>
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {["All", "Active", "Pending", "Inactive"].map((status) => (
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

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white border border-black/5 rounded-[32px] p-8 hover:border-brand-blue/30 transition-all duration-500 flex flex-col shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-blue-400 flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-brand-blue/20 group-hover:scale-110 transition-transform duration-500">
                {client.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-1 rounded text-[8px] font-bold uppercase tracking-wider",
                  client.status === "Active" ? "bg-emerald-500/10 text-emerald-600" :
                  client.status === "Pending" ? "bg-[#ffca0f]/10 text-[#ffca0f]" :
                  "bg-red-500/10 text-red-600"
                )}>
                  {client.status}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setEditingClient(client); setIsAddingClient(true); }}
                    className="p-2 hover:bg-black/5 rounded-lg text-gray-500 hover:text-[#1a1a1a] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-2 hover:bg-red-500/5 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-8 flex-1">
              <h3 className="text-xl font-bold text-[#1a1a1a] group-hover:text-brand-blue transition-colors mb-1">{client.name}</h3>
              <div className="flex items-center gap-2 text-gray-500 mb-4">
                <Building2 className="w-3 h-3" />
                <span className="text-xs font-bold uppercase tracking-widest">{client.company}</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-500">
                  <Mail className="w-4 h-4 text-brand-blue" />
                  <span className="text-sm truncate text-[#1a1a1a]">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <MapPin className="w-4 h-4 text-brand-blue" />
                  <span className="text-sm text-[#1a1a1a]">{client.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-black/5">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Projects</p>
                <p className="text-sm font-bold text-[#1a1a1a]">{client.projects}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Total Revenue</p>
                <p className="text-sm font-bold text-[#1a1a1a]">{client.revenue}</p>
              </div>
            </div>

            <button className="mt-8 w-full py-4 bg-black/5 hover:bg-brand-blue hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn text-gray-600">
              View Profile <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Client Modal */}
      <AnimatePresence>
        {isAddingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddingClient(false); setEditingClient(null); }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-black/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#1a1a1a]">{editingClient ? "Edit Client" : "Add New Client"}</h2>
                <button 
                  onClick={() => { setIsAddingClient(false); setEditingClient(null); }}
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

              <form onSubmit={handleAddClient} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Full Name</label>
                    <input
                      name="name"
                      defaultValue={editingClient?.name}
                      required
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={editingClient?.email}
                      required
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                      placeholder="e.g., john@company.com"
                    />
                  </div>
                  {!editingClient && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-500 ml-1">Initial Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          name="password"
                          type="password"
                          required
                          className="w-full bg-black/5 border border-black/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Company</label>
                    <input
                      name="company"
                      defaultValue={editingClient?.company}
                      required
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                      placeholder="e.g., Enterprise Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Location</label>
                    <input
                      name="location"
                      defaultValue={editingClient?.location}
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                      placeholder="e.g., New York, USA"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500 ml-1">Status</label>
                    <select 
                      name="status" 
                      defaultValue={editingClient?.status || "Active"}
                      className="w-full bg-black/5 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors appearance-none text-[#1a1a1a]"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsAddingClient(false); setEditingClient(null); }}
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
                    {editingClient ? "Update Client" : "Create Client Account"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {filteredClients.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-[#1a1a1a]">No clients found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
