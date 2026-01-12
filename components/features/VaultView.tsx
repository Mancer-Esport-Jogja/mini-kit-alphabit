import React from 'react';
import { Shield, Flame, Coins } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';
import { VaultVisualizer } from '@/components/ui/VaultVisualizer';

export const VAULT_CONFIG = [
    {
        id: 'v1',
        name: 'ETH COVERED CALL',
        alias: 'SHIELD GENERATOR',
        type: 'CONSERVATIVE',
        apy: '12.5%',
        apyVal: 12.5,
        tvl: '450 ETH',
        tvlVal: 75,
        risk: 'LOW',
        desc: 'Automated strategy selling OTM calls. Steady yield accumulation.',
        humanDesc: 'You rent out your ETH. You get guaranteed rent (Yield). BUT, if ETH price skyrockets (To The Moon), your upside is capped. Good for crab markets.',
        color: 'text-blue-400',
        bg: 'bg-blue-900',
        borderColor: 'border-blue-500',
        barColor: 'bg-blue-500',
        icon: Shield,
        status: 'STABLE'
    },
    {
        id: 'v2',
        name: 'ETH PUT SELLING',
        alias: 'MAGMA REACTOR',
        type: 'AGGRESSIVE',
        apy: '45.2%',
        apyVal: 85,
        tvl: '120 ETH',
        tvlVal: 40,
        risk: 'HIGH',
        desc: 'High-frequency put selling strategy. Maximum yield output.',
        humanDesc: 'You agree to buy ETH if it dips, at a discount. You get paid well for this promise. BUT, if ETH crashes hard, you are "forced" to buy ETH at a price potentially higher than market.',
        color: 'text-orange-400',
        bg: 'bg-orange-900',
        borderColor: 'border-orange-500',
        barColor: 'bg-orange-500',
        icon: Flame,
        status: 'CRITICAL'
    }
];

export const VaultView = ({ onSelectVault }: { onSelectVault: (vault: typeof VAULT_CONFIG[0]) => void }) => {
    return (
        <div>
            <div className="mb-4 text-center">
                <h1 className="text-sm text-blue-400 mb-2 font-pixel">YIELD GENERATORS</h1>
                <p className="text-[8px] text-slate-400 font-mono">DEPLOY ASSETS TO POWER UP</p>
            </div>

            {VAULT_CONFIG.map((vault) => (
                <PixelCard key={vault.id} title={vault.alias} borderColor={vault.borderColor}>
                    <div className="flex items-start gap-4 mb-2">
                        <div className={`w-10 h-10 border-2 border-black flex items-center justify-center bg-slate-900 ${vault.color}`}>
                            <vault.icon className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <h3 className={`text-sm font-bold ${vault.color} mb-0.5 font-pixel`}>{vault.name}</h3>
                            <span className="bg-slate-700 text-white text-[8px] px-1 py-0.5 font-pixel">RISK: {vault.risk}</span>
                        </div>
                    </div>

                    <VaultVisualizer vault={vault} />

                    <PixelButton
                        label="DEPLOY ASSETS"
                        subLabel="EARN YIELD"
                        color="bg-slate-700"
                        hoverColor="hover:bg-slate-600"
                        icon={Coins}
                        onClick={() => onSelectVault(vault)}
                    />
                </PixelCard>
            ))}
        </div>
    );
};
