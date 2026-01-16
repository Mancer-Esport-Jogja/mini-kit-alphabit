"use client";

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface LogEntry {
    id: string;
    title: string;
    details: string;
}

interface TerminalWindowProps {
    title?: string;
    logs: LogEntry[];
}

export const TerminalWindow = ({ title = "DEVELOPER CONSOLE", logs }: TerminalWindowProps) => {
    const [openLogs, setOpenLogs] = useState<string[]>([]);

    const toggleLog = (id: string) => {
        setOpenLogs(prev =>
            prev.includes(id)
                ? prev.filter(logId => logId !== id)
                : [...prev, id]
        );
    };

    return (
        <div className="terminal rounded-lg overflow-hidden">
            {/* Terminal Header */}
            <div className="terminal-header flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="terminal-dot bg-bit-coral"></div>
                    <div className="terminal-dot bg-yellow-500"></div>
                    <div className="terminal-dot bg-bit-green"></div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{title}</span>
                <div className="w-16"></div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 space-y-2">
                {/* Blinking Cursor Header */}
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-bit-green font-mono text-xs">root@alphabit:~$</span>
                    <span className="text-bit-green font-mono text-xs">cat /var/log/hackathon.log</span>
                    <span className="w-2 h-4 bg-bit-green animate-blink"></span>
                </div>

                {/* Log Entries */}
                {logs.map((log, index) => (
                    <details
                        key={log.id}
                        className="group"
                        open={openLogs.includes(log.id)}
                        onClick={(e) => {
                            e.preventDefault();
                            toggleLog(log.id);
                        }}
                    >
                        <summary className="cursor-pointer flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded transition-colors list-none">
                            <ChevronRight
                                className={`w-4 h-4 text-bit-coral transition-transform ${openLogs.includes(log.id) ? 'rotate-90' : ''
                                    }`}
                            />
                            <span className="text-bit-coral font-mono text-xs">
                                [{String(index + 1).padStart(2, '0')}]
                            </span>
                            <span className="text-bit-green font-mono text-xs flex-1">
                                {log.title}
                            </span>
                            <span className="text-slate-600 text-[10px] font-mono">
                                {openLogs.includes(log.id) ? '[-]' : '[+]'}
                            </span>
                        </summary>
                        <div className="ml-6 mt-2 p-3 bg-black/50 border-l-2 border-bit-coral rounded">
                            <p className="text-slate-400 font-mono text-[11px] leading-relaxed">
                                {log.details}
                            </p>
                        </div>
                    </details>
                ))}

                {/* End of Log */}
                <div className="text-slate-600 font-mono text-[10px] mt-4 pt-2 border-t border-slate-800">
                    --- END OF LOG --- [{logs.length} entries]
                </div>
            </div>
        </div>
    );
};
