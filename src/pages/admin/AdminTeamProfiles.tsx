import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  X, 
  Image as ImageIcon,
  Linkedin,
  Twitter,
  Github,
  Mail,
  LayoutGrid,
  List,
  ChevronUp,
  ChevronDown,
  Save,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, handleFirestoreError, OperationType, serverTimestamp, query, orderBy } from "@/src/firebase";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  departmentId: string;
  image: string;
  bio: string;
  quote?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
  order: number;
}

interface Department {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  layoutType: 'grid' | 'timeline';
  description?: string;
}

export default function AdminTeamProfiles() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const unsubDepts = onSnapshot(query(collection(db, "departments"), orderBy("order", "asc")), (snapshot) => {
      setDepartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "departments"));

    const unsubMembers = onSnapshot(query(collection(db, "team_members"), orderBy("order", "asc")), (snapshot) => {
      setTeamMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "team_members"));

    return () => {
      unsubDepts();
      unsubMembers();
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDept = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const deptData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      layoutType: formData.get("layoutType") as 'grid' | 'timeline',
      isActive: formData.get("isActive") === "on",
      order: editingDept ? editingDept.order : departments.length,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingDept) {
        await updateDoc(doc(db, "departments", editingDept.id), deptData);
        setSuccess("Department updated successfully!");
      } else {
        await addDoc(collection(db, "departments"), { ...deptData, createdAt: serverTimestamp() });
        setSuccess("Department added successfully!");
      }
      setIsAddingDept(false);
      setEditingDept(null);
    } catch (err) {
      setError("Failed to save department.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleSaveMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const memberData = {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      departmentId: formData.get("departmentId") as string,
      bio: formData.get("bio") as string,
      quote: formData.get("quote") as string,
      image: (e.currentTarget.querySelector('input[name="image_base64"]') as HTMLInputElement)?.value || editingMember?.image || "",
      socialLinks: {
        linkedin: formData.get("linkedin") as string,
        twitter: formData.get("twitter") as string,
        github: formData.get("github") as string,
        email: formData.get("email") as string,
      },
      order: editingMember ? editingMember.order : teamMembers.length,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingMember) {
        await updateDoc(doc(db, "team_members", editingMember.id), memberData);
        setSuccess("Team member updated successfully!");
      } else {
        await addDoc(collection(db, "team_members"), { ...memberData, createdAt: serverTimestamp() });
        setSuccess("Team member added successfully!");
      }
      setIsAddingMember(false);
      setEditingMember(null);
    } catch (err) {
      setError("Failed to save team member.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${collectionName === 'departments' ? 'department' : 'member'}?`)) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        setSuccess("Deleted successfully!");
      } catch (err) {
        setError("Failed to delete.");
      } finally {
        setTimeout(() => setSuccess(""), 3000);
      }
    }
  };

  const reorder = async (collectionName: string, items: any[], index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const item1 = items[index];
    const item2 = items[newIndex];

    try {
      await updateDoc(doc(db, collectionName, item1.id), { order: item2.order });
      await updateDoc(doc(db, collectionName, item2.id), { order: item1.order });
    } catch (err) {
      setError("Failed to reorder.");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark tracking-tight">Public Team Management</h1>
          <p className="text-brand-secondary mt-1">Manage the "Meet the Team" section on your public website.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAddingDept(true)}
            className="px-6 py-2.5 bg-brand-blue-soft text-brand-primary rounded-xl font-bold text-sm hover:bg-brand-primary hover:text-white transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
          <button 
            onClick={() => setIsAddingMember(true)}
            className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20"
          >
            <Users className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" /> {success}
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> {error}
        </motion.div>
      )}

      {/* Departments Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-brand-primary" /> Departments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => (
            <div key={dept.id} className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-brand-dark">{dept.name}</h3>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                    dept.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    {dept.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => reorder('departments', departments, index, 'up')} className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-secondary"><ChevronUp className="w-4 h-4" /></button>
                  <button onClick={() => reorder('departments', departments, index, 'down')} className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-secondary"><ChevronDown className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-sm text-brand-secondary line-clamp-2 mb-6">{dept.description || "No description provided."}</p>
              <div className="flex items-center justify-between pt-4 border-t border-brand-border">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-widest">
                  {dept.layoutType === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  {dept.layoutType}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingDept(dept); setIsAddingDept(true); }} className="p-2 hover:bg-brand-blue-soft rounded-lg text-brand-primary"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete('departments', dept.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Members Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-primary" /> Team Members
        </h2>
        <div className="bg-white border border-brand-border rounded-[32px] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg/50 border-bottom border-brand-border">
                <th className="px-6 py-4 text-xs font-bold text-brand-secondary uppercase tracking-widest">Member</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-secondary uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-secondary uppercase tracking-widest">Socials</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-secondary uppercase tracking-widest">Order</th>
                <th className="px-6 py-4 text-xs font-bold text-brand-secondary uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {teamMembers.map((member, index) => (
                <tr key={member.id} className="hover:bg-brand-bg/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-brand-blue-soft border border-brand-border">
                        <img src={member.image || `https://picsum.photos/seed/${member.name}/100/100`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-brand-dark">{member.name}</div>
                        <div className="text-xs text-brand-primary font-medium">{member.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-brand-bg border border-brand-border rounded-lg text-xs font-bold text-brand-dark">
                      {departments.find(d => d.id === member.departmentId)?.name || "Unassigned"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {member.socialLinks?.linkedin && <Linkedin className="w-4 h-4 text-brand-secondary" />}
                      {member.socialLinks?.twitter && <Twitter className="w-4 h-4 text-brand-secondary" />}
                      {member.socialLinks?.github && <Github className="w-4 h-4 text-brand-secondary" />}
                      {member.socialLinks?.email && <Mail className="w-4 h-4 text-brand-secondary" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => reorder('team_members', teamMembers, index, 'up')} className="p-1 hover:bg-brand-bg rounded text-brand-secondary"><ChevronUp className="w-4 h-4" /></button>
                      <button onClick={() => reorder('team_members', teamMembers, index, 'down')} className="p-1 hover:bg-brand-bg rounded text-brand-secondary"><ChevronDown className="w-4 h-4" /></button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingMember(member); setIsAddingMember(true); }} className="p-2 hover:bg-brand-blue-soft rounded-xl text-brand-primary transition-all"><Edit3 className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete('team_members', member.id)} className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {teamMembers.length === 0 && (
            <div className="p-12 text-center text-brand-secondary">
              No team members found. Start by adding one!
            </div>
          )}
        </div>
      </div>

      {/* Dept Modal */}
      <AnimatePresence>
        {isAddingDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddingDept(false); setEditingDept(null); }} className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[40px] p-10 shadow-2xl">
              <h2 className="text-2xl font-bold text-brand-dark mb-8">{editingDept ? "Edit Department" : "New Department"}</h2>
              <form onSubmit={handleSaveDept} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest ml-1">Department Name</label>
                  <input name="name" defaultValue={editingDept?.name} required className="w-full bg-brand-bg border border-brand-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-primary transition-all" placeholder="e.g., Leadership" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest ml-1">Description</label>
                  <textarea name="description" defaultValue={editingDept?.description} className="w-full bg-brand-bg border border-brand-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-primary transition-all h-32" placeholder="Briefly describe this department's role..." />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest ml-1">Layout Type</label>
                    <select name="layoutType" defaultValue={editingDept?.layoutType || 'grid'} className="w-full bg-brand-bg border border-brand-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-primary transition-all appearance-none">
                      <option value="grid">Grid View</option>
                      <option value="timeline">Timeline View</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-8">
                    <input type="checkbox" name="isActive" defaultChecked={editingDept ? editingDept.isActive : true} className="w-5 h-5 rounded border-brand-border text-brand-primary focus:ring-brand-primary" />
                    <label className="text-sm font-bold text-brand-dark">Active</label>
                  </div>
                </div>
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => { setIsAddingDept(false); setEditingDept(null); }} className="flex-1 py-4 bg-brand-bg text-brand-secondary rounded-2xl font-bold text-sm hover:bg-brand-border transition-all">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2">
                    {isSubmitting ? "Saving..." : <><Save className="w-4 h-4" /> Save Department</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Modal */}
      <AnimatePresence>
        {isAddingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddingMember(false); setEditingMember(null); }} className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-[48px] p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-3xl font-bold text-brand-dark mb-10">{editingMember ? "Edit Team Member" : "New Team Member"}</h2>
              <form onSubmit={handleSaveMember} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest ml-1">Profile Image</label>
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-32 rounded-[32px] bg-brand-bg border-2 border-dashed border-brand-border flex items-center justify-center overflow-hidden relative group">
                        {(editingMember?.image || "") ? (
                          <img src={editingMember?.image} id="img-preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-brand-secondary" />
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e, (base64) => {
                            const preview = document.getElementById('img-preview') as HTMLImageElement;
                            if (preview) preview.src = base64;
                            const hiddenInput = document.getElementById('image_base64') as HTMLInputElement;
                            if (hiddenInput) hiddenInput.value = base64;
                          })}
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                        <input type="hidden" name="image_base64" id="image_base64" defaultValue={editingMember?.image} />
                      </div>
                      <div className="text-xs text-brand-secondary">
                        <p className="font-bold text-brand-dark mb-1">Click to upload</p>
                        <p>JPG, PNG or WEBP. Max 1MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest ml-1">Full Name</label>
                    <input name="name" defaultValue={editingMember?.name} required className="w-full bg-brand-bg border border-brand-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-primary transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest ml-1">Role / Title</label>
                    <input name="role" defaultValue={editingMember?.role} required className="w-full bg-brand-bg border border-brand-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-primary transition-all" placeholder="e.g., Founder & CEO" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest ml-1">Department</label>
                    <select name="departmentId" defaultValue={editingMember?.departmentId} required className="w-full bg-brand-bg border border-brand-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-primary transition-all appearance-none">
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest ml-1">Bio / Story</label>
                    <textarea name="bio" defaultValue={editingMember?.bio} required className="w-full bg-brand-bg border border-brand-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-primary transition-all h-32" placeholder="Tell their story..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest ml-1">Personal Quote (Optional)</label>
                    <input name="quote" defaultValue={editingMember?.quote} className="w-full bg-brand-bg border border-brand-border rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-primary transition-all" placeholder="An inspiring quote..." />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest ml-1">Social Links</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary" />
                        <input name="linkedin" defaultValue={editingMember?.socialLinks?.linkedin} className="w-full bg-brand-bg border border-brand-border rounded-xl pl-12 pr-4 py-3 text-xs focus:outline-none focus:border-brand-primary transition-all" placeholder="LinkedIn URL" />
                      </div>
                      <div className="relative">
                        <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary" />
                        <input name="twitter" defaultValue={editingMember?.socialLinks?.twitter} className="w-full bg-brand-bg border border-brand-border rounded-xl pl-12 pr-4 py-3 text-xs focus:outline-none focus:border-brand-primary transition-all" placeholder="Twitter URL" />
                      </div>
                      <div className="relative">
                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary" />
                        <input name="github" defaultValue={editingMember?.socialLinks?.github} className="w-full bg-brand-bg border border-brand-border rounded-xl pl-12 pr-4 py-3 text-xs focus:outline-none focus:border-brand-primary transition-all" placeholder="GitHub URL" />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary" />
                        <input name="email" defaultValue={editingMember?.socialLinks?.email} className="w-full bg-brand-bg border border-brand-border rounded-xl pl-12 pr-4 py-3 text-xs focus:outline-none focus:border-brand-primary transition-all" placeholder="Email Address" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => { setIsAddingMember(false); setEditingMember(null); }} className="flex-1 py-4 bg-brand-bg text-brand-secondary rounded-2xl font-bold text-sm hover:bg-brand-border transition-all">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20">
                      {isSubmitting ? "Saving..." : <><Save className="w-4 h-4" /> Save Member</>}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
