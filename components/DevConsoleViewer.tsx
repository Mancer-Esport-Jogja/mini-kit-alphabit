"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function DevConsoleViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Disabled console interception to prevent React lifecycle violations
  // The console interception was causing "useInsertionEffect must not schedule updates" errors
  // The DevConsole is now just a visual element without actual log capture
  useEffect(() => {
    // No-op - console interception disabled
  }, [isOpen]);

  // Hide button on coming-soon page
  if (pathname === '/coming-soon') {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-0 right-0 w-8 h-8 opacity-100 bg-red-600 hover:bg-red-500 z-[9999] rounded-bl-lg flex items-center justify-center text-[8px] text-white font-bold shadow-lg border border-red-400"
        aria-label="Open Dev Console"
      >
        BUG
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 text-green-400 font-mono text-xs flex flex-col p-4 animate-in fade-in zoom-in duration-200">
      <div className="flex justify-between items-center mb-2 border-b border-green-800 pb-2">
        <h2 className="font-bold text-lg">DEV CONSOLE</h2>
        <div className="flex gap-2">
            <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 border border-red-600 text-red-400 hover:bg-red-900/50 rounded transition-colors"
            >
            Close
            </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto whitespace-pre-wrap font-mono p-2 bg-black/50 rounded border border-green-900/30">
        <div className="text-gray-600 italic text-center mt-10">
          <div className="text-yellow-400 font-bold mb-2">⚠ Console Interception Disabled</div>
          <div className="text-xs">Console interception has been disabled to prevent React lifecycle errors.</div>
          <div className="text-xs mt-2">Check your browser's native console (F12) for logs.</div>
        </div>
      </div>
    </div>
  );
}
