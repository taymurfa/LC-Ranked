import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CODE = `class LRUCache:

    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        self.order = collections.OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.order.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.order.move_to_end(key)
        self.cache[key] = value
        self.order[key] = value
        if len(self.cache) > self.cap:
            oldest = next(iter(self.order))
            del self.order[oldest]
            del self.cache[oldest]`;

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

export default function Battle() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('id');

  const { tabWarnings, faceOk, acAlert, setAcAlert } = useAntiCheat(socket, matchId);

  const [timeLeft, setTimeLeft] = useState(25 * 60 - 13);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (acAlert) setShowModal(true);
  }, [acAlert]);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const urgent = timeLeft < 120;
  const tabOk = tabWarnings === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 52px)" }}>
      {/* Anti-cheat bar */}
      <div style={{
        height: 38, display: "flex", alignItems: "center", gap: 20,
        padding: "0 16px", background: "var(--surface-2)", borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}>
        {[
          [tabOk ? "var(--green)" : "var(--amber)", tabOk, `Tab: ${tabOk ? "focused" : `warned ×${tabWarnings}`}`],
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
            ⚠ {acAlert}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", flex: 1, overflow: "hidden" }}>
        {/* Left: problem */}
        <div style={{ borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Top bar */}
          <div style={{
            height: 46, display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 16px", borderBottom: "1px solid var(--border)",
            background: "var(--surface)", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Alex Kim <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent-bright)" }}>(you)</span></div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)" }}>1387 · Gold II</div>
              </div>
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, letterSpacing: 2,
              color: urgent ? "var(--red)" : "var(--amber)",
              animation: urgent ? "pulse 0.6s ease infinite" : "none",
            }}>{mins}:{String(secs).padStart(2, "0")}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>@giga_coder</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)" }}>1402 · Gold II</div>
              </div>
            </div>
          </div>
          {/* Opponent progress */}
          <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.6px" }}>Opponent progress</div>
            <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "42%", background: "var(--red)", borderRadius: 2 }} />
            </div>
          </div>
          {/* Problem */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.3px", marginBottom: 8 }}>LRU Cache</div>
            <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.8 }}>
              <p>Design a data structure following the constraints of a Least Recently Used (LRU) cache.</p>
              <p style={{ marginTop: 10 }}>Implement the LRUCache class...</p>
            </div>
          </div>
        </div>

        {/* Right: editor */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{
            height: 40, display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 14px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0,
          }}>
            <select style={{
              fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--surface-2)",
              border: "1px solid var(--border)", color: "var(--text-2)", borderRadius: 6,
              padding: "3px 8px", cursor: "pointer",
            }}>
              <option>Python 3</option><option>JavaScript</option><option>Java</option><option>C++</option>
            </select>
            <div style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
              Tests: <span style={{ color: "var(--green)" }}>3/5 ✓</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", background: "var(--bg)" }}>
            {CODE.split("\n").map((line, i) => (
              <CodeLine key={i} line={line} />
            ))}
          </div>

          <div style={{
            height: 50, display: "flex", alignItems: "center", gap: 10,
            padding: "0 14px", borderTop: "1px solid var(--border)",
            background: "var(--surface)", flexShrink: 0,
          }}>
            <button style={{
              padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              border: "1px solid var(--border-2)", background: "transparent",
              color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>Run tests</button>
            <button onClick={() => navigate('/result')} style={{
              padding: "7px 18px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              border: "none", background: "var(--green)", color: "#000",
              cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>Submit</button>
          </div>
        </div>
      </div>

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
            <div style={{ fontSize: 36, marginBottom: 14 }}>⚠️</div>
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
