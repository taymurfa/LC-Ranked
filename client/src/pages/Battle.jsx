import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';

function CodeLine({ line }) {
  const kws = ["class", "def", "if", "return", "not", "in", "del"];
  const rest = line.trimStart();
  const indentMatch = line.match(/^(\s*)/);
  const indent = indentMatch ? indentMatch[1] : "";
  const tokens = rest.split(/(\b\w+\b|[^\w\s]+|\s+)/g).filter(Boolean);

  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: "1.8", whiteSpace: "pre" }}>
      {indent}{tokens.map((tok, i) => {
        if (kws.includes(tok)) return <span key={i} style={{ color: "#bd93f9" }}>{tok}</span>;
        if (/^[A-Z]/.test(tok)) return <span key={i} style={{ color: "#ffb86c" }}>{tok}</span>;
        if (/^-?\d+$/.test(tok)) return <span key={i} style={{ color: "var(--amber)" }}>{tok}</span>;
        if (tok === "self") return <span key={i} style={{ color: "#8be9fd" }}>{tok}</span>;
        return <span key={i} style={{ color: "var(--text)" }}>{tok}</span>;
      })}
    </div>
  );
}

const LANGUAGES = ["Python 3", "JavaScript", "Java", "C++"];

export default function Battle() {
  const socket = useSocket();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('id');

  const { tabWarnings, faceOk, acAlert, setAcAlert } = useAntiCheat(socket, matchId);

  // Match state
  const [matchStarted, setMatchStarted] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(30 * 60);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [myInfo, setMyInfo] = useState(null);
  const [opponentInfo, setOpponentInfo] = useState(null);
  const [opponentProgress, setOpponentProgress] = useState({ testsPassed: 0, testsTotal: 1 });

  // Editor state
  const [code, setCode] = useState('# Write your solution here\n');
  const [language, setLanguage] = useState("Python 3");
  const [testsPassed, setTestsPassed] = useState(0);
  const [testsTotal, setTestsTotal] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const startTimeRef = useRef(null);
  const codeRef = useRef(null);

  // Send match:ready when we have socket + matchId
  useEffect(() => {
    if (!socket || !matchId) return;
    socket.emit('match:ready', { matchId });
  }, [socket, matchId]);

  // Listen for match lifecycle events
  useEffect(() => {
    if (!socket) return;

    const onMatchStart = ({ startTime, durationSeconds: dur }) => {
      startTimeRef.current = startTime;
      setDurationSeconds(dur);
      setTimeLeft(dur);
      setMatchStarted(true);
    };

    const onOpponentProgress = ({ testsPassed: tp, testsTotal: tt }) => {
      setOpponentProgress({ testsPassed: tp, testsTotal: tt });
    };

    const onForfeit = ({ reason }) => {
      navigate(`/result?id=${matchId}&forfeit=self&reason=${reason}`);
    };

    const onOpponentForfeit = () => {
      navigate(`/result?id=${matchId}&forfeit=opponent`);
    };

    socket.on('match:start', onMatchStart);
    socket.on('opponent:progress', onOpponentProgress);
    socket.on('match:forfeit', onForfeit);
    socket.on('match:opponent_forfeit', onOpponentForfeit);

    return () => {
      socket.off('match:start', onMatchStart);
      socket.off('opponent:progress', onOpponentProgress);
      socket.off('match:forfeit', onForfeit);
      socket.off('match:opponent_forfeit', onOpponentForfeit);
    };
  }, [socket, matchId, navigate]);

  // Load match data from API to get player info
  useEffect(() => {
    if (!matchId || !token) return;
    fetch(`/api/matches/${matchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.player_a && data.player_b) {
          const isA = data.player_a_id === user?.id;
          setMyInfo(isA ? data.player_a : data.player_b);
          setOpponentInfo(isA ? data.player_b : data.player_a);
        }
      })
      .catch(() => {});
  }, [matchId, token, user?.id]);

  // Countdown timer
  useEffect(() => {
    if (!matchStarted) return;
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [matchStarted]);

  // Show anti-cheat modal
  useEffect(() => {
    if (acAlert) setShowModal(true);
  }, [acAlert]);

  // Report progress to opponent
  const reportProgress = useCallback((passed, total) => {
    if (socket && matchId) {
      socket.emit('match:progress', { matchId, testsPassed: passed, testsTotal: total });
    }
  }, [socket, matchId]);

  // Submit solution
  const handleSubmit = async () => {
    if (submitting || !token) return;
    setSubmitting(true);

    const elapsed = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : durationSeconds - timeLeft;

    try {
      const res = await fetch(`/api/matches/${matchId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId,
          code,
          language,
          testsPassed,
          testsTotal,
          durationSeconds: elapsed,
        }),
      });
      const data = await res.json();
      if (data.status === 'completed') {
        navigate(`/result?id=${matchId}`);
      }
      // If "waiting", stay on page — opponent hasn't submitted yet
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 120;
  const tabOk = tabWarnings === 0;
  const oppProgressPct = opponentProgress.testsTotal > 0
    ? Math.round((opponentProgress.testsPassed / opponentProgress.testsTotal) * 100)
    : 0;

  const myName = myInfo?.username || 'You';
  const myElo = myInfo?.elo || '—';
  const oppName = opponentInfo?.username || 'Opponent';
  const oppElo = opponentInfo?.elo || '—';

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 52px)" }}>
      {/* Anti-cheat bar */}
      <div style={{
        height: 38, display: "flex", alignItems: "center", gap: 20,
        padding: "0 16px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        {[
          [tabOk ? "var(--green)" : "var(--amber)", !tabOk, `Tab: ${tabOk ? "focused" : `warned ×${tabWarnings}`}`],
          [faceOk ? "var(--green)" : "var(--red)", !faceOk, faceOk ? "Face detected" : "Face not visible"],
          ["var(--green)", false, "Keystroke: normal"],
        ].map(([color, pulse, label], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0,
              boxShadow: `0 0 6px ${color}`,
              animation: pulse ? "pulse 1s ease infinite" : "none",
            }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-2)" }}>{label}</span>
          </div>
        ))}

        {acAlert && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--amber-dim)", border: "1px solid rgba(255,211,42,0.3)",
            borderRadius: 7, padding: "4px 12px",
            fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--amber)",
          }}>
            {acAlert}
          </div>
        )}
      </div>

      {!matchStarted && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              border: "2px solid var(--border-2)", borderTopColor: "var(--accent)",
              animation: "spin 1s linear infinite", margin: "0 auto 16px",
            }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-2)" }}>Waiting for opponent to ready up...</div>
          </div>
        </div>
      )}

      {matchStarted && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", flex: 1, overflow: "hidden" }}>
          {/* Left: problem */}
          <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{
              height: 46, display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 16px", borderBottom: "1px solid var(--border)",
              background: "var(--surface)", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{myName} <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)" }}>(you)</span></div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)" }}>{myElo}</div>
                </div>
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, letterSpacing: 2,
                color: urgent ? "var(--red)" : "var(--amber)",
                animation: urgent ? "pulse 0.6s ease infinite" : "none",
              }}>{mins}:{String(secs).padStart(2, "0")}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>@{oppName}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)" }}>{oppElo}</div>
                </div>
              </div>
            </div>
            {/* Opponent progress */}
            <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.6px" }}>Opponent progress</div>
              <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${oppProgressPct}%`, background: "var(--red)", borderRadius: 2, transition: "width 0.3s ease" }} />
              </div>
            </div>
            {/* Problem */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.3px", marginBottom: 8 }}>LRU Cache</div>
              <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.8 }}>
                <p>Design a data structure following the constraints of a Least Recently Used (LRU) cache.</p>
                <p style={{ marginTop: 10 }}>Implement the LRUCache class:</p>
                <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                  <li><code>LRUCache(int capacity)</code> — Initialize the LRU cache with positive size capacity.</li>
                  <li><code>int get(int key)</code> — Return the value of the key if it exists, otherwise return -1.</li>
                  <li><code>void put(int key, int value)</code> — Update or insert the value. When the cache reaches capacity, evict the least recently used key.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: editor */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{
              height: 40, display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 14px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0,
            }}>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--surface-2)",
                  border: "1px solid var(--border)", color: "var(--text-2)", borderRadius: 6,
                  padding: "3px 8px", cursor: "pointer",
                }}
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <div style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
                Tests: <span style={{ color: testsPassed === testsTotal ? "var(--green)" : "var(--text-2)" }}>{testsPassed}/{testsTotal}</span>
              </div>
            </div>

            <textarea
              ref={codeRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1, padding: "14px 16px", background: "var(--bg)",
                color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 13,
                lineHeight: "1.8", border: "none", outline: "none", resize: "none",
                overflowY: "auto",
              }}
            />

            <div style={{
              height: 50, display: "flex", alignItems: "center", gap: 10,
              padding: "0 14px", borderTop: "1px solid var(--border)",
              background: "var(--surface)", flexShrink: 0,
            }}>
              <button
                onClick={() => reportProgress(testsPassed, testsTotal)}
                style={{
                  padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600,
                  border: "1px solid var(--border-2)", background: "transparent",
                  color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-sans)",
                }}
              >Run tests</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: "7px 18px", borderRadius: 7, fontSize: 13, fontWeight: 600,
                  border: "none", background: submitting ? "var(--surface-2)" : "var(--green)",
                  color: submitting ? "var(--text-2)" : "#000",
                  cursor: submitting ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)",
                }}
              >{submitting ? "Submitting..." : "Submit"}</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.2s ease",
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid rgba(255,107,129,0.3)",
            borderRadius: 14, padding: "2rem", maxWidth: 400, width: "90%", textAlign: "center",
          }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>&#9888;&#65039;</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--red)", marginBottom: 8 }}>Anti-cheat Warning</div>
            <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 12 }}>
              {acAlert}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--amber)", marginBottom: 20 }}>
              3 violations = automatic forfeit
            </div>
            <button onClick={() => { setShowModal(false); setAcAlert(null); }} style={{
              padding: "10px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: "none", background: "var(--red)", color: "#fff", cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>Resume battle</button>
          </div>
        </div>
      )}
    </div>
  );
}
