import React from 'react';
import { Cpu, Flame } from 'lucide-react';
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownLink, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity, EthBalance } from '@coinbase/onchainkit/identity';

export const Header = ({ streak }: { streak: number }) => {
    return (
        <div className="flex justify-between items-end p-4 bg-slate-900 border-b-4 border-black sticky top-0 z-20 w-full max-w-md mx-auto">
            <div className="flex items-center gap-3">
                {/* Brand Icon */}
                <div className="w-12 h-12 bg-black border-4 border-slate-700 flex items-center justify-center">
                    <Cpu className="text-white w-6 h-6" />
                </div>
                <div>
                    <h2 className="font-bold text-white text-xs mb-1 font-pixel tracking-widest">ALPHABIT</h2>
                    <div className="bg-black px-2 py-1 border border-slate-700 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[8px] text-slate-400 font-mono">SYSTEM: ONLINE</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                {/* Streak Mock */}
                <div className="flex items-center gap-1">
                    <div className="text-[8px] text-slate-500 animate-pulse hidden sm:block">STREAK</div>
                    <div className={`flex items-center gap-2 px-3 py-1 bg-black border-2 ${streak > 3 ? 'border-orange-500' : 'border-slate-600'}`}>
                        <Flame className={`w-3 h-3 ${streak > 3 ? 'text-orange-500 fill-orange-500' : 'text-slate-500'}`} />
                        <span className={`font-bold ${streak > 3 ? 'text-orange-500' : 'text-slate-400'} text-xs font-pixel`}>x{streak}</span>
                    </div>
                </div>

                {/* OnchainKit Connect Wallet */}
                <div className="flex justify-end">
                    <Wallet>
                        <ConnectWallet className="bg-slate-800 border-2 border-slate-600 text-white font-pixel text-[10px] px-2 py-1 h-8 min-w-[100px]">
                            <Avatar className="h-6 w-6" />
                            <Name className="text-white" />
                        </ConnectWallet>
                        <WalletDropdown>
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
