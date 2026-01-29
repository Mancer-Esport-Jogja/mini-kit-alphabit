"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

// Define log types for better type safety
type LogType = 'log' | 'error' | 'warn' | 'info' | 'api';

interface LogEntry {
  timestamp: string;
  type: LogType;
  messages: string[];
  // API-specific metadata
  apiUrl?: string;
  apiMethod?: string;
  apiStatus?: number;
  apiResponse?: unknown;
}

export default function DevConsoleViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Auto-scroll to bottom of logs
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
    const originalFetch = window.fetch;

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

    const addLog = (type: LogType, args: unknown[], apiData?: {
      url?: string;
      method?: string;
      status?: number;
      response?: unknown;
    }) => {
      const processedArgs = args.map(arg => {
         if (typeof arg === 'object' && arg !== null) {
             try {
                 return safeStringify(arg);
             } catch {
                 return String(arg);
             }
         }
         return String(arg);
      });

      // Defer state update to avoid "useInsertionEffect must not schedule updates" error
      // This ensures the state update happens outside the current render cycle
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString().split("T")[1].slice(0, -1),
        type,
        messages: processedArgs,
        ...(apiData && {
          apiUrl: apiData.url,
          apiMethod: apiData.method,
          apiStatus: apiData.status,
          apiResponse: apiData.response,
        }),
      };

      setTimeout(() => {
        setLogs((prev) => [...prev, logEntry]);
      }, 0);
    };

    // Override console methods
    console.log = (...args) => {
      originalLog.apply(console, args);
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

    // Override fetch to capture API calls
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const [resource, options] = args;
      const url = typeof resource === 'string' ? resource : (resource instanceof Request ? resource.url : String(resource));
      const method = options?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        
        // Clone response to read body without consuming it
        const clonedResponse = response.clone();
        
        let responseData;
        try {
          const contentType = clonedResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            responseData = await clonedResponse.json();
          } else {
            responseData = await clonedResponse.text();
          }
        } catch {
          responseData = '[Unable to parse response]';
        }

        // Log API call with response
        addLog('api', [`${method} ${url}`], {
          url,
          method,
          status: response.status,
          response: responseData,
        });

        return response;
      } catch (error) {
        // Log failed API call
        addLog('api', [`${method} ${url} - FAILED`], {
          url,
          method,
          status: 0,
          response: error instanceof Error ? error.message : 'Request failed',
        });
        throw error;
      }
    };

    // Cleanup: Restore original console methods and fetch
    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
      window.fetch = originalFetch;
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
                className="px-3 py-1 border border-green-600 text-green-400 hover:bg-green-900/50 rounded transition-colors mr-2"
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
        {logs.length === 0 && (
            <div className="text-gray-600 italic text-center mt-10">No logs captured yet...</div>
        )}
        {logs.map((log, index) => {
            const isApiLog = log.type === 'api';
            
            return (
              <div key={index} className={`mb-2 border-b border-gray-800/50 pb-2 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'warn' ? 'text-yellow-400' : 
                  log.type === 'api' ? 'text-cyan-400' :
                  'text-green-400'
              }`}>
                  <div className="flex items-start gap-2">
                      <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                      <span className="uppercase font-bold text-[10px] mr-2 opacity-75">[{log.type}]</span>
                      
                      {isApiLog && log.apiStatus && (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold mr-2 ${
                              log.apiStatus >= 200 && log.apiStatus < 300 
                                  ? 'bg-green-900/50 text-green-300' 
                                  : log.apiStatus >= 400 
                                  ? 'bg-red-900/50 text-red-300'
                                  : 'bg-yellow-900/50 text-yellow-300'
                          }`}>
                              {log.apiStatus}
                          </span>
                      )}
                      
                      <span className="flex-1">{log.messages.join(' ')}</span>
                  </div>
                  
                  {isApiLog && log.apiResponse !== undefined && log.apiResponse !== null && (
                      <details className="mt-2 ml-4 border-l-2 border-cyan-700/50 pl-3">
                          <summary className="cursor-pointer text-cyan-300/70 hover:text-cyan-300 text-[10px] font-semibold mb-1">
                              📦 Response Data
                          </summary>
                          <pre className="text-[10px] text-cyan-200/80 bg-black/30 p-2 rounded mt-1 overflow-x-auto max-h-60 overflow-y-auto">
                              {(() => {
                                const response = log.apiResponse;
                                if (typeof response === 'string') return response;
                                try {
                                  return JSON.stringify(response, null, 2);
                                } catch {
                                  return String(response);
                                }
                              })()}
                          </pre>
                      </details>
                  )}
              </div>
            );
        })}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
