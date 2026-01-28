"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

type LogType = "log" | "error" | "warn" | "info";

interface LogEntry {
  timestamp: string;
  type: LogType;
  messages: string[];
}

export default function DevConsoleViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Scroll to bottom when logs update
  useEffect(() => {
    if (isOpen && logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const safeStringify = (arg: unknown) => {
        try {
            if (typeof arg === 'object' && arg !== null) {
                // Better handling for Event objects (like WebSocket errors)
                if (arg instanceof Event) {
                   return `[Event type="${arg.type}"]`;
                }
                return JSON.stringify(arg, null, 2);
            }
            return String(arg);
        } catch {
            return '[Circular / Error Stringifying]';
        }
    };

    const addLog = (type: LogType, args: unknown[]) => {
      // Process args for display to avoid storage issues with complex objects if needed, 
      // but keeping them raw for now to stringify in render is better? 
      // Actually stringifying early is safer for state.
      const processedArgs = args.map(arg => {
         if (typeof arg === 'object' && arg !== null) {
             try {
                 // We don't want to JSON.stringify here entirely because we lose interactivity if we were using a real console,
                 // but for this text viewer, stringifying is the expected behavior.
                 return safeStringify(arg);
             } catch {
                 return String(arg);
             }
         }
         return String(arg);
      });

      // Defer state update to avoid "useInsertionEffect must not schedule updates" error
      // when console logs occur during critical render phases (e.g. Radix UI or Emotion warnings)
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString().split("T")[1].slice(0, -1),
        type,
        messages: processedArgs,
      };

      setTimeout(() => {
        setLogs((prev) => [...prev, logEntry]);
      }, 0);
    };

    console.log = (...args) => {
      originalLog.apply(console, args); // Keep original behavior
      addLog("log", args);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      addLog("error", args);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      addLog("warn", args);
    };

    console.info = (...args) => {
      originalInfo.apply(console, args);
      addLog("info", args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, []);

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
            onClick={() => setLogs([])}
            className="px-3 py-1 border border-green-600 hover:bg-green-900/50 rounded transition-colors"
            >
            Clear
            </button>
            <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 border border-red-600 text-red-400 hover:bg-red-900/50 rounded transition-colors"
            >
            Close
            </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto whitespace-pre-wrap font-mono p-2 bg-black/50 rounded border border-green-900/30">
        {logs.length === 0 && <div className="text-gray-600 italic text-center mt-10">Waiting for logs...</div>}
        {logs.map((log, i) => (
          <div key={i} className={`mb-2 border-b border-gray-900 pb-2 last:border-0 ${
                log.type === 'error' ? 'text-red-400 bg-red-950/10' : 
                log.type === 'warn' ? 'text-yellow-400 bg-yellow-950/10' : 
                'text-green-400'
          }`}>
            <div className="flex items-center gap-2 mb-1 opacity-70">
                <span className="text-[10px] text-gray-500">[{log.timestamp}]</span>
                <span className="text-[10px] font-bold uppercase px-1 rounded bg-white/5">{log.type}</span>
            </div>
            <div className="pl-4 break-words">
              {log.messages.map((m, j) => (
                <span key={j} className="mr-1 block">
                  {m}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
