import { useState, useEffect, useRef } from 'react';
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
  const [code, setCode] = useState('# Initialize Sequence. Waiting for prompt...\n');
  const [language, setLanguage] = useState("Python 3");
  const [testsPassed, setTestsPassed] = useState(0);
  const [testsTotal, setTestsTotal] = useState(0);

  // Run/Submit state
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);

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
    const onOpponentProgress = ({ testsPassed: tp, testsTotal: tt }) => setOpponentProgress({ testsPassed: tp, testsTotal: tt });
    const onOpponentSubmitted = () => setOpponentSubmitted(true);
    const onForfeit = ({ reason }) => navigate(`/result?id=${matchId}&forfeit=self&reason=${reason}`);
    const onOpponentForfeit = () => navigate(`/result?id=${matchId}&forfeit=opponent`);
    const onMatchCompleted = () => navigate(`/result?id=${matchId}`);

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

  // Load match data
  useEffect(() => {
    if (!matchId || !token) return;
    fetch(`${BACKEND_URL}/api/matches/${matchId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.player_a && data.player_b) {
          const isA = data.player_a_id === user?.id;
          setMyInfo(isA ? data.player_a : data.player_b);
          setOpponentInfo(isA ? data.player_b : data.player_a);
        }
        if (data.problem_id) setProblemId(data.problem_id);
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
        const langKey = LANG_KEYS[language];
        if (data.starter_code && data.starter_code[langKey]) setCode(data.starter_code[langKey]);
      })
      .catch(() => {});
  }, [problemId]);

  // Language change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const langKey = LANG_KEYS[newLang];
    if (problem?.starter_code?.[langKey]) setCode(problem.starter_code[langKey]);
  };

  // Timer
  useEffect(() => {
    if (!matchStarted) return;
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) {
          clearInterval(t);
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

  // Run tests
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
        if (socket && matchId) socket.emit('match:progress', { matchId, testsPassed: data.passed, testsTotal: data.total });
      } else if (data.error) {
        setTestResults([{ testCase: 0, passed: false, error: data.error }]);
      }
    } catch (err) {
      setTestResults([{ testCase: 0, passed: false, error: err.message }]);
    } finally {
      setRunning(false);
    }
  };

  // Submit
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
      if (data.status === 'completed') navigate(`/result?id=${matchId}`);
      else if (data.status === 'waiting' && data.testResult?.results) {
        setTestResults(data.testResult.results);
        setTestsPassed(data.testResult.passed);
        setTestsTotal(data.testResult.total);
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

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-4 md:-m-8 bg-black fade-in z-20 relative">
      <div className="scanline"></div>

      {/* Top Protocol Bar (Anti-Cheat & Time) */}
      <div className="h-10 flex items-center justify-between px-6 bg-surface-container-lowest border-b border-secondary-container/40 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${tabOk ? 'bg-primary-container shadow-[0_0_6px_#00ff41]' : 'bg-error shadow-[0_0_6px_#ff003c] animate-pulse'}`} />
            <span className={`text-[10px] font-mono tracking-widest uppercase ${tabOk ? 'text-secondary-container' : 'text-error font-bold'}`}>
              TAB_FOCUS: {tabOk ? 'VERIFIED' : `WARN_x${tabWarnings}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_6px_#00ff41]" />
            <span className="text-[10px] font-mono tracking-widest text-secondary-container uppercase">KEYSTROKE: SECURE</span>
          </div>
          {opponentSubmitted && <span className="text-[10px] font-mono tracking-widest text-error uppercase font-bold animate-pulse">! OPPONENT_HAS_SUBMITTED !</span>}
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-secondary-container tracking-widest uppercase">MATCH_TIME_REMAINING</span>
            <span className={`text-xl font-body font-bold ${urgent ? 'text-error animate-pulse text-shadow-glow' : 'text-primary-container text-shadow-glow'}`}>
                {mins}:{String(secs).padStart(2, "0")}
            </span>
        </div>
      </div>

      {!matchStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-secondary-container/30 border-t-primary-container animate-spin mb-4" />
            <div className="text-secondary-container font-mono text-xs tracking-widest uppercase animate-pulse">Awaiting Opponent Handshake...</div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column: Problem Space */}
          <section className="w-1/2 h-full border-r border-secondary-container/40 p-6 flex flex-col gap-6 overflow-y-auto bg-surface-container-low">
            {/* User Info Panel */}
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-secondary-container/20 border border-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container text-xl">account_circle</span>
                </div>
                <div>
                  <div className="text-primary-container font-headline font-bold text-sm tracking-wider uppercase">{myName}</div>
                  <div className="text-[10px] text-secondary-container uppercase">RANK: ELITE // ELO: {myElo}</div>
                </div>
              </div>
              <div className="text-center pt-2">
                <div className="text-tertiary-fixed-dim font-headline font-bold text-lg leading-none">VS</div>
                <div className="text-secondary-container text-[8px] tracking-widest leading-none pt-1">MATCH_ID: #{matchId.slice(0, 5).toUpperCase()}</div>
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <div className="text-error font-headline font-bold text-sm tracking-wider uppercase opacity-80">{oppName}</div>
                  <div className="text-[10px] text-secondary-container uppercase opacity-80">RANK: UNKNOWN // ELO: {oppElo}</div>
                </div>
                <div className="w-10 h-10 bg-error-container/20 border border-error/50 flex items-center justify-center opacity-80">
                  <span className="material-symbols-outlined text-error text-xl">memory</span>
                </div>
              </div>
            </div>

            {/* Problem Description Box */}
            <div className="flex-grow flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-2 text-primary-container text-[10px]">
                    <span>╔══════════════════════════════════════════════╗</span>
                </div>
                <div className="flex-1 px-4 py-4 border-l border-r border-primary-container bg-surface-container-lowest overflow-y-auto">
                    {problem ? (
                        <>
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="font-headline text-xl font-bold tracking-widest text-shadow-glow uppercase text-primary-container">{problem.title}</h2>
                                <span className={`px-2 py-1 text-[9px] font-bold tracking-widest uppercase text-black ${problem.difficulty === 'hard' ? 'bg-error' : problem.difficulty === 'medium' ? 'bg-tertiary-fixed-dim' : 'bg-primary-container'}`}>
                                    {problem.difficulty}_LEVEL
                                </span>
                            </div>
                            <div className="space-y-4 text-xs leading-relaxed text-secondary-container whitespace-pre-wrap font-mono">
                                {problem.description}
                                {problem.examples?.length > 0 && (
                                    <div className="mt-6 space-y-4">
                                        {problem.examples.map((ex, i) => (
                                            <div key={i} className="border border-secondary-container/30 bg-black p-3">
                                                <div className="text-primary-container mb-2 text-[10px]">EXAMPLE_0{i+1}:</div>
                                                <div><span className="text-on-surface opacity-50">INPUT:</span> {ex.input}</div>
                                                <div><span className="text-on-surface opacity-50">OUTPUT:</span> {ex.output}</div>
                                                {ex.explanation && <div className="mt-2 text-[10px] text-secondary-container/60 opacity-80">EXPLANATION: {ex.explanation}</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {problem.constraints?.length > 0 && (
                                    <div className="text-[10px] mt-6 border-t border-secondary-container/20 pt-4 text-secondary-container/60">
                                        // CONSTRAINTS:<br/>
                                        {problem.constraints.map((c, i) => <div key={i}>// {c}</div>)}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-secondary-container font-mono text-xs animate-pulse">FETCHING_PROBLEM_DATA...</div>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-primary-container text-[10px]">
                    <span>╚══════════════════════════════════════════════╝</span>
                </div>
            </div>

            {/* Opponent Progress Bar */}
            <div className="bg-surface-container-lowest p-3 border border-secondary-container/40 flex-shrink-0">
              <div className="flex justify-between text-[9px] mb-2 text-secondary-container tracking-widest uppercase">
                <span>OPPONENT_PROGRESS_STATUS</span>
                <span>{oppProgressPct}%_COMPLETE</span>
              </div>
              <div className="w-full h-3 bg-black border border-secondary-container/40 overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full bg-error transition-all duration-500 ease-in-out" style={{ width: `${oppProgressPct}%` }}></div>
              </div>
            </div>
          </section>

          {/* Right Column: Editor Space */}
          <section className="w-1/2 h-full bg-black flex flex-col relative z-20 border-l border-primary-container/20 shadow-[-10px_0_20px_rgba(0,255,65,0.03)]">
            {/* Language Selector */}
            <div className="h-10 border-b border-secondary-container/40 flex items-center px-2 bg-surface-container-lowest flex-shrink-0">
                {LANGUAGES.map(l => (
                    <button 
                        key={l} 
                        onClick={() => handleLanguageChange(l)} 
                        className={`px-4 h-full text-[10px] font-bold tracking-widest uppercase transition-all ${language === l ? 'border-b-2 border-primary-container text-primary-container' : 'text-secondary-container/60 hover:text-primary-container'}`}
                    >
                        [{l}]
                    </button>
                ))}
            </div>

            {/* Code Area */}
            <div className="flex-1 min-h-0 bg-[#0e0e0e] relative relative-z-20">
                <CodeEditor value={code} onChange={setCode} language={language} theme="vs-dark" />
            </div>

            {/* Test Results */}
            {testResults && (
                <div className="h-40 overflow-y-auto border-t border-primary-container/30 bg-surface-container-lowest font-mono text-xs p-0 flex-shrink-0">
                    <div className="sticky top-0 bg-surface-container-lowest border-b border-primary-container/30 px-4 py-2 flex justify-between items-center text-[10px] uppercase font-bold text-primary-container z-10 shadow-md">
                        <span>TEST_EXECUTION_RESULTS</span>
                        <span>{testsPassed}/{testsTotal} PASSED</span>
                    </div>
                    <div>
                        {testResults.map((r, i) => (
                            <div key={i} className={`p-3 border-b border-secondary-container/20 flex gap-4 ${r.passed ? 'bg-primary-container/5' : 'bg-error/5'}`}>
                                <span className={`font-bold tracking-widest flex-shrink-0 ${r.passed ? 'text-primary-container' : 'text-error'}`}>
                                    [{r.passed ? 'PASS' : 'FAIL'}]
                                </span>
                                <div className="flex-1 text-secondary-container text-[11px] space-y-1">
                                    {r.error ? (
                                        <div className="text-error">{r.error}</div>
                                    ) : (
                                        <>
                                            <div>INPUT: {JSON.stringify(r.input)}</div>
                                            <div>EXPECTED: {JSON.stringify(r.expected)}</div>
                                            {!r.passed && <div className="text-on-surface">GOT: {JSON.stringify(r.actual)}</div>}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Editor Actions */}
            <div className="p-4 border-t border-secondary-container/40 flex justify-between items-center bg-surface-container-lowest flex-shrink-0">
              <div className="flex gap-4">
                <button 
                    onClick={handleRunTests} disabled={running}
                    className="px-6 py-2 border border-primary-container text-primary-container hover:bg-primary-container hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-headline font-bold uppercase tracking-wider text-xs"
                >
                    {running ? "[ EXECUTING... ]" : "[ RUN TESTS ]"}
                </button>
                <button 
                    onClick={handleSubmit} disabled={submitting}
                    className="px-8 py-2 bg-primary-container text-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-headline font-bold uppercase tracking-widest text-xs flex items-center gap-2"
                >
                    {submitting ? "[ UPLOADING... ]" : "[ SUBMIT ]"} <span className="material-symbols-outlined text-sm">play_arrow</span>
                </button>
              </div>
              <div className="hidden lg:flex items-center gap-3 text-secondary-container text-[10px] font-mono tracking-widest">
                <span className="material-symbols-outlined text-sm">wifi</span>
                <span>LATENCY: 24MS</span>
                <span className="ml-4 material-symbols-outlined text-sm">lock</span>
                <span>ENCRYPTION: ACTIVE</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Anti-cheat modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center fade-in backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-error p-8 max-w-sm w-[90%] text-center shadow-[0_0_30px_rgba(255,0,60,0.15)]">
            <div className="text-4xl mb-4 material-symbols-outlined text-error animate-pulse">warning</div>
            <div className="text-xl font-headline font-bold text-error tracking-widest mb-2 uppercase text-shadow-glow">SECURITY_ALERT</div>
            <div className="text-xs font-mono text-secondary-container mb-4">{acAlert}</div>
            <div className="text-[10px] font-mono text-error/80 mb-6 uppercase tracking-widest">
              3 violations = automatic forfeit
            </div>
            <button onClick={() => { setShowModal(false); setAcAlert(null); }} className="px-6 py-3 bg-error text-black font-headline font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
              [ ACKNOWLEDGE_&_RESUME ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
