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
        <div className="min-h-screen flex items-center justify-center bg-surface relative">
            <div className="w-full max-w-lg px-8 z-10 slide-up">
                
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-[0.1em] text-primary-container text-shadow-glow uppercase mb-2">
                        LEETBATTLE_SYS
                    </h1>
                    <p className="text-secondary-container uppercase text-xs tracking-widest">
                        SUB_ROUTINE: {isSignUp ? "REGISTRATION" : "AUTHENTICATION"}
                    </p>
                </div>

                <div className="relative">
                    {/* ASCII Frame */}
                    <div className="ascii-border text-secondary-container/40 absolute -top-4 -left-4 w-[110%] h-full pointer-events-none select-none hidden md:block">
                        ╔═══════════════════════════════════════════════════════════╗
                    </div>
                    <div className="ascii-border text-secondary-container/40 absolute -bottom-4 -left-4 w-[110%] pointer-events-none select-none hidden md:block">
                        ╚═══════════════════════════════════════════════════════════╝
                    </div>
                    
                    <div className="bg-surface-container-lowest border border-secondary-container/20 p-8 md:p-10 relative z-10">
                        {error && (
                            <div className="bg-error-container/20 border-l-4 border-error p-3 mb-6">
                                <p className="text-error text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">warning</span>
                                    {error}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {isSignUp && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] text-secondary-container tracking-[0.2em] uppercase">
                                        &gt; INPUT_CALLSIGN
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Operator Name"
                                        value={username} onChange={e => setUsername(e.target.value)}
                                        className="w-full bg-surface-container-low border border-secondary-container/40 text-primary-container px-4 py-3 placeholder:text-secondary-container/30 focus:border-primary-container focus:outline-none transition-colors font-mono text-sm"
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] text-secondary-container tracking-[0.2em] uppercase">
                                    &gt; IDENTITY_TOKEN (EMAIL)
                                </label>
                                <input
                                    required
                                    type="email"
                                    placeholder="operator@network.sys"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-surface-container-low border border-secondary-container/40 text-primary-container px-4 py-3 placeholder:text-secondary-container/30 focus:border-primary-container focus:outline-none transition-colors font-mono text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] text-secondary-container tracking-[0.2em] uppercase">
                                    &gt; ACCESS_CODE (PASSWORD)
                                </label>
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-surface-container-low border border-secondary-container/40 text-primary-container px-4 py-3 placeholder:text-secondary-container/30 focus:border-primary-container focus:outline-none transition-colors font-mono text-sm tracking-widest"
                                />
                            </div>

                            <button 
                                disabled={loading} 
                                type="submit" 
                                className="w-full mt-4 bg-primary-container text-black font-headline font-black py-4 text-sm md:text-base tracking-[0.2em] uppercase transition-all active:scale-[0.98] hover:bg-primary-fixed-dim disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "PROCESSING..." : (isSignUp ? "[ INITIATE_REGISTER ]" : "[ EXECUTE_LOGIN ]")}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-secondary-container/20 text-center">
                            <span className="text-secondary-container text-xs tracking-wider uppercase">
                                {isSignUp ? "ALREADY_IN_DATABASE?" : "NO_RECORD_FOUND?"}
                            </span>
                            <button 
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)} 
                                className="ml-3 text-primary-container text-xs font-bold uppercase hover:text-primary-fixed transition-colors underline decoration-secondary-container/50 underline-offset-4"
                            >
                                {isSignUp ? "SWITCH_TO_LOGIN" : "CREATE_RECORD"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
