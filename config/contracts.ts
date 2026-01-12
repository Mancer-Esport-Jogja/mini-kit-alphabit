import { defineChain } from "viem";
import { baseSepolia } from "viem/chains";

export const ALPHABIT_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000006"; // Using WETH on Base Sepolia as placeholder
export const CHAIN_ID = baseSepolia.id;

export const ALPHABIT_ABI = [
    {
        inputs: [],
        name: "deposit",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
] as const;
