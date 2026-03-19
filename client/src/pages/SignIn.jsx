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
                // use Supabase native auth
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { username } }
                });
                if (error) throw error;
                // The backend has an auto-create profile on insert for auth.users
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
        <div style={{
            maxWidth: 400, margin: "10vh auto", padding: "2.5rem",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, animation: "slideUp 0.25s ease"
        }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-1px" }}>
                    Leet<span style={{ color: "var(--accent-bright)" }}>Battle</span>
                </div>
                <div style={{ fontSize: 14, color: "var(--text-2)", marginTop: 8 }}>
                    {isSignUp ? "Create a new account" : "Sign in to continue"}
                </div>
            </div>

            {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16, textAlign: "center" }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {isSignUp && (
                    <input
                        required
                        type="text"
                        placeholder="Username"
                        value={username} onChange={e => setUsername(e.target.value)}
                        style={inputStyle}
                    />
                )}
                <input
                    required
                    type="email"
                    placeholder="Email address"
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                />
                <input
                    required
                    type="password"
                    placeholder="Password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    style={inputStyle}
                />

                <button disabled={loading} type="submit" style={{
                    padding: 14, borderRadius: 8, fontSize: 15, fontWeight: 600,
                    border: "none", background: "var(--accent)", color: "#fff",
                    cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s"
                }}>
                    {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
                </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-2)" }}>
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button onClick={() => setIsSignUp(!isSignUp)} style={{
                    background: "none", border: "none", color: "var(--accent-bright)",
                    cursor: "pointer", fontWeight: 600, marginLeft: 4
                }}>
                    {isSignUp ? "Sign In" : "Sign Up"}
                </button>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 8,
    background: "var(--surface-2)", border: "1px solid var(--border)",
    color: "var(--text)", fontSize: 14, fontFamily: "var(--font-sans)"
};
