import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  UserPlus,
  Trash2,
  Edit3,
  Briefcase,
  LogIn,
  LogOut
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, handleFirestoreError, OperationType, serverTimestamp, query, orderBy, secondaryAuth, createUserWithEmailAndPassword, setDoc } from "@/src/firebase";
import { useAuth } from "@/src/context/AuthContext";

export default function AdminTeam() {
  const { user } = useAuth();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isClocking, setIsClocking] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logAudit = async (action: string, details: any) => {
    try {
      await addDoc(collection(db, "audit_logs"), {
        adminId: user?.uid,
        adminName: user?.displayName || user?.email,
        action,
        details,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Audit log failed:", error);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "team"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(members);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "team"));

    return () => unsubscribe();
  }, []);

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;

    const memberData = {
      name,
      email,
      role,
      expertise: (formData.get("expertise") as string).split(',').map(s => s.trim()),
      projects: parseInt(formData.get("projects") as string) || 0,
      tasks: parseInt(formData.get("tasks") as string) || 0,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingMember) {
        await updateDoc(doc(db, "team", editingMember.id), memberData);
        // Also update users collection
        await updateDoc(doc(db, "users", editingMember.id), {
          name,
          email,
          role: "manager", // Team members are managers or similar
        });
        await logAudit("edit_member", { memberId: editingMember.id, ...memberData });
      } else {
        if (!password) {
          setError("Password is required for new accounts.");
          setIsSubmitting(false);
          return;
        }

        // 1. Create Auth User using secondaryAuth
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const uid = userCredential.user.uid;

        // 2. Create Team Document
        const newMember = {
          ...memberData,
          uid,
          status: "inactive",
          lastActive: null,
          clockIn: null,
          clockOut: null,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "team", uid), newMember);

        // 3. Create User Document for AuthContext
        await setDoc(doc(db, "users", uid), {
          name,
          email,
          role: "manager", // Default role for team
          createdAt: serverTimestamp(),
        });

        await logAudit("add_member", { memberId: uid, ...memberData });
      }
      setIsAddingMember(false);
      setEditingMember(null);
    } catch (err: any) {
      let errorMessage = err.message || "Failed to save member.";
      if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Email/Password sign-in is not enabled in the Firebase Console. Please enable it in the Authentication tab.";
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this team member?")) {
      try {
        await deleteDoc(doc(db, "team", id));
        await logAudit("delete_member", { memberId: id });
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `team/${id}`);
      }
    }
  };

  const handleStatusChange = async (member: any, newStatus: string) => {
    setIsClocking(true);
    try {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updateData: any = {
        status: newStatus,
        lastActive: serverTimestamp(),
      };

      if (newStatus === "active") {
        updateData.clockIn = now;
        updateData.clockOut = null;
      } else if (newStatus === "inactive") {
        updateData.clockOut = now;
      }
      
      await updateDoc(doc(db, "team", member.id), updateData);

      // Log attendance
      await addDoc(collection(db, "attendance"), {
        memberId: member.id,
        memberName: member.name,
        type: newStatus,
        timestamp: serverTimestamp(),
        time: now
      });

      await logAudit("status_change", { memberId: member.id, status: newStatus });

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `team/${member.id}`);
    } finally {
      setIsClocking(false);
    }
  };

  const filteredMembers = teamMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Team", value: teamMembers.length.toString(), icon: Users, color: "text-blue-400" },
    { label: "Currently Active", value: teamMembers.filter(m => m.status === "active").length.toString(), icon: CheckCircle2, color: "text-emerald-400" },
    { label: "On Break / Away", value: teamMembers.filter(m => m.status === "away").length.toString(), icon: Clock, color: "text-amber-400" },
    { label: "Offline", value: teamMembers.filter(m => m.status === "inactive").length.toString(), icon: XCircle, color: "text-gray-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">Team & Attendance</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your workforce, roles, and real-time activity.</p>
        </div>
        <button
          onClick={() => setIsAddingMember(true)}
          className="bg-[#3473c8] hover:bg-[#3473c8]/90 text-white px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-[#3473c8]/20"
        >
          <UserPlus className="w-5 h-5" />
          Add Team Member
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
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
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl pl-10 pr-4 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#f1f4f8] hover:bg-black/5 border border-black/5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 transition-all">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#f1f4f8] hover:bg-black/5 border border-black/5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 transition-all">
            <Calendar className="w-4 h-4" /> Attendance Logs
          </button>
        </div>
      </div>

      {/* Team List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMembers.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-black/5 rounded-2xl p-6 hover:bg-[#f1f4f8]/50 transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Profile Info */}
              <div className="flex items-center gap-4 w-full lg:w-1/4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3473c8]/10 to-[#ffca0f]/10 flex items-center justify-center text-xl font-bold border border-black/5 text-[#3473c8] uppercase">
                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                    member.status === "active" ? "bg-emerald-500" : member.status === "away" ? "bg-amber-500" : "bg-gray-400"
                  )} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none text-[#1a1a1a]">{member.name}</h3>
                  <p className="text-[#3473c8] text-sm mt-1">{member.role}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Last Active: {member.lastActive ? new Date(member.lastActive.toDate()).toLocaleTimeString() : 'Never'}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Info */}
              <div className="grid grid-cols-2 gap-8 w-full lg:w-1/4 border-l border-black/5 pl-8">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Clock In</div>
                  <div className="text-sm font-bold text-emerald-600">{member.clockIn || "--:--"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Clock Out</div>
                  <div className="text-sm font-bold text-gray-400">{member.clockOut || "--:--"}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 w-full lg:w-1/4 border-l border-black/5 pl-8">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Projects</div>
                  <div className="text-sm font-bold text-[#1a1a1a]">{member.projects || 0}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Tasks</div>
                  <div className="text-sm font-bold text-[#1a1a1a]">{member.tasks || 0}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 w-full lg:w-1/4">
                <div className="flex items-center bg-[#f1f4f8] rounded-xl p-1 border border-black/5">
                  <button 
                    onClick={() => handleStatusChange(member, "active")}
                    disabled={isClocking || member.status === "active"}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      member.status === "active" ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-emerald-600"
                    )}
                    title="Clock In"
                  >
                    <LogIn className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleStatusChange(member, "away")}
                    disabled={isClocking || member.status === "away"}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      member.status === "away" ? "bg-amber-500 text-white" : "text-gray-400 hover:text-amber-600"
                    )}
                    title="Set Away"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleStatusChange(member, "inactive")}
                    disabled={isClocking || member.status === "inactive"}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      member.status === "inactive" ? "bg-red-500 text-white" : "text-gray-400 hover:text-red-600"
                    )}
                    title="Clock Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => { setEditingMember(member); setIsAddingMember(true); }}
                  className="p-2.5 hover:bg-[#f1f4f8] rounded-xl text-gray-400 hover:text-[#3473c8] transition-all"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-2.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddingMember(false); setEditingMember(null); }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-black/10 rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6 text-[#1a1a1a]">{editingMember ? "Edit Team Member" : "Add New Team Member"}</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAddMember}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                    <input
                      name="name"
                      defaultValue={editingMember?.name}
                      required
                      type="text"
                      className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors"
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-500">Email Address</label>
                    <input
                      name="email"
                      defaultValue={editingMember?.email}
                      required
                      type="email"
                      className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors"
                      placeholder="e.g., john@sacho.com"
                    />
                  </div>
                  {!editingMember && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-500">Initial Password</label>
                      <input
                        name="password"
                        required
                        type="password"
                        className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  )}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-500">Role</label>
                    <select name="role" defaultValue={editingMember?.role} className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors appearance-none">
                      <option>Lead Developer</option>
                      <option>Project Manager</option>
                      <option>UI Designer</option>
                      <option>Full Stack Developer</option>
                      <option>QA Engineer</option>
                      <option>DevOps Engineer</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-500">Expertise (Comma separated)</label>
                    <input
                      name="expertise"
                      defaultValue={editingMember?.expertise?.join(', ')}
                      type="text"
                      className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors"
                      placeholder="e.g., React, Python, AWS"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-500">Active Projects</label>
                    <input
                      name="projects"
                      defaultValue={editingMember?.projects || 0}
                      type="number"
                      min="0"
                      className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-500">Assigned Tasks</label>
                    <input
                      name="tasks"
                      defaultValue={editingMember?.tasks || 0}
                      type="number"
                      min="0"
                      className="w-full bg-[#f1f4f8] border border-black/5 rounded-xl px-4 py-3 text-[#1a1a1a] focus:outline-none focus:border-[#3473c8] transition-colors"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => { setIsAddingMember(false); setEditingMember(null); }}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-[#3473c8] hover:bg-[#3473c8]/90 disabled:bg-[#3473c8]/50 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#3473c8]/20 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : null}
                    {editingMember ? "Update Member" : "Create Account"}
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
