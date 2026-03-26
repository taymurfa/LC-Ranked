import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
    const navigate = useNavigate();
    const { session } = useAuth();

    return (
        <div className="min-h-screen bg-[#060e20] text-[#dee5ff] font-body selection:bg-primary selection:text-on-primary">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(99,102,241,0.1)]">
                <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
                    <div className="text-2xl font-black tracking-tighter text-indigo-500 italic">LeetBattle</div>
                    <div className="hidden md:flex items-center gap-8">
                        <button onClick={() => navigate('/play')} className="font-headline font-bold uppercase tracking-wider text-indigo-400 border-b-2 border-indigo-500 pb-1">Arena</button>
                        <button onClick={() => navigate('/leaderboard')} className="font-headline font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors">Leaderboard</button>
                        <button className="font-headline font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors">Docs</button>
                        <button className="font-headline font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors">Pro</button>
                    </div>
                    <div className="flex items-center gap-4">
                        {!session ? (
                            <>
                                <button onClick={() => navigate('/signin')} className="px-5 py-2 text-slate-400 hover:text-slate-100 transition-colors font-semibold">Log In</button>
                                <button onClick={() => navigate('/signin')} className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg shadow-lg hover:bg-primary-container transition-all active:scale-95 duration-100">Sign Up</button>
                            </>
                        ) : (
                            <button onClick={() => navigate('/play')} className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg shadow-lg hover:bg-primary-container transition-all active:scale-95 duration-100">
                                Enter App
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-20">
                {/* Hero Section */}
                <section className="relative px-6 py-20 lg:py-32 overflow-hidden">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10"></div>
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] -z-10"></div>
                    
                    <div className="max-w-6xl mx-auto text-center">
                        <div className="glass-card p-12 lg:p-20 rounded-3xl border border-outline-variant relative">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-highest border border-outline-variant mb-8">
                                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                                <span className="text-xs font-mono tracking-widest uppercase text-on-surface-variant">Live Season 04: Neon Protocol</span>
                            </div>
                            <h1 className="font-headline text-5xl lg:text-8xl font-black tracking-tighter text-on-surface mb-6 leading-none">
                                CODE TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">CONQUER.</span>
                            </h1>
                            <p className="max-w-2xl mx-auto text-lg lg:text-xl text-on-surface-variant mb-12 font-light">
                                The arena where algorithmic precision meets competitive adrenaline. Join thousands of developers in high-stakes tactical coding battles.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <button onClick={() => navigate('/play')} className="group relative px-10 py-5 bg-secondary text-on-secondary font-black text-xl rounded-xl glow-secondary hover:scale-105 transition-all active:scale-95 flex items-center gap-3">
                                    ENTER ARENA
                                    <span className="material-symbols-outlined font-bold">rocket_launch</span>
                                </button>
                                <button onClick={() => navigate('/leaderboard')} className="px-10 py-5 bg-surface-container-high border border-outline-variant text-on-surface font-bold text-xl rounded-xl hover:bg-surface-container-highest transition-all">
                                    VIEW RANKS
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Ultimate Competitive Coding Platform */}
                <section className="px-6 py-24 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-card p-8 rounded-2xl group hover:bg-surface-container-high transition-colors text-left flex flex-col items-start cursor-pointer" onClick={() => navigate('/play')}>
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-3xl">swords</span>
                            </div>
                            <h3 className="font-headline text-2xl font-bold mb-4">The Arena</h3>
                            <p className="text-on-surface-variant leading-relaxed">
                                1v1 and Squad-based real-time matchups. Solve complex problems under pressure while watching your opponent's progress metrics in real-time.
                            </p>
                        </div>
                        
                        <div className="glass-card p-8 rounded-2xl group hover:bg-surface-container-high transition-colors text-left flex flex-col items-start cursor-pointer" onClick={() => navigate('/leaderboard')}>
                            <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20">
                                <span className="material-symbols-outlined text-secondary text-3xl">leaderboard</span>
                            </div>
                            <h3 className="font-headline text-2xl font-bold mb-4">Leaderboards</h3>
                            <p className="text-on-surface-variant leading-relaxed">
                                Dynamic ELO-based ranking system. Climb from 'Script-Kiddie' to 'Legendary Architect' and earn exclusive digital badges and terminal skins.
                            </p>
                        </div>
                        
                        <div className="glass-card p-8 rounded-2xl group hover:bg-surface-container-high transition-colors text-left flex flex-col items-start cursor-pointer">
                            <div className="w-14 h-14 rounded-xl bg-tertiary/10 flex items-center justify-center mb-6 border border-tertiary/20">
                                <span className="material-symbols-outlined text-tertiary text-3xl">event_upcoming</span>
                            </div>
                            <h3 className="font-headline text-2xl font-bold mb-4">Daily Challenges</h3>
                            <p className="text-on-surface-variant leading-relaxed">
                                Curated problems refreshed every 24 hours. Maintain your streak to unlock rare performance analytics and priority match queueing.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Real-time Battle Stats (Bento Grid) */}
                <section className="px-6 py-24 bg-surface-container-low">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-16">
                            <h2 className="font-headline text-4xl lg:text-5xl font-black mb-4">BATTLE ANALYTICS</h2>
                            <p className="text-on-surface-variant max-w-xl">Deep-dive into your cognitive performance metrics. Track speed, accuracy, and algorithmic complexity in every match.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
                            {/* Main Stat Card */}
                            <div className="lg:col-span-8 glass-card rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-20">
                                    <span className="material-symbols-outlined text-9xl">monitoring</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-4 mb-8">
                                        <span className="text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded border border-primary/20">LIVE_TELEMETRY</span>
                                        <span className="text-xs font-mono text-on-surface-variant">ID: BATTLE_772-X</span>
                                    </div>
                                    <h4 className="text-6xl font-headline font-black text-on-surface mb-2">98.4%</h4>
                                    <p className="text-tertiary font-mono uppercase tracking-widest text-sm">Peak Accuracy Rating</p>
                                </div>
                                <div className="mt-12 h-48 flex items-end gap-2">
                                    <div className="flex-1 bg-primary/20 h-[30%] rounded-t-lg"></div>
                                    <div className="flex-1 bg-primary/40 h-[60%] rounded-t-lg"></div>
                                    <div className="flex-1 bg-primary/30 h-[45%] rounded-t-lg"></div>
                                    <div className="flex-1 bg-primary/60 h-[80%] rounded-t-lg"></div>
                                    <div className="flex-1 bg-primary/50 h-[65%] rounded-t-lg"></div>
                                    <div className="flex-1 bg-primary/90 h-[100%] rounded-t-lg glow-primary"></div>
                                    <div className="flex-1 bg-primary/40 h-[50%] rounded-t-lg"></div>
                                </div>
                            </div>
                            
                            {/* Side Stats */}
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                <div className="flex-1 glass-card rounded-2xl p-6 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30">
                                        <span className="material-symbols-outlined text-secondary">timer</span>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-headline font-bold">12ms</div>
                                        <div className="text-sm text-on-surface-variant font-mono">Avg Response Time</div>
                                    </div>
                                </div>
                                <div className="flex-1 glass-card rounded-2xl p-6 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center border border-error/30">
                                        <span className="material-symbols-outlined text-error">bug_report</span>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-headline font-bold">0</div>
                                        <div className="text-sm text-on-surface-variant font-mono">Runtime Errors (Last 50)</div>
                                    </div>
                                </div>
                                <div className="flex-1 glass-card rounded-2xl p-6 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-full bg-tertiary/10 flex items-center justify-center border border-tertiary/30">
                                        <span className="material-symbols-outlined text-tertiary">bolt</span>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-headline font-bold">4.2x</div>
                                        <div className="text-sm text-on-surface-variant font-mono">Speed Multiplier vs Global</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Master Your Craft (Practice Library) */}
                <section className="px-6 py-24 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                        <div>
                            <h2 className="font-headline text-4xl lg:text-5xl font-black mb-4 uppercase">Master Your Craft</h2>
                            <p className="text-on-surface-variant">Choose your discipline and sharpen your mental blades.</p>
                        </div>
                        <div className="flex gap-2 p-1.5 bg-surface-container rounded-xl border border-outline-variant">
                            <button className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold transition-all">ALL</button>
                            <button className="px-6 py-2 hover:bg-surface-container-high rounded-lg font-medium transition-all">EASY</button>
                            <button className="px-6 py-2 hover:bg-surface-container-high rounded-lg font-medium transition-all">MEDIUM</button>
                            <button className="px-6 py-2 hover:bg-surface-container-high rounded-lg font-medium transition-all text-secondary">HARD</button>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="glass-card p-6 rounded-xl flex flex-wrap md:flex-nowrap items-center gap-6 group hover:translate-x-2 transition-transform cursor-pointer">
                            <div className="w-12 h-12 bg-surface-container-highest rounded flex items-center justify-center font-mono text-on-surface-variant">#42</div>
                            <div className="flex-1">
                                <h4 className="text-xl font-bold group-hover:text-primary transition-colors">Bitwise Matrix Traversal</h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs uppercase font-bold text-secondary">Hard</span>
                                    <span className="text-xs text-on-surface-variant font-mono">Acceptance: 12.4%</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 hidden sm:flex">
                                <span className="text-xs text-on-surface-variant font-mono">2.4k Solved</span>
                            </div>
                            <button className="w-12 h-12 flex-shrink-0 rounded-full border border-outline-variant flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all">
                                <span className="material-symbols-outlined">play_arrow</span>
                            </button>
                        </div>
                        
                        <div className="glass-card p-6 rounded-xl flex flex-wrap md:flex-nowrap items-center gap-6 group hover:translate-x-2 transition-transform cursor-pointer">
                            <div className="w-12 h-12 bg-surface-container-highest rounded flex items-center justify-center font-mono text-on-surface-variant">#108</div>
                            <div className="flex-1">
                                <h4 className="text-xl font-bold group-hover:text-primary transition-colors">Dynamic String Reversal</h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs uppercase font-bold text-tertiary">Easy</span>
                                    <span className="text-xs text-on-surface-variant font-mono">Acceptance: 84.1%</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 hidden sm:flex">
                                <span className="text-xs text-on-surface-variant font-mono">15k Solved</span>
                            </div>
                            <button className="w-12 h-12 flex-shrink-0 rounded-full border border-outline-variant flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all">
                                <span className="material-symbols-outlined">play_arrow</span>
                            </button>
                        </div>
                        
                        <div className="glass-card p-6 rounded-xl flex flex-wrap md:flex-nowrap items-center gap-6 group hover:translate-x-2 transition-transform cursor-pointer">
                            <div className="w-12 h-12 bg-surface-container-highest rounded flex items-center justify-center font-mono text-on-surface-variant">#92</div>
                            <div className="flex-1">
                                <h4 className="text-xl font-bold group-hover:text-primary transition-colors">Asynchronous Task Orchestrator</h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs uppercase font-bold text-primary">Medium</span>
                                    <span className="text-xs text-on-surface-variant font-mono">Acceptance: 45.8%</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 hidden sm:flex">
                                <span className="text-xs text-on-surface-variant font-mono">5.2k Solved</span>
                            </div>
                            <button className="w-12 h-12 flex-shrink-0 rounded-full border border-outline-variant flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all">
                                <span className="material-symbols-outlined">play_arrow</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Join the Elite (Top Players) */}
                <section className="px-6 py-24 bg-surface-container-low/50 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="font-headline text-4xl lg:text-6xl font-black mb-4">JOIN THE ELITE</h2>
                            <p className="text-on-surface-variant">The gods of the arena. Will you challenge their reign?</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Rank 2 */}
                            <div className="md:mt-12 order-2 md:order-1">
                                <div className="glass-card p-1 text-center rounded-3xl group transition-all hover:-translate-y-2">
                                    <div className="p-8 rounded-[1.4rem] bg-surface-container">
                                        <div className="relative w-32 h-32 mx-auto mb-6">
                                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                                            <div className="w-full h-full rounded-full border-4 border-outline-variant bg-slate-800 flex items-center justify-center relative z-10 overflow-hidden">
                                                <span className="material-symbols-outlined text-4xl text-outline-variant">person</span>
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center text-on-primary-fixed font-black text-xl z-20">2</div>
                                        </div>
                                        <h4 className="text-2xl font-headline font-bold mb-1">NullPointer_Zero</h4>
                                        <p className="text-on-surface-variant font-mono text-sm mb-6">ELO: 2840</p>
                                        <div className="flex justify-center gap-2">
                                            <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold border border-outline-variant">REACT</span>
                                            <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold border border-outline-variant">GO</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Rank 1 */}
                            <div className="order-1 md:order-2">
                                <div className="glass-card p-1 text-center rounded-3xl group transition-all hover:-translate-y-4 glow-secondary">
                                    <div className="p-10 rounded-[1.4rem] bg-surface-container-high relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent"></div>
                                        <div className="relative w-40 h-40 mx-auto mb-6">
                                            <div className="absolute inset-0 bg-secondary/30 rounded-full blur-2xl animate-pulse"></div>
                                            <div className="w-full h-full rounded-full border-4 border-secondary bg-slate-800 flex items-center justify-center relative z-10 overflow-hidden">
                                                <span className="material-symbols-outlined text-5xl text-secondary">person</span>
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-on-secondary font-black text-2xl z-20 shadow-lg">1</div>
                                        </div>
                                        <h4 className="text-3xl font-headline font-black mb-1 text-secondary">CyberShogun</h4>
                                        <p className="text-on-surface-variant font-mono text-sm mb-6">ELO: 3125</p>
                                        <div className="flex justify-center gap-2">
                                            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold border border-secondary/20">C++</span>
                                            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold border border-secondary/20">RUST</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Rank 3 */}
                            <div className="md:mt-20 order-3">
                                <div className="glass-card p-1 text-center rounded-3xl group transition-all hover:-translate-y-2">
                                    <div className="p-8 rounded-[1.4rem] bg-surface-container">
                                        <div className="relative w-28 h-28 mx-auto mb-6">
                                            <div className="absolute inset-0 bg-tertiary/20 rounded-full blur-xl"></div>
                                            <div className="w-full h-full rounded-full border-4 border-outline-variant bg-slate-800 flex items-center justify-center relative z-10 overflow-hidden">
                                                <span className="material-symbols-outlined text-3xl text-outline-variant">person</span>
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-black text-xl z-20">3</div>
                                        </div>
                                        <h4 className="text-2xl font-headline font-bold mb-1">AsyncQueen</h4>
                                        <p className="text-on-surface-variant font-mono text-sm mb-6">ELO: 2715</p>
                                        <div className="flex justify-center gap-2">
                                            <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold border border-outline-variant">PYTHON</span>
                                            <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold border border-outline-variant">TYPESCRIPT</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-950 w-full py-12 px-8 border-t border-white/5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    <div className="col-span-2 md:col-span-1">
                        <div className="text-lg font-bold text-slate-100 mb-4 font-headline uppercase tracking-tight italic">LeetBattle</div>
                        <p className="text-slate-500 font-inter text-sm antialiased max-w-xs leading-relaxed">
                            © 2024 LeetBattle. Terminal Grade Performance. Elevating the standard of competitive programming.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-100 mb-4 uppercase tracking-widest text-xs">Navigation</h5>
                        <ul className="space-y-2 flex flex-col">
                            <li><button onClick={() => navigate('/play')} className="text-slate-500 hover:text-indigo-300 transition-colors text-sm text-left">Arena</button></li>
                            <li><button onClick={() => navigate('/leaderboard')} className="text-slate-500 hover:text-indigo-300 transition-colors text-sm text-left">Leaderboard</button></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-100 mb-4 uppercase tracking-widest text-xs">Platform</h5>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-slate-500 hover:text-indigo-300 transition-colors text-sm">Docs</a></li>
                            <li><a href="#" className="text-slate-500 hover:text-indigo-300 transition-colors text-sm">Pro Membership</a></li>
                            <li><a href="#" className="text-slate-500 hover:text-indigo-300 transition-colors text-sm">Teams</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-100 mb-4 uppercase tracking-widest text-xs">Community</h5>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-500 hover:text-indigo-300 transition-colors">
                                <span className="material-symbols-outlined">forum</span>
                            </a>
                            <a href="#" className="text-slate-500 hover:text-indigo-300 transition-colors">
                                <span className="material-symbols-outlined">terminal</span>
                            </a>
                        </div>
                        <div className="mt-6 flex gap-4">
                            <a href="#" className="text-slate-500 hover:text-indigo-300 transition-colors text-xs">Terms</a>
                            <a href="#" className="text-slate-500 hover:text-indigo-300 transition-colors text-xs">Privacy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
