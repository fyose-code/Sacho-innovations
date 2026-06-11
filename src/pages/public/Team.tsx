import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Linkedin, 
  Twitter, 
  Github, 
  Mail, 
  ChevronRight, 
  Quote,
  ArrowRight,
  Users,
  Heart,
  Lightbulb,
  Target
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { db, collection, onSnapshot, query, orderBy, where, handleFirestoreError, OperationType } from "@/src/firebase";

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

const TeamPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    // Fetch Departments
    const qDepts = query(collection(db, "departments"), where("isActive", "==", true), orderBy("order", "asc"));
    const unsubDepts = onSnapshot(qDepts, (snapshot) => {
      const depts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
      setDepartments(depts);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "departments"));

    // Fetch Team Members
    const qMembers = query(collection(db, "team_members"), orderBy("order", "asc"));
    const unsubMembers = onSnapshot(qMembers, (snapshot) => {
      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
      setTeamMembers(members);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "team_members"));

    return () => {
      unsubDepts();
      unsubMembers();
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-brand-secondary font-medium animate-pulse">Loading the dream team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [0, 50, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-primary/5 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -45, 0],
              x: [0, -30, 0],
              y: [0, 40, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-brand-accent/5 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-brand-blue-soft text-brand-primary text-xs font-bold uppercase tracking-widest rounded-full mb-6">
              Our People
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-brand-dark mb-6 tracking-tight">
              Meet the Team Behind <br />
              <span className="animate-gradient-text bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary bg-[length:200%_auto]">
                Sacho Innovations
              </span>
            </h1>
            <p className="text-xl text-brand-secondary max-w-2xl mx-auto leading-relaxed">
              We are a collective of dreamers, builders, and innovators dedicated to shaping the future of technology through human-centered design.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-12 flex justify-center gap-8"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-primary mb-2">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-brand-secondary uppercase tracking-tighter">Passion</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-accent mb-2">
                <Lightbulb className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-brand-secondary uppercase tracking-tighter">Innovation</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-brand-primary mb-2">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-brand-secondary uppercase tracking-tighter">Purpose</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Sections */}
      <div className="max-w-7xl mx-auto px-6 pb-32 space-y-32">
        {departments.map((dept, deptIndex) => {
          const deptMembers = teamMembers.filter(m => m.departmentId === dept.id);
          if (deptMembers.length === 0) return null;

          return (
            <section key={dept.id} className="relative">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2">{dept.name}</h2>
                  <p className="text-brand-secondary max-w-xl">{dept.description || `The brilliant minds driving our ${dept.name.toLowerCase()} efforts.`}</p>
                </motion.div>
                <div className="h-px flex-1 bg-brand-border mx-8 hidden md:block mb-4 opacity-50" />
                <div className="text-brand-primary font-bold text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {deptMembers.length} Members
                </div>
              </div>

              {dept.layoutType === 'grid' ? (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                  {deptMembers.map((member) => (
                    <motion.div
                      key={member.id}
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      className="group relative bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-brand-border"
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="aspect-[4/5] overflow-hidden relative">
                        <img 
                          src={member.image || `https://picsum.photos/seed/${member.name}/400/500`} 
                          alt={member.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Social Links Overlay */}
                        <div className="absolute bottom-6 left-6 right-6 flex justify-center gap-4 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                          {member.socialLinks?.linkedin && (
                            <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-brand-primary transition-colors">
                              <Linkedin className="w-5 h-5" />
                            </a>
                          )}
                          {member.socialLinks?.twitter && (
                            <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-brand-primary transition-colors">
                              <Twitter className="w-5 h-5" />
                            </a>
                          )}
                          {member.socialLinks?.email && (
                            <a href={`mailto:${member.socialLinks.email}`} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-brand-primary transition-colors">
                              <Mail className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="text-xl font-bold text-brand-dark mb-1 group-hover:text-brand-primary transition-colors">{member.name}</h3>
                        <p className="text-brand-secondary text-sm font-medium mb-4">{member.role}</p>
                        <button className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-widest group-hover:gap-4 transition-all">
                          View Story <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="space-y-12">
                  {deptMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className={cn(
                        "flex flex-col md:flex-row items-center gap-12 p-8 rounded-[40px] bg-white border border-brand-border shadow-sm hover:shadow-xl transition-all duration-500",
                        index % 2 !== 0 && "md:flex-row-reverse"
                      )}
                    >
                      <div className="w-full md:w-1/3 aspect-square rounded-[32px] overflow-hidden shadow-lg">
                        <img 
                          src={member.image || `https://picsum.photos/seed/${member.name}/600/600`} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 space-y-6">
                        <div>
                          <h3 className="text-3xl font-bold text-brand-dark mb-2">{member.name}</h3>
                          <p className="text-brand-primary font-bold tracking-wide uppercase text-sm">{member.role}</p>
                        </div>
                        <p className="text-brand-secondary leading-relaxed text-lg italic">
                          "{member.bio}"
                        </p>
                        {member.quote && (
                          <div className="flex gap-4 p-6 bg-brand-blue-soft rounded-2xl border border-brand-primary/10">
                            <Quote className="w-8 h-8 text-brand-primary opacity-20 shrink-0" />
                            <p className="text-brand-dark font-medium italic">{member.quote}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-6 pt-4">
                          <div className="flex gap-4">
                            {member.socialLinks?.linkedin && (
                              <a href={member.socialLinks.linkedin} className="text-brand-secondary hover:text-brand-primary transition-colors">
                                <Linkedin className="w-6 h-6" />
                              </a>
                            )}
                            {member.socialLinks?.twitter && (
                              <a href={member.socialLinks.twitter} className="text-brand-secondary hover:text-brand-primary transition-colors">
                                <Twitter className="w-6 h-6" />
                              </a>
                            )}
                          </div>
                          <button 
                            onClick={() => setSelectedMember(member)}
                            className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20"
                          >
                            Full Profile <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-brand-dark/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-4xl bg-white rounded-[48px] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-primary hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-full md:w-2/5 h-64 md:h-auto relative">
                <img 
                  src={selectedMember.image || `https://picsum.photos/seed/${selectedMember.name}/800/1000`} 
                  alt={selectedMember.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent md:hidden" />
              </div>

              <div className="flex-1 p-12 md:p-16 space-y-8 overflow-y-auto max-h-[80vh] md:max-h-none">
                <div>
                  <h2 className="text-4xl font-bold text-brand-dark mb-2">{selectedMember.name}</h2>
                  <p className="text-brand-primary font-bold text-lg">{selectedMember.role}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-brand-secondary uppercase tracking-widest">About</h4>
                  <p className="text-brand-secondary text-lg leading-relaxed">
                    {selectedMember.bio}
                  </p>
                </div>

                {selectedMember.quote && (
                  <div className="p-8 bg-brand-yellow-soft rounded-3xl border border-brand-accent/20 relative">
                    <Quote className="absolute -top-4 -left-4 w-12 h-12 text-brand-accent opacity-20" />
                    <p className="text-brand-dark font-medium text-xl italic leading-relaxed">
                      {selectedMember.quote}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4">
                  <h4 className="text-xs font-bold text-brand-secondary uppercase tracking-widest">Connect</h4>
                  <div className="flex gap-4">
                    {selectedMember.socialLinks?.linkedin && (
                      <a href={selectedMember.socialLinks.linkedin} className="w-12 h-12 bg-brand-blue-soft text-brand-primary rounded-2xl flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all">
                        <Linkedin className="w-6 h-6" />
                      </a>
                    )}
                    {selectedMember.socialLinks?.twitter && (
                      <a href={selectedMember.socialLinks.twitter} className="w-12 h-12 bg-brand-blue-soft text-brand-primary rounded-2xl flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all">
                        <Twitter className="w-6 h-6" />
                      </a>
                    )}
                    {selectedMember.socialLinks?.github && (
                      <a href={selectedMember.socialLinks.github} className="w-12 h-12 bg-brand-blue-soft text-brand-primary rounded-2xl flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all">
                        <Github className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const X: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

export default TeamPage;
