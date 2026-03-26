export default function DailyChallenge() {
    return (
        <div className="fade-in pb-12 overflow-x-hidden">
            {/* Hero Section: Daily Challenge */}
            <section className="relative mt-0 md:mt-8 rounded-2xl overflow-hidden bg-surface-container-low min-h-[400px] flex items-center border border-outline-variant/10 shadow-lg glow-secondary">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-secondary-container rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary-container rounded-full blur-[100px]"></div>
                </div>
                <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 lg:p-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error-container/20 text-error-dim border border-error-container/30">
                            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                            <span className="text-xs font-bold font-headline tracking-widest uppercase">Algorithm of the Day</span>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl lg:text-6xl font-black font-headline text-on-surface tracking-tight leading-none drop-shadow-lg">
                                #142: Invert Binary Tree
                            </h1>
                            <p className="text-slate-400 font-mono text-lg tracking-tight">Given the root of a binary tree, invert the tree, and return its root.</p>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2 px-4 py-2 glass-panel rounded-xl bg-surface-container/50 border border-outline-variant/20">
                                <span className="material-symbols-outlined text-secondary">monitoring</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase font-headline font-bold">Difficulty</span>
                                    <span className="text-sm font-bold text-secondary font-headline">HARD</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 glass-panel rounded-xl bg-surface-container/50 border border-outline-variant/20">
                                <span className="material-symbols-outlined text-tertiary">check_circle</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase font-headline font-bold">Acceptance</span>
                                    <span className="text-sm font-bold text-on-surface font-headline">76.4%</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 glass-panel rounded-xl bg-surface-container/50 border border-outline-variant/20">
                                <span className="material-symbols-outlined text-primary">groups</span>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase font-headline font-bold">Solvers</span>
                                    <span className="text-sm font-bold text-on-surface font-headline">12.4K</span>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button className="px-10 py-4 bg-secondary text-on-secondary font-headline font-black text-lg tracking-widest rounded-xl hover:scale-105 shadow-[0_0_30px_rgba(172,138,255,0.3)] transition-all duration-300 active:scale-95">
                                SOLVE NOW
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center lg:items-end justify-center space-y-4">
                        <div className="bg-surface-container-highest/50 backdrop-blur-md p-8 rounded-2xl flex flex-col items-center text-center w-full max-w-[320px] border border-outline-variant/20 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                            <span className="text-xs font-bold text-slate-500 uppercase font-headline tracking-[0.2em] mb-4">Ends in</span>
                            <div className="flex gap-4">
                                <div className="flex flex-col">
                                    <span className="text-4xl font-black font-headline text-on-surface">14</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-headline font-bold">Hrs</span>
                                </div>
                                <span className="text-4xl font-black font-headline text-secondary-dim">:</span>
                                <div className="flex flex-col">
                                    <span className="text-4xl font-black font-headline text-on-surface">32</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-headline font-bold">Min</span>
                                </div>
                                <span className="text-4xl font-black font-headline text-secondary-dim">:</span>
                                <div className="flex flex-col">
                                    <span className="text-4xl font-black font-headline text-on-surface">09</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-headline font-bold">Sec</span>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/5 w-full">
                                <div className="flex justify-between items-center text-xs font-headline font-bold mb-2">
                                    <span className="text-slate-400">DAILY GOAL</span>
                                    <span className="text-primary">85% COMPLETE</span>
                                </div>
                                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Previous Daily Challenges */}
            <section className="mt-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black font-headline text-on-surface tracking-tight uppercase">PREVIOUS DAILY CHALLENGES</h2>
                        <p className="text-slate-500 text-sm mt-1">Review your history and catch up on missed ranks.</p>
                    </div>
                    <button className="flex items-center gap-2 text-primary hover:text-primary-fixed transition-colors text-sm font-bold font-headline uppercase tracking-widest hidden sm:flex">
                        View Archive
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                </div>
                
                {/* Grid of Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="bg-surface-container-low/50 backdrop-blur-md p-6 rounded-xl hover:bg-surface-container transition-all group cursor-pointer border-l-4 border-l-tertiary border-y border-r border-outline-variant/10 shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-mono text-slate-500">MAY 23, 2024</span>
                            <span className="px-2 py-1 rounded bg-tertiary-container/20 text-tertiary text-[10px] font-bold font-headline border border-tertiary/20">EASY</span>
                        </div>
                        <h3 className="text-lg font-bold font-headline text-on-surface group-hover:text-primary transition-colors">#206: Reverse Linked List</h3>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                <div className="h-6 w-6 rounded-full border-2 border-surface bg-slate-800 flex items-center justify-center"><span className="material-symbols-outlined text-[10px] text-slate-400">person</span></div>
                                <div className="h-6 w-6 rounded-full border-2 border-surface bg-slate-700 flex items-center justify-center"><span className="material-symbols-outlined text-[10px] text-slate-400">person</span></div>
                                <div className="h-6 w-6 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[8px] font-bold text-slate-400">+2.4k</div>
                            </div>
                            <div className="flex items-center gap-1 text-primary">
                                <span className="material-symbols-outlined text-lg !font-variation-[FILL_1]">check_circle</span>
                                <span className="text-[10px] font-headline font-bold uppercase tracking-widest">Completed</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-surface-container-low/50 backdrop-blur-md p-6 rounded-xl hover:bg-surface-container transition-all group cursor-pointer border-l-4 border-l-secondary border-y border-r border-outline-variant/10 shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-mono text-slate-500">MAY 22, 2024</span>
                            <span className="px-2 py-1 rounded bg-secondary-container/20 text-secondary text-[10px] font-bold font-headline border border-secondary/20">MEDIUM</span>
                        </div>
                        <h3 className="text-lg font-bold font-headline text-on-surface group-hover:text-primary transition-colors">#15: 3Sum</h3>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                <div className="h-6 w-6 rounded-full border-2 border-surface bg-slate-800 flex items-center justify-center"><span className="material-symbols-outlined text-[10px] text-slate-400">person</span></div>
                                <div className="h-6 w-6 rounded-full border-2 border-surface bg-slate-700 flex items-center justify-center"><span className="material-symbols-outlined text-[10px] text-slate-400">person</span></div>
                            </div>
                            <div className="flex items-center gap-1 text-error">
                                <span className="material-symbols-outlined text-lg">error</span>
                                <span className="text-[10px] font-headline font-bold uppercase tracking-widest">Missed</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-surface-container-low/50 backdrop-blur-md p-6 rounded-xl hover:bg-surface-container transition-all group cursor-pointer border-l-4 border-l-error border-y border-r border-outline-variant/10 shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-mono text-slate-500">MAY 21, 2024</span>
                            <span className="px-2 py-1 rounded bg-error-container/20 text-error text-[10px] font-bold font-headline border border-error/20">HARD</span>
                        </div>
                        <h3 className="text-lg font-bold font-headline text-on-surface group-hover:text-primary transition-colors">#42: Trapping Rain Water</h3>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                <div className="h-6 w-6 rounded-full border-2 border-surface bg-slate-800 flex items-center justify-center"><span className="material-symbols-outlined text-[10px] text-slate-400">person</span></div>
                                <div className="h-6 w-6 rounded-full border-2 border-surface bg-slate-700 flex items-center justify-center"><span className="material-symbols-outlined text-[10px] text-slate-400">person</span></div>
                            </div>
                            <div className="flex items-center gap-1 text-primary">
                                <span className="material-symbols-outlined text-lg !font-variation-[FILL_1]">check_circle</span>
                                <span className="text-[10px] font-headline font-bold uppercase tracking-widest">Completed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Battle Feed Section */}
            <section className="mt-16">
                <h3 className="text-xl font-black font-headline text-on-surface tracking-widest uppercase mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">bolt</span>
                    Live Activity
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-variant/30 border-l-4 border-secondary border-y border-r border-outline-variant/10">
                        <span className="text-[10px] font-mono text-slate-500">2M AGO</span>
                        <p className="text-sm font-body">
                            <span className="font-bold text-primary">NeoCode</span> solved <span className="text-on-surface font-bold">#142</span> in <span className="text-secondary font-bold">12:45</span>
                        </p>
                        <div className="ml-auto text-xs font-headline font-bold text-tertiary">+150 XP</div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-variant/30 border-l-4 border-secondary/50 border-y border-r border-outline-variant/10">
                        <span className="text-[10px] font-mono text-slate-500">5M AGO</span>
                        <p className="text-sm font-body">
                            <span className="font-bold text-primary">BinaryWiz</span> reached <span className="text-secondary font-bold">Diamond Tier</span>
                        </p>
                        <div className="ml-auto text-xs font-headline font-bold text-tertiary">+500 XP</div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-surface-variant/30 border-l-4 border-secondary/30 border-y border-r border-outline-variant/10">
                        <span className="text-[10px] font-mono text-slate-500">8M AGO</span>
                        <p className="text-sm font-body">
                            <span className="font-bold text-primary">LogicLord</span> submitted a perfect solution for <span className="text-on-surface font-bold">#142</span>
                        </p>
                        <div className="ml-auto text-xs font-headline font-bold text-tertiary">+200 XP</div>
                    </div>
                </div>
            </section>
        </div>
    );
}
