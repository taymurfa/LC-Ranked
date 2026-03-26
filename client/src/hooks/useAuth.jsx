import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
            if (!mounted) return;
            
            // Generate guest info
            const guestId = Math.random().toString(36).slice(2, 8).toUpperCase();
            const guestEmail = `guest_${Date.now()}_${guestId}@temp.com`;
            
            if (sessionError || !import.meta.env.VITE_SUPABASE_URL) {
                // If Supabase is missing .env or unconfigured on their machine, gracefully mock the session to allow UI viewing
                setError("SUPABASE_NOT_CONFIGURED: Falling back to Local Simulation Mode.");
                setSession({
                    user: { email: guestEmail, user_metadata: { username: `LOCAL_GUEST_${guestId}` } },
                    access_token: 'valid_mock_token'
                });
                setLoading(false);
                return;
            }

            if (!session) {
                const guestPassword = `pwd_${Math.random()}`;
                
                supabase.auth.signUp({
                    email: guestEmail,
                    password: guestPassword,
                    options: { data: { username: `GUEST_${guestId}` } }
                }).then(({ data, error }) => {
                    if (error) {
                        console.error("Guest Auth Error:", error);
                        if (mounted) {
                            setError(error.message);
                            // Fallback to local session on rate limit to still show the dashboard
                            setSession({
                                user: { email: guestEmail, user_metadata: { username: `LOCAL_GUEST_${guestId}` } },
                                access_token: 'valid_mock_token'
                            });
                            setLoading(false);
                        }
                    } else if (!data.session) {
                        if (mounted) {
                            setError("Supabase required email confirmation for signup. Guest auto-login failed.");
                            setLoading(false);
                        }
                    }
                }).catch(err => {
                    // Fallback on total failure like "Failed to fetch"
                    setError(err.message);
                    setSession({
                        user: { email: guestEmail, user_metadata: { username: `LOCAL_GUEST_${guestId}` } },
                        access_token: 'valid_mock_token'
                    });
                    setLoading(false);
                });
            } else {
                setSession(session);
                setLoading(false);
            }
        }).catch(err => {
            if (!mounted) return;
            const guestId = Math.random().toString(36).slice(2, 8).toUpperCase();
            setError(err.message);
            setSession({
                user: { email: `guest_${guestId}@temp.com`, user_metadata: { username: `LOCAL_GUEST_${guestId}` } },
                access_token: 'valid_mock_token'
            });
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return;
            setSession(session);
            setLoading(false); // Make sure we stop loading!
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const value = {
        session,
        user: session?.user,
        token: session?.access_token,
        loading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};
