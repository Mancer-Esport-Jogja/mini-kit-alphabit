"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative w-48 h-48">
          <Image
            src="/logo-alphabit.png"
            alt="Alphabit Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
};
