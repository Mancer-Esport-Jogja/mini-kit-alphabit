"use client";

import React from "react";
import { motion } from "framer-motion";

interface MarqueeProps {
  text: string;
  speed?: number;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({ 
  text, 
  speed = 15, 
  className = "" 
}) => {
  return (
    <div className={`flex overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div
        className="flex"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <span className="pr-4">{text}</span>
        <span className="pr-4">{text}</span>
      </motion.div>
    </div>
  );
};
