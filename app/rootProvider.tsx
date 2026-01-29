"use client";
import { MiniAppProvider } from "@neynar/react";
import { ReactNode, useState } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/config/wagmi";

import { AuthProvider } from "@/context/AuthContext";
import { GamificationProvider } from "@/context/GamificationContext";
import sdk from "@farcaster/miniapp-sdk";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useCallback } from "react";
import { DroidProvider } from "@/context/DroidContext";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

// Launch date: February 1, 2026 00:00:00 GMT+7
const LAUNCH_DATE = new Date('2026-02-01T00:00:00+07:00').getTime();

function isLaunched(): boolean {
  return Date.now() >= LAUNCH_DATE;
}

function UserStatusGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check if not authenticated yet
    if (!isAuthenticated || !user) return;

    // If launch date has passed, skip all coming-soon logic
    if (isLaunched()) {
      // If user is still on coming-soon page after launch, redirect to home
      if (pathname === '/coming-soon') {
        router.push('/');
      }
      return;
    }

    // Pre-launch: Check status
    // Skip redirect in development mode for easier testing
    if (user.status === 'INACTIVE' && process.env.NODE_ENV !== 'development') {
       if (pathname !== '/coming-soon') {
         router.push('/coming-soon');
       }
    } else if (pathname === '/coming-soon' && user.status === 'ACTIVE') {
       // If user becomes active, redirect back to home (or dashboard)
       router.push('/');
    }

  }, [user, isAuthenticated, pathname, router]);

  return <>{children}</>;
}

export function RootProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [isReady, setIsReady] = useState(false);

  const handleLoadingComplete = useCallback(() => {
    sdk.actions.ready();
    setIsReady(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniAppProvider>
          <AuthProvider>
            <GamificationProvider>
              <DroidProvider>
                <OnchainKitProvider
                    apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
                    chain={base}
                    miniKit={{
                      enabled: true,
                    }}
                    config={{
                      appearance: {
                        mode: "dark",
                        theme: "hacker",
                      },
                      wallet: {
                        display: "modal",
                        preference: "all",
                      },
                    }}
                  >
                    {!isReady && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
                    <div style={{ display: isReady ? 'block' : 'none' }}>
                      <UserStatusGuard>
                        {children}
                      </UserStatusGuard>
                    </div>
                  </OnchainKitProvider>
              </DroidProvider>
            </GamificationProvider>
          </AuthProvider>
        </MiniAppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
