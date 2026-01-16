import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'void-black': '#0A0A0A',
                'bit-coral': '#E85A5A',      // Primary brand color - dominant
                'bit-green': '#4ADE80',       // Success/CALL/profit
                'bit-dark': '#1a1a2e',        // Dark accent
            },
            fontFamily: {
                pixel: ['var(--font-pixel)', 'monospace'],
                grotesk: ['var(--font-grotesk)', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
                'scanline': 'scanline 4s linear infinite',
                'glitch': 'glitch 0.3s ease-in-out infinite',
                'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'blink': 'blink 1s step-end infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scanline: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' },
                },
                glitch: {
                    '0%, 100%': { transform: 'translate(0)' },
                    '20%': { transform: 'translate(-2px, 2px)' },
                    '40%': { transform: 'translate(-2px, -2px)' },
                    '60%': { transform: 'translate(2px, 2px)' },
                    '80%': { transform: 'translate(2px, -2px)' },
                },
                pulseNeon: {
                    '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor' },
                    '50%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                blink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' },
                },
            }
        },
    },
    plugins: [],
};
export default config;
