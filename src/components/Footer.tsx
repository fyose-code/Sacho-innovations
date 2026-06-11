import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Facebook, 
  Twitter, 
  Github,
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-dark pt-24 pb-12 border-t border-brand-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-lg tracking-tighter leading-none uppercase">
                  SACHO
                </span>
                <span className="text-[9px] text-brand-blue font-black tracking-[0.3em] uppercase mt-0.5">Innovations</span>
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed text-sm font-medium">
              Sacho Innovations is a technology company building transformative 
              digital solutions and smart systems for businesses, institutions, 
              and communities.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { name: "Home", href: "/" },
                { name: "About", href: "/about" },
                { name: "Services", href: "/services" },
                { name: "Products", href: "/products" },
                { name: "Portfolio", href: "/portfolio" },
                { name: "Team", href: "/team" },
                { name: "Process", href: "/process" },
                { name: "Contact", href: "/contact" },
                { name: "Request Access", href: "/request-access" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-gray-400 hover:text-brand-blue transition-colors flex items-center gap-2 group text-sm font-medium">
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Services</h4>
            <ul className="space-y-4">
              {[
                "Mobile App Development",
                "Desktop Software",
                "ERP Systems",
                "Security Systems",
                "Industrial Automation",
                "Infrastructure Management"
              ].map((item) => (
                <li key={item}>
                  <Link to="/services" className="text-gray-400 hover:text-brand-blue transition-colors flex items-center gap-2 group text-sm font-medium">
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Contact Us</h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-blue shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Email</div>
                  <div className="text-white font-bold text-sm">support@sachoinnovations.com</div>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-blue shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Phone</div>
                  <div className="text-white font-bold text-sm">+260 967 233 897</div>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-blue shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Address</div>
                  <div className="text-white font-bold text-sm">Lusaka, Zambia</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-gray-500 text-xs font-medium">
            © {new Date().getFullYear()} Sacho Innovations. All rights reserved.
          </div>
          <div className="flex items-center gap-8 text-xs font-medium text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
