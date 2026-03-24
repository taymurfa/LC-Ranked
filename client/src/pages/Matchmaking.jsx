import { useState, useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const MODES = [
    { icon: "⚔", name: "Ranked", desc: "Earn or lose Elo", k: "K=24 · Medium" },
    { icon: "◎", name: "Casual", desc: "No rating on the line", k: "No Elo change" },
    { icon: "▲", name: "Blitz", desc: "10 min · Easy only", k: "K=16 · Fast" },
];
const DIFFS = ["Easy · K16", "Medium · K24", "Hard · K32", "Random"];

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
        socket.emit('queue:join', { difficulty: difficultyLevel, mode: MODES[mode].name.toLowerCase() });
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
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "3rem 2rem", animation: "slideUp 0.25s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-1px", color: "var(--text)", marginBottom: 8 }}>Find a match</div>
                <div style={{ fontSize: 15, color: "var(--text-2)" }}>Paired with a player near your rating</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
                {MODES.map((m, i) => (
                    <div key={m.name} onClick={() => setMode(i)} style={{
                        background: mode === i ? "var(--accent-dim)" : "var(--surface)",
                        border: `1px solid ${mode === i ? 'rgba(162,155,254,0.35)' : 'var(--border)'}`,
                        borderRadius: 12, padding: "1.25rem", cursor: "pointer",
                        transition: "all 0.2s",
                    }}>
                        <div style={{ fontSize: 22, marginBottom: 10 }}>{m.icon}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{m.desc}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)", marginTop: 8 }}>{m.k}</div>
                    </div>
                ))}
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Difficulty</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {DIFFS.map((d, i) => (
                    <button key={d} onClick={() => setDiff(i)} style={{
                        flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        border: `1px solid ${diff === i ? 'var(--accent)' : 'var(--border)'}`,
                        background: diff === i ? "var(--accent-dim)" : "var(--surface)",
                        color: diff === i ? "var(--text)" : "var(--text-2)",
                        cursor: "pointer", fontFamily: "var(--font-mono)", transition: "all 0.15s",
                    }}>{d}</button>
                ))}
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem" }}>
                {!searching ? (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 20 }}>
                            {[[String(queueCount), "in queue"], ["<45s", "avg wait"], ["1350–1420", "your bracket"]].map(([v, l]) => (
                                <div key={l} style={{ textAlign: "center" }}>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: "var(--green)" }}>{v}</div>
                                    <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{l}</div>
                                </div>
                            ))}
                        </div>
                        <button onClick={startSearch} style={{
                            width: "100%", padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600,
                            border: "none", background: "var(--accent)", color: "#fff",
                            cursor: "pointer", transition: "all 0.2s",
                        }}>Find match</button>
                    </>
                ) : (
                    <div style={{ textAlign: "center", padding: "1rem 0" }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: "50%",
                            border: "2px solid var(--border-2)", borderTopColor: "var(--accent)",
                            animation: "spin 1s linear infinite", margin: "0 auto 16px",
                        }} />
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-2)" }}>Searching for opponent...</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-3)", marginTop: 8 }}>{fmtSecs(secs)}</div>
                        <button onClick={cancel} style={{
                            marginTop: 14, fontSize: 13, color: "var(--text-3)", background: "transparent",
                            border: "none", cursor: "pointer", textDecoration: "underline",
                        }}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
}
