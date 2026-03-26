import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams, useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export function ProfilePage() {
    const { token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            // Mock profile if missing token
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

    if (loading) return <div className="p-10 text-secondary-container font-mono uppercase animate-pulse">Loading profile_data...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 fade-in">
            <div className="mb-8">
                <div className="text-secondary-container text-xs mb-2 tracking-[0.2em] font-bold">SYSTEM_DIR: /ROOT/OPERATOR/PROFILE</div>
                <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary-container text-shadow-glow tracking-tighter uppercase leading-none">
                    OPERATOR_DOSSIER<span className="animate-pulse">_</span>
                </h1>
            </div>

            {/* Profile Stats Matrix */}
            <div className="border border-primary-container/40 bg-surface-container-lowest p-6 mb-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary-container"></div>
                <div className="absolute top-2 right-2 text-primary-container/20 font-mono text-[100px] leading-none select-none opacity-20 material-symbols-outlined">account_circle</div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex-1">
                        <div className="text-3xl font-headline font-bold text-primary-container tracking-widest uppercase text-shadow-glow mb-1">{profile.username}</div>
                        <div className="text-xs font-mono text-secondary-container tracking-widest uppercase">RANK_DESIGNATION: {profile.rank || 'EVALUATING'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-primary-container/20 border border-primary-container/40 mt-8">
                    {[
                        ["CURRENT_ELO", profile.elo],
                        ["VICTORIES", profile.wins],
                        ["DEFEATS", profile.losses],
                        ["TOTAL_ENGAGEMENTS", profile.match_count],
                    ].map(([label, val]) => (
                        <div key={label} className="bg-black p-4">
                            <div className="font-mono text-[10px] text-secondary-container mb-1 tracking-widest">{label}</div>
                            <div className="font-mono text-xl text-primary-container font-bold uppercase">{val}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Match History Log */}
            <div>
                <div className="flex items-center gap-3 mb-4 text-primary-container border-b border-primary-container/30 pb-2">
                    <span className="material-symbols-outlined text-sm">history</span>
                    <span className="font-headline font-bold text-xs uppercase tracking-widest">COMBAT_LOGS</span>
                </div>
                
                {matches.length === 0 && <div className="p-6 text-center border border-dashed border-secondary-container/40 text-secondary-container font-mono text-xs uppercase">No combat records found in main database.</div>}
                
                <div className="space-y-2">
                    {matches.map(m => {
                        const isWin = m.winner_id === profile.id;
                        const isDraw = m.winner_id === null;
                        const delta = m.player_a_id === profile.id ? m.player_a_delta : m.player_b_delta;
                        
                        return (
                            <div key={m.id} className="flex justify-between items-center p-4 bg-surface-container-lowest border border-secondary-container/20 hover:border-primary-container/50 transition-colors">
                                <div>
                                    <div className="text-xs font-mono text-on-surface mb-1">
                                        <span className="text-secondary-container">VS </span> 
                                        {m.player_a?.username} <span className="text-secondary-container opacity-50">/</span> {m.player_b?.username}
                                    </div>
                                    <div className="text-[10px] font-mono text-secondary-container space-x-3 uppercase">
                                        <span className={m.difficulty === 'hard' ? 'text-error' : m.difficulty === 'medium' ? 'text-tertiary-fixed-dim' : 'text-primary-container'}>[{m.difficulty}]</span>
                                        <span>MATCH_ID: #{m.id.substring(0, 8)}</span>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div className="text-[10px] font-mono uppercase tracking-widest">
                                        {isWin ? <span className="text-primary-container">SUCCESS</span> : isDraw ? <span className="text-secondary-container">DRAW</span> : <span className="text-error">FAILURE</span>}
                                    </div>
                                    <div className={`font-mono text-sm font-bold w-12 text-right tracking-widest ${isWin ? 'text-primary-container text-shadow-glow' : isDraw ? 'text-secondary-container' : 'text-error'}`}>
                                        {delta > 0 ? '+' : ''}{delta || 0}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
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

    if (loading) return <div className="p-10 text-secondary-container font-mono uppercase animate-pulse">Syncing Global Matrix...</div>;

    return (
        <div className="max-w-5xl mx-auto py-8 fade-in">
            <div className="mb-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                        <div className="text-secondary-container text-xs mb-2 tracking-[0.2em] font-bold">SYSTEM_DIR: /ROOT/LADDER/GLOBAL</div>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold text-primary-container text-shadow-glow tracking-tighter uppercase leading-none">
                            GLOBAL_RANKINGS<span className="animate-pulse">_</span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="w-full relative overflow-x-auto bg-surface-container-lowest border border-primary-container/20">
                <table className="w-full font-mono text-xs text-left">
                    <thead>
                        <tr className="text-secondary-container border-b border-primary-container/30 bg-black/50 tracking-widest">
                            <th className="py-4 px-6 border-r border-primary-container/10">RANK</th>
                            <th className="py-4 px-6 border-r border-primary-container/10">HANDLE</th>
                            <th className="py-4 px-6 border-r border-primary-container/10">ELO_RATING</th>
                            <th className="py-4 px-6 border-r border-primary-container/10">W/R_RATIO</th>
                            <th className="py-4 px-6">TIER_CLASS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((p, index) => (
                            <tr key={p.id} className="border-b border-primary-container/10 hover:bg-primary-container/5 transition-colors group">
                                <td className={`py-4 px-6 border-r border-primary-container/10 ${index < 3 ? 'text-primary-container font-bold text-shadow-glow' : 'text-secondary-container'}`}>
                                    {String(p.rank).padStart(3, '0')}
                                </td>
                                <td className="py-4 px-6 border-r border-primary-container/10 font-bold uppercase text-on-surface group-hover:text-primary-container transition-colors">
                                    @{p.username}
                                </td>
                                <td className={`py-4 px-6 border-r border-primary-container/10 font-bold ${index < 3 ? 'text-primary-container' : 'text-secondary-container'}`}>
                                    {p.elo}
                                </td>
                                <td className="py-4 px-6 border-r border-primary-container/10 text-primary-container/70">
                                    {p.winRate}%
                                </td>
                                <td className="py-4 px-6 text-primary-container/90 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[14px]">
                                        {index < 3 ? 'military_tech' : 'shield'}
                                    </span>
                                    {p.tier}
                                </td>
                            </tr>
                        ))}
                        {players.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-10 text-center text-secondary-container tracking-widest uppercase">No verified operators found</td>
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

    if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-secondary-container font-mono animate-pulse uppercase tracking-widest">Compiling Battle Report...</div>;

    if (forfeit) {
        const isSelf = forfeit === 'self';
        return (
            <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center fade-in">
                <div className="absolute -z-10 text-[400px] text-error/5 select-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 material-symbols-outlined">
                    {isSelf ? 'skull' : 'military_tech'}
                </div>
                <h1 className={`font-headline font-bold text-6xl md:text-[100px] tracking-tighter uppercase mb-4 ${isSelf ? 'text-error shadow-[0_0_30px_rgba(255,0,60,0.3)]' : 'text-primary-container text-shadow-glow'}`}>
                    {isSelf ? 'DISQUALIFIED' : 'VICTORY'}
                </h1>
                <p className="font-mono text-secondary-container tracking-[0.5em] uppercase mb-12 text-center text-xs">
                    {isSelf ? "ANTICHEAT_SYSTEM_VIOLATION_DETECTED" : "OPPONENT_ABORTED_CONNECTION"}
                </p>
                <button onClick={() => navigate('/play')} className="px-10 py-4 bg-primary-container text-black font-mono font-bold tracking-widest uppercase hover:bg-white transition-all hover:scale-105">
                    [ RETURN_TO_BASE ]
                </button>
            </div>
        );
    }

    // Default mock data if no backend connection
    const m = match || { player_a_id: user?.id, player_b_id: 'opponent-id', winner_id: user?.id, status: 'completed', player_a_score: 950, player_b_score: 410, player_a_delta: 24, player_a_submission: { score: { testScore: 600, speedBonus: 150, efficiencyBonus: 200 } } };
    
    const isA = m.player_a_id === user?.id;
    const myDelta = isA ? m.player_a_delta : m.player_b_delta;
    const myScore = isA ? m.player_a_score : m.player_b_score;
    const oppScore = isA ? m.player_b_score : m.player_a_score;
    const mySubmission = isA ? m.player_a_submission : m.player_b_submission;
    const isWinner = m.winner_id === user?.id;
    const isDraw = m.winner_id === null && m.status === 'completed';

    const ThemeColor = isWinner ? "text-primary-container" : isDraw ? "text-tertiary-fixed-dim" : "text-error";
    const GlowColor = isWinner ? "shadow-[0_0_30px_rgba(0,255,65,0.4)]" : isDraw ? "" : "shadow-[0_0_30px_rgba(255,0,60,0.4)]";
    const StatusText = isWinner ? "SUCCESSFUL_BREACH" : isDraw ? "STALEMATE_ACHIEVED" : "SYSTEM_COMPROMISED";
    const BigText = isWinner ? "VICTORY" : isDraw ? "DRAW" : "DEFEAT";

    return (
        <div className="max-w-4xl mx-auto py-8 relative fade-in">
            {/* Main Header */}
            <div className="text-center mb-16 relative z-10">
                <h1 className={`font-headline font-bold text-[80px] md:text-[120px] leading-none tracking-tighter uppercase ${ThemeColor} ${GlowColor}`}>
                    {BigText}
                </h1>
                <p className="font-mono text-secondary-container text-xs mt-4 tracking-[0.5em] uppercase">
                    SYSTEM_VALIDATED // {StatusText}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-primary-container/20 border border-primary-container/40 p-1 mb-12">
                <div className="bg-black p-6">
                    <div className="font-mono text-[10px] text-secondary-container mb-1 tracking-widest">FINAL_SCORE</div>
                    <div className={`font-mono text-2xl font-bold uppercase ${ThemeColor}`}>{myScore || 0}</div>
                </div>
                <div className="bg-black p-6">
                    <div className="font-mono text-[10px] text-secondary-container mb-1 tracking-widest">OPP_SCORE</div>
                    <div className="font-mono text-2xl font-bold uppercase text-secondary-container">{oppScore || 0}</div>
                </div>
                <div className="bg-black p-6">
                    <div className="font-mono text-[10px] text-secondary-container mb-1 tracking-widest">TESTS_PASSED</div>
                    <div className="font-mono text-xl font-bold uppercase text-primary-container">
                        {mySubmission?.score?.testScore ? '100%' : 'UNKNOWN'}
                    </div>
                </div>
                <div className="bg-black p-6">
                    <div className="font-mono text-[10px] text-secondary-container mb-1 tracking-widest">ELO_DELTA</div>
                    <div className={`font-mono text-2xl font-bold uppercase flex items-center gap-2 ${ThemeColor}`}>
                        <span className="material-symbols-outlined text-lg">{myDelta >= 0 ? 'trending_up' : 'trending_down'}</span>
                        {myDelta >= 0 ? '+' : ''}{myDelta || 0}
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown */}
            {mySubmission?.score && (
                <div className="border border-primary-container/20 bg-surface-container-lowest p-6 mb-12">
                    <div className="flex items-center gap-3 mb-6 text-primary-container">
                        <span className="material-symbols-outlined text-sm">analytics</span>
                        <span className="font-headline font-bold text-xs uppercase tracking-widest">BREAKDOWN_ANALYTICS</span>
                    </div>

                    <div className="space-y-4 font-mono text-xs text-secondary-container/80">
                        <div className="flex justify-between items-center bg-black p-3 border border-secondary-container/10">
                            <span>TEST_CASE_COMPLETION (BASE)</span>
                            <span className="text-primary-container font-bold">[{mySubmission.score.testScore} / 600 PTS]</span>
                        </div>
                        <div className="flex justify-between items-center bg-black p-3 border border-secondary-container/10">
                            <span>EXECUTION_SPEED_BONUS</span>
                            <span className="text-primary-container font-bold">[{mySubmission.score.speedBonus} / 200 PTS]</span>
                        </div>
                        <div className="flex justify-between items-center bg-black p-3 border border-secondary-container/10">
                            <span>ALGORITHMIC_EFFICIENCY_BONUS</span>
                            <span className="text-primary-container font-bold">[{mySubmission.score.efficiencyBonus} / 200 PTS]</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-6 mt-16 pb-12">
                <button onClick={() => navigate('/play')} className="px-10 py-4 bg-primary-container text-black font-mono font-bold text-sm tracking-widest transition-transform hover:scale-105 hover:bg-white active:scale-95 uppercase shadow-[0_0_15px_rgba(0,255,65,0.3)]">
                    [ RETURN_TO_BASE ]
                </button>
            </div>
        </div>
    );
}
