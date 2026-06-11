import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle2, AlertCircle, LogIn, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState<"google" | "email">("google");
  const navigate = useNavigate();
  const { login, loginWithEmail, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin" || user.role === "manager") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await login();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side: Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block"
        >
          <h1 className="text-5xl font-bold tracking-tight mb-8 leading-tight">
            Access your <span className="text-blue-400">innovation</span> workspace.
          </h1>
          <p className="text-gray-400 text-lg mb-12 leading-relaxed">
            Log in to track your project progress, collaborate with our team, and manage your digital assets in one secure ecosystem.
          </p>

          <div className="space-y-6">
            {[
              "Real-time milestone tracking",
              "Secure file management & versioning",
              "Direct communication with engineers",
              "Digital approval & sign-off system",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-gray-300 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 border-4 border-black">
              <Shield className="w-8 h-8 text-white" />
            </div>

            <div className="text-center mb-10 mt-4">
              <h2 className="text-2xl font-bold mb-2">Client Portal</h2>
              <p className="text-sm text-gray-500">
                {loginMethod === "google" ? "Sign in with your Google account" : "Sign in with your email and password"}
              </p>
            </div>

            <div className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {loginMethod === "google" ? (
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-4 bg-white text-black hover:bg-gray-100 disabled:bg-gray-300 rounded-2xl text-lg font-bold transition-all shadow-xl flex items-center justify-center gap-3 group"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                      Sign in with Google
                    </>
                  )}
                </button>
              ) : (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-50 text-white hover:text-blue-600 disabled:bg-blue-600/50 rounded-2xl text-lg font-bold transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                onClick={() => setLoginMethod(loginMethod === "google" ? "email" : "google")}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                {loginMethod === "google" ? (
                  <>
                    <Mail className="w-4 h-4" />
                    Sign in with Email
                  </>
                ) : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                    Sign in with Google
                  </>
                )}
              </button>
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-gray-500">
                Secure access powered by Sacho Innovations.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-600">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure SSL Encryption</span>
            <span className="flex items-center gap-1"><LogIn className="w-3 h-3" /> OAuth 2.0 Protection</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
