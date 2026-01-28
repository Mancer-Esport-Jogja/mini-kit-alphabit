"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useDroid } from '@/context/DroidContext';
import { ChatInterface } from './ChatInterface';

export const DroidDrawer = () => {
    const { isDrawerOpen, closeDrawer, isOnboarding } = useDroid();

    // Hide if still onboarding
    if (isOnboarding) return null;

    return (
        <>


            {/* DRAWER PANEL */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeDrawer}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full max-w-sm z-50 shadow-2xl"
                        >
                            <div className="h-full w-full relative">
                                <ChatInterface />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
