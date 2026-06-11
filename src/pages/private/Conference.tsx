import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Maximize,
  Minimize,
  Hand,
  MoreVertical,
  Send,
  X,
  Shield,
  Clock,
  Globe,
  AlertCircle,
  RefreshCw,
  PhoneOff
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDoc, handleFirestoreError, OperationType } from "@/src/firebase";
import Peer from "peerjs";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";

const Conference: React.FC = () => {
  const { id: meetingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [meetingData, setMeetingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const callsRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    if (!meetingId) return;

    const unsub = onSnapshot(doc(db, "meetings", meetingId), (doc) => {
      if (doc.exists()) {
        setMeetingData({ id: doc.id, ...doc.data() });
        setLoading(false);
      } else {
        setError("Meeting not found.");
        setLoading(false);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `meetings/${meetingId}`));

    return () => unsub();
  }, [meetingId]);

  useEffect(() => {
    if (meetingId && joined) {
      const q = query(
        collection(db, "meeting_messages"),
        where("meetingId", "==", meetingId),
        orderBy("timestamp", "asc")
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
      }, (error) => handleFirestoreError(error, OperationType.LIST, "meeting_messages"));

      return () => unsub();
    }
  }, [meetingId, joined]);

  const startMeeting = async () => {
    if (!meetingId || !user) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize PeerJS
      const peer = new Peer();
      peerRef.current = peer;

      peer.on("open", async (peerId) => {
        console.log("My peer ID is: " + peerId);
        setJoined(true);

        // Update meeting status if host
        if (meetingData?.hostId === user.uid) {
          await updateDoc(doc(db, "meetings", meetingId), { status: "active" });
        }

        // Add self to participants in Firestore (simplified for demo)
        const participantsRef = collection(db, "meetings", meetingId, "participants");
        await addDoc(participantsRef, {
          userId: user.uid,
          peerId,
          name: user.displayName || "User",
          joinedAt: serverTimestamp()
        });

        // Listen for other participants
        onSnapshot(participantsRef, (snapshot) => {
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.peerId !== peerId && !callsRef.current[data.peerId]) {
              const call = peer.call(data.peerId, stream);
              handleCall(call);
            }
          });
        });
      });

      peer.on("call", (call) => {
        call.answer(stream);
        handleCall(call);
      });

    } catch (err) {
      console.error("Failed to get local stream", err);
      setError("Please allow camera and microphone access to join the meeting.");
    }
  };

  const handleCall = (call: any) => {
    callsRef.current[call.peer] = call;
    call.on("stream", (remoteStream: MediaStream) => {
      addRemoteStream(remoteStream, call.peer);
    });
    call.on("close", () => {
      removeRemoteStream(call.peer);
    });
  };

  const addRemoteStream = (remoteStream: MediaStream, peerId: string) => {
    if (!remoteVideosRef.current) return;
    
    let videoContainer = document.getElementById(`container-${peerId}`);
    if (!videoContainer) {
      videoContainer = document.createElement("div");
      videoContainer.id = `container-${peerId}`;
      videoContainer.className = "relative aspect-video bg-white/5 rounded-3xl overflow-hidden border border-white/10";
      
      const video = document.createElement("video");
      video.id = peerId;
      video.autoplay = true;
      video.playsInline = true;
      video.className = "w-full h-full object-cover";
      
      videoContainer.appendChild(video);
      remoteVideosRef.current.appendChild(videoContainer);
    }
    
    const video = document.getElementById(peerId) as HTMLVideoElement;
    if (video) video.srcObject = remoteStream;
  };

  const removeRemoteStream = (peerId: string) => {
    const container = document.getElementById(`container-${peerId}`);
    if (container) container.remove();
    delete callsRef.current[peerId];
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !meetingId || !user) return;

    try {
      await addDoc(collection(db, "meeting_messages"), {
        meetingId,
        senderId: user.uid,
        senderName: user.displayName || "User",
        text: message,
        timestamp: serverTimestamp()
      });
      setMessage("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "meeting_messages");
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => track.enabled = isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);
        
        // Replace video track in all active calls
        const videoTrack = screenStream.getVideoTracks()[0];
        Object.values(callsRef.current).forEach(call => {
          const sender = call.peerConnection.getSenders().find((s: any) => s.track.kind === "video");
          if (sender) sender.replaceTrack(videoTrack);
        });

        videoTrack.onended = () => stopScreenShare();
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    
    // Restore camera track
    if (streamRef.current) {
      const cameraTrack = streamRef.current.getVideoTracks()[0];
      Object.values(callsRef.current).forEach(call => {
        const sender = call.peerConnection.getSenders().find((s: any) => s.track.kind === "video");
        if (sender) sender.replaceTrack(cameraTrack);
      });
    }
  };

  const leaveMeeting = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (meetingData?.hostId === user?.uid) {
      await updateDoc(doc(db, "meetings", meetingId!), { status: "completed" });
    }
    navigate("/meetings");
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !meetingData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4">{error || "Meeting Unavailable"}</h2>
        <button 
          onClick={() => navigate("/meetings")}
          className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all"
        >
          Back to Meetings
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[40px] overflow-hidden relative">
      {/* Top Bar */}
      <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">{meetingData.title}</h2>
            <div className="flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full", joined ? "bg-emerald-500 animate-pulse" : "bg-gray-500")} />
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", joined ? "text-emerald-400" : "text-gray-500")}>
                {joined ? "Live" : "Waiting"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {format(new Date(meetingData.startTime.seconds * 1000), "HH:mm")}
            </span>
          </div>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Grid */}
        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar">
          {/* Local Participant */}
          <div className="relative aspect-video bg-white/5 rounded-3xl overflow-hidden border border-white/10 group">
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className={cn("w-full h-full object-cover", isVideoOff && "hidden")} 
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-400">{user?.displayName?.[0]}</span>
                </div>
                <p className="text-sm font-bold text-white">{user?.displayName} (You)</p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
              <span className="text-[10px] font-bold text-white truncate max-w-[120px]">{user?.displayName} (You)</span>
              {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
            </div>
          </div>

          {/* Remote Participants Container */}
          <div ref={remoteVideosRef} className="contents"></div>
        </div>

        {/* Side Panels */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-96 border-l border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold">Meeting Chat</h3>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex flex-col", msg.senderId === user?.uid ? "items-end" : "items-start")}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{msg.senderName}</span>
                    </div>
                    <div className={cn(
                      "max-w-[85%] p-3 rounded-2xl text-sm",
                      msg.senderId === user?.uid ? "bg-blue-600 text-white rounded-tr-none" : "bg-white/5 text-gray-300 border border-white/10 rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-white/5">
                <div className="relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500/50"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="h-24 border-t border-white/5 px-8 flex items-center justify-between bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMute}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              isMuted ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
            )}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button 
            onClick={toggleVideo}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              isVideoOff ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
            )}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              isHandRaised ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
            )}
          >
            <Hand className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleScreenShare}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              isScreenSharing ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
            )}
          >
            <Monitor className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              isChatOpen ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
            )}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              isParticipantsOpen ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5"
            )}
          >
            <Users className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-12 h-12 rounded-2xl bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-all">
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={leaveMeeting}
            className="px-6 h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Join Overlay */}
      <AnimatePresence>
        {!joined && meetingData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full bg-black/60 border border-white/10 rounded-[40px] p-10 text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-600/20">
                <Video className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to join?</h2>
              <p className="text-gray-500 mb-10">Boardroom: {meetingData.title}</p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={startMeeting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20"
                >
                  Join Meeting
                </button>
                <button 
                  onClick={() => navigate("/meetings")}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
                >
                  Not Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Conference;
