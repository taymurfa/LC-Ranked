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
        <div className="w-full fade-in z-10 relative">
            <header className="mb-10">
                <h2 className="text-4xl font-headline font-black text-on-surface mb-2 tracking-tight uppercase">Battle Arena</h2>
                <p className="text-on-surface-variant max-w-2xl text-sm">Select your combat parameters and enter the matchmaking queue to face off against global opponents.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Selection */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Select Mode */}
                    <div className="bg-surface-container-low p-6 md:p-8 rounded-xl border border-outline-variant/10 shadow-lg relative overflow-hidden group hover:border-primary/20 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-[100px]">sports_esports</span>
                        </div>
                        <h3 className="text-sm font-headline font-black text-indigo-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">tune</span>
                            Select Mode
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                            {[
                                { title: 'Ranked', desc: 'Climb the global ladder', icon: 'trending_up', activeColor: 'primary' },
                                { title: 'Casual', desc: 'No rating changes', icon: 'sports_esports', activeColor: 'tertiary' },
                                { title: 'Blitz', desc: 'Fast-paced challenges', icon: 'bolt', activeColor: 'secondary' }
                            ].map((m, i) => (
                                <button key={m.title} onClick={() => setMode(i)} className={`flex flex-col gap-2 p-4 rounded-xl border transition-all text-left ${mode === i ? `bg-${m.activeColor}/10 border-${m.activeColor}/50 glow-${m.activeColor}` : 'bg-surface-container border-outline-variant/20 hover:border-outline-variant hover:bg-surface-container-high'}`}>
                                    <div className="flex justify-between items-start w-full">
                                        <span className={`material-symbols-outlined ${mode === i ? `text-${m.activeColor}` : 'text-on-surface-variant'}`}>{m.icon}</span>
                                        {mode === i && <span className={`w-2 h-2 rounded-full bg-${m.activeColor} animate-pulse`}></span>}
                                    </div>
                                    <div>
                                        <div className={`font-headline font-bold uppercase tracking-widest ${mode === i ? `text-${m.activeColor}` : 'text-white'}`}>{m.title}</div>
                                        <div className="text-[10px] text-on-surface-variant mt-1">{m.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Select Difficulty */}
                    <div className="bg-surface-container-low p-6 md:p-8 rounded-xl border border-outline-variant/10 shadow-lg relative overflow-hidden group hover:border-primary/20 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-[100px]">query_stats</span>
                        </div>
                        <h3 className="text-sm font-headline font-black text-indigo-400 tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">speed</span>
                            Select Difficulty
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                            {['Easy', 'Medium', 'Hard', 'Random'].map((d, i) => {
                                const activeColor = i === 0 ? 'tertiary' : i === 1 ? 'secondary' : i === 2 ? 'error' : 'primary';
                                return (
                                    <button 
                                        key={d} 
                                        onClick={() => setDiff(i)} 
                                        className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all font-headline font-bold uppercase tracking-widest text-xs ${diff === i ? `bg-${activeColor}/10 border-${activeColor}/50 text-${activeColor} glow-${activeColor}` : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:border-outline-variant hover:text-white'}`}
                                    >
                                        {d}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Status & Start Block */}
                <aside className="lg:col-span-4 flex flex-col gap-6">
                    <div className={`glass-card p-6 md:p-8 rounded-xl flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden border-t-4 transition-all duration-500 min-h-[300px] ${searching ? 'border-primary glow-primary' : 'border-outline-variant/30'}`}>
                        {searching && <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>}
                        
                        {!searching ? (
                            <div className="relative z-10 flex flex-col items-center w-full">
                                <div className="w-20 h-20 rounded-full bg-surface-container-high border border-outline-variant/30 flex justify-center items-center mb-6">
                                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant">satellite_alt</span>
                                </div>
                                <h3 className="text-xl font-headline font-black text-white mb-2 uppercase tracking-tight">Ready for Combat</h3>
                                <p className="text-xs text-on-surface-variant font-mono mb-8">System Nominal • Latency 14ms</p>
                                
                                <button onClick={startSearch} className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-black tracking-widest uppercase shadow-[0_0_20px_rgba(163,166,255,0.4)] hover:shadow-[0_0_30px_rgba(163,166,255,0.6)] hover:bg-primary-container transition-all active:scale-95 text-sm">
                                    FIND MATCH
                                </button>
                            </div>
                        ) : (
                            <div className="relative z-10 flex flex-col items-center w-full">
                                <div className="relative w-24 h-24 flex justify-center items-center mb-6">
                                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                                    <span className="material-symbols-outlined text-[30px] text-primary animate-pulse">radar</span>
                                </div>
                                <h3 className="text-xl font-headline font-black text-primary mb-2 uppercase tracking-tight animate-pulse">Searching...</h3>
                                <p className="text-2xl font-mono text-white font-bold tracking-widest mb-8">{fmtSecs(secs)}</p>
                                
                                <button onClick={cancel} className="w-full py-4 border border-error/50 bg-error/10 text-error rounded-xl font-headline font-bold tracking-widest uppercase hover:bg-error hover:text-on-error transition-all active:scale-95 text-xs">
                                    ABORT SEARCH
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="bg-surface-container rounded-xl p-6 border border-white/5 grid grid-cols-2 gap-4">
                        <div className="bg-surface-container-low p-4 rounded-xl text-center">
                            <p className="text-2xl font-headline font-bold text-secondary mb-1">{queueCount + 1045}</p>
                            <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Online Now</p>
                        </div>
                        <div className="bg-surface-container-low p-4 rounded-xl text-center">
                            <p className="text-2xl font-headline font-bold text-tertiary mb-1">14ms</p>
                            <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">Latency</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
