import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Layout, 
  Briefcase, 
  Settings,
  X,
  AlertCircle,
  CheckCircle2,
  Package,
  MessageSquare,
  Globe,
  Reply
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, doc, getDoc, setDoc, collection, onSnapshot, addDoc, deleteDoc, updateDoc, handleFirestoreError, OperationType } from "@/src/firebase";

const tabs = [
  { id: "about", name: "About Content", icon: Layout },
  { id: "settings", name: "Site Settings", icon: Globe },
  { id: "services", name: "Services", icon: Settings },
  { id: "products", name: "Products", icon: Package },
  { id: "portfolio", name: "Case Studies", icon: Briefcase },
  { id: "messages", name: "Messages", icon: MessageSquare },
];

export default function AdminCMS() {
  const [activeTab, setActiveTab] = useState("about");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // About Content State
  const [aboutContent, setAboutContent] = useState({
    title: "",
    description: "",
    mission: "",
    vision: ""
  });

  // Site Settings State
  const [siteSettings, setSiteSettings] = useState({
    projectsDelivered: "",
    clientSatisfaction: "",
    linesOfCode: "",
    globalReach: ""
  });

  // Contact Messages State
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  // Services State
  const [services, setServices] = useState<any[]>([]);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Case Studies State
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [isAddingCaseStudy, setIsAddingCaseStudy] = useState(false);
  const [editingCaseStudy, setEditingCaseStudy] = useState<any>(null);

  useEffect(() => {
    // Fetch About Content
    const unsubscribeAbout = onSnapshot(doc(db, "content", "about"), (doc) => {
      if (doc.exists()) {
        setAboutContent(doc.data() as any);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, "content/about"));

    // Fetch Site Settings
    const unsubscribeSettings = onSnapshot(doc(db, "content", "settings"), (doc) => {
      if (doc.exists()) {
        setSiteSettings(doc.data() as any);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, "content/settings"));

    // Fetch Contact Messages
    const unsubscribeMessages = onSnapshot(collection(db, "contactMessages"), (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContactMessages(messagesData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (error) => handleFirestoreError(error, OperationType.LIST, "contactMessages"));

    // Fetch Services
    const unsubscribeServices = onSnapshot(collection(db, "services"), (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "services"));

    // Fetch Products
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "products"));

    // Fetch Case Studies
    const unsubscribeCaseStudies = onSnapshot(collection(db, "caseStudies"), (snapshot) => {
      const caseStudiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCaseStudies(caseStudiesData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "caseStudies"));

    return () => {
      unsubscribeAbout();
      unsubscribeSettings();
      unsubscribeMessages();
      unsubscribeServices();
      unsubscribeProducts();
      unsubscribeCaseStudies();
    };
  }, []);

  const handleSaveAbout = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await setDoc(doc(db, "content", "about"), aboutContent);
      setMessage({ type: 'success', text: 'About content saved successfully!' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "content/about");
      setMessage({ type: 'error', text: 'Failed to save about content.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await setDoc(doc(db, "content", "settings"), siteSettings);
      setMessage({ type: 'success', text: 'Site settings saved successfully!' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "content/settings");
      setMessage({ type: 'error', text: 'Failed to save site settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReplyMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo || !replyText.trim()) return;

    setIsSaving(true);
    try {
      await updateDoc(doc(db, "contactMessages", replyingTo.id), {
        reply: replyText,
        status: "replied"
      });
      setReplyingTo(null);
      setReplyText("");
      setMessage({ type: 'success', text: 'Reply sent successfully!' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `contactMessages/${replyingTo.id}`);
      setMessage({ type: 'error', text: 'Failed to send reply.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteDoc(doc(db, "contactMessages", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `contactMessages/${id}`);
      }
    }
  };

  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serviceData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      icon: formData.get("icon") as string,
      category: formData.get("category") as string,
      imageUrl: formData.get("imageUrl") as string,
      benefits: formData.get("benefits") as string,
      features: (formData.get("features") as string).split('\n').filter(f => f.trim() !== ''),
    };

    try {
      if (editingService) {
        await updateDoc(doc(db, "services", editingService.id), serviceData);
      } else {
        await addDoc(collection(db, "services"), serviceData);
      }
      setIsAddingService(false);
      setEditingService(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "services");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteDoc(doc(db, "services", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
      }
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      title: formData.get("title") as string,
      tagline: formData.get("tagline") as string,
      description: formData.get("description") as string,
      icon: formData.get("icon") as string,
      imageUrl: formData.get("imageUrl") as string,
      features: (formData.get("features") as string).split('\n').filter(f => f.trim() !== ''),
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
      } else {
        await addDoc(collection(db, "products"), productData);
      }
      setIsAddingProduct(false);
      setEditingProduct(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "products");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  const handleAddCaseStudy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const caseStudyData = {
      title: formData.get("title") as string,
      client: formData.get("client") as string,
      industry: formData.get("industry") as string,
      description: formData.get("description") as string,
      challenge: formData.get("challenge") as string,
      outcome: formData.get("outcome") as string,
      category: formData.get("category") as string,
      imageUrl: formData.get("imageUrl") as string || "https://picsum.photos/seed/project/800/600",
    };

    try {
      if (editingCaseStudy) {
        await updateDoc(doc(db, "caseStudies", editingCaseStudy.id), caseStudyData);
      } else {
        await addDoc(collection(db, "caseStudies"), caseStudyData);
      }
      setIsAddingCaseStudy(false);
      setEditingCaseStudy(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "caseStudies");
    }
  };

  const handleDeleteCaseStudy = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this case study?")) {
      try {
        await deleteDoc(doc(db, "caseStudies", id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `caseStudies/${id}`);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">CMS & Content</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your website's public content and portfolio.</p>
        </div>
        {(activeTab === "about" || activeTab === "settings") && (
          <button
            onClick={activeTab === "about" ? handleSaveAbout : handleSaveSettings}
            disabled={isSaving}
            className="bg-brand-blue hover:bg-brand-blue/90 disabled:bg-brand-blue/70 text-white px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-brand-blue/20"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSaving ? "Saving..." : `Save ${activeTab === "about" ? "About Content" : "Site Settings"}`}
          </button>
        )}
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-xl flex items-center gap-3 text-sm",
            message.type === 'success' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600" : "bg-red-500/10 border border-red-500/20 text-red-600"
          )}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white rounded-2xl w-fit border border-black/5 overflow-x-auto shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
                : "text-gray-500 hover:text-brand-blue hover:bg-brand-blue/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === "about" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-black/5 rounded-3xl p-8 space-y-6 shadow-sm"
          >
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-500">Hero Title</label>
              <input
                type="text"
                value={aboutContent.title}
                onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-500">About Description</label>
              <textarea
                rows={6}
                value={aboutContent.description}
                onChange={(e) => setAboutContent({ ...aboutContent, description: e.target.value })}
                className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors resize-none text-[#1a1a1a]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-500">Our Vision</label>
                <textarea
                  rows={4}
                  value={aboutContent.vision}
                  onChange={(e) => setAboutContent({ ...aboutContent, vision: e.target.value })}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors resize-none text-[#1a1a1a]"
                  placeholder="Enter vision statement..."
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-500">Our Mission</label>
                <textarea
                  rows={4}
                  value={aboutContent.mission}
                  onChange={(e) => setAboutContent({ ...aboutContent, mission: e.target.value })}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors resize-none text-[#1a1a1a]"
                  placeholder="Enter mission statement..."
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "services" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-end">
              <button 
                onClick={() => setIsAddingService(true)}
                className="flex items-center gap-2 bg-white hover:bg-brand-blue/5 border border-black/5 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm text-gray-500 hover:text-brand-blue"
              >
                <Plus className="w-4 h-4" /> Add New Service
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white border border-black/5 rounded-2xl p-6 flex items-start justify-between group shadow-sm hover:shadow-md transition-all">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-2xl">
                      {service.icon || "⚙️"}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#1a1a1a]">{service.title}</h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{service.description}</p>
                      <span className="text-[10px] text-brand-blue font-bold uppercase tracking-widest mt-2 block">{service.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingService(service); setIsAddingService(true); }}
                      className="p-2 hover:bg-brand-blue/5 rounded-lg transition-colors text-gray-500 hover:text-brand-blue"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "products" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-end">
              <button 
                onClick={() => setIsAddingProduct(true)}
                className="flex items-center gap-2 bg-white hover:bg-brand-blue/5 border border-black/5 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm text-gray-500 hover:text-brand-blue"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white border border-black/5 rounded-2xl p-6 flex items-start justify-between group shadow-sm hover:shadow-md transition-all">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center text-2xl">
                      {product.icon || "📦"}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#1a1a1a]">{product.title}</h3>
                      <p className="text-brand-blue text-[10px] font-bold uppercase tracking-widest">{product.tagline}</p>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingProduct(product); setIsAddingProduct(true); }}
                      className="p-2 hover:bg-brand-blue/5 rounded-lg transition-colors text-gray-500 hover:text-brand-blue"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-black/5 rounded-3xl p-8 space-y-6 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-500">Projects Delivered</label>
                <input
                  type="text"
                  value={siteSettings.projectsDelivered}
                  onChange={(e) => setSiteSettings({ ...siteSettings, projectsDelivered: e.target.value })}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                  placeholder="e.g. 250+"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-500">Client Satisfaction</label>
                <input
                  type="text"
                  value={siteSettings.clientSatisfaction}
                  onChange={(e) => setSiteSettings({ ...siteSettings, clientSatisfaction: e.target.value })}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                  placeholder="e.g. 99%"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-500">Lines of Code</label>
                <input
                  type="text"
                  value={siteSettings.linesOfCode}
                  onChange={(e) => setSiteSettings({ ...siteSettings, linesOfCode: e.target.value })}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                  placeholder="e.g. 5M+"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-500">Global Reach</label>
                <input
                  type="text"
                  value={siteSettings.globalReach}
                  onChange={(e) => setSiteSettings({ ...siteSettings, globalReach: e.target.value })}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors text-[#1a1a1a]"
                  placeholder="e.g. 15+"
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "messages" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4">
              {contactMessages.length === 0 ? (
                <div className="text-center py-20 bg-white border border-black/5 rounded-3xl">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No messages found.</p>
                </div>
              ) : (
                contactMessages.map((msg) => (
                  <div key={msg.id} className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue font-bold">
                          {msg.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#1a1a1a]">{msg.name}</h3>
                          <p className="text-xs text-gray-500">{msg.email} • {new Date(msg.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          msg.status === "new" ? "bg-brand-blue/10 text-brand-blue" : "bg-emerald-500/10 text-emerald-600"
                        )}>
                          {msg.status}
                        </span>
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Subject: {msg.subject || "No Subject"}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{msg.message}</p>
                    </div>
                    {msg.reply && (
                      <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <Reply className="w-3 h-3" /> Your Reply
                        </p>
                        <p className="text-gray-600 text-sm italic">"{msg.reply}"</p>
                      </div>
                    )}
                    {!msg.reply && (
                      <button 
                        onClick={() => setReplyingTo(msg)}
                        className="mt-2 flex items-center gap-2 text-xs font-bold text-brand-blue hover:text-brand-blue/80 transition-colors"
                      >
                        <Reply className="w-4 h-4" /> Reply to Message
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
        {activeTab === "portfolio" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-end">
              <button 
                onClick={() => setIsAddingCaseStudy(true)}
                className="flex items-center gap-2 bg-white hover:bg-brand-blue/5 border border-black/5 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm text-gray-500 hover:text-brand-blue"
              >
                <Plus className="w-4 h-4" /> Add New Case Study
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {caseStudies.map((item) => (
                <div key={item.id} className="bg-white border border-black/5 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-video bg-gray-100 relative">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setEditingCaseStudy(item); setIsAddingCaseStudy(true); }}
                          className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-all"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCaseStudy(item.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] text-brand-blue font-bold uppercase tracking-wider mb-1">{item.category}</div>
                    <h4 className="font-bold text-[#1a1a1a]">{item.title}</h4>
                    <p className="text-gray-500 text-[10px] font-medium uppercase tracking-widest mt-1">{item.client}</p>
                    <p className="text-gray-500 text-xs mt-2 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Service Modal */}
      <AnimatePresence>
        {isAddingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddingService(false); setEditingService(null); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-white border border-black/5 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold mb-6 text-[#1a1a1a]">{editingService ? "Edit Service" : "Add New Service"}</h2>
              <form onSubmit={handleAddService} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Service Title</label>
                    <input name="title" defaultValue={editingService?.title} required className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
                    <input name="category" defaultValue={editingService?.category} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
                  <textarea name="description" defaultValue={editingService?.description} required rows={2} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue resize-none text-[#1a1a1a]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Benefits</label>
                  <textarea name="benefits" defaultValue={editingService?.benefits} required rows={2} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue resize-none text-[#1a1a1a]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Features (One per line)</label>
                  <textarea name="features" defaultValue={editingService?.features?.join('\n')} required rows={4} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue resize-none text-[#1a1a1a]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Icon (Lucide Name)</label>
                    <input name="icon" defaultValue={editingService?.icon || "Settings"} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Image URL</label>
                    <input name="imageUrl" defaultValue={editingService?.imageUrl} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]" />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button type="button" onClick={() => { setIsAddingService(false); setEditingService(null); }} className="px-6 py-2 text-gray-500 hover:text-brand-blue font-medium">Cancel</button>
                  <button type="submit" className="bg-brand-blue hover:bg-brand-blue/90 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-brand-blue/20">{editingService ? "Update Service" : "Create Service"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {isAddingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-white border border-black/5 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold mb-6 text-[#1a1a1a]">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Product Title</label>
                    <input name="title" defaultValue={editingProduct?.title} required className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Tagline</label>
                    <input name="tagline" defaultValue={editingProduct?.tagline} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
                  <textarea name="description" defaultValue={editingProduct?.description} required rows={3} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue resize-none text-[#1a1a1a]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Features (One per line)</label>
                  <textarea name="features" defaultValue={editingProduct?.features?.join('\n')} required rows={4} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue resize-none text-[#1a1a1a]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Icon (Lucide Name)</label>
                    <input name="icon" defaultValue={editingProduct?.icon || "Sparkles"} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Image URL</label>
                    <input name="imageUrl" defaultValue={editingProduct?.imageUrl} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]" />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button type="button" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="px-6 py-2 text-gray-500 hover:text-brand-blue font-medium">Cancel</button>
                  <button type="submit" className="bg-brand-blue hover:bg-brand-blue/90 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-brand-blue/20">{editingProduct ? "Update Product" : "Create Product"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Case Study Modal */}
      <AnimatePresence>
        {isAddingCaseStudy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddingCaseStudy(false); setEditingCaseStudy(null); }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-white border border-black/5 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold mb-6 text-[#1a1a1a]">{editingCaseStudy ? "Edit Case Study" : "Add New Case Study"}</h2>
              <form onSubmit={handleAddCaseStudy} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Project Title</label>
                  <input name="title" defaultValue={editingCaseStudy?.title} required className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Client Name</label>
                  <input name="client" defaultValue={editingCaseStudy?.client} required className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Industry</label>
                  <input name="industry" defaultValue={editingCaseStudy?.industry} required className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
                  <select name="category" defaultValue={editingCaseStudy?.category} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]">
                    <option>Mobile Apps</option>
                    <option>ERP Systems</option>
                    <option>Automation</option>
                    <option>Security</option>
                    <option>Infrastructure</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
                  <textarea name="description" defaultValue={editingCaseStudy?.description} required rows={2} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue resize-none text-[#1a1a1a]" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">The Challenge</label>
                  <textarea name="challenge" defaultValue={editingCaseStudy?.challenge} required rows={2} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue resize-none text-[#1a1a1a]" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">The Outcome</label>
                  <textarea name="outcome" defaultValue={editingCaseStudy?.outcome} required rows={2} className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue resize-none text-[#1a1a1a]" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Image URL</label>
                  <input name="imageUrl" defaultValue={editingCaseStudy?.imageUrl} placeholder="https://..." className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue text-[#1a1a1a]" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button type="button" onClick={() => { setIsAddingCaseStudy(false); setEditingCaseStudy(null); }} className="px-6 py-2 text-gray-500 hover:text-brand-blue font-medium">Cancel</button>
                  <button type="submit" className="bg-brand-blue hover:bg-brand-blue/90 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-brand-blue/20">{editingCaseStudy ? "Update Case Study" : "Publish Case Study"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reply Modal */}
      <AnimatePresence>
        {replyingTo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReplyingTo(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-white border border-black/5 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1a1a1a]">Reply to {replyingTo.name}</h2>
                <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-black/5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Original Message:</p>
                <p className="text-gray-600 text-sm italic">"{replyingTo.message}"</p>
              </div>
              <form onSubmit={handleReplyMessage} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Your Reply</label>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required 
                    rows={6} 
                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue resize-none text-[#1a1a1a]" 
                    placeholder="Type your reply here..."
                  />
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button type="button" onClick={() => setReplyingTo(null)} className="px-6 py-2 text-gray-500 hover:text-brand-blue font-medium">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-brand-blue hover:bg-brand-blue/90 disabled:bg-brand-blue/70 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-brand-blue/20 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Reply className="w-4 h-4" />
                    )}
                    {isSaving ? "Sending..." : "Send Reply"}
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
