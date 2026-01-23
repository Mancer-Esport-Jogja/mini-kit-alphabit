import { motion, AnimatePresence } from 'framer-motion';
import { useTacticalBrain, Sentiment } from '../../hooks/useTacticalBrain';

interface TacticalDroidProps {
    marketStats: {
        callVolume: number;
        putVolume: number;
        spreadSize: number;
    };
    tutorialStep?: number;
    onNext?: () => void;
}

export const TacticalDroid = ({ marketStats, tutorialStep = 0, onNext }: TacticalDroidProps) => {
    const { dialogue, sentiment, isTalking } = useTacticalBrain(marketStats, true, tutorialStep);

    // Dynamic color based on sentiment
    const getLightColor = (s: Sentiment) => {
        switch (s) {
            case 'BULLISH': return 'bg-green-500 shadow-[0_0_15px_#22c55e]';
            case 'BEARISH': return 'bg-red-500 shadow-[0_0_15px_#ef4444]';
            case 'DANGER': return 'bg-yellow-500 animate-pulse shadow-[0_0_20px_#eab308]';
            case 'TUTORIAL': return 'bg-purple-500 shadow-[0_0_15px_#a855f7]';
            default: return 'bg-blue-400 shadow-[0_0_10px_#60a5fa]';
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none">
            {/* Speech Bubble */}
            <AnimatePresence mode="wait">
                {isTalking && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="mb-4 mr-4 bg-[#1a1b26] border-2 border-[#4ADE80] p-4 rounded-tl-xl rounded-tr-xl rounded-bl-xl max-w-xs relative pointer-events-auto font-pixel text-xs leading-relaxed text-white shadow-lg"
                    >
                        <span className={`font-bold block mb-1 ${tutorialStep > 0 ? 'text-purple-400' : 'text-[#4ADE80]'}`}>
                            R.O.B.B.I.E. 9000
                        </span>
                        {dialogue}

                        {/* Tutorial Next Button */}
                        {tutorialStep > 0 && onNext && (
                            <button
                                onClick={onNext}
                                className="mt-3 w-full py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded border-b-2 border-purple-800 active:border-b-0 active:translate-y-[2px] transition-all"
                            >
                                NEXT &gt;&gt;
                            </button>
                        )}

                        {/* Pixelated tailored arrow */}
                        <div className={`absolute -bottom-[10px] right-0 w-0 h-0 
              border-l-[10px] border-l-transparent
              border-t-[10px] ${tutorialStep > 0 ? 'border-t-[#4ADE80]' : 'border-t-[#4ADE80]'}
              border-r-[0px] border-r-transparent`}>
                        </div>
                        <div className="absolute -bottom-[6px] right-[3px] w-0 h-0 
              border-l-[6px] border-l-transparent
              border-t-[6px] border-t-[#1a1b26]
              border-r-[0px] border-r-transparent">
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Droid Avatar (CSS Art / Shapes) */}
            <motion.div
                animate={{
                    y: [0, -10, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative w-24 h-24 pointer-events-auto cursor-help group"
                onClick={onNext} // Creating a click handler on the droid to advance tutorial too
            >
                {/* Head */}
                <div className="absolute top-2 left-2 w-20 h-16 bg-slate-700 border-4 border-black rounded-lg overflow-hidden">
                    {/* Eye Screen */}
                    <div className="absolute top-3 left-2 w-14 h-6 bg-black rounded-sm flex items-center justify-center gap-2 overflow-hidden">
                        {/* Eyes */}
                        <motion.div
                            animate={{ height: isTalking ? [2, 12, 4, 12] : 4 }}
                            className={`w-3 ${getLightColor(sentiment)} transition-colors duration-500`}
                        />
                        <motion.div
                            animate={{ height: isTalking ? [2, 12, 4, 12] : 4 }}
                            className={`w-3 ${getLightColor(sentiment)} transition-colors duration-500`}
                        />
                    </div>
                    {/* Mouth/Grill */}
                    <div className="absolute bottom-2 left-4 w-10 h-2 flex gap-[2px]">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex-1 bg-slate-500" />
                        ))}
                    </div>
                </div>

                {/* Antenna */}
                <motion.div
                    animate={{ rotate: [0, 10, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 right-6 w-1 h-6 bg-slate-500 border border-black origin-bottom"
                >
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full border border-black animate-pulse" />
                </motion.div>

                {/* Neck */}
                <div className="absolute bottom-4 left-8 w-8 h-4 bg-slate-800 border-x-2 border-black -z-10" />

                {/* Shadow */}
                <div className="absolute bottom-0 left-4 w-16 h-2 bg-black/40 blur-sm rounded-full" />
            </motion.div>
        </div>
    );
};
