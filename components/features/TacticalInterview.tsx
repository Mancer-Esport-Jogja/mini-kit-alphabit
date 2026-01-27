
import React from 'react';
import { Shield, Zap, Clock, Hourglass } from 'lucide-react';
import { InterviewStage } from '@/hooks/useTacticalBrain';

interface TacticalInterviewProps {
    stage: InterviewStage;
    onAnswer: (type: 'RISK' | 'TIMELINE', value: string) => void;
    onCancel: () => void;
}

export const TacticalInterview: React.FC<TacticalInterviewProps> = ({ stage, onAnswer, onCancel }) => {
    if (stage === 'IDLE' || stage === 'INTRO' || stage === 'RECOMMENDING') return null;

    return (
        <div className="mt-2 flex flex-col gap-2">
            {stage === 'RISK' && (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onAnswer('RISK', 'SAFE')}
                        className="flex items-center justify-center gap-1 py-2 px-3 bg-blue-900/40 border border-blue-500 rounded hover:bg-blue-900/60 transition-colors group"
                    >
                        <Shield size={14} className="text-blue-400 group-hover:text-white" />
                        <span className="font-pixel text-[10px] text-blue-300 group-hover:text-white">SAFE</span>
                    </button>
                    <button
                        onClick={() => onAnswer('RISK', 'DEGEN')}
                        className="flex items-center justify-center gap-1 py-2 px-3 bg-red-900/40 border border-red-500 rounded hover:bg-red-900/60 transition-colors group"
                    >
                        <Zap size={14} className="text-red-400 group-hover:text-white" />
                        <span className="font-pixel text-[10px] text-red-300 group-hover:text-white">DEGEN</span>
                    </button>
                </div>
            )}

            {stage === 'TIMELINE' && (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onAnswer('TIMELINE', 'SHORT')}
                        className="flex items-center justify-center gap-1 py-2 px-3 bg-yellow-900/40 border border-yellow-500 rounded hover:bg-yellow-900/60 transition-colors group"
                    >
                        <Clock size={14} className="text-yellow-400 group-hover:text-white" />
                        <span className="font-pixel text-[10px] text-yellow-300 group-hover:text-white">SHORT TERM</span>
                    </button>
                    <button
                        onClick={() => onAnswer('TIMELINE', 'LONG')}
                        className="flex items-center justify-center gap-1 py-2 px-3 bg-purple-900/40 border border-purple-500 rounded hover:bg-purple-900/60 transition-colors group"
                    >
                        <Hourglass size={14} className="text-purple-400 group-hover:text-white" />
                        <span className="font-pixel text-[10px] text-purple-300 group-hover:text-white">LONG TERM</span>
                    </button>
                </div>
            )}

            <button
                onClick={onCancel}
                className="mt-1 text-[9px] font-mono text-slate-500 hover:text-slate-300 underline text-center"
            >
                CANCEL INTERVIEW
            </button>
        </div>
    );
};
