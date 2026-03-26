import { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function Matchmaking() {
    const [mode, setMode] = useState(0);
    const [diff, setDiff] = useState(1);
    const [searching, setSearching] = useState(false);
    const [secs, setSecs] = useState(0);
    const [queueCount, setQueueCount] = useState(0);
    const timerRef = useRef(null);
    const socket = useSocket();
    const navigate = useNavigate();

    // Fetch queue stats periodically
    useEffect(() => {
        const fetchStats = () => fetch(`${BACKEND_URL}/api/status`).then(r => r.json()).then(d => setQueueCount(d.queueSize || 0)).catch(() => {});
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('match:found', (data) => {
            clearInterval(timerRef.current);
            navigate(`/battle?id=${data.matchId}`);
        });
        return () => socket.off('match:found');
    }, [socket, navigate]);

    const startSearch = () => {
        if (!socket) return;
        setSearching(true);
        setSecs(0);
        const difficultyLevel = diff === 0 ? 'easy' : diff === 1 ? 'medium' : diff === 2 ? 'hard' : 'random';
        socket.emit('queue:join', { difficulty: difficultyLevel, mode: mode === 0 ? 'ranked' : mode === 1 ? 'casual' : 'blitz' });
        timerRef.current = setInterval(() => setSecs(s => s + 1), 1000);
    };

    const cancel = () => {
        if (socket) socket.emit('queue:leave');
        clearInterval(timerRef.current);
        setSearching(false);
        setSecs(0);
    };

    useEffect(() => () => clearInterval(timerRef.current), []);

    const fmtSecs = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    return (
        <div className="w-full slide-up z-10 relative">
            <div className="mb-10 text-center">
                <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-[0.1em] text-shadow-glow uppercase mb-2">BATTLE_INIT</h1>
                <p className="text-secondary-container uppercase text-xs tracking-widest">SUB_ROUTINE: MATCHMAKING_V4.2</p>
            </div>

            <div className="relative">
                <div className="ascii-border text-secondary-container/40 absolute -top-4 -left-4 w-[110%] h-full pointer-events-none select-none hidden md:block">
                    ╔══════════════════════════════════════════════════════════════════════════════════════╗
                </div>
                <div className="ascii-border text-secondary-container/40 absolute -bottom-4 -left-4 w-[110%] pointer-events-none select-none hidden md:block">
                    ╚══════════════════════════════════════════════════════════════════════════════════════╝
                </div>

                <div className="bg-surface-container-lowest border border-secondary-container/20 p-6 md:p-12 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left Column: Selection */}
                        <div className="space-y-8">
                            <section>
                                <label className="block text-[10px] text-secondary-container mb-4 tracking-[0.2em] uppercase">01 // SELECT_MODE</label>
                                <div className="flex flex-col gap-3">
                                    <button onClick={() => setMode(0)} className={`flex items-center justify-between border px-4 py-3 font-bold group transition-all ${mode === 0 ? 'border-primary-container bg-primary-container text-black text-shadow-glow' : 'border-secondary-container/40 text-secondary-container hover:border-primary-container hover:text-primary-container'}`}>
                                        <span>[1] RANKED</span>
                                        <span className="material-symbols-outlined text-lg">trending_up</span>
                                    </button>
                                    <button onClick={() => setMode(1)} className={`flex items-center justify-between border px-4 py-3 font-bold group transition-all ${mode === 1 ? 'border-primary-container bg-primary-container text-black text-shadow-glow' : 'border-secondary-container/40 text-secondary-container hover:border-primary-container hover:text-primary-container'}`}>
                                        <span>[2] CASUAL</span>
                                        <span className="material-symbols-outlined text-lg">sports_esports</span>
                                    </button>
                                    <button onClick={() => setMode(2)} className={`flex items-center justify-between border px-4 py-3 font-bold group transition-all ${mode === 2 ? 'border-primary-container bg-primary-container text-black text-shadow-glow' : 'border-secondary-container/40 text-secondary-container hover:border-primary-container hover:text-primary-container'}`}>
                                        <span>[3] BLITZ</span>
                                        <span className="material-symbols-outlined text-lg">bolt</span>
                                    </button>
                                </div>
                            </section>

                            <section>
                                <label className="block text-[10px] text-secondary-container mb-4 tracking-[0.2em] uppercase">02 // DIFFICULTY</label>
                                <div className="flex gap-2">
                                    {['EASY', 'MEDIUM', 'HARD', 'RANDOM'].map((d, i) => (
                                        <button 
                                            key={d} 
                                            onClick={() => setDiff(i)} 
                                            className={`flex-1 py-3 border text-xs font-bold transition-all ${diff === i ? 'border-primary-container text-primary-container bg-secondary-container/20 text-shadow-glow' : 'border-secondary-container/40 text-secondary-container hover:bg-secondary-container/10'}`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right Column: System Status */}
                        <div className="flex flex-col justify-between">
                            <div className="space-y-6">
                                <label className="block text-[10px] text-secondary-container mb-4 tracking-[0.2em] uppercase">03 // SYSTEM_STATE</label>
                                
                                {!searching ? (
                                    <div className="bg-black/50 p-6 border-l-2 border-secondary-container space-y-3 font-mono text-sm">
                                        <div className="text-secondary-container flex gap-2">
                                            <span className="opacity-50">&gt;</span>
                                            <span>MAINFRAME_ONLINE</span>
                                        </div>
                                        <div className="text-secondary-container flex gap-2 items-center">
                                            <span className="opacity-50">&gt;</span>
                                            <span>ACTIVE_QUEUES: {queueCount}</span>
                                        </div>
                                        <div className="text-secondary-container flex gap-2 items-center">
                                            <span className="opacity-50">&gt;</span>
                                            <span className="animate-pulse">AWAITING_INPUT...</span>
                                            <span className="cursor-blink">_</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-black/50 p-6 border-l-2 border-primary-container space-y-3 font-mono text-sm">
                                        <div className="text-primary-container flex gap-2">
                                            <span className="opacity-50">&gt;</span>
                                            <span>ESTABLISHING_HANDSHAKE...</span>
                                        </div>
                                        <div className="text-primary-container flex gap-2 items-center">
                                            <span className="opacity-50">&gt;</span>
                                            <span className="animate-pulse">SEARCHING FOR OPPONENT...</span>
                                        </div>
                                        <div className="text-primary-container flex gap-2">
                                            <span className="opacity-50">&gt;</span>
                                            <span className="animate-pulse">SCANNING BRACKET: {fmtSecs(secs)}</span>
                                            <span className="cursor-blink">_</span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="bg-surface-container-low p-3">
                                        <div className="text-[10px] text-secondary-container uppercase mb-1">REGION</div>
                                        <div className="text-primary-container text-xs font-bold">NETWORK_1</div>
                                    </div>
                                    <div className="bg-surface-container-low p-3">
                                        <div className="text-[10px] text-secondary-container uppercase mb-1">PING</div>
                                        <div className="text-primary-container text-xs font-bold">14 MS</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-8">
                                {!searching ? (
                                    <button onClick={startSearch} className="w-full bg-primary-container text-black font-headline font-black py-4 md:text-xl tracking-[0.2em] uppercase transition-all active:scale-[0.98] hover:bg-primary-fixed-dim">
                                        [ ENTER QUEUE ]
                                    </button>
                                ) : (
                                    <button onClick={cancel} className="w-full bg-error-container text-error font-headline font-black py-4 md:text-xl tracking-[0.2em] uppercase transition-all active:scale-[0.98] hover:bg-error-container/80">
                                        [ CANCEL SEARCH ]
                                    </button>
                                )}
                                <p className="text-[9px] text-secondary-container text-center mt-4 uppercase tracking-tighter italic">
                                    ESTIMATED_WAIT_TIME: {searching ? (secs > 15 ? 'UNKNOWN' : '15 SEC') : 'UNKNOWN'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Context Bento */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                <div className="border border-secondary-container/20 p-4 bg-surface-container-lowest">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-secondary-container">groups</span>
                        <h3 className="text-[10px] text-primary-container uppercase font-bold tracking-widest">ACTIVE_OPERATORS</h3>
                    </div>
                    <div className="text-2xl font-headline font-bold text-shadow-glow">{(queueCount * 14) + 12402}</div>
                    <div className="w-full bg-secondary-container/10 h-[2px] mt-4 overflow-hidden">
                        <div className="bg-primary-container h-full w-2/3"></div>
                    </div>
                </div>
                <div className="border border-secondary-container/20 p-4 bg-surface-container-lowest">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-secondary-container">emoji_events</span>
                        <h3 className="text-[10px] text-primary-container uppercase font-bold tracking-widest">SEASON_REWARDS</h3>
                    </div>
                    <div className="text-[11px] text-secondary-container leading-relaxed">
                        CURRENT_CYCLE: PHANTOM_PROTOCOL<br/>
                        END_IN: 14D 02H 11M
                    </div>
                </div>
            </div>
        </div>
    );
}
