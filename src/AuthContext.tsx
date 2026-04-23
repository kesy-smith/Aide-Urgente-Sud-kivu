import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signIn, signOut } from './lib/firebase';
import { UserProfile } from './types';
import { handleFirestoreError } from './lib/error_handler';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: () => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        } as UserProfile);
      } else {
        // Create initial profile if it doesn't exist
        const currentUser = auth.currentUser;
        if (currentUser) {
          const profileData = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'User',
            email: currentUser.email || '',
            role: 'user' as const,
            createdAt: serverTimestamp(),
          };
          try {
            await setDoc(docRef, profileData);
            setProfile({
              ...profileData,
              createdAt: new Date().toISOString()
            } as UserProfile);
          } catch (err) {
            handleFirestoreError(err, 'create', path);
          }
        }
      }
    } catch (error: any) {
      const isOffline = error?.message?.toLowerCase().includes('offline') || !navigator.onLine;
      
      if (isOffline) {
        console.log("[Auth] Client is offline, profile will sync when online.");
        // Try to recover from local cache if possible (should happen automatically with getDoc, 
        // but if it threw, it means it's not in cache either)
        return;
      }

      console.error("Error fetching profile:", error);
      if (error?.code === 'permission-denied') {
        handleFirestoreError(error, 'get', path);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
