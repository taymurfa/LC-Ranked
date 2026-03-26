import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { username } }
                });
                if (error) throw error;
                navigate('/play');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/play');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden font-body text-on-surface fade-in">
            {/* Background Beams */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]"></div>
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px]"></div>
            </div>

            <div className="w-full max-w-lg px-8 relative z-10 slide-up">
                
                <div className="mb-10 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                            <span className="material-symbols-outlined text-[40px] text-on-primary-container">terminal</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tight text-white mb-2 uppercase">
                        LeetBattle
                    </h1>
                    <p className="text-on-surface-variant font-mono text-xs tracking-widest uppercase">
                        {isSignUp ? "OPERATOR REGISTRATION" : "SYSTEM AUTHENTICATION"}
                    </p>
                </div>

                <div className="glass-card bg-surface-container-low/80 p-8 md:p-10 rounded-2xl border border-outline-variant/30 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                    
                    {error && (
                        <div className="bg-error/10 border border-error/50 rounded-xl p-4 mb-6">
                            <p className="text-error text-xs font-mono tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">warning</span>
                                {error}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {isSignUp && (
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] text-on-surface-variant tracking-[0.2em] font-bold font-headline uppercase">
                                    Operator Callsign
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Username"
                                    value={username} onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-surface-container border border-outline-variant text-white px-4 py-3 rounded-xl placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-mono text-sm"
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-on-surface-variant tracking-[0.2em] font-bold font-headline uppercase">
                                Identity Token
                            </label>
                            <input
                                required
                                type="email"
                                placeholder="operator@network.sys"
                                value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-surface-container border border-outline-variant text-white px-4 py-3 rounded-xl placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-mono text-sm"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-on-surface-variant tracking-[0.2em] font-bold font-headline uppercase">
                                Access Code
                            </label>
                            <input
                                required
                                type="password"
                                placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full bg-surface-container border border-outline-variant text-white px-4 py-3 rounded-xl placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-mono text-sm tracking-widest"
                            />
                        </div>

                        <button 
                            disabled={loading} 
                            type="submit" 
                            className="w-full mt-6 bg-primary text-on-primary font-headline font-black py-4 rounded-xl text-sm md:text-base tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(163,166,255,0.4)] active:scale-95 hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(163,166,255,0.6)]"
                        >
                            {loading ? "PROCESSING..." : (isSignUp ? "INITIALIZE" : "ENTER MATRIX")}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center flex flex-col items-center">
                        <span className="text-on-surface-variant text-xs font-mono uppercase tracking-wider mb-3">
                            {isSignUp ? "ALREADY IN DIRECTORY?" : "NO PROFILE DETECTED?"}
                        </span>
                        <button 
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)} 
                            className="text-primary text-xs font-headline font-bold uppercase hover:text-primary-container transition-colors tracking-widest py-2 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/20"
                        >
                            {isSignUp ? "AUTHENTICATE" : "CREATE DISK RECORD"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
