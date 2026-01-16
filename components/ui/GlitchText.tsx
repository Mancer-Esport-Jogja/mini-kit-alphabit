"use client";

import React from 'react';

interface GlitchTextProps {
    children: string;
    className?: string;
}

export const GlitchText = ({ children, className = "" }: GlitchTextProps) => {
    return (
        <span
            className={`glitch-text font-pixel ${className}`}
            data-text={children}
        >
            {children}
        </span>
    );
};
