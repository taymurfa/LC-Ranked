import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';

export function ProfilePage() {
    const { token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        Promise.all([
            fetch('/api/profiles/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch('/api/profiles/me/matches', { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.ok ? r.json() : { matches: [] })
                .catch(() => ({ matches: [] })),
        ]).then(([profileData, matchData]) => {
            setProfile(profileData);
            setMatches(matchData.matches || []);
        }).finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div style={{ padding: 40, color: "var(--text-2)" }}>Loading profile...</div>;
    if (!profile || profile.error) return <div style={{ padding: 40, color: "var(--red)" }}>Failed to load profile</div>;

    return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "2rem" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem", marginBottom: 24 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{profile.username}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent-bright)", marginBottom: 16 }}>{profile.rank || ''}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                    {[
                        ["Elo", profile.elo],
                        ["Wins", profile.wins],
                        ["Losses", profile.losses],
                        ["Matches", profile.match_count],
                    ].map(([label, val]) => (
                        <div key={label} style={{ textAlign: "center" }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: "var(--green)" }}>{val}</div>
                            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Recent Matches</div>
            {matches.length === 0 && <div style={{ color: "var(--text-2)", fontSize: 14 }}>No matches yet</div>}
            {matches.map(m => (
                <div key={m.id} style={{
                    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8,
                    padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                    <div>
                        <span style={{ fontSize: 13, color: "var(--text)" }}>
                            {m.player_a?.username} vs {m.player_b?.username}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", marginLeft: 8 }}>{m.difficulty}</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                        {m.winner_id === profile.id
                            ? <span style={{ color: "var(--green)" }}>+{Math.abs(m.player_a_id === profile.id ? m.player_a_delta : m.player_b_delta) || 0}</span>
                            : m.winner_id === null
                            ? <span style={{ color: "var(--text-3)" }}>Draw</span>
                            : <span style={{ color: "var(--red)" }}>{m.player_a_id === profile.id ? m.player_a_delta : m.player_b_delta}</span>
                        }
                    </div>
                </div>
            ))}
        </div>
    );
}

export function LeaderboardPage() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/leaderboard')
            .then(r => r.json())
            .then(data => setPlayers(data.players || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: 40, color: "var(--text-2)" }}>Loading leaderboard...</div>;

    return (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>Leaderboard</div>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{
                    display: "grid", gridTemplateColumns: "50px 1fr 80px 80px 60px",
                    padding: "10px 16px", borderBottom: "1px solid var(--border)",
                    fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.5px",
                }}>
                    <div>#</div><div>Player</div><div>Elo</div><div>Tier</div><div>W/R</div>
                </div>
                {players.map(p => (
                    <div key={p.id} style={{
                        display: "grid", gridTemplateColumns: "50px 1fr 80px 80px 60px",
                        padding: "10px 16px", borderBottom: "1px solid var(--border)",
                        fontSize: 13, color: "var(--text)",
                    }}>
                        <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>{p.rank}</div>
                        <div style={{ fontWeight: 500 }}>{p.username}</div>
                        <div style={{ fontFamily: "var(--font-mono)", color: "var(--accent-bright)" }}>{p.elo}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-2)" }}>{p.tier}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-2)" }}>{p.winRate}%</div>
                    </div>
                ))}
                {players.length === 0 && <div style={{ padding: 20, color: "var(--text-2)", textAlign: "center" }}>No players yet</div>}
            </div>
        </div>
    );
}

export function ResultPage() {
    const { token, user } = useAuth();
    const [searchParams] = useSearchParams();
    const matchId = searchParams.get('id');
    const forfeit = searchParams.get('forfeit');
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!matchId || !token) { setLoading(false); return; }
        fetch(`/api/matches/${matchId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(setMatch)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [matchId, token]);

    if (loading) return <div style={{ padding: 40, color: "var(--text-2)" }}>Loading result...</div>;

    if (forfeit) {
        const isSelf = forfeit === 'self';
        return (
            <div style={{ maxWidth: 500, margin: "10vh auto", padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{isSelf ? "💀" : "🏆"}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: isSelf ? "var(--red)" : "var(--green)", marginBottom: 8 }}>
                    {isSelf ? "Match Forfeited" : "Opponent Forfeited!"}
                </div>
                <div style={{ fontSize: 14, color: "var(--text-2)" }}>
                    {isSelf ? "You were disqualified due to anti-cheat violations." : "Your opponent forfeited. You win!"}
                </div>
            </div>
        );
    }

    if (!match || match.error) {
        return <div style={{ padding: 40, color: "var(--text-2)" }}>Match not found</div>;
    }

    const isA = match.player_a_id === user?.id;
    const myDelta = isA ? match.player_a_delta : match.player_b_delta;
    const isWinner = match.winner_id === user?.id;
    const isDraw = match.winner_id === null && match.status === 'completed';

    return (
        <div style={{ maxWidth: 500, margin: "10vh auto", padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{isWinner ? "🏆" : isDraw ? "🤝" : "💀"}</div>
            <div style={{
                fontSize: 24, fontWeight: 700, marginBottom: 8,
                color: isWinner ? "var(--green)" : isDraw ? "var(--text-2)" : "var(--red)",
            }}>
                {isWinner ? "Victory!" : isDraw ? "Draw" : "Defeat"}
            </div>
            {myDelta != null && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: myDelta >= 0 ? "var(--green)" : "var(--red)", marginBottom: 16 }}>
                    {myDelta >= 0 ? '+' : ''}{myDelta} Elo
                </div>
            )}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem", display: "inline-flex", gap: 32 }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, color: "var(--text-2)" }}>{match.player_a?.username || 'Player A'}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)" }}>{match.player_a?.elo}</div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-3)", alignSelf: "center" }}>vs</div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, color: "var(--text-2)" }}>{match.player_b?.username || 'Player B'}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)" }}>{match.player_b?.elo}</div>
                </div>
            </div>
        </div>
    );
}
