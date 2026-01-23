"use client";

import { useState } from "react";
// import { motion } from "framer-motion"; // Unused removal
import { DollarSign, ArrowRight, Loader } from "lucide-react";

interface OrderBuilderProps {
    balance: string;
    isProcessing: boolean;
    onPlaceOrder: (amount: string) => void;
    yieldInfo: {
        label: string;
        value: string;
        subValue?: string;
    };
}

export function OrderBuilder({ balance, isProcessing, onPlaceOrder, yieldInfo }: OrderBuilderProps) {
    const [amount, setAmount] = useState("");

    const handlePercentageClick = (percent: number) => {
        // Mock logic: assuming balance is parseable number for now
        const numBalance = parseFloat(balance.replace(/,/g, ""));
        if (!isNaN(numBalance)) {
            setAmount((numBalance * percent).toFixed(2));
        } else {
            // Just set a dummy value if balance isn't ready
            setAmount("100");
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-slate-300">Amount (USDC)</label>
                <span className="text-xs text-slate-500">Balance: {balance} USDC</span>
            </div>

            <div className="relative mb-4">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <DollarSign size={16} />
                </div>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black border border-slate-700 rounded p-3 pl-9 text-lg font-mono text-white focus:outline-none focus:border-green-500 transition-colors"
                />
            </div>

            <div className="flex gap-2 mb-6">
                {[0.25, 0.5, 0.75, 1].map((p) => (
                    <button
                        key={p}
                        onClick={() => handlePercentageClick(p)}
                        className="flex-1 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors"
                    >
                        {p * 100}%
                    </button>
                ))}
            </div>

            <div className="bg-slate-950/50 rounded p-4 mb-6 flex justify-between items-center border border-slate-800/50">
                <div className="text-sm text-slate-400">{yieldInfo.label}</div>
                <div className="text-right">
                    <div className="text-lg font-bold text-green-400 font-mono">{yieldInfo.value}</div>
                    {yieldInfo.subValue && <div className="text-[10px] text-slate-500">{yieldInfo.subValue}</div>}
                </div>
            </div>

            <button
                onClick={() => onPlaceOrder(amount)}
                disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                className="w-full bg-white text-black font-bold py-4 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99] flex justify-center items-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <Loader className="animate-spin" size={18} />
                        PROCESSING...
                    </>
                ) : (
                    <>
                        CONFIRM ORDER
                        <ArrowRight size={18} />
                    </>
                )}
            </button>
        </div>
    );
}
