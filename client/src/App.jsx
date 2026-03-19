import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { supabase } from "./services/supabase";
import { disconnectSocket } from "./hooks/useSocket";
import SignIn from "./pages/SignIn";
import Matchmaking from "./pages/Matchmaking";
import Battle from "./pages/Battle";
import { ProfilePage, LeaderboardPage, ResultPage } from "./pages/Pages";

function Nav() {
  const navigate = useNavigate();
  const { session } = useAuth();

  if (!session) return null;

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: 52, borderBottom: "1px solid var(--border)",
      background: "var(--bg)", position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.5px" }}>
        Leet<span style={{ color: "var(--accent-bright)" }}>Battle</span>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {["Profile", "Play", "Leaderboard"].map((s) => (
          <button key={s} onClick={() => navigate(`/${s.toLowerCase()}`)} style={{
            padding: "6px 14px", fontSize: 13, fontWeight: 500,
            borderRadius: 6, cursor: "pointer", fontFamily: "var(--font-sans)",
            border: "none", background: "transparent",
            color: "var(--text2)", transition: "all 0.15s",
          }}>{s}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => { disconnectSocket(); supabase.auth.signOut(); }} style={{ fontSize: 12, cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-2)' }}>Sign Out</button>
        <div style={{
          width: 32, height: 32, borderRadius: "50%", background: "var(--accent-dim)",
          border: "1px solid rgba(162,155,254,0.3)", display: "flex", alignItems: "center",
          justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 11,
          fontWeight: 700, color: "var(--accent-bright)"
        }}>ME</div>
      </div>
    </nav>
  );
}

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!session) return <Navigate to="/signin" />;
  return children;
};

export default function App() {
  const { loading } = useAuth();

  if (loading) return <div style={{ color: 'white', padding: 20 }}>Initializing App...</div>;

  return (
    <>
      <Nav />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/play" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>} />
        <Route path="/battle" element={<ProtectedRoute><Battle /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/play" />} />
      </Routes>
    </>
  );
}
