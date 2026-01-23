"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAccount } from "wagmi";

interface User {
  username?: string;
  pfpUrl?: string;
  streak?: number;
  primaryEthAddress?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  user: User | null;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAccount();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mock authentication when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      // In a real app, we would sign a message and exchange for JWT here
      // For now, we simulate a token if connected
      setToken("mock-token-" + address);

      // Mock User Data
      setUser({
        username: "Pilot-" + address.slice(0, 4),
        pfpUrl: "https://api.dicebear.com/9.x/pixel-art/svg?seed=" + address,
        streak: 5, // Mock streak sync
        primaryEthAddress: address
      });

    } else {
      setToken(null);
      setUser(null);
    }
  }, [isConnected, address]);

  const login = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        isLoading,
        token,
        user,
        login,
        logout,
      }}
    >
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
