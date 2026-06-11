import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Shield,
  Clock,
  CheckCircle2,
  X,
  Trash2,
  Edit2,
  RefreshCw,
  Plus
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, collection, onSnapshot, query, where, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, handleFirestoreError, OperationType } from "@/src/firebase";

const Team: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // In a real app, we'd fetch members of the user's organization
    // For this demo, we'll fetch from a "team_members" collection where ownerId is current user
    const q = query(collection(db, "team_members"), where("ownerId", "==", user.uid));
    const unsubMembers = onSnapshot(q, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(membersData);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "team_members"));

    const qInvites = query(collection(db, "team_invites"), where("ownerId", "==", user.uid));
    const unsubInvites = onSnapshot(qInvites, (snapshot) => {
      const invitesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvites(invitesData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "team_invites"));

    return () => {
      unsubMembers();
      unsubInvites();
    };
  }, [user]);

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !user) return;

    try {
      await addDoc(collection(db, "team_invites"), {
        email: inviteEmail,
        role: inviteRole,
        ownerId: user.uid,
        status: "Pending",
        createdAt: serverTimestamp()
      });
      setInviteEmail("");
      setIsInviteModalOpen(false);
      alert("Invite sent successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "team_invites");
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await deleteDoc(doc(db, "team_members", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `team_members/${id}`);
    }
  };

  const handleDeleteInvite = async (id: string) => {
    try {
      await deleteDoc(doc(db, "team_invites", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `team_invites/${id}`);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-gray-500 mt-2">Manage your team members, roles, and invitations.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Total Members", value: members.length + 1, icon: Users, color: "blue" },
          { label: "Pending Invites", value: invites.length, icon: Clock, color: "orange" },
          { label: "Active Roles", value: "3", icon: Shield, color: "emerald" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px]"
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
              stat.color === "blue" && "bg-blue-500/10 text-blue-400",
              stat.color === "orange" && "bg-orange-500/10 text-orange-400",
              stat.color === "emerald" && "bg-emerald-500/10 text-emerald-400",
            )}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Members List */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
          <div className="relative flex-1 w-full md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Current User (Owner) */}
          <div className="p-6 bg-black/40 backdrop-blur-xl border border-blue-500/20 rounded-2xl flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold">
              {user?.displayName?.[0] || "U"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-sm font-bold">{user?.displayName} (You)</h3>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold rounded uppercase tracking-wider">Owner</span>
              </div>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Joined</p>
              <p className="text-xs font-bold">Original Member</p>
            </div>
          </div>

          {/* Other Members */}
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-white/10 transition-all group flex items-center gap-6"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-lg font-bold text-gray-400 group-hover:text-blue-400 transition-colors">
                {member.name?.[0] || "M"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-bold">{member.name}</h3>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                    member.role === "Admin" ? "bg-purple-500/10 text-purple-400" : "bg-white/5 text-gray-500"
                  )}>
                    {member.role}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Status</p>
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-emerald-400">Active</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Pending Invites */}
          {invites.map((invite, index) => (
            <motion.div
              key={invite.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (members.length + index) * 0.05 }}
              className="p-6 bg-black/20 backdrop-blur-xl border border-dashed border-white/10 rounded-2xl flex items-center gap-6 opacity-60"
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-bold text-gray-400">{invite.email}</h3>
                  <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[8px] font-bold rounded uppercase tracking-wider">Pending</span>
                </div>
                <p className="text-xs text-gray-500">Role: {invite.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDeleteInvite(invite.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {members.length === 0 && invites.length === 0 && !loading && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No team members yet</h3>
            <p className="text-gray-500">Invite your first team member to get started.</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-black/60 border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
              
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Invite Member</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">Add to your organization</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Assign Role</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["Member", "Admin"].map((role) => (
                      <button
                        key={role}
                        onClick={() => setInviteRole(role)}
                        className={cn(
                          "p-4 rounded-2xl border text-sm font-bold transition-all text-left flex flex-col gap-1",
                          inviteRole === role 
                            ? "bg-blue-600/10 border-blue-500/50 text-blue-400" 
                            : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
                        )}
                      >
                        <span>{role}</span>
                        <span className="text-[10px] font-medium opacity-60">
                          {role === "Admin" ? "Full access to settings" : "Standard project access"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button 
                    onClick={() => setIsInviteModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendInvite}
                    disabled={!inviteEmail.trim()}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-600/20"
                  >
                    Send Invitation
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Team;
