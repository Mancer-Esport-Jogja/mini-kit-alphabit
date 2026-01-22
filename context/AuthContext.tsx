"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { User, AuthState } from "@/types/auth";
import { ALPHABIT_BACKEND_URL } from "@/config/api";

interface AuthContextType extends AuthState {
  reconnect: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  const login = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // In SDK v0.2.0, we try to get the session token headlessly
      // Many frames/miniapps now use viewProfile to get the user + token
      let token: string | null = null;
      try {
        const result = await (sdk.actions as any).viewProfile();
        token = result?.token;
      } catch (e) {
        // If viewProfile fails or is unavailable, try a standard signIn
        const signInResult = await sdk.actions.signIn({ nonce: Math.random().toString(36).substring(2, 12) });
        token = (signInResult as any).token || (signInResult as any).signature; // Fallback for various versions
      }
      
      if (!token) {
        console.warn("No auth token received from Farcaster. Continuing in Guest mode.");
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const response = await fetch(`${ALPHABIT_BACKEND_URL}/auth`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Backend auth failed");

      const result = await response.json();
      
      if (result.success) {
        setState({
          user: result.data.user,
          isAuthenticated: true,
          isLoading: false,
          token: token,
        });
        localStorage.setItem("alphabit_token", token);
      }
    } catch (error) {
      console.error("Auto-connect error:", error);
      setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
    }
  }, []);

  const logout = useCallback(() => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
    });
    localStorage.removeItem("alphabit_token");
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
        
        // 1. Check for existing session
        const savedToken = localStorage.getItem("alphabit_token");
        if (savedToken) {
          const response = await fetch(`${ALPHABIT_BACKEND_URL}/auth`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${savedToken}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setState({
                user: result.data.user,
                isAuthenticated: true,
                isLoading: false,
                token: savedToken,
              });
              return;
            }
          }
          localStorage.removeItem("alphabit_token");
        }

        // 2. If no session, try auto-connect (Real Auth)
        await login();

      } catch (e) {
        console.warn("Auth initialization error", e);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    // Dev helper
    (window as any).devLogin = async (customToken?: string) => {
       // ... existing dev login logic ...
       // (Kept for local dev if needed, logic is same)
       const token = customToken || 'dev-token';
       // ... fetch ...
       // Updating logic here to match new flow if needed, but existing is fine
       // We can just call the same endpoint
        const response = await fetch(`${ALPHABIT_BACKEND_URL}/auth`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setState({
            user: result.data.user,
            isAuthenticated: true,
            isLoading: false,
            token: token,
          });
          localStorage.setItem("alphabit_token", token);
        }
      }
    };

    init();
  }, [login]);

  return (
    <AuthContext.Provider value={{ ...state, reconnect: login, logout }}>
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
