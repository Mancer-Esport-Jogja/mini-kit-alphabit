import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ArcadeButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const ArcadeButton = ({ variant = "primary", size = "md", className = "", children, ...props }: ArcadeButtonProps) => {
  const baseStyles = "relative font-pixel uppercase tracking-widest transition-all active:translate-y-1";
  
  const variantStyles = {
    primary: "bg-emerald-500 border-b-4 border-emerald-800 text-white shadow-[0_4px_0_#064e3b]",
    danger: "bg-rose-500 border-b-4 border-rose-800 text-white shadow-[0_4px_0_#881337]",
    warning: "bg-yellow-400 border-b-4 border-yellow-700 text-black shadow-[0_4px_0_#a16207]",
  };

  const sizeStyles = {
    sm: "px-2 py-1 text-[10px]",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm w-full",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity" />
      {children}
    </motion.button>
  );
};
