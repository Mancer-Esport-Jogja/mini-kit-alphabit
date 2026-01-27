"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { useConnect, useAccount, useSignMessage } from "wagmi";
import { IS_TESTNET } from "@/config/wagmi";

/**
 * User profile from backend auth
 */
interface User {
  id: string;
  fid: string;
  username: string | null;
  displayName: string | null;
  pfpUrl: string | null;
  primaryEthAddress: string | null;
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt?: string;
  streak?: number; // For gamification system
}

/**
 * Backend auth response format
 */
interface BackendAuthResponse {
  success: boolean;
  data: {
    user: User;
    isNewUser: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  user: User | null;
  isDevMode: boolean;
  login: () => Promise<void>;
  logout: () => void;
  bindWallet: () => Promise<void>;
  needsBinding: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);

  const { connect, connectors } = useConnect();
  const { isConnected, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [needsBinding, setNeedsBinding] = useState(false);
  const [hasAttemptedAutoSync, setHasAttemptedAutoSync] = useState(false);

  /**
   * Authenticate with backend
   * - Dev mode: Use 'dev-token'
   * - Prod mode: Use Farcaster Quick Auth token
   */
  const authenticate = useCallback(async () => {
    setIsLoading(true);

    try {
      let authToken: string;

      if (IS_TESTNET) {
        // Dev mode: Use dev-token for local testing
        console.log("Auth: Using dev-token for development mode");
        authToken = "dev-token";
        
        // Auto-connect wallet if in dev mode
        if (!isConnected && connectors.length > 0) {
            console.log("Auth: Auto-connecting dev wallet...");
            connect({ connector: connectors[0] });
        }
      } else {
        // Prod mode: Get Farcaster Quick Auth token
        console.log("Auth: Getting Farcaster Quick Auth token...");
        console.log("Auth: Config - NEXT_PUBLIC_URL:", process.env.NEXT_PUBLIC_URL);
        try {
            const result = await sdk.quickAuth.getToken();
            authToken = result.token;
            console.log("Auth: Farcaster token:", authToken);
        } catch (err: unknown) {
             console.error("Auth: Failed sdk.quickAuth.getToken()", err);
             throw err;
        }
      }

      // Call backend auth endpoint directly
      const PROXY_AUTH_URL = "/api/auth";
      console.log("Auth: Calling proxy backend at:", PROXY_AUTH_URL);
      const response = await fetch(PROXY_AUTH_URL, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
      });

      console.log("Auth: Backend response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Auth: Backend error response:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error?.message || `Backend returned ${response.status}`);
        } catch {
          throw new Error(`Backend returned ${response.status}: ${errorText.substring(0, 100)}`);
        }
      }

      const data: BackendAuthResponse = await response.json();
      console.log("Auth: Backend response data:", JSON.stringify(data));

      if (!data.success) {
        throw new Error(data.error?.message || "Authentication failed");
      }

      setToken(authToken);
      setUser(data.data.user);
      setIsDevMode(IS_TESTNET);

      console.log("Auth: Successfully authenticated", {
        fid: data.data.user.fid,
        username: data.data.user.username,
        isDevMode: IS_TESTNET,
        isNewUser: data.data.isNewUser,
      });

      // Signal Farcaster that the app is ready
      sdk.actions.ready();
    } catch (error) {
      console.error("Auth: Authentication failed CRITICAL", error);
      // Log specific error details if available
      if (error instanceof Error) {
        console.error("Auth Error Message:", error.message);
        console.error("Auth Error Stack:", error.stack);
      }
      
      setToken(null);
      setUser(null);
      setIsDevMode(false);
      
    } finally {
      setIsLoading(false);
      console.log("Auth: Authenticate process finished.");
    }
  }, [connect, connectors, isConnected]);

  /**
   * Check if wallet needs binding & Auto-Trigger
   */
  /**
   * Check if wallet needs binding & Auto-Trigger
   */
  useEffect(() => {
    const isAuthenticated = !!token && !!user;
    
    if (isAuthenticated && user && isConnected && address) {
      const isMismatch = !user.primaryEthAddress || user.primaryEthAddress.toLowerCase() !== address.toLowerCase();
      
      if (isMismatch) {
         setNeedsBinding(true);

         // Auto-trigger bind if not attempted yet
         if (!hasAttemptedAutoSync) {
            console.log("Auth: Auto-triggering wallet binding...");
            setHasAttemptedAutoSync(true);
            // Small delay to ensure UI is ready
            setTimeout(() => {
                bindWallet();
            }, 500);
         }
      } else {
         setNeedsBinding(false);
      }
    } else {
      setNeedsBinding(false);
    }
  }, [token, user, isConnected, address, hasAttemptedAutoSync]); 

  /**
   * Bind current wallet to user account (SIWE)
   */
  const bindWallet = async () => {
    if (!token || !user || !address) return;

    try {
      setIsLoading(true);
      console.log("Auth: Binding wallet...", address);
      
      const message = `Bind Wallet ${address} to Alphabit Account ${user.fid}`;
      const signature = await signMessageAsync({ message });

      const response = await fetch("/api/auth/bind-wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          address,
          signature
        })
      });

      if (!response.ok) {
        throw new Error("Failed to bind wallet");
      }

      const result = await response.json();
      if (result.success) {
        // Update local user state
        setUser(prev => prev ? { ...prev, primaryEthAddress: address } : null);
        setNeedsBinding(false);
        console.log("Auth: Wallet bound successfully");
      }

    } catch (error) {
      console.error("Auth: Failed to bind wallet", error);
      // We don't re-throw here for the auto-trigger to avoid crashing layout
      // User can retry manually via Header prompt if auto fails
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Auto-authenticate on mount
   * In dev mode: Always authenticate with dev-token
   * In prod mode: Authenticate via Farcaster Quick Auth
   */
  useEffect(() => {
    // Delay slightly to ensure SDK is ready
    const timer = setTimeout(async () => {
      // Logic for Dev Mode wallet connection enforcement
      if (IS_TESTNET) {
        const devConnector = connectors.find(c => c.id === 'dev-wallet');
        
        // If we are connected but not to the dev connector (or multiple)
        if (isConnected && (!connectors[0] || connectors[0].id !== 'dev-wallet')) {
             console.log("Auth: Connected to wrong wallet in Dev Mode. Disconnecting...");
             // We can't easily disconnect specific wallet via hooks here without `disconnect` from useDisconnect
             // But we can try to connect to the correct one which usually overrides
        }

        if (devConnector && (!isConnected || connectors[0]?.id !== 'dev-wallet')) {
            console.log("Auth: Auto-connecting Dev Wallet...");
            connect({ connector: devConnector });
        }
      } else {
        // Prod: Auto-connect Farcaster Wallet if available
        if (!isConnected) {
            const farcasterConnector = connectors.find(c => c.id === 'farcaster');
            if (farcasterConnector) {
                console.log("Auth: Auto-connecting Farcaster Wallet...");
                connect({ connector: farcasterConnector });
            }
        }
      }
      
      await authenticate();
    }, 100);

    return () => clearTimeout(timer);
  }, [authenticate, connect, connectors, isConnected]);

  const login = async () => {
    await authenticate();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsDevMode(false);
    console.log("Auth: Logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && !!user,
        isLoading,
        token,
        user,
        isDevMode,
        login,
        logout,
        bindWallet,
        needsBinding
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
