import React from "react";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark font-sans selection:bg-brand-blue/30">
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
