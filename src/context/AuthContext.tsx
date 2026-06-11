import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db, doc, getDoc, setDoc, signInWithEmailAndPassword, collection, addDoc, serverTimestamp } from "@/src/firebase";

export type UserRole = "visitor" | "client" | "admin" | "manager";

interface User {
  id: string;
  uid: string;
  name: string;
  displayName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "nkandusydneychongo@gmail.com";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check for existing user in Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        let role: UserRole = "client";
        
        // Bootstrap first admin
        if (firebaseUser.email === ADMIN_EMAIL && firebaseUser.emailVerified) {
          role = "admin";
        } else if (userDoc.exists()) {
          role = userDoc.data().role as UserRole;
        }

        const userData: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          email: firebaseUser.email || "",
          role: role,
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`,
          photoURL: firebaseUser.photoURL || undefined,
        };

        // Sync to Firestore if it's a new user or role changed
        if (!userDoc.exists() || userDoc.data().role !== role) {
          await setDoc(userDocRef, {
            name: userData.name,
            email: userData.email,
            role: userData.role,
            avatar: userData.avatar,
            lastLogin: new Date().toISOString()
          }, { merge: true });

          // Add welcome notification for new users or first login in session
          await addDoc(collection(db, "notifications"), {
            userId: firebaseUser.uid,
            title: "Welcome to SACHO Portal!",
            message: "We're excited to have you here. Explore your dashboard to get started.",
            type: "success",
            read: false,
            timestamp: serverTimestamp()
          });
        }

        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      let errorMessage = "Failed to sign in. Please try again.";
      if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Email/Password sign-in is not enabled in the Firebase Console. Please enable it in the Authentication tab.";
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      }
      console.error("Email login failed:", error);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithEmail, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
