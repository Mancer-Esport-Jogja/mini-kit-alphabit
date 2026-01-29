
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpDown, Target, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { ParsedOrder } from '@/types/orders';

interface OrderMatrixProps {
    isOpen: boolean;
    onClose: () => void;
    orders: ParsedOrder[];
    onSelect: (order: ParsedOrder) => void;
    currentAsset: string;
    currentTarget: 'MOON' | 'DOOM' | null;
}

type SortField = 'strike' | 'expiry' | 'premium' | 'roi';
type SortDirection = 'asc' | 'desc';

export const OrderMatrix = ({ isOpen, onClose, orders, onSelect, currentAsset, currentTarget }: OrderMatrixProps) => {
    const [sortField, setSortField] = useState<SortField>('roi');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Filter relevant orders first (Safety check, though parent should likely pass filtered)
    const relevantOrders = useMemo(() => {
        if (!currentTarget) return [];
        return orders.filter(o => {
            if (o.asset !== currentAsset) return false;
            if (currentTarget === 'MOON' && o.direction !== 'CALL') return false;
            if (currentTarget === 'DOOM' && o.direction !== 'PUT') return false;
            return true;
        });
    }, [orders, currentAsset, currentTarget]);

    // Sort orders
    const sortedOrders = useMemo(() => {
        return [...relevantOrders].sort((a, b) => {
            let valA: number, valB: number;

            switch (sortField) {
                case 'strike':
                    valA = a.strikes[0];
                    valB = b.strikes[0];
                    break;
                case 'expiry':
                    valA = a.expiry.getTime();
                    valB = b.expiry.getTime();
                    break;
                case 'premium':
                    valA = a.premium;
                    valB = b.premium;
                    break;
                case 'roi':
                    // Calculate quick ROI estimate
                    const strikeA = a.strikes[0];
                    const premiumA = a.premium;
                    // For Call: Infinity/High, For Put: (Strike-Prem)/Prem.
                    // Let's use simplified implied potential for sorting
                    // This is just a heuristic as max ROI for call is infinite.
                    // We can inverse sort by Premium/Strike ratio for Calls.
                    // For consistency let's use a unified "Value Score"
                    valA = (strikeA / premiumA); 
                    valB = (b.strikes[0] / b.premium);
                    break;
                default:
                    valA = 0; valB = 0;
            }

            return sortDirection === 'asc' ? valA - valB : valB - valA;
        });
    }, [relevantOrders, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc'); // Default to high-to-low for new fields usually
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <ArrowUpDown size={10} className="opacity-30" />;
        return sortDirection === 'asc' ? <ArrowUpDown size={10} className="transform rotate-180 text-bit-green" /> : <ArrowUpDown size={10} className="text-bit-green" />;
    };

    // Calculate ROI display
    const getRoiDisplay = (order: ParsedOrder) => {
        const strike = order.strikes[0];
        const premium = order.premium;
        if(premium === 0) return "∞";
        
        let roi = 0;
        if (order.isSpread) {
            const width = Math.abs(order.strikes[1] - order.strikes[0]);
             roi = ((width - premium) / premium) * 100;
        } else {
             // Put or Call, simplistic calc
             // For Calls really it's infinite, but let's show implied leverage?
             // Or just "High"
             if (order.direction === 'CALL') return "∞";
             roi = ((strike - premium) / premium) * 100;
        }
        return `${Math.round(roi)}%`;
    }

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center px-2 sm:px-4 bg-black/80 backdrop-blur-sm pt-16 sm:pt-0">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="w-[95%] md:w-full max-w-2xl bg-slate-900 border-4 border-slate-700 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="bg-slate-800 p-3 border-b-4 border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-none animate-pulse ${currentTarget === 'MOON' ? 'bg-bit-green' : 'bg-bit-coral'}`}></div>
                                <h2 className="font-pixel text-slate-200 text-sm md:text-base uppercase tracking-widest">
                                    ORDER MATRIX :: {currentAsset} {'//'} {currentTarget}
                                </h2>
                            </div>
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-5 gap-2 px-4 py-3 bg-slate-900 border-b-2 border-slate-800 font-pixel text-[10px] text-slate-500 uppercase tracking-wider sticky top-0">
                            <div onClick={() => handleSort('strike')} className="flex items-center gap-1 cursor-pointer hover:text-slate-300">
                                <Target size={10} /> TARGET PRICE {getSortIcon('strike')}
                            </div>
                            <div onClick={() => handleSort('expiry')} className="flex items-center gap-1 cursor-pointer hover:text-slate-300">
                                <Clock size={10} /> EXPIRY {getSortIcon('expiry')}
                            </div>
                            <div onClick={() => handleSort('premium')} className="flex items-center gap-1 cursor-pointer hover:text-slate-300">
                                <DollarSign size={10} /> PREMIUM {getSortIcon('premium')}
                            </div>
                            <div onClick={() => handleSort('roi')} className="flex items-center gap-1 cursor-pointer hover:text-slate-300">
                                <TrendingUp size={10} /> MAX ROI {getSortIcon('roi')}
                            </div>
                            <div className="text-right">ACTION</div>
                        </div>

                        {/* Scrollable List */}
                        <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                            {sortedOrders.length === 0 ? (
                                <div className="text-center py-10 font-mono text-slate-600">
                                    NO ORDERS FOUND IN SECTOR
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {sortedOrders.map((order) => (
                                        <motion.div
                                            key={`${order.id}-${order.expiry.getTime?.() ?? order.expiry}-${order.strikes?.[0] ?? 'n/a'}`}
                                            whileHover={{ scale: 1.01, x: 2 }}
                                            onClick={() => onSelect(order)}
                                            className="grid grid-cols-5 gap-2 items-center px-3 py-3 bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:border-slate-500 cursor-pointer transition-all group"
                                        >
                                            <div className="font-mono text-white">
                                                ${order.strikes[0].toLocaleString()}
                                            </div>
                                            <div className="font-mono text-slate-400 text-xs">
                                                {order.expiryFormatted}
                                            </div>
                                            <div className="font-mono text-bit-green">
                                                {order.premiumFormatted}
                                            </div>
                                            <div className="font-pixel text-yellow-400 text-xs">
                                                {getRoiDisplay(order)}
                                            </div>
                                            <div className="text-right">
                                                <button className="px-2 py-1 bg-slate-900 border border-slate-600 text-[10px] font-pixel text-slate-300 group-hover:bg-bit-green group-hover:text-black group-hover:border-green-800 transition-colors">
                                                    SELECT
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Status */}
                        <div className="bg-slate-800 p-2 text-[10px] font-mono text-slate-400 flex justify-between">
                            <span>{sortedOrders.length} SIGNALS FOUND</span>
                            <span>MANUAL OVERRIDE ACTIVE</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
