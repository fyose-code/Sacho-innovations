import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, 
  Plus, 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  MoreVertical, 
  Copy, 
  Trash2, 
  ChevronRight, 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  Settings,
  MessageSquare,
  Mic,
  Video as VideoIcon,
  Monitor,
  Shield,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, handleFirestoreError, OperationType } from "@/src/firebase";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: any;
  duration: number;
  hostId: string;
  hostName: string;
  participants: string[];
  status: "scheduled" | "active" | "completed";
  type: "team" | "client";
}

const Meetings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "team" | "client">("all");

  // Create Meeting Form State
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    duration: 60,
    type: "team" as "team" | "client"
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "meetings"), (snapshot) => {
      const meetingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Meeting[];
      setMeetings(meetingsData.sort((a, b) => b.startTime?.seconds - a.startTime?.seconds));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "meetings"));

    return () => unsubscribe();
  }, []);

  const handleCreateMeeting = async () => {
    if (!user) return;
    try {
      const meetingData = {
        ...newMeeting,
        startTime: new Date(newMeeting.startTime),
        hostId: user.uid,
        hostName: user.displayName || "User",
        participants: [user.uid],
        status: "scheduled",
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, "meetings"), meetingData);
      setShowCreateModal(false);
      setNewMeeting({
        title: "",
        description: "",
        startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        duration: 60,
        type: "team"
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "meetings");
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this meeting?")) {
      try {
        await deleteDoc(doc(db, "meetings", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `meetings/${id}`);
      }
    }
  };

  const startMeeting = (id: string) => {
    navigate(`/conference/${id}`);
  };

  const filteredMeetings = meetings.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || m.type === filter;
    return matchesSearch && matchesFilter;
  });

  const upcomingMeetings = filteredMeetings.filter(m => m.status === "scheduled");
  const pastMeetings = filteredMeetings.filter(m => m.status === "completed" || m.status === "active");

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-gray-500 mt-2">Create, schedule, and manage your video conferences.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            New Meeting
          </button>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "New Meeting", icon: Video, color: "bg-blue-600", onClick: () => setShowCreateModal(true) },
          { label: "Join Meeting", icon: Plus, color: "bg-emerald-600", onClick: () => {} },
          { label: "Schedule", icon: CalendarIcon, color: "bg-purple-600", onClick: () => setShowCreateModal(true) },
          { label: "Share Screen", icon: Monitor, color: "bg-orange-600", onClick: () => {} },
        ].map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px] flex flex-col items-center gap-4 hover:border-white/20 transition-all group"
          >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform", action.color)}>
              <action.icon className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-black/40 backdrop-blur-xl border border-white/5 p-6 rounded-[32px]">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
          {(["all", "team", "client"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                filter === f ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-12">
        {/* Upcoming */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 ml-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-lg font-bold uppercase tracking-widest text-gray-500">Upcoming Meetings</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {upcomingMeetings.map((meeting) => (
                <motion.div
                  key={meeting.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[40px] group hover:border-blue-500/30 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-bl-[100px] -translate-y-10 translate-x-10 group-hover:translate-y-0 group-hover:translate-x-0 transition-transform duration-700"></div>
                  
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl",
                        meeting.type === "team" ? "bg-blue-600/10 text-blue-400" : "bg-emerald-600/10 text-emerald-400"
                      )}>
                        {meeting.type === "team" ? <Users className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors">{meeting.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {meeting.duration} min</span>
                          <span className="w-1 h-1 rounded-full bg-gray-700" />
                          <span className="flex items-center gap-1 capitalize">{meeting.type} Meeting</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-8 line-clamp-2 leading-relaxed relative z-10">{meeting.description}</p>

                  <div className="flex items-center justify-between pt-8 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-[#1a1a1a] bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400">
                          +2
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 font-bold">{meeting.participants.length} Participants</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="p-4 hover:bg-red-500/10 rounded-2xl text-red-400 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => startMeeting(meeting.id)}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                      >
                        Start <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {upcomingMeetings.length === 0 && !loading && (
            <div className="p-20 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[40px] text-center space-y-6">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-500 mx-auto">
                <Video className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">No upcoming meetings</h3>
                <p className="text-gray-500">Schedule a new meeting to get started.</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition-all"
              >
                Schedule Meeting
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600" />
              
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600/10 rounded-xl text-blue-400">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Schedule Meeting</h2>
                    <p className="text-gray-500 text-sm">Fill in the details for your new session.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Meeting Title</label>
                    <input
                      type="text"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                      placeholder="e.g. Weekly Strategy Sync"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Meeting Type</label>
                    <select
                      value={newMeeting.type}
                      onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none"
                    >
                      <option value="team">Team Meeting</option>
                      <option value="client">Client Meeting</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Description</label>
                  <textarea
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                    placeholder="What is this meeting about?"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Start Time</label>
                    <input
                      type="datetime-local"
                      value={newMeeting.startTime}
                      onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={newMeeting.duration}
                      onChange={(e) => setNewMeeting({ ...newMeeting, duration: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-4">
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateMeeting}
                    disabled={!newMeeting.title}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-600/20"
                  >
                    Create Meeting
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

export default Meetings;
