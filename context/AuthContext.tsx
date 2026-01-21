"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { User, AuthState } from "@/types/auth";
import { ALPHABIT_BACKEND_URL } from "@/config/api";

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
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
      
      // 1. Get token from Farcaster SDK
      const signInResult = (await sdk.actions.signIn({ nonce: Math.random().toString(36).substring(7) })) as any;
      const token = signInResult.token;
      
      if (!token) {
        throw new Error("Failed to get token from Farcaster");
      }

      // 2. Authenticate with backend
      const response = await fetch(`${ALPHABIT_BACKEND_URL}/auth`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Backend authentication failed");
      }

      const result = await response.json();
      
      if (result.success) {
        setState({
          user: result.data.user,
          isAuthenticated: true,
          isLoading: false,
          token: token,
        });
        
        localStorage.setItem("alphabit_token", token);
      } else {
        throw new Error(result.error || "Authentication failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setState(prev => ({ ...prev, isLoading: false }));
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

  // Auto-login on mount
  useEffect(() => {
    // Dev helper for manual testing in browser
    (window as any).devLogin = async (customToken?: string) => {
      const token = customToken || 'dev-token';
      console.log(`[DEV] Attempting login with token: ${token}`);
      
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
          console.log(`[DEV] Logged in as: ${result.data.user.username}`);
          return;
        }
      }
      console.error("[DEV] Login failed");
    };

    const init = async () => {
      try {
        await sdk.actions.ready();
        
        const savedToken = localStorage.getItem("alphabit_token");
        if (savedToken) {
          // Verify saved token with backend
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
          // If verification fails, clear it
          localStorage.removeItem("alphabit_token");
        }
      } catch (e) {
        console.warn("Auth initialization error", e);
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
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
