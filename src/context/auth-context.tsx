"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface StoredAccount {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null; // The currently active user
  token: string | null; // The token for the active user
  accounts: StoredAccount[];
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  switchAccount: (userId: string) => void;
  isLoading: boolean;
  updateUserContext: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'authData';

interface AuthData {
  accounts: StoredAccount[];
  activeUserId: string | null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    try {
      const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedData) {
        const data: AuthData = JSON.parse(storedData);
        setAccounts(data.accounts || []);
        setActiveUserId(data.activeUserId || null);
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const saveAuthData = (data: AuthData) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    setAccounts(data.accounts);
    setActiveUserId(data.activeUserId);
  };

  const login = (user: User, token: string) => {
    const newAccount: StoredAccount = { user, token };
    const currentAccounts = accounts.filter(acc => acc.user.id !== user.id);
    const newAccounts = [...currentAccounts, newAccount];
    
    saveAuthData({ accounts: newAccounts, activeUserId: user.id });
  };

  const switchAccount = (userId: string) => {
    if (userId === activeUserId) return;
    
    const accountToSwitch = accounts.find(acc => acc.user.id === userId);
    if (accountToSwitch) {
        saveAuthData({ accounts, activeUserId: userId });
        toast({
            title: "Account Switched",
            description: `You are now logged in as ${accountToSwitch.user.username}.`,
        });
        router.push('/');
    }
  };

  const logout = () => {
    const remainingAccounts = accounts.filter(acc => acc.user.id !== activeUserId);
    
    if (remainingAccounts.length > 0) {
      const newActiveId = remainingAccounts[0].user.id;
      saveAuthData({ accounts: remainingAccounts, activeUserId: newActiveId });
    } else {
      setAccounts([]);
      setActiveUserId(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    router.push('/');
    router.refresh();
  };
  
  const updateUserContext = (updatedUser: User) => {
    const newAccounts = accounts.map(acc => {
        if (acc.user.id === updatedUser.id) {
            return { ...acc, user: updatedUser };
        }
        return acc;
    });
    saveAuthData({ accounts: newAccounts, activeUserId });
  };

  const activeUser = accounts.find(acc => acc.user.id === activeUserId)?.user || null;
  const activeToken = accounts.find(acc => acc.user.id === activeUserId)?.token || null;

  const value = {
    user: activeUser,
    token: activeToken,
    accounts,
    isAuthenticated: !!activeUserId,
    login,
    logout,
    switchAccount,
    isLoading,
    updateUserContext,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
