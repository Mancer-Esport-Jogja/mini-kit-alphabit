import React from 'react';
import { Cpu, Flame, LogIn } from 'lucide-react';
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownLink, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity, EthBalance } from '@coinbase/onchainkit/identity';
import { useAuth } from '@/context/AuthContext';

export const Header = ({ streak }: { streak: number }) => {
    const { user, isAuthenticated, login, isLoading } = useAuth();

    return (
        <div className="flex justify-between items-end p-4 bg-slate-900 border-b-4 border-black sticky top-0 z-20 w-full max-w-md mx-auto">
            <div className="flex items-center gap-3">
                {/* Brand Icon or User PFP */}
                <div className="relative">
                    {isAuthenticated && user?.pfpUrl ? (
                        <div className="w-12 h-12 bg-black border-4 border-bit-green overflow-hidden">
                            <img src={user.pfpUrl} alt={user.username || 'user'} className="w-full h-full object-cover" />
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
                <div>
                    <h2 className="font-bold text-white text-xs mb-1 font-pixel tracking-widest">
                        {isAuthenticated ? user?.username?.toUpperCase() : 'ALPHABIT'}
                    </h2>
                    <div className="bg-black px-2 py-1 border border-slate-700 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isAuthenticated ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-[8px] text-slate-400 font-mono uppercase">
                            {isAuthenticated ? 'AUTH: SECURE' : 'AUTH: PENDING'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
                {!isAuthenticated ? (
                    <button 
                        onClick={login}
                        disabled={isLoading}
                        className="bg-bit-green hover:bg-green-400 text-black font-pixel text-[9px] px-3 py-1 flex items-center gap-2 border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 h-8"
                    >
                        <LogIn size={10} /> 
                        {isLoading ? 'SYNCING...' : 'LOGIN_FARCASTER'}
                    </button>
                ) : (
                    <div className="flex items-center gap-1">
                        <div className="text-[8px] text-slate-500 animate-pulse hidden sm:block">STREAK</div>
                        <div className={`flex items-center gap-2 px-3 py-1 bg-black border-2 ${streak > 3 ? 'border-orange-500' : 'border-slate-600'}`}>
                            <Flame className={`w-3 h-3 ${streak > 3 ? 'text-orange-500 fill-orange-500' : 'text-slate-500'}`} />
                            <span className={`font-bold ${streak > 3 ? 'text-orange-500' : 'text-slate-400'} text-xs font-pixel`}>x{streak}</span>
                        </div>
                    </div>
                )}

                {/* OnchainKit Connect Wallet */}
                <div className="wallet-wrapper overflow-hidden max-w-[120px]">
                    <Wallet>
                        <ConnectWallet
                            disconnectedLabel="Connect"
                            className="!bg-slate-800 !border-2 !border-slate-600 hover:!border-bit-green !font-pixel !text-[10px] !px-3 !py-1.5 !rounded-none [&>*:nth-child(n+2)]:!hidden"
                        />
                        <WalletDropdown className="!bg-slate-900 !border-2 !border-slate-700 !rounded-none">
                            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                <Avatar />
                                <Name />
                                <Address />
                                <EthBalance />
                            </Identity>
                            <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
                                Wallet
                            </WalletDropdownLink>
                            <WalletDropdownDisconnect />
                        </WalletDropdown>
                    </Wallet>
                </div>
            </div>
        </div>
    );
};
