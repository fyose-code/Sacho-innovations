import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Files as FilesIcon,
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  Download,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  ChevronRight,
  Folder,
  ArrowUpRight,
  Trash2,
  Share2,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "@/src/context/AuthContext";
import { db, collection, onSnapshot, query, where, handleFirestoreError, OperationType } from "@/src/firebase";

const Files: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "projectFiles"),
      where("clientId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const filesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFiles(filesData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "projectFiles"));

    return () => unsub();
  }, [user]);

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.projectName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || f.type === filterType;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
      case "DOCX":
      case "CSV":
        return <FileText className="w-6 h-6" />;
      case "ZIP":
        return <Archive className="w-6 h-6" />;
      case "MP4":
        return <Video className="w-6 h-6" />;
      case "FIGMA":
        return <ImageIcon className="w-6 h-6" />;
      default:
        return <FilesIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files</h1>
          <p className="text-gray-500 mt-2">Manage and access all project-related assets and documents.</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Upload File
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:row justify-between items-center gap-6 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "grid" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-500 hover:text-white"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "list" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-500 hover:text-white"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {["All", "PDF", "ZIP", "FIGMA", "MP4"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                filterType === type
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-gray-500 border border-white/5 hover:border-white/10 hover:text-white"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Files Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-black/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 hover:border-blue-500/30 transition-all duration-500 flex flex-col"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform duration-500">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-blue-400 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-8 flex-1">
                <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors truncate mb-1">{file.name}</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{file.projectName}</p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Size</p>
                  <p className="text-xs font-bold text-white">{file.size}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Date</p>
                  <p className="text-xs font-bold text-white">{file.uploadedAt?.toDate ? file.uploadedAt.toDate().toLocaleDateString() : file.uploadedAt}</p>
                </div>
              </div>
            </motion.div>
          ))}
          <button className="p-8 border-2 border-dashed border-white/5 hover:border-blue-500/30 rounded-[32px] flex flex-col items-center justify-center gap-4 group transition-all">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-500 group-hover:text-blue-400 group-hover:scale-110 transition-all">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-sm font-bold text-gray-500 group-hover:text-white">Upload New Asset</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="px-6 py-3 grid grid-cols-12 gap-4 text-[10px] uppercase tracking-widest font-bold text-gray-500">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Project</div>
            <div className="col-span-1">Size</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group grid grid-cols-12 gap-4 items-center"
            >
              <div className="col-span-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0">
                  {getFileIcon(file.type)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold truncate group-hover:text-blue-400 transition-colors">{file.name}</h3>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{file.type}</span>
                </div>
              </div>

              <div className="col-span-2">
                <p className="text-xs font-bold text-gray-400 truncate">{file.projectName}</p>
              </div>

              <div className="col-span-1">
                <p className="text-xs font-bold text-gray-400">{file.size}</p>
              </div>

              <div className="col-span-2">
                <p className="text-xs font-bold text-gray-400">{file.uploadedAt?.toDate ? file.uploadedAt.toDate().toLocaleDateString() : file.uploadedAt}</p>
              </div>

              <div className="col-span-1 flex items-center justify-end gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-blue-400 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredFiles.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <FilesIcon className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">No files found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Files;
