import React from 'react';
import { Cpu } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useAuth } from '@/context/AuthContext';
import { StreakFlame } from '@/components/ui/StreakFlame';
import Image from 'next/image';

const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const Header = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const streak = user?.currentWinStreak ?? user?.streak ?? 0;
    const { address, isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    const handleConnect = () => {
        // In Dev Mode (or if Farcaster not found), try the first available connector (usually Coinbase or Injected)
        const connector = connectors.find(c => c.id === 'farcasterFrame') || connectors[0];
        if (connector) {
            console.log("Connecting with:", connector.name);
            connect({ connector });
        } else {
            console.error("No suitable connector found");
        }
    };

    // Use Farcaster address as priority, fallback to connected wallet
    // const displayAddress = user?.primaryEthAddress || address;

    return (
        <div className="flex justify-between items-end p-4 bg-slate-900 border-b-4 border-black sticky top-0 z-20 w-full max-w-md mx-auto">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Brand Icon or User PFP */}
                <div className="relative shrink-0">
                    {isAuthenticated && user?.pfpUrl ? (
                        <div className="w-12 h-12 bg-black border-4 border-bit-green overflow-hidden relative">
                            <Image
                                src={user.pfpUrl}
                                alt={user.username || 'user'}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-black border-4 border-slate-700 flex items-center justify-center">
                            <Cpu className="text-white w-6 h-6" />
                        </div>
                    )}
                    {isAuthenticated && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-bit-green border-2 border-black rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
                    )}
                </div>
                <div className="min-w-0">
                    <h2 className="font-bold text-white text-xs mb-1 font-pixel tracking-widest truncate whitespace-nowrap">
                        {isAuthenticated ? user?.username?.toUpperCase() : 'ALPHABIT'}
                    </h2>
                    <div className="bg-black px-2 py-1 border border-slate-700 inline-flex items-center gap-2 w-fit max-w-full">
                        <div className="w-2 h-2 rounded-full animate-pulse bg-green-500"></div>
                        <span className="text-[8px] text-slate-400 font-mono uppercase whitespace-nowrap">
                            SYSTEM: ONLINE
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 max-w-[50%]">
                {/* Status & Streak Row */}
                <div className="flex items-center gap-2">
                    {isLoading ? (
                        <div className="h-6 flex items-center">
                            <div className="px-2 py-0.5 bg-slate-800 border border-slate-600">
                                <span className="text-[8px] font-pixel text-slate-400 animate-pulse uppercase">SYNCING</span>
                            </div>
                        </div>
                    ) : (
                        <StreakFlame streak={streak} size="sm" />
                    )}
                </div>

                {/* Custom Wallet Pill (High Performance) */}
                <div className="flex flex-col items-end w-full">
                    {isConnected && address ? (
                        <button
                            onClick={() => disconnect()}
                            className="flex items-center gap-2 bg-slate-800 border-2 border-slate-700 px-2 py-1 w-full justify-between hover:border-bit-coral transition-colors group"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-bit-green group-hover:bg-bit-coral shadow-[0_0_4px_currentColor]"></div>
                            <span className="text-[9px] font-mono text-white tracking-tighter uppercase">
                                {formatAddress(address)}
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={handleConnect}
                            className="bg-slate-800 border-2 border-slate-600 hover:border-bit-green text-white font-pixel text-[9px] px-3 py-1 animate-pulse"
                        >
                            {isAuthenticated ? 'CONNECT WALLET' : 'CONNECT'}
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
};
