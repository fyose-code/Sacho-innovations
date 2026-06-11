import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  Lock,
  Shield,
  CreditCard,
  Globe,
  Zap,
  LogOut,
  ChevronRight,
  Camera,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  Monitor,
  Plus,
  MoreVertical,
  X,
  Copy,
  RefreshCw,
  Trash2,
  CreditCard as CardIcon
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, doc, onSnapshot, updateDoc, handleFirestoreError, OperationType, setDoc } from "@/src/firebase";
import * as otplib from "otplib";
const authenticator = (otplib as any).authenticator;
import { QRCodeSVG } from "qrcode.react";

interface UserSettings {
  notifications: {
    projectUpdates: boolean;
    taskAssignments: boolean;
    messages: boolean;
    billing: boolean;
    security: boolean;
  };
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  billing: {
    plan: string;
    paymentMethods: any[];
  };
}

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security" | "billing">("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    try {
      // In a real app, we'd use Firebase updatePassword
      // For this demo, we'll simulate it and update settings
      await updateSettings({
        security: {
          lastPasswordChange: new Date().toISOString()
        }
      } as any);
      setNewPassword("");
      setCurrentPassword("");
      alert("Password updated successfully!");
    } catch (error) {
      alert("Failed to update password. Please try again.");
    }
  };

  const handlePlanSelect = async (plan: string) => {
    try {
      await updateSettings({
        billing: {
          ...settings?.billing,
          plan
        }
      } as any);
      alert(`Plan updated to ${plan}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `settings/${user?.uid}`);
    }
  };
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 2FA State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempSecret, setTempSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, "settings", user.uid), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as UserSettings);
      } else {
        // Initialize default settings
        const defaultSettings: UserSettings = {
          notifications: {
            projectUpdates: true,
            taskAssignments: true,
            messages: true,
            billing: false,
            security: true,
          },
          twoFactorEnabled: false,
          billing: {
            plan: "Enterprise Pro",
            paymentMethods: [
              { id: "1", type: "Visa", last4: "4242", expiry: "12/28", isDefault: true },
              { id: "2", type: "Mastercard", last4: "8888", expiry: "05/27", isDefault: false },
            ],
          },
        };
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, `settings/${user?.uid}`));

    return () => unsubscribe();
  }, [user]);

  const updateSettings = async (updates: any) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "settings", user.uid), updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `settings/${user.uid}`);
    }
  };

  const handleToggleNotification = (key: string) => {
    if (!settings) return;
    const newNotifications = { 
      ...settings.notifications, 
      [key]: !settings.notifications[key as keyof UserSettings["notifications"]] 
    };
    updateSettings({ notifications: newNotifications } as any);
  };

  const setup2FA = () => {
    const secret = authenticator.generateSecret();
    setTempSecret(secret);
    setShow2FAModal(true);
    setError("");
  };

  const verifyAndEnable2FA = async () => {
    setIsVerifying(true);
    setError("");
    try {
      const isValid = authenticator.check(verificationCode, tempSecret);
      if (isValid) {
        await updateSettings({
          twoFactorEnabled: true,
          twoFactorSecret: tempSecret
        });
        setShow2FAModal(false);
        setVerificationCode("");
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  const disable2FA = async () => {
    if (window.confirm("Are you sure you want to disable Two-Factor Authentication?")) {
      await updateSettings({
        twoFactorEnabled: false,
        twoFactorSecret: undefined
      });
    }
  };

  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    phoneNumber: "",
    location: ""
  });

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        displayName: user.displayName || ""
      }));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      await updateSettings({
        profile: profileData
      } as any);
      // Also update user profile if possible (though AuthContext handles this usually)
      alert("Profile updated successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `settings/${user.uid}`);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account preferences and security settings.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-80 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full p-4 rounded-2xl flex items-center gap-4 transition-all group relative overflow-hidden",
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-black/40 backdrop-blur-xl border border-white/5 text-gray-500 hover:border-blue-500/30 hover:text-white"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-white" : "text-gray-500 group-hover:text-blue-400")} />
              <span className="text-sm font-bold uppercase tracking-widest">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 -z-10"
                />
              )}
            </button>
          ))}
          <div className="pt-10">
            <button 
              onClick={logout}
              className="w-full p-4 rounded-2xl flex items-center gap-4 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all group"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 md:p-12 min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-2xl shadow-blue-600/20">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white transition-all shadow-lg shadow-blue-600/20 group-hover:scale-110">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold mb-2">{user?.displayName || "User"}</h2>
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-4">{user?.email}</p>
                    <div className="flex items-center gap-4 justify-center md:justify-start">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/20">Client Admin</span>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">Verified</span>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Full Name</label>
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Email Address</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ""}
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm opacity-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      placeholder="New York, USA"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                  <button className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all">Cancel</button>
                  <button 
                    onClick={handleSaveProfile}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="space-y-8">
                  <h3 className="text-xl font-bold">Notification Preferences</h3>
                  {[
                    { key: "projectUpdates", title: "Project Updates", desc: "Get notified when a milestone is completed or a status changes." },
                    { key: "taskAssignments", title: "Task Assignments", desc: "Receive alerts when you are assigned to a new task." },
                    { key: "messages", title: "Messages & Comments", desc: "Get notified when someone sends you a message or replies to your comment." },
                    { key: "billing", title: "Billing & Invoices", desc: "Receive alerts for new invoices and payment reminders." },
                    { key: "security", title: "Security Alerts", desc: "Get notified about login attempts and security updates." },
                  ].map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-blue-500/30 transition-all">
                      <div className="max-w-[70%]">
                        <h4 className="text-sm font-bold mb-1 group-hover:text-blue-400 transition-colors">{pref.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{pref.desc}</p>
                      </div>
                      <button 
                        onClick={() => handleToggleNotification(pref.key as any)}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all",
                          settings?.notifications[pref.key as keyof UserSettings["notifications"]] ? "bg-blue-600" : "bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          settings?.notifications[pref.key as keyof UserSettings["notifications"]] ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="space-y-8">
                  <h3 className="text-xl font-bold">Security Settings</h3>
                  
                  {/* Password Change */}
                  <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600/10 rounded-xl text-blue-400">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-bold">Change Password</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleUpdatePassword}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
                    >
                      Update Password
                    </button>
                  </div>

                  {/* Two-Factor Auth */}
                  <div className={cn(
                    "p-8 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-between group transition-all",
                    settings?.twoFactorEnabled ? "border-emerald-500/30" : "hover:border-blue-500/30"
                  )}>
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "p-3 rounded-xl",
                        settings?.twoFactorEnabled ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-600/10 text-blue-400"
                      )}>
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold group-hover:text-blue-400 transition-colors">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">
                          {settings?.twoFactorEnabled 
                            ? "Your account is protected with 2FA." 
                            : "Add an extra layer of security to your account."}
                        </p>
                      </div>
                    </div>
                    {settings?.twoFactorEnabled ? (
                      <button 
                        onClick={disable2FA}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Disable 2FA
                      </button>
                    ) : (
                      <button 
                        onClick={setup2FA}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Enable 2FA
                      </button>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 ml-1">Active Sessions</h4>
                    {[
                      { device: "MacBook Pro", browser: "Chrome", location: "New York, USA", time: "Active Now", icon: Laptop, current: true },
                      { device: "iPhone 15 Pro", browser: "Safari", location: "New York, USA", time: "2 hours ago", icon: Smartphone, current: false },
                    ].map((session) => (
                      <div key={session.device} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/5 rounded-xl text-gray-400 group-hover:text-blue-400 transition-colors">
                            <session.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-sm font-bold">{session.device} • {session.browser}</h5>
                              {session.current && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-bold rounded uppercase">Current</span>}
                            </div>
                            <p className="text-xs text-gray-500">{session.location} • {session.time}</p>
                          </div>
                        </div>
                        {!session.current && (
                          <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-all">
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "billing" && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="space-y-8">
                  <h3 className="text-xl font-bold">Billing Information</h3>
                  
                  {/* Current Plan */}
                  <div className="p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/10 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                      <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-2">Current Plan</p>
                      <h4 className="text-3xl font-bold mb-2">{settings?.billing.plan}</h4>
                      <p className="text-sm text-gray-400">Your plan includes unlimited projects and priority support.</p>
                    </div>
                    <button className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-2xl text-sm font-bold transition-all shadow-xl">Upgrade Plan</button>
                  </div>

                  {/* Plan Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {["Starter", "Professional", "Enterprise"].map((plan) => (
                      <button
                        key={plan}
                        onClick={() => handlePlanSelect(plan)}
                        className={cn(
                          "p-6 bg-white/5 border rounded-2xl text-left transition-all group",
                          settings?.billing.plan === plan ? "border-blue-500/50 bg-blue-600/5" : "border-white/5 hover:border-white/10"
                        )}
                      >
                        <h4 className="text-lg font-bold mb-2">{plan}</h4>
                        <p className="text-2xl font-bold mb-4">
                          {plan === "Starter" ? "$0" : plan === "Professional" ? "$49" : "$199"}
                          <span className="text-xs text-gray-500 font-normal">/mo</span>
                        </p>
                        {settings?.billing.plan === plan ? (
                          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Current Plan</span>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-white">Select Plan</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500">Payment Methods</h4>
                      <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Method
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {settings?.billing.paymentMethods.map((card) => (
                        <div key={card.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl relative group hover:border-blue-500/30 transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <CardIcon className="w-8 h-8 text-blue-400" />
                            {card.isDefault && (
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold rounded uppercase tracking-wider">Default</span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-white mb-1">•••• •••• •••• {card.last4}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Expires {card.expiry}</p>
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShow2FAModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-purple-600" />
              
              <button 
                onClick={() => setShow2FAModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center space-y-8">
                <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-400 mx-auto">
                  <Shield className="w-10 h-10" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-2">Enable 2FA</h2>
                  <p className="text-gray-500 text-sm">Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                </div>

                <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl">
                  <QRCodeSVG 
                    value={authenticator.keyuri(user?.email || "user", "Sacho Innovations", tempSecret)}
                    size={200}
                    level="H"
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Or enter this code manually</p>
                  <div className="flex items-center justify-center gap-4">
                    <code className="bg-white/5 px-4 py-2 rounded-xl text-blue-400 font-mono text-lg tracking-widest">
                      {tempSecret}
                    </code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(tempSecret)}
                      className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Verification Code</label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="000000"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  {error && <p className="text-red-400 text-xs font-bold flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>}
                  <button 
                    onClick={verifyAndEnable2FA}
                    disabled={isVerifying || verificationCode.length !== 6}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
                  >
                    {isVerifying ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Verify and Enable"}
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

export default Settings;
