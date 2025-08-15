'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import type { UserSettings } from '@/lib/types';

interface SettingsContextType {
  settings: UserSettings | null; // Pode ser nulo enquanto carrega
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Define um estado inicial padrão completo
const defaultSettings: UserSettings = {
  currency: 'EUR',
  plan: 'free',
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null); // Inicia como nulo
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const settingsDocRef = doc(db, `users/${user.uid}`);
      const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().currency && docSnap.data().plan) {
          setSettings(docSnap.data() as UserSettings);
        } else {
          // Se o documento não existir ou estiver incompleto, cria com os valores padrão
          setDoc(settingsDocRef, defaultSettings, { merge: true });
          setSettings(defaultSettings);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Se não houver utilizador, limpa as definições e para de carregar
      setSettings(null);
      setLoading(false);
    }
  }, [user]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (user) {
      const settingsDocRef = doc(db, `users/${user.uid}`);
      await setDoc(settingsDocRef, newSettings, { merge: true });
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};