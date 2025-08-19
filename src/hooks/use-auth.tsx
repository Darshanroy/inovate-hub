
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { apiService } from '@/lib/api';

export const getCookie = (name: string): string | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

interface AuthContextType {
  isLoggedIn: boolean;
  userType: string | undefined;
  setAuthStatus: (loggedIn: boolean, type?: string) => void;
  checkLoginStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | undefined>(undefined);

  const checkLoginStatus = useCallback(() => {
    const token = getCookie("authToken");
    const hasToken = Boolean(token);
    setIsLoggedIn(hasToken);
    if (hasToken && token) {
      apiService.verifyToken({ token }).then((info) => {
        if (info?.valid) {
          setUserType(info.user_type);
        }
      }).catch(() => {
        setIsLoggedIn(false);
        setUserType(undefined);
      });
    } else {
      setUserType(undefined);
    }
  }, []);

  const setAuthStatus = (loggedIn: boolean, type?: string) => {
    setIsLoggedIn(loggedIn);
    setUserType(type);
  };
  
  return (
    <AuthContext.Provider value={{ isLoggedIn, userType, setAuthStatus, checkLoginStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
