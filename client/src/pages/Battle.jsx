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
    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
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
        <div className="flex flex-col h-[calc(100vh-64px)] -m-4 md:-m-8 bg-surface overflow-hidden relative fade-in z-20">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[10%] left-[20%] w-[50rem] h-[50rem] bg-indigo-500/5 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-[0%] right-[0%] w-[40rem] h-[40rem] bg-purple-500/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Top Protocol Bar (Anti-Cheat & Time) */}
            <div className="h-12 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 shadow-sm flex-shrink-0 z-30">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${tabOk ? 'bg-tertiary shadow-[0_0_8px_rgba(71,196,255,0.6)]' : 'bg-error shadow-[0_0_8px_rgba(255,110,132,0.6)] animate-pulse'}`} />
                        <span className={`text-xs font-mono font-medium tracking-wide ${tabOk ? 'text-on-surface-variant' : 'text-error font-bold'}`}>
                            Focus: {tabOk ? 'Secure' : `Warn (${tabWarnings}/3)`}
                        </span>
                    </div>
                    {opponentSubmitted && <span className="text-xs font-mono tracking-widest text-secondary font-bold animate-pulse px-3 py-1 bg-secondary/10 rounded-lg">Opponent Submitted</span>}
                </div>
                <div className="flex items-center gap-3 bg-surface-container-low px-4 py-1.5 rounded-lg border border-outline-variant/30">
                    <span className="material-symbols-outlined text-sm text-outline">timer</span>
                    <span className={`text-lg font-headline font-bold tracking-wider ${urgent ? 'text-error animate-pulse' : 'text-primary'}`}>
                        {mins}:{String(secs).padStart(2, "0")}
                    </span>
                </div>
            </div>

            {!matchStarted ? (
                <div className="flex-1 flex flex-col items-center justify-center z-20">
                    <div className="relative w-24 h-24 flex justify-center items-center mb-6">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                        <span className="material-symbols-outlined text-[30px] text-primary animate-pulse">radar</span>
                    </div>
                    <div className="text-primary font-headline font-bold text-xl tracking-widest uppercase animate-pulse">Awaiting Opponent...</div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden p-6 gap-6 z-20">
                    
                    {/* Left Column: Problem Space */}
                    <div className="w-full lg:w-[40%] flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                        
                        {/* Opponent Tracking Card */}
                        <section className="glass-card rounded-xl p-5 flex flex-col gap-4 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)] flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center relative overflow-hidden">
                                        <span className="material-symbols-outlined text-outline">person_off</span>
                                        <div className="absolute -bottom-1 w-full h-1 bg-gradient-to-r from-error/50 to-error"></div>
                                    </div>
                                    <div>
                                        <div className="font-headline font-bold text-sm text-on-surface tracking-wide">{oppName} <span className="text-[10px] text-on-surface-variant font-medium ml-2">({oppElo})</span></div>
                                        <div className="text-[10px] font-mono text-error uppercase tracking-widest mt-0.5">Opponent Status</div>
                                    </div>
                                </div>
                                <span className="text-sm font-mono text-tertiary-fixed-dim font-bold">{opponentProgress.testsPassed}/{opponentProgress.testsTotal}</span>
                            </div>
                            <div className="space-y-1.5">
                                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                                    <div className="bg-error h-full shadow-[0_0_12px_#ff6e84] transition-all duration-700 ease-out" style={{ width: `${oppProgressPct}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-mono text-outline">
                                    <span>Test Progress</span>
                                    <span>{oppProgressPct}%</span>
                                </div>
                            </div>
                        </section>

                        {/* Problem Description Card */}
                        <section className="glass-card flex-1 rounded-xl p-6 border border-outline-variant/10 flex flex-col gap-4 overflow-y-auto">
                            {problem ? (
                                <>
                                    <div className="flex flex-col gap-3 pb-4 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${problem.difficulty === 'hard' ? 'bg-error/10 text-error border-error/20' : problem.difficulty === 'medium' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                {problem.difficulty}
                                            </span>
                                            <h1 className="font-headline font-bold text-xl text-on-surface tracking-tight">{problem.title}</h1>
                                        </div>
                                    </div>

                                    <div className="text-on-surface-variant text-sm leading-relaxed font-body whitespace-pre-wrap">
                                        {problem.description}
                                    </div>

                                    {problem.examples?.length > 0 && (
                                        <div className="mt-4 space-y-4">
                                            {problem.examples.map((ex, i) => (
                                                <div key={i} className="pt-4 border-t border-white/5">
                                                    <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-3">Example {i+1}</h4>
                                                    <div className="bg-surface-container-lowest p-4 rounded-lg border border-white/5 font-mono text-xs space-y-2">
                                                        <div><span className="text-outline">Input:</span> <span className="text-primary-dim">{ex.input}</span></div>
                                                        <div><span className="text-outline">Output:</span> <span className="text-tertiary-dim">{ex.output}</span></div>
                                                        {ex.explanation && <div className="text-outline-variant mt-2 text-[11px]">Explanation: {ex.explanation}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {problem.constraints?.length > 0 && (
                                        <div className="pt-4 border-t border-white/5 mt-auto">
                                            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-3">Constraints</h4>
                                            <ul className="list-disc list-inside text-xs text-on-surface-variant/80 font-mono space-y-1">
                                                {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-outline animate-pulse text-sm">Loading Problem Space...</div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Editor Space */}
                    <div className="flex-1 flex flex-col gap-4 h-full min-w-0">
                        
                        {/* Large Professional Code Editor */}
                        <section className="flex-1 flex flex-col rounded-xl overflow-hidden border border-indigo-500/10 shadow-2xl glass-card relative min-h-[300px]">
                            
                            {/* Editor Header */}
                            <div className="bg-slate-950/60 h-12 px-5 flex items-center justify-between border-b border-indigo-500/10">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-error/30 border border-error/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-tertiary/30 border border-tertiary/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-secondary/30 border border-secondary/50"></div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-surface-container-high px-4 py-1.5 rounded-t-lg border-x border-t border-indigo-500/20 translate-y-2 relative top-[2px]">
                                        <span className="material-symbols-outlined text-sm text-yellow-500 font-variation-FILL">description</span>
                                        <span className="text-xs font-mono text-on-surface tracking-tight">solution</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-outline text-xs">
                                        <span className="material-symbols-outlined text-sm">language</span>
                                        <select 
                                            value={language} 
                                            onChange={handleLanguageChange}
                                            className="bg-transparent border-none text-on-surface-variant text-xs outline-none cursor-pointer hover:text-primary transition-colors pr-4 focus:ring-0"
                                        >
                                            {LANGUAGES.map(l => <option key={l} value={l} className="bg-surface-container-highest">{l}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Editor Space */}
                            <div className="flex-1 overflow-hidden relative bg-[#1e1e1e]">
                                <CodeEditor value={code} onChange={setCode} language={language} theme="vs-dark" />
                            </div>

                            {/* Editor Footer / Action Bar */}
                            <div className="bg-slate-950/60 h-14 flex items-center justify-end px-5 border-t border-indigo-500/10 shrink-0 gap-3">
                                <button 
                                    onClick={handleRunTests} disabled={running}
                                    className="px-6 py-2 rounded-lg bg-surface-container-high text-primary border border-primary/20 font-headline font-bold text-xs tracking-widest uppercase hover:bg-primary/10 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {running ? "Running..." : "Run Tests"}
                                </button>
                                <button 
                                    onClick={handleSubmit} disabled={submitting}
                                    className="px-8 py-2 rounded-lg bg-primary text-on-primary font-headline font-bold text-xs tracking-widest uppercase hover:brightness-110 transition-all active:scale-95 shadow-[0_0_20px_rgba(163,166,255,0.3)] disabled:opacity-50"
                                >
                                    {submitting ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </section>

                        {/* Dedicated Console Area */}
                        {(testResults || running || submitting) && (
                            <section className="h-56 glass-card rounded-xl border border-indigo-500/20 overflow-hidden shadow-inner flex flex-col shrink-0">
                                <div className="px-5 py-3 bg-slate-950/40 flex justify-between items-center border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-sm ${running || submitting ? 'text-secondary animate-spin' : 'text-tertiary'}`}>
                                            {running || submitting ? 'autorenew' : 'terminal'}
                                        </span>
                                        <span className="text-[10px] font-mono text-on-surface uppercase tracking-widest">Execution Console</span>
                                        {testResults && (
                                            <span className="text-xs font-mono ml-4 bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant font-bold">
                                                {testsPassed}/{testsTotal} Passed
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-4">
                                        <span onClick={() => setTestResults(null)} className="material-symbols-outlined text-outline text-lg cursor-pointer hover:text-on-surface transition-colors">close</span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 p-5 font-mono text-sm overflow-y-auto space-y-3 bg-[#0a0f1c]/50">
                                    {running || submitting ? (
                                        <div className="flex items-center gap-2 text-outline animate-pulse">
                                            <span className="text-secondary">➜</span> {running ? 'Executing tests on server...' : 'Validating submission...'}
                                        </div>
                                    ) : (
                                        testResults?.map((r, i) => (
                                            <div key={i} className={`flex flex-col gap-1 pl-4 border-l-2 ${r.passed ? 'border-primary/50 text-on-surface' : 'border-error/50 text-error-dim'}`}>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold text-xs ${r.passed ? 'text-primary' : 'text-error'}`}>Test Case #{i+1}:</span> 
                                                    <span className="text-xs">{r.passed ? 'Passed' : 'Failed'}</span>
                                                </div>
                                                {r.error ? (
                                                    <div className="text-outline-variant text-[11px] mt-1">{r.error}</div>
                                                ) : !r.passed ? (
                                                    <div className="text-outline text-xs mt-1 grid grid-cols-1 gap-1">
                                                        <div><span className="opacity-60">Input:</span> {JSON.stringify(r.input)}</div>
                                                        <div><span className="opacity-60">Expected:</span> {JSON.stringify(r.expected)}</div>
                                                        <div className="text-error-dim"><span className="opacity-60">Actual:</span> {JSON.stringify(r.actual)}</div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                </div>
            )}

            {/* Anti-cheat modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center fade-in backdrop-blur-md">
                    <div className="glass-card border border-error/50 p-8 rounded-2xl max-w-sm w-[90%] text-center shadow-[0_0_50px_rgba(255,110,132,0.2)]">
                        <div className="text-5xl mb-4 material-symbols-outlined text-error animate-pulse">security</div>
                        <div className="text-xl font-headline font-bold text-error tracking-widest mb-2 uppercase">Protocol Violation</div>
                        <div className="text-sm font-body text-on-surface-variant mb-4">{acAlert}</div>
                        <div className="text-[10px] font-mono text-error/80 mb-6 uppercase tracking-widest p-2 bg-error/10 rounded">
                            Warning {tabWarnings}/3 — 3 violations = Game Over
                        </div>
                        <button onClick={() => { setShowModal(false); setAcAlert(null); }} className="w-full py-3 rounded-xl bg-error text-on-error font-headline font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,110,132,0.4)]">
                            Acknowledge Warning
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
