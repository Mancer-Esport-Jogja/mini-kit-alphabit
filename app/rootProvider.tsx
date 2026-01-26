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
                  {children}
                </div>
              </OnchainKitProvider>
            </GamificationProvider>
          </AuthProvider>
        </MiniAppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
