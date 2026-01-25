"use client";
import { ReactNode, useState } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/config/wagmi";

import { AuthProvider } from "@/context/AuthContext";
import { GamificationProvider } from "@/context/GamificationContext";
import sdk from "@farcaster/miniapp-sdk";
import { SplashScreen } from "@/components/SplashScreen";
import { useEffect } from "react";

export function RootProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Small delay to show splash screen and ensure SDK is ready
      setTimeout(() => {
        sdk.actions.ready();
        setIsReady(true);
      }, 3000);
    };

    init();
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GamificationProvider>
            <OnchainKitProvider
              apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
              chain={base}
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
              {!isReady && <SplashScreen />}
              <div style={{ display: isReady ? 'block' : 'none' }}>
                {children}
              </div>
            </OnchainKitProvider>
          </GamificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
