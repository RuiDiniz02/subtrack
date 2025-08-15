
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (newProfile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const profileDocRef = doc(db, `users/${user.uid}`);
      const unsubscribe = onSnapshot(profileDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().plan) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Cria um perfil padrão para novos utilizadores
          const defaultProfile: UserProfile = { currency: 'EUR', plan: 'free' };
          setDoc(profileDocRef, defaultProfile, { merge: true });
          setProfile(defaultProfile);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    if (user) {
        const profileDocRef = doc(db, `users/${user.uid}`);
        await setDoc(profileDocRef, newProfile, { merge: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

