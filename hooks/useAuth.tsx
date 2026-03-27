import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db, initError } from '../firebaseConfig';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  initError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initError || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && db) {
        // Create or update user profile in Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              createdAt: Date.now()
            });
          }
        } catch (error) {
          console.error("Error checking/creating user profile:", error);
        }
      }
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    if (auth) {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    }
  };

  const logout = async () => {
    if (auth) {
      await auth.signOut();
    }
  };

  const value = { user, loading, login, logout, initError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};