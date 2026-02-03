"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { AuthContextType, User } from "@/types";
import { api } from "@/lib/api";
import { useChatStore } from "@/hooks/custom/use-chat-store";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const previousUserIdRef = useRef<string | null>(null);
  const clearAllChats = useChatStore((state) => state.clearAllChats);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clear local chat storage when user changes (different user logs in)
      if (firebaseUser && previousUserIdRef.current && previousUserIdRef.current !== firebaseUser.uid) {
        clearAllChats();
      }

      // Update previous user ID
      previousUserIdRef.current = firebaseUser?.uid || null;

      setUser(firebaseUser);

      // Sync user with backend when authenticated
      if (firebaseUser) {
        try {
          await api.post("/auth/login", {
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
          });
        } catch (error) {
          console.error("Failed to sync user with backend:", error);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [clearAllChats]);

  const signIn = async (email: string, password: string): Promise<void> => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);

    // Backend sync happens automatically in onAuthStateChanged
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    const auth = getFirebaseAuth();
    await createUserWithEmailAndPassword(auth, email, password);

    // Backend sync happens automatically in onAuthStateChanged
  };

  const signOut = async () => {
    const auth = getFirebaseAuth();
    // Clear local chat storage on logout
    clearAllChats();
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
