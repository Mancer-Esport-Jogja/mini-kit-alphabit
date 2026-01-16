import React, { useState } from 'react';
import { Terminal, Info, LucideIcon } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { Transaction, TransactionButton, TransactionStatus, TransactionStatusLabel, TransactionStatusAction } from '@coinbase/onchainkit/transaction';
import { ALPHABIT_CONTRACT_ADDRESS, ALPHABIT_ABI, CHAIN_ID } from '@/config/contracts';
import { encodeFunctionData } from 'viem';

// Shared type definition 
export interface VaultConfig {
    id: string;
    alias: string;
    name: string;
    description?: string;
    humanDesc: string;
    risk: string;
    apy: string;
    color: string;
    borderColor: string;
    barColor: string;
    icon: LucideIcon;
    tvl?: string;
    bg?: string;
    desc?: string;
    apyVal?: number;
    tvlVal?: number;
    type?: string;
    status?: string;
}

interface VaultBriefingProps {
    vault: VaultConfig;
    onBack: () => void;
    onSuccess: () => void;
}

export const VaultBriefing = ({ vault, onBack, onSuccess }: VaultBriefingProps) => {
    const [depositAmount, setDepositAmount] = useState('0.0001'); // Default for testing

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTransactionStatus = (status: any) => {
        console.log('Transaction status:', status);
        if (status.statusName === 'success') {
            setTimeout(onSuccess, 1000);
        }
    };

    const encodedData = encodeFunctionData({
        abi: ALPHABIT_ABI,
        functionName: 'deposit',
        args: [],
    });

    const calls = [
        {
            to: ALPHABIT_CONTRACT_ADDRESS as `0x${string}`,
            data: encodedData,
            value: BigInt(Math.floor(parseFloat(depositAmount) * 1e18) || 0),
        },
    ];

    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col font-pixel">
            {/* Header Briefing */}
            <div className="p-4 mb-2 flex items-center gap-2 border-b-2 border-slate-700 bg-slate-900">
                <Terminal className="text-green-500 w-5 h-5 animate-pulse" />
                <h1 className="text-xs text-green-500 font-pixel">TACTICAL CONSOLE</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-32">

                {/* SECTION 1: GAMIFIED SPECS */}
                <PixelCard title="MISSION SPECS" borderColor={vault.borderColor} color="bg-slate-900">
                    <div className="flex gap-4 items-center mb-4">
                        <div className={`w-14 h-14 border-2 border-white/20 bg-black flex items-center justify-center ${vault.risk === 'HIGH' ? 'animate-pulse' : ''}`}>
                            <vault.icon className={`w-8 h-8 ${vault.color}`} />
                        </div>
                        <div>
                            <h2 className={`text-sm font-bold text-white mb-1`}>{vault.alias}</h2>
                            <p className="text-[8px] text-slate-400 font-mono mb-1">CODE: {vault.name}</p>
                            <span className={`text-[8px] px-1.5 py-0.5 border ${vault.risk === 'HIGH' ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500'}`}>
                                RISK LEVEL: {vault.risk}
                            </span>
                        </div>
                    </div>

                    {/* Input Simulation */}
                    <div className="bg-black p-3 border border-slate-700 mb-2">
                        <label className="text-[8px] text-slate-500 mb-1 block">FUEL INPUT (ETH)</label>
                        <div className="flex items-center justify-between">
                            <input
                                type="number"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className="bg-transparent text-white font-pixel text-sm w-full focus:outline-none"
                                step="0.0001"
                            />
                            <span className="text-xs text-slate-600">Ξ</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono">
                        <span>EST. POWER OUTPUT:</span>
                        <span className={`${vault.color}`}>{vault.apy} / YEAR</span>
                    </div>
                </PixelCard>

                {/* SECTION 2: HUMAN TRANSLATION */}
                <div className="relative mb-6">
                    <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 to-transparent"></div>
                    <div className="pl-3">
                        <h3 className="text-[10px] text-yellow-500 font-bold mb-2 flex items-center gap-2">
                            <Info size={12} />
                            DECODED TRANSMISSION
                        </h3>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-none text-[10px] leading-relaxed text-slate-300 font-sans">
                            <p className="mb-2"><strong className="text-white">Translation:</strong> {vault.humanDesc}</p>
                            <ul className="list-disc pl-4 space-y-1 text-slate-400">
                                <li>You deposit <span className="text-white">{depositAmount} ETH</span>.</li>
                                <li>Assets locked for <span className="text-white">1 Epoch (7 Days)</span>.</li>
                                <li>Yield is auto-compounded.</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>

            {/* Fixed Sticky Footer for Mobile */}
            <div className="fixed bottom-0 w-full max-w-md bg-slate-900 border-t-4 border-black p-4 flex gap-3 z-30">
                <button
                    onClick={onBack}
                    className="w-1/3 bg-slate-800 border-4 border-black text-[10px] text-slate-400 font-bold hover:bg-slate-700 active:translate-y-1 h-12 font-pixel"
                >
                    ABORT
                </button>

                <div className="w-2/3">
                    <Transaction
                        chainId={CHAIN_ID}
                        calls={calls}
                        onStatus={handleTransactionStatus}
                    >
                        <TransactionButton
                            className={`w-full h-12 ${vault.barColor} border-4 border-black text-[10px] text-white font-bold hover:brightness-110 active:translate-y-1 flex items-center justify-center gap-2 font-pixel`}
                            text="INITIATE SEQUENCE"
                        />
                        <TransactionStatus>
                            <TransactionStatusLabel />
                            <TransactionStatusAction />
                        </TransactionStatus>
                    </Transaction>
                </div>
            </div>
        </div>
    );
};
