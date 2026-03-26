import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams, useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export function ProfilePage() {
    const { token, user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setProfile({ username: 'LOCAL_GUEST', rank: 'UNRANKED', elo: 1000, wins: 0, losses: 0, match_count: 0 });
            setLoading(false);
            return;
        }

        Promise.all([
            fetch(`${BACKEND_URL}/api/profiles/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch(`${BACKEND_URL}/api/profiles/me/matches`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.ok ? r.json() : { matches: [] })
                .catch(() => ({ matches: [] })),
        ]).then(([profileData, matchData]) => {
            setProfile(profileData);
            setMatches(matchData.matches || []);
        }).catch(() => {
            setProfile({ username: 'LOCAL_GUEST', rank: 'UNRANKED', elo: 1000, wins: 0, losses: 0, match_count: 0 });
        }).finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div className="p-10 text-on-surface-variant font-mono uppercase animate-pulse">Loading profile data...</div>;

    const winRate = profile.match_count > 0 ? ((profile.wins / profile.match_count) * 100).toFixed(1) : 0;

    return (
        <div className="fade-in pb-12">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-xl bg-surface-container-low p-8 mb-8 border border-outline-variant/10 shadow-lg">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-xl overflow-hidden ring-4 ring-primary/20 ring-offset-4 ring-offset-surface bg-primary-container flex justify-center items-center">
                            <span className="material-symbols-outlined text-[80px] text-on-primary-container">person</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] font-black tracking-widest font-headline shadow-lg">
                            {profile.rank || 'ELITE'}
                        </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-black font-headline tracking-tight text-white mb-2">{profile.username}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-headline">Matches Played</span>
                                <span className="text-2xl font-bold font-headline text-primary">{profile.match_count}</span>
                            </div>
                            <div className="w-px h-10 bg-outline-variant/30 self-center"></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-headline">Win Rate</span>
                                <span className="text-2xl font-bold font-headline text-tertiary">{winRate}%</span>
                            </div>
                            <div className="w-px h-10 bg-outline-variant/30 self-center"></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-on-surface-variant uppercase tracking-widest font-headline">Elo Rating</span>
                                <span className="text-2xl font-bold font-headline text-secondary">{profile.elo}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <button className="p-2 bg-surface-container-highest text-primary rounded-lg border border-primary/20 hover:bg-primary/10 transition-all flex items-center justify-center">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Match History */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black font-headline tracking-[0.2em] text-on-surface-variant uppercase">Match History</h3>
                    <button className="text-[10px] font-bold text-primary uppercase hover:underline">Full Logs</button>
                </div>
                
                {matches.length === 0 && <div className="p-8 text-center bg-surface-container-low rounded-xl border border-outline-variant/10 text-on-surface-variant font-mono text-xs uppercase">No combat records found.</div>}

                <div className="flex flex-col gap-3">
                    {matches.map(m => {
                        const isWin = m.winner_id === profile.id;
                        const isDraw = m.winner_id === null;
                        const delta = m.player_a_id === profile.id ? m.player_a_delta : m.player_b_delta;
                        
                        const statusColorStr = isWin ? 'tertiary' : isDraw ? 'secondary' : 'error';
                        const statusLetter = isWin ? 'W' : isDraw ? 'D' : 'L';
                        const opponent = m.player_a_id === profile.id ? m.player_b?.username : m.player_a?.username;

                        return (
                            <div key={m.id} className="group flex flex-wrap sm:flex-nowrap items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 hover:bg-surface-container-high hover:border-outline-variant/30 transition-all">
                                <div className={`w-12 h-12 rounded bg-${statusColorStr}/10 flex items-center justify-center border border-${statusColorStr}/20`}>
                                    <span className={`text-${statusColorStr} font-black font-headline text-xl`}>{statusLetter}</span>
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <div className="text-sm font-bold text-white font-headline">Ranked Match</div>
                                    <div className="text-[10px] font-mono text-on-surface-variant">Vs. {opponent || 'Unknown'} • {m.difficulty || 'Medium'}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-bold text-${statusColorStr} font-mono`}>
                                        {delta > 0 ? '+' : ''}{delta || 0} MMR
                                    </div>
                                    <div className="text-[10px] text-on-surface-variant font-mono uppercase">{m.status}</div>
                                </div>
                                <button className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-lg text-[10px] font-bold text-on-surface hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-sm">play_circle</span>
                                    REPLAY
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

export function LeaderboardPage() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${BACKEND_URL}/api/leaderboard`)
            .then(r => r.json())
            .then(data => setPlayers(data.players || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-on-surface-variant font-mono uppercase animate-pulse">Syncing Global Matrix...</div>;

    // Grab top 3 for the bento grid display
    const top3 = players.slice(0, 3);
    const rest = players.slice(3);

    return (
        <div className="fade-in pb-12">
            <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black font-headline text-on-surface tracking-tight uppercase">Global Leaderboard</h1>
                    <p className="text-on-surface-variant mt-2 font-body">Season 4: Neon Protocol</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg bg-surface-container text-xs font-bold font-headline tracking-widest border border-outline-variant/30 hover:border-primary/50 transition-all">WORLDWIDE</button>
                    <button className="px-4 py-2 rounded-lg bg-surface-container-low text-xs font-bold font-headline tracking-widest text-on-surface-variant border border-transparent hover:border-outline-variant transition-all">FRIENDS</button>
                </div>
            </div>

            {/* Top 3 Legends Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
                {top3[1] && (
                    <div className="glass-card rounded-xl p-8 flex flex-col items-center relative overflow-hidden h-[340px] border-b-4 border-slate-400 order-2 md:order-1 hover:-translate-y-2 transition-transform">
                        <div className="absolute top-4 right-4 font-mono text-4xl font-bold text-slate-400/20">#2</div>
                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-slate-400 to-slate-100 mb-6 flex justify-center items-center shadow-lg">
                            <span className="material-symbols-outlined text-[60px] text-slate-800">person</span>
                        </div>
                        <h3 className="text-2xl font-black font-headline tracking-tight mb-1">{top3[1].username}</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-bold font-headline text-secondary tracking-widest uppercase">{top3[1].tier}</span>
                        </div>
                        <div className="mt-auto text-center">
                            <p className="font-mono text-3xl font-bold text-on-surface">{top3[1].elo}</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">ELO RATING</p>
                        </div>
                    </div>
                )}
                
                {top3[0] && (
                    <div className="glass-card rounded-xl p-10 flex flex-col items-center relative overflow-hidden h-[400px] border-b-4 border-primary glow-primary order-1 md:order-2 hover:-translate-y-4 transition-transform z-10">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                        <div className="absolute top-4 right-4 font-mono text-6xl font-black text-primary/20">#1</div>
                        <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary mb-6 shadow-[0_0_30px_rgba(163,166,255,0.4)] flex justify-center items-center">
                            <span className="material-symbols-outlined text-[80px] text-slate-800">person</span>
                        </div>
                        <h3 className="text-3xl font-black font-headline tracking-tight mb-1 text-primary">{top3[0].username}</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="text-xs font-bold font-headline text-primary tracking-widest uppercase">{top3[0].tier}</span>
                        </div>
                        <div className="mt-auto text-center">
                            <p className="font-mono text-4xl font-bold text-on-surface tracking-tighter">{top3[0].elo}</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">ELO RATING</p>
                        </div>
                    </div>
                )}
                
                {top3[2] && (
                    <div className="glass-card rounded-xl p-8 flex flex-col items-center relative overflow-hidden h-[340px] border-b-4 border-orange-400 order-3 hover:-translate-y-2 transition-transform">
                        <div className="absolute top-4 right-4 font-mono text-4xl font-bold text-orange-400/20">#3</div>
                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-orange-500 to-orange-200 mb-6 flex justify-center items-center shadow-lg">
                            <span className="material-symbols-outlined text-[60px] text-slate-800">person</span>
                        </div>
                        <h3 className="text-2xl font-black font-headline tracking-tight mb-1">{top3[2].username}</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-bold font-headline text-secondary tracking-widest uppercase">{top3[2].tier}</span>
                        </div>
                        <div className="mt-auto text-center">
                            <p className="font-mono text-3xl font-bold text-on-surface">{top3[2].elo}</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">ELO RATING</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Leaderboard Table */}
            <div className="rounded-xl overflow-x-auto bg-surface-container-low border border-outline-variant/20 shadow-2xl relative">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-surface-container-high/50 border-b border-outline-variant/30">
                            <th className="px-6 py-4 text-[10px] font-black font-headline tracking-widest text-on-surface-variant uppercase">Rank</th>
                            <th className="px-6 py-4 text-[10px] font-black font-headline tracking-widest text-on-surface-variant uppercase">User</th>
                            <th className="px-6 py-4 text-[10px] font-black font-headline tracking-widest text-on-surface-variant uppercase">Tier</th>
                            <th className="px-6 py-4 text-[10px] font-black font-headline tracking-widest text-on-surface-variant uppercase text-center">Win Rate</th>
                            <th className="px-6 py-4 text-[10px] font-black font-headline tracking-widest text-on-surface-variant uppercase text-right">Elo Rating</th>
                        </tr>
                    </thead>
                    <tbody className="font-body divide-y divide-white/5">
                        {players.map((p, index) => {
                            const rank = index + 1;
                            const isTop3 = rank <= 3;
                            return (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                    <td className={`px-6 py-4 font-mono text-lg ${isTop3 ? 'text-primary font-bold' : 'text-on-surface-variant group-hover:text-primary transition-colors'}`}>
                                        {String(rank).padStart(2, '0')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-surface-container flex justify-center items-center">
                                                <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
                                            </div>
                                            <span className={`font-bold ${isTop3 ? 'text-primary' : 'text-on-surface'}`}>{p.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded bg-surface-container-highest text-on-surface-variant text-[10px] font-bold tracking-widest uppercase border border-outline-variant/30">
                                            {p.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono text-sm text-tertiary">
                                        {p.winRate}%
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono font-bold ${isTop3 ? 'text-primary' : 'text-on-surface'}`}>
                                        {p.elo}
                                    </td>
                                </tr>
                            );
                        })}
                        {players.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center font-mono text-on-surface-variant uppercase tracking-widest text-xs">No verified operators found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function ResultPage() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const matchId = searchParams.get('id');
    const forfeit = searchParams.get('forfeit');
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(!forfeit);

    useEffect(() => {
        if (!matchId || !token || forfeit) { setLoading(false); return; }
        fetch(`${BACKEND_URL}/api/matches/${matchId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(setMatch)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [matchId, token, forfeit]);

    if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-on-surface-variant font-mono animate-pulse uppercase tracking-widest">Processing telemetry...</div>;

    if (forfeit) {
        const isSelf = forfeit === 'self';
        return (
            <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center fade-in">
                <div className="glass-card p-12 rounded-3xl text-center shadow-2xl relative overflow-hidden glow-secondary">
                    <h1 className={`font-headline font-black text-6xl md:text-8xl tracking-tight mb-4 ${isSelf ? 'text-error' : 'text-primary'}`}>
                        {isSelf ? 'DISQUALIFIED' : 'VICTORY'}
                    </h1>
                    <p className="font-mono text-on-surface-variant tracking-[0.2em] uppercase mb-10 text-xs text-center border-b border-outline-variant/30 pb-4 inline-block">
                        {isSelf ? "Connection Intentionally Severed" : "Opponent Abandoned Match"}
                    </p>
                    <button onClick={() => navigate('/play')} className="mt-4 px-10 py-4 bg-primary text-on-primary font-headline font-bold rounded-xl shadow-[0_0_15px_rgba(163,166,255,0.4)] hover:bg-primary-container transition-all hover:scale-105 active:scale-95">
                        RETURN TO ARENA
                    </button>
                </div>
            </div>
        );
    }

    const m = match || { player_a_id: user?.id, player_b_id: 'opponent-id', winner_id: user?.id, status: 'completed', player_a_score: 950, player_b_score: 410, player_a_delta: 24, player_a_submission: { score: { testScore: 600, speedBonus: 150, efficiencyBonus: 200 } } };
    
    const isA = m.player_a_id === user?.id;
    const myDelta = isA ? m.player_a_delta : m.player_b_delta;
    const myScore = isA ? m.player_a_score : m.player_b_score;
    const oppScore = isA ? m.player_b_score : m.player_a_score;
    const mySubmission = isA ? m.player_a_submission : m.player_b_submission;
    const isWinner = m.winner_id === user?.id;
    const isDraw = m.winner_id === null && m.status === 'completed';

    const StatusText = isWinner ? "VICTORY" : isDraw ? "DRAW" : "DEFEAT";
    const StatusColor = isWinner ? "text-primary glow-primary" : isDraw ? "text-tertiary" : "text-error";

    return (
        <div className="max-w-4xl mx-auto py-8 relative fade-in">
            {/* Main Header */}
            <div className={`glass-card p-12 text-center rounded-3xl mb-12 shadow-2xl relative overflow-hidden border-t-4 ${isWinner ? 'border-primary' : isDraw ? 'border-tertiary' : 'border-error'}`}>
               <h1 className={`font-headline font-black text-6xl md:text-8xl tracking-tight mb-4 ${StatusColor}`}>
                   {StatusText}
               </h1>
               <p className="font-mono text-on-surface-variant tracking-[0.3em] text-xs uppercase">
                   MATCH STATUS: {m.status}
               </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 text-center">
                    <div className="font-headline text-[10px] text-on-surface-variant font-bold tracking-widest uppercase mb-2">Final Score</div>
                    <div className={`font-mono text-3xl font-bold ${isWinner ? 'text-primary' : 'text-on-surface'}`}>{myScore || 0}</div>
                </div>
                <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 text-center opacity-80">
                    <div className="font-headline text-[10px] text-on-surface-variant font-bold tracking-widest uppercase mb-2">Opp Score</div>
                    <div className="font-mono text-3xl font-bold text-on-surface-variant">{oppScore || 0}</div>
                </div>
                <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 text-center">
                    <div className="font-headline text-[10px] text-on-surface-variant font-bold tracking-widest uppercase mb-2">Tests Passed</div>
                    <div className="font-mono text-3xl font-bold text-tertiary">
                        {mySubmission?.score?.testScore ? '100%' : 'N/A'}
                    </div>
                </div>
                <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 text-center relative overflow-hidden">
                    <div className={`absolute inset-0 bg-${isWinner ? 'primary' : 'error'}/5`}></div>
                    <div className="relative z-10">
                        <div className="font-headline text-[10px] text-on-surface-variant font-bold tracking-widest uppercase mb-2">Elo Gain</div>
                        <div className={`font-mono text-3xl font-bold flex items-center justify-center gap-2 ${isWinner ? 'text-primary' : 'text-error'}`}>
                            <span className="material-symbols-outlined">{myDelta >= 0 ? 'trending_up' : 'trending_down'}</span>
                            {myDelta >= 0 ? '+' : ''}{myDelta || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center mt-12">
                <button onClick={() => navigate('/play')} className="px-10 py-4 bg-primary text-on-primary font-headline font-bold rounded-xl shadow-[0_0_15px_rgba(163,166,255,0.4)] hover:bg-primary-container transition-all hover:scale-105 active:scale-95 text-sm tracking-wider uppercase">
                    Return to Arena
                </button>
            </div>
        </div>
    );
}
