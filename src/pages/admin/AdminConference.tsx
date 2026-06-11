import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  PhoneOff, 
  Users, 
  MessageSquare, 
  Settings,
  Hand,
  MoreHorizontal,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Send,
  X,
  Volume2,
  VolumeX,
  ShieldAlert,
  Crown,
  Share2
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, handleFirestoreError, OperationType, serverTimestamp, query, orderBy, limit, setDoc, getDocs, where } from "@/src/firebase";
import { useAuth } from "@/src/context/AuthContext";
import { io, Socket } from "socket.io-client";
import Peer from "peerjs";
import * as otplib from "otplib";
const authenticator = (otplib as any).authenticator;

interface Participant {
  id: string;
  uid: string;
  name: string;
  avatar: string;
  role: string;
  color: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isSharing: boolean;
  isHandRaised?: boolean;
  stream?: MediaStream;
}

export default function AdminConference() {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [selectedAudio, setSelectedAudio] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const peersRef = useRef<{ [key: string]: any }>({});

  const roomId = "boardroom-alpha"; // Can be dynamic
  const isAdmin = user?.role === "admin";

  // Initialize Meeting Session in Firestore
  useEffect(() => {
    const initMeetingSession = async () => {
      if (!user) return;

      try {
        // Try to find an active meeting for this room
        const q = query(
          collection(db, "meetings"),
          where("roomId", "==", roomId),
          where("status", "==", "active"),
          limit(1)
        );
        
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setMeetingId(snapshot.docs[0].id);
        } else if (isAdmin) {
          // Create a new meeting session if admin
          const docRef = await addDoc(collection(db, "meetings"), {
            roomId,
            hostId: user.uid,
            status: "active",
            startTime: serverTimestamp(),
          });
          setMeetingId(docRef.id);
        }
      } catch (err) {
        console.error("Error initializing meeting session:", err);
      }
    };

    initMeetingSession();
  }, [user, isAdmin, roomId]);

  // Listen for Firestore Messages
  useEffect(() => {
    if (meetingId) {
      const q = query(
        collection(db, "meeting_messages"),
        where("meetingId", "==", meetingId),
        orderBy("timestamp", "asc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          isMe: doc.data().uid === user?.uid
        }));
        setMessages(msgs);
        
        // Scroll to bottom
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }, (err) => handleFirestoreError(err, OperationType.LIST, "meeting_messages"));
      
      return () => unsubscribe();
    }
  }, [meetingId, user?.uid]);

  // Initialize Media and Devices
  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        localStreamRef.current = stream;
        cameraVideoTrackRef.current = stream.getVideoTracks()[0];
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        const devs = await navigator.mediaDevices.enumerateDevices();
        setDevices(devs);
        
        const videoDev = devs.find(d => d.kind === "videoinput");
        const audioDev = devs.find(d => d.kind === "audioinput");
        if (videoDev) setSelectedVideo(videoDev.deviceId);
        if (audioDev) setSelectedAudio(audioDev.deviceId);
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setConnectionStatus("error");
      }
    };

    initMedia();

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Initialize Socket and Peer
  useEffect(() => {
    if (!user || !localStreamRef.current) return;

    // Initialize Socket
    socketRef.current = io();
    
    // Initialize Peer
    const peer = new Peer(user.uid, {
      host: window.location.hostname,
      port: 3000,
      path: "/peerjs",
      secure: window.location.protocol === "https:"
    });
    peerRef.current = peer;

    peer.on("open", (id) => {
      console.log("Peer ID:", id);
      setConnectionStatus("connected");
      socketRef.current?.emit("join-room", roomId, user.uid, user.displayName, user.role);
    });

    peer.on("error", (err) => {
      console.error("PeerJS Error:", err);
      setConnectionStatus("error");
    });

    peer.on("call", (call) => {
      call.answer(localStreamRef.current!);
      call.on("stream", (remoteStream) => {
        addRemoteStream(call.peer, remoteStream);
      });
      peersRef.current[call.peer] = call;
    });

    socketRef.current.on("existing-participants", (existingParticipants: any[]) => {
      setParticipants(existingParticipants.map(p => ({
        id: p.userId,
        uid: p.userId,
        name: p.userName,
        avatar: p.userName[0],
        role: p.role,
        color: "bg-blue-600",
        isMuted: p.isMuted,
        isVideoOn: p.isVideoOn,
        isSharing: p.isSharing
      })));
    });

    socketRef.current.on("user-connected", (userId, userName, socketId, role) => {
      console.log("User connected:", userId);
      const call = peer.call(userId, localStreamRef.current!);
      call.on("stream", (remoteStream) => {
        addRemoteStream(userId, remoteStream, userName, role);
      });
      peersRef.current[userId] = call;
    });

    socketRef.current.on("user-disconnected", (userId) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
      }
      setParticipants(prev => prev.filter(p => p.uid !== userId));
    });

    socketRef.current.on("user-state-updated", (userId, state) => {
      setParticipants(prev => prev.map(p => 
        p.uid === userId ? { ...p, ...state } : p
      ));
    });

    socketRef.current.on("user-raised-hand", (userId) => {
      setParticipants(prev => prev.map(p => 
        p.uid === userId ? { ...p, isHandRaised: true } : p
      ));
      // Auto-lower hand after 5 seconds
      setTimeout(() => {
        setParticipants(prev => prev.map(p => 
          p.uid === userId ? { ...p, isHandRaised: false } : p
        ));
      }, 5000);
    });

    socketRef.current.on("receive-message", (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    socketRef.current.on("meeting-ended", () => {
      window.history.back();
    });

    socketRef.current.on("force-mute", () => {
      if (!isMuted) {
        toggleMute();
      }
    });

    return () => {
      socketRef.current?.disconnect();
      peer.destroy();
    };
  }, [user]);

  const addRemoteStream = (userId: string, stream: MediaStream, userName?: string, role?: string) => {
    setParticipants(prev => {
      const existing = prev.find(p => p.uid === userId);
      if (existing) {
        return prev.map(p => p.uid === userId ? { ...p, stream } : p);
      }
      return [...prev, {
        id: userId,
        uid: userId,
        name: userName || "Participant",
        avatar: (userName || "P")[0],
        role: role || "Participant",
        color: "bg-blue-600",
        isMuted: false,
        isVideoOn: true,
        isSharing: false,
        stream
      }];
    });
  };

  const updateMediaState = (state: Partial<{ isMuted: boolean, isVideoOn: boolean, isSharing: boolean }>) => {
    socketRef.current?.emit("update-media-state", {
      isMuted: state.isMuted ?? isMuted,
      isVideoOn: state.isVideoOn ?? isVideoOn,
      isSharing: state.isSharing ?? isSharing
    });
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
      updateMediaState({ isMuted: !audioTrack.enabled });
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
      updateMediaState({ isVideoOn: videoTrack.enabled });
    }
  };

  const toggleScreenShare = async () => {
    if (isSharing) {
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
      setIsSharing(false);
      updateMediaState({ isSharing: false });
      
      if (localStreamRef.current && cameraVideoTrackRef.current) {
        const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
        localStreamRef.current.removeTrack(currentVideoTrack);
        localStreamRef.current.addTrack(cameraVideoTrackRef.current);
        
        replaceTrack(cameraVideoTrackRef.current);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        const screenTrack = stream.getVideoTracks()[0];
        
        if (localStreamRef.current) {
          const currentVideoTrack = localStreamRef.current.getVideoTracks()[0];
          localStreamRef.current.removeTrack(currentVideoTrack);
          localStreamRef.current.addTrack(screenTrack);
          
          replaceTrack(screenTrack);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        }
        
        setIsSharing(true);
        updateMediaState({ isSharing: true });

        screenTrack.onended = () => toggleScreenShare();
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    }
  };

  const replaceTrack = (newTrack: MediaStreamTrack) => {
    Object.values(peersRef.current).forEach((call: any) => {
      const sender = call.peerConnection.getSenders().find((s: any) => s.track.kind === newTrack.kind);
      if (sender) {
        sender.replaceTrack(newTrack);
      }
    });
  };

  const raiseHand = () => {
    setIsHandRaised(true);
    socketRef.current?.emit("raise-hand", roomId, user?.uid);
    setTimeout(() => setIsHandRaised(false), 5000);
  };

  const applySettings = async () => {
    try {
      const constraints = {
        video: { deviceId: selectedVideo ? { exact: selectedVideo } : undefined },
        audio: { deviceId: selectedAudio ? { exact: selectedAudio } : undefined }
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Replace tracks in existing stream and peer connections
      const videoTrack = newStream.getVideoTracks()[0];
      const audioTrack = newStream.getAudioTracks()[0];
      
      if (localStreamRef.current) {
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        const oldAudioTrack = localStreamRef.current.getAudioTracks()[0];
        
        localStreamRef.current.removeTrack(oldVideoTrack);
        localStreamRef.current.addTrack(videoTrack);
        localStreamRef.current.removeTrack(oldAudioTrack);
        localStreamRef.current.addTrack(audioTrack);
        
        oldVideoTrack.stop();
        oldAudioTrack.stop();
      }
      
      replaceTrack(videoTrack);
      replaceTrack(audioTrack);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      
      setShowSettings(false);
    } catch (err) {
      console.error("Error applying settings:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !meetingId) return;

    const msgData = {
      meetingId,
      roomId,
      uid: user.uid,
      name: user.displayName || "Anonymous",
      text: newMessage,
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "meeting_messages"), msgData);
      setNewMessage("");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "meeting_messages");
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const endMeeting = async () => {
    if (meetingId && isAdmin) {
      try {
        await updateDoc(doc(db, "meetings", meetingId), {
          status: "ended",
          endTime: serverTimestamp()
        });
      } catch (err) {
        console.error("Error ending meeting in Firestore:", err);
      }
    }
    socketRef.current?.emit("end-meeting", roomId);
  };

  const muteAll = () => {
    socketRef.current?.emit("mute-all", roomId);
  };

  return (
    <div 
      ref={containerRef}
      className="h-[calc(100vh-160px)] flex flex-col bg-white border border-black/5 rounded-3xl overflow-hidden relative"
    >
      {/* Conference Header */}
      <header className="h-16 border-b border-black/5 px-6 flex items-center justify-between bg-white/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live</span>
          </div>
          <h2 className="font-bold text-sm text-[#1a1a1a] uppercase tracking-widest flex items-center gap-2">
            <Crown className="w-4 h-4 text-brand-yellow" />
            Virtual Boardroom
          </h2>
          <div className="w-px h-4 bg-black/10 mx-2" />
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users className="w-3 h-3" />
            <span>{participants.length + 1} Online</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowParticipants(!showParticipants)}
            className={cn("p-2 hover:bg-brand-blue/5 rounded-lg transition-all", showParticipants ? "text-brand-blue bg-brand-blue/10" : "text-gray-500")}
          >
            <Users className="w-4 h-4" />
          </button>
          <button 
            onClick={toggleFullScreen}
            className="p-2 hover:bg-black/5 rounded-lg text-gray-500 transition-all"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Conference Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#f1f4f8]">
          <div className={cn(
            "grid gap-4 h-full",
            participants.length === 0 ? "grid-cols-1" :
            participants.length === 1 ? "grid-cols-2" :
            participants.length <= 3 ? "grid-cols-2" : "grid-cols-3"
          )}>
            {/* Local Video */}
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-black/5 group shadow-lg">
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className={cn("w-full h-full object-cover", isSharing && "object-contain bg-black")}
              />
              {!isVideoOn && !isSharing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="w-24 h-24 rounded-full bg-brand-blue flex items-center justify-center text-3xl font-bold text-white">
                    {user?.displayName?.[0] || "U"}
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <span className="text-xs font-bold text-white">Me (Host)</span>
                {isMuted && <MicOff className="w-3 h-3 text-red-500" />}
              </div>
              {isSharing && (
                <div className="absolute top-4 right-4 bg-brand-blue px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-white">
                  <Monitor className="w-3 h-3" />
                  Sharing Screen
                </div>
              )}
            </div>

            {/* Remote Videos */}
            {participants.map((p) => (
              <RemoteVideo key={p.id} participant={p} />
            ))}
          </div>
        </main>

        {/* Side Panels */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 border-l border-black/5 bg-white flex flex-col z-30 shadow-2xl"
            >
              <div className="p-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500">Boardroom Chat</h3>
                <button onClick={() => setShowChat(false)} className="p-1 hover:bg-black/5 rounded-lg text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex flex-col", msg.uid === user?.uid ? "items-end" : "items-start")}>
                    <span className="text-[10px] text-gray-500 mb-1">{msg.name}</span>
                    <div className={cn(
                      "px-3 py-2 rounded-2xl text-sm max-w-[90%]",
                      msg.uid === user?.uid ? "bg-brand-blue text-white rounded-tr-none shadow-md shadow-brand-blue/10" : "bg-gray-50 text-gray-700 rounded-tl-none border border-black/5"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-black/5">
                <div className="relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-gray-50 border border-black/10 rounded-xl pl-4 pr-10 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-brand-blue hover:text-brand-blue/80">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {showParticipants && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 border-l border-black/5 bg-white flex flex-col z-30 shadow-2xl"
            >
              <div className="p-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500">Participants</h3>
                <div className="flex items-center gap-2">
                  {user?.role === "admin" && (
                    <button 
                      onClick={muteAll}
                      className="p-1 hover:bg-red-500/10 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-tighter border border-red-500/20"
                    >
                      Mute All
                    </button>
                  )}
                  <button onClick={() => setShowParticipants(false)} className="p-1 hover:bg-black/5 rounded-lg text-gray-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="flex items-center justify-between p-2 rounded-xl bg-brand-blue/5 border border-brand-blue/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-xs font-bold text-white">Me</div>
                    <span className="text-xs font-bold text-[#1a1a1a]">{user?.displayName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isHandRaised && <Hand className="w-3 h-3 text-brand-yellow animate-bounce" />}
                    <Crown className="w-3 h-3 text-brand-yellow" />
                  </div>
                </div>
                {participants.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-xs font-bold text-brand-blue">{p.avatar}</div>
                      <div className="flex flex-col">
                        <span className="text-xs text-[#1a1a1a] font-medium">{p.name}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{p.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.isHandRaised && <Hand className="w-3 h-3 text-brand-yellow animate-bounce" />}
                      {p.isMuted ? <MicOff className="w-3 h-3 text-red-500" /> : <Mic className="w-3 h-3 text-emerald-500" />}
                      {!p.isVideoOn ? <VideoOff className="w-3 h-3 text-red-500" /> : <Video className="w-3 h-3 text-emerald-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {showSettings && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
            >
              <div className="w-full max-w-md bg-white border border-black/5 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-3 text-[#1a1a1a]">
                    <Settings className="w-6 h-6 text-brand-blue" />
                    Device Settings
                  </h3>
                  <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-black/5 rounded-xl text-gray-500">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Camera</label>
                    <select 
                      value={selectedVideo}
                      onChange={(e) => setSelectedVideo(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue"
                    >
                      {devices.filter(d => d.kind === "videoinput").map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Microphone</label>
                    <select 
                      value={selectedAudio}
                      onChange={(e) => setSelectedAudio(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-brand-blue"
                    >
                      {devices.filter(d => d.kind === "audioinput").map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 5)}`}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={applySettings}
                  className="w-full mt-10 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand-blue/20"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Conference Controls */}
      <footer className="h-24 border-t border-black/5 px-8 flex items-center justify-between bg-white/80 backdrop-blur-xl z-40">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1a1a1a]">Boardroom Alpha</span>
            <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Secure Connection
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleMute}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
              isMuted ? "bg-red-500 text-white" : "bg-white text-gray-500 border border-black/10 hover:bg-brand-blue/5 hover:text-brand-blue"
            )}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button 
            onClick={toggleVideo}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
              !isVideoOn ? "bg-red-500 text-white" : "bg-white text-gray-500 border border-black/10 hover:bg-brand-blue/5 hover:text-brand-blue"
            )}
          >
            {!isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
          <button 
            onClick={toggleScreenShare}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
              isSharing ? "bg-brand-blue text-white shadow-brand-blue/20" : "bg-white text-gray-500 border border-black/10 hover:bg-brand-blue/5 hover:text-brand-blue"
            )}
          >
            <Monitor className="w-5 h-5" />
          </button>
          <button 
            onClick={raiseHand}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
              isHandRaised ? "bg-brand-yellow text-white shadow-brand-yellow/20" : "bg-white text-gray-500 border border-black/10 hover:bg-brand-blue/5 hover:text-brand-blue"
            )}
          >
            <Hand className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 bg-white text-gray-500 border border-black/10 hover:bg-brand-blue/5 hover:text-brand-blue rounded-2xl flex items-center justify-center transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
          <div className="w-px h-8 bg-black/10 mx-2" />
          <button 
            onClick={() => window.history.back()}
            className="px-6 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
          >
            <PhoneOff className="w-5 h-5" />
            Leave
          </button>
          {user?.role === "admin" && (
            <button 
              onClick={endMeeting}
              className="px-6 h-12 rounded-2xl border border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold transition-all"
            >
              End Meeting
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowChat(!showChat)}
            className={cn(
              "p-3 rounded-xl transition-all relative",
              showChat ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "hover:bg-brand-blue/5 text-gray-500 hover:text-brand-blue"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            {!showChat && messages.length > 0 && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-brand-blue rounded-full" />
            )}
          </button>
          <button className="p-3 hover:bg-brand-blue/5 rounded-xl text-gray-500 hover:text-brand-blue transition-all">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}

function RemoteVideo({ participant }: { participant: Participant }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-black/5 group shadow-lg">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />
      {!participant.isVideoOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className={cn("w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white", participant.color)}>
            {participant.avatar}
          </div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        <span className="text-xs font-bold text-white">{participant.name}</span>
        {participant.isHandRaised && <Hand className="w-3 h-3 text-brand-yellow animate-bounce" />}
        {participant.isMuted && <MicOff className="w-3 h-3 text-red-500" />}
      </div>
    </div>
  );
}
