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
        if (!token) return;

        Promise.all([
            fetch(`${BACKEND_URL}/api/profiles/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch(`${BACKEND_URL}/api/profiles/me/matches`, { headers: { Authorization: `Bearer ${token}` } })
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
        fetch(`${BACKEND_URL}/api/leaderboard`)
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
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const matchId = searchParams.get('id');
    const forfeit = searchParams.get('forfeit');
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!matchId || !token) { setLoading(false); return; }
        fetch(`${BACKEND_URL}/api/matches/${matchId}`, {
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
                <div style={{ fontSize: 48, marginBottom: 16 }}>{isSelf ? "\uD83D\uDC80" : "\uD83C\uDFC6"}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: isSelf ? "var(--red)" : "var(--green)", marginBottom: 8 }}>
                    {isSelf ? "Match Forfeited" : "Opponent Forfeited!"}
                </div>
                <div style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
                    {isSelf ? "You were disqualified due to anti-cheat violations." : "Your opponent forfeited. You win!"}
                </div>
                <button onClick={() => navigate('/play')} style={playAgainStyle}>Play Again</button>
            </div>
        );
    }

    if (!match || match.error) {
        return <div style={{ padding: 40, color: "var(--text-2)" }}>Match not found</div>;
    }

    const isA = match.player_a_id === user?.id;
    const myDelta = isA ? match.player_a_delta : match.player_b_delta;
    const myScore = isA ? match.player_a_score : match.player_b_score;
    const oppScore = isA ? match.player_b_score : match.player_a_score;
    const mySubmission = isA ? match.player_a_submission : match.player_b_submission;
    const isWinner = match.winner_id === user?.id;
    const isDraw = match.winner_id === null && match.status === 'completed';

    return (
        <div style={{ maxWidth: 550, margin: "6vh auto", padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{isWinner ? "\uD83C\uDFC6" : isDraw ? "\uD83E\uDD1D" : "\uD83D\uDC80"}</div>
            <div style={{
                fontSize: 24, fontWeight: 700, marginBottom: 8,
                color: isWinner ? "var(--green)" : isDraw ? "var(--text-2)" : "var(--red)",
            }}>
                {isWinner ? "Victory!" : isDraw ? "Draw" : "Defeat"}
            </div>
            {myDelta != null && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: myDelta >= 0 ? "var(--green)" : "var(--red)", marginBottom: 20 }}>
                    {myDelta >= 0 ? '+' : ''}{myDelta} Elo
                </div>
            )}

            {/* Score comparison */}
            {myScore != null && oppScore != null && (
                <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", marginBottom: 20 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>Score</div>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginBottom: 12 }}>
                        <div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: myScore >= oppScore ? "var(--green)" : "var(--text-2)" }}>{myScore}</div>
                            <div style={{ fontSize: 12, color: "var(--text-3)" }}>You</div>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-3)" }}>vs</div>
                        <div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: oppScore > myScore ? "var(--red)" : "var(--text-2)" }}>{oppScore}</div>
                            <div style={{ fontSize: 12, color: "var(--text-3)" }}>Opponent</div>
                        </div>
                    </div>

                    {/* Score bar */}
                    <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden", display: "flex" }}>
                        <div style={{ width: `${(myScore / (myScore + oppScore || 1)) * 100}%`, background: "var(--green)", transition: "width 0.5s ease" }} />
                        <div style={{ flex: 1, background: "var(--red)" }} />
                    </div>

                    {/* Breakdown */}
                    {mySubmission?.score && (
                        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                            {[
                                ["Tests", mySubmission.score.testScore, "/600"],
                                ["Speed", mySubmission.score.speedBonus, "/200"],
                                ["Efficiency", mySubmission.score.efficiencyBonus, "/200"],
                            ].map(([label, val, max]) => (
                                <div key={label} style={{ textAlign: "center" }}>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{val ?? '—'}<span style={{ fontSize: 11, color: "var(--text-3)" }}>{max}</span></div>
                                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Players */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem", display: "inline-flex", gap: 32, marginBottom: 24 }}>
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

            <div>
                <button onClick={() => navigate('/play')} style={playAgainStyle}>Play Again</button>
            </div>
        </div>
    );
}

const playAgainStyle = {
    padding: "12px 32px", borderRadius: 10, fontSize: 15, fontWeight: 600,
    border: "none", background: "var(--accent)", color: "#fff",
    cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.2s",
};
