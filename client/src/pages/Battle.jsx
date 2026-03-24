import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const LANGUAGES = ["Python 3", "JavaScript", "Java", "C++"];
const LANG_KEYS = { "Python 3": "python3", "JavaScript": "javascript", "Java": "java", "C++": "cpp" };

export default function Battle() {
  const socket = useSocket();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('id');

  const { tabWarnings, acAlert, setAcAlert } = useAntiCheat(socket, matchId);

  // Match state
  const [matchStarted, setMatchStarted] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(30 * 60);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [myInfo, setMyInfo] = useState(null);
  const [opponentInfo, setOpponentInfo] = useState(null);
  const [opponentProgress, setOpponentProgress] = useState({ testsPassed: 0, testsTotal: 1 });
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);

  // Problem state
  const [problem, setProblem] = useState(null);
  const [problemId, setProblemId] = useState(null);

  // Editor state
  const [code, setCode] = useState('# Write your solution here\n');
  const [language, setLanguage] = useState("Python 3");
  const [testsPassed, setTestsPassed] = useState(0);
  const [testsTotal, setTestsTotal] = useState(0);

  // Run/Submit state
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [outputTab, setOutputTab] = useState('tests'); // 'tests' | 'output'

  const [showModal, setShowModal] = useState(false);
  const startTimeRef = useRef(null);

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

    const onOpponentSubmitted = () => setOpponentSubmitted(true);

    const onForfeit = ({ reason }) => {
      navigate(`/result?id=${matchId}&forfeit=self&reason=${reason}`);
    };

    const onOpponentForfeit = () => {
      navigate(`/result?id=${matchId}&forfeit=opponent`);
    };

    const onMatchCompleted = () => {
      navigate(`/result?id=${matchId}`);
    };

    socket.on('match:start', onMatchStart);
    socket.on('opponent:progress', onOpponentProgress);
    socket.on('opponent:submitted', onOpponentSubmitted);
    socket.on('match:forfeit', onForfeit);
    socket.on('match:opponent_forfeit', onOpponentForfeit);
    socket.on('match:completed', onMatchCompleted);

    return () => {
      socket.off('match:start', onMatchStart);
      socket.off('opponent:progress', onOpponentProgress);
      socket.off('opponent:submitted', onOpponentSubmitted);
      socket.off('match:forfeit', onForfeit);
      socket.off('match:opponent_forfeit', onOpponentForfeit);
      socket.off('match:completed', onMatchCompleted);
    };
  }, [socket, matchId, navigate]);

  // Load match data + problem
  useEffect(() => {
    if (!matchId || !token) return;
    fetch(`${BACKEND_URL}/api/matches/${matchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.player_a && data.player_b) {
          const isA = data.player_a_id === user?.id;
          setMyInfo(isA ? data.player_a : data.player_b);
          setOpponentInfo(isA ? data.player_b : data.player_a);
        }
        if (data.problem_id) {
          setProblemId(data.problem_id);
        }
      })
      .catch(() => {});
  }, [matchId, token, user?.id]);

  // Fetch problem details
  useEffect(() => {
    if (!problemId) return;
    fetch(`${BACKEND_URL}/api/problems/${problemId}`)
      .then(r => r.json())
      .then(data => {
        setProblem(data);
        // Set starter code for current language
        const langKey = LANG_KEYS[language];
        if (data.starter_code && data.starter_code[langKey]) {
          setCode(data.starter_code[langKey]);
        }
      })
      .catch(() => {});
  }, [problemId]); // intentionally not depending on language here

  // Update starter code when language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const langKey = LANG_KEYS[newLang];
    if (problem?.starter_code?.[langKey]) {
      setCode(problem.starter_code[langKey]);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!matchStarted) return;
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) {
          clearInterval(t);
          // Auto-submit on timeout
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [matchStarted]);

  useEffect(() => {
    if (acAlert) setShowModal(true);
  }, [acAlert]);

  // Run tests (sample only)
  const handleRunTests = async () => {
    if (running || !token || !problemId) return;
    setRunning(true);
    setTestResults(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/execute/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ matchId, problemId, code, language }),
      });
      const data = await res.json();
      if (data.results) {
        setTestResults(data.results);
        setTestsPassed(data.passed);
        setTestsTotal(data.total);
        // Relay progress to opponent
        if (socket && matchId) {
          socket.emit('match:progress', { matchId, testsPassed: data.passed, testsTotal: data.total });
        }
      } else if (data.error) {
        setTestResults([{ testCase: 0, passed: false, error: data.error }]);
      }
    } catch (err) {
      setTestResults([{ testCase: 0, passed: false, error: err.message }]);
    } finally {
      setRunning(false);
    }
  };

  // Submit (all tests, server-validated scoring)
  const handleSubmit = async () => {
    if (submitting || !token) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/matches/${matchId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (data.status === 'completed') {
        navigate(`/result?id=${matchId}`);
      } else if (data.status === 'waiting') {
        // Show test results while waiting
        if (data.testResult?.results) {
          setTestResults(data.testResult.results);
          setTestsPassed(data.testResult.passed);
          setTestsTotal(data.testResult.total);
        }
      }
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

  const diffColors = { easy: 'var(--green)', medium: 'var(--amber)', hard: 'var(--red)' };

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
        {opponentSubmitted && (
          <div style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--amber)" }}>
            Opponent has submitted
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
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{myName} <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)" }}>(you)</span></div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)" }}>{myElo}</div>
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, letterSpacing: 2,
                color: urgent ? "var(--red)" : "var(--amber)",
                animation: urgent ? "pulse 0.6s ease infinite" : "none",
              }}>{mins}:{String(secs).padStart(2, "0")}</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>@{oppName}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)" }}>{oppElo}</div>
              </div>
            </div>

            {/* Opponent progress */}
            <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.6px" }}>Opponent progress</div>
              <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${oppProgressPct}%`, background: "var(--red)", borderRadius: 2, transition: "width 0.3s ease" }} />
              </div>
            </div>

            {/* Problem content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
              {problem ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.3px" }}>{problem.title}</span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
                      color: diffColors[problem.difficulty] || "var(--text-2)",
                      background: "var(--surface-2)", padding: "2px 8px", borderRadius: 4,
                      textTransform: "capitalize",
                    }}>{problem.difficulty}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                    {problem.description}
                  </div>

                  {problem.examples && problem.examples.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      {problem.examples.map((ex, i) => (
                        <div key={i} style={{ background: "var(--surface-2)", borderRadius: 8, padding: "12px 16px", marginBottom: 8, fontFamily: "var(--font-mono)", fontSize: 13 }}>
                          <div style={{ color: "var(--text-3)", marginBottom: 4 }}>Example {i + 1}:</div>
                          <div style={{ color: "var(--text)" }}>Input: {ex.input}</div>
                          <div style={{ color: "var(--text)" }}>Output: {ex.output}</div>
                          {ex.explanation && <div style={{ color: "var(--text-3)", marginTop: 4 }}>Explanation: {ex.explanation}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {problem.constraints && problem.constraints.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>Constraints</div>
                      <ul style={{ paddingLeft: 20, fontSize: 13, color: "var(--text-2)", lineHeight: 1.8 }}>
                        {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ color: "var(--text-3)" }}>Loading problem...</div>
              )}
            </div>
          </div>

          {/* Right: editor + output */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Editor toolbar */}
            <div style={{
              height: 40, display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 14px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0,
            }}>
              <select
                value={language}
                onChange={e => handleLanguageChange(e.target.value)}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--surface-2)",
                  border: "1px solid var(--border)", color: "var(--text-2)", borderRadius: 6,
                  padding: "3px 8px", cursor: "pointer",
                }}
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <div style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
                Tests: <span style={{ color: testsPassed === testsTotal && testsTotal > 0 ? "var(--green)" : "var(--text-2)" }}>{testsPassed}/{testsTotal}</span>
              </div>
            </div>

            {/* Code editor */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
              />
            </div>

            {/* Output panel */}
            {testResults && (
              <div style={{
                maxHeight: 200, overflowY: "auto", borderTop: "1px solid var(--border)",
                background: "var(--surface-2)", fontSize: 12, fontFamily: "var(--font-mono)",
              }}>
                <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--border)", color: "var(--text-3)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Test Results
                </div>
                {testResults.map((r, i) => (
                  <div key={i} style={{
                    padding: "6px 14px", borderBottom: "1px solid var(--border)",
                    display: "flex", gap: 12, alignItems: "flex-start",
                  }}>
                    <span style={{ color: r.passed ? "var(--green)" : "var(--red)", fontWeight: 700, flexShrink: 0 }}>
                      {r.passed ? "PASS" : "FAIL"}
                    </span>
                    <div style={{ flex: 1, color: "var(--text-2)" }}>
                      {r.error ? (
                        <div style={{ color: "var(--red)" }}>{r.error}</div>
                      ) : (
                        <>
                          <div>Input: {JSON.stringify(r.input)}</div>
                          <div>Expected: {JSON.stringify(r.expected)}</div>
                          {!r.passed && <div>Got: {JSON.stringify(r.actual)}</div>}
                          {r.execTime != null && <span style={{ color: "var(--text-3)" }}> ({r.execTime}s)</span>}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action bar */}
            <div style={{
              height: 50, display: "flex", alignItems: "center", gap: 10,
              padding: "0 14px", borderTop: "1px solid var(--border)",
              background: "var(--surface)", flexShrink: 0,
            }}>
              <button
                onClick={handleRunTests}
                disabled={running}
                style={{
                  padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600,
                  border: "1px solid var(--border-2)", background: "transparent",
                  color: running ? "var(--text-3)" : "var(--text-2)",
                  cursor: running ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)",
                }}
              >{running ? "Running..." : "Run tests"}</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: "7px 18px", borderRadius: 7, fontSize: 13, fontWeight: 600,
                  border: "none",
                  background: submitting ? "var(--surface-2)" : "var(--green)",
                  color: submitting ? "var(--text-2)" : "#000",
                  cursor: submitting ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)",
                }}
              >{submitting ? "Submitting..." : "Submit"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-cheat modal */}
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
            <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 12 }}>{acAlert}</div>
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
