
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import type { UserSettings } from '@/lib/types';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({ currency: 'EUR' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // O caminho para as definições do utilizador agora é dentro da coleção 'users'
      const settingsDocRef = doc(db, `users/${user.uid}`);
      const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().currency) {
          setSettings(docSnap.data() as UserSettings);
        } else {
          // Se não existirem definições, cria com os valores padrão
          setDoc(settingsDocRef, { currency: 'EUR' }, { merge: true });
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Se não houver utilizador, usa as definições padrão
      setSettings({ currency: 'EUR' });
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
