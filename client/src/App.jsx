import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { supabase } from "./services/supabase";
import { disconnectSocket } from "./hooks/useSocket";
import SignIn from "./pages/SignIn";
import Matchmaking from "./pages/Matchmaking";
import Battle from "./pages/Battle";
import { ProfilePage, LeaderboardPage, ResultPage } from "./pages/Pages";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, user } = useAuth();

  if (!session) return children;

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-black text-primary-container font-body">
      <div className="scanline"></div>
      
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-secondary-container/40 flex justify-between items-center w-full px-6 py-3">
        <div className="text-xl font-headline font-bold text-primary-container tracking-widest text-shadow-glow uppercase cursor-pointer" onClick={() => navigate('/play')}>
          LEETBATTLE_SYS
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <button onClick={() => navigate('/play')} className={`font-headline tracking-[0.05em] uppercase font-bold hover:text-primary-container hover:bg-secondary-container/20 transition-all ${isActive('/play') ? 'text-primary-container border-b-2 border-primary-container pb-1' : 'text-secondary-container/60'}`}>ARENA</button>
          <button onClick={() => navigate('/leaderboard')} className={`font-headline tracking-[0.05em] uppercase font-bold hover:text-primary-container hover:bg-secondary-container/20 transition-all ${isActive('/leaderboard') ? 'text-primary-container border-b-2 border-primary-container pb-1' : 'text-secondary-container/60'}`}>RANKED</button>
          <button onClick={() => navigate('/profile')} className={`font-headline tracking-[0.05em] uppercase font-bold hover:text-primary-container hover:bg-secondary-container/20 transition-all ${isActive('/profile') ? 'text-primary-container border-b-2 border-primary-container pb-1' : 'text-secondary-container/60'}`}>LOGS</button>
        </nav>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary-container cursor-pointer hover:text-primary transition-colors">settings</span>
          <span className="material-symbols-outlined text-primary-container cursor-pointer hover:text-primary transition-colors">terminal</span>
          <span title="Sign Out" onClick={() => { disconnectSocket(); supabase.auth.signOut(); }} className="material-symbols-outlined text-primary-container cursor-pointer hover:text-error transition-colors">power_settings_new</span>
        </div>
      </header>
      
      {/* SideNavBar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full z-40 flex-col pt-16 w-64 border-r border-secondary-container/40 bg-black">
        <div className="px-6 py-8 flex flex-col gap-1">
          <div className="text-lg font-black text-primary-container font-headline uppercase truncate" title={user?.email || "OPERATOR"}>
            {user?.user_metadata?.username || "OPERATOR_01"}
          </div>
          <div className="text-[10px] text-secondary-container uppercase tracking-widest">RANK: ELITE</div>
        </div>
        <nav className="flex-1 flex flex-col px-4 gap-2">
          <button onClick={() => navigate('/profile')} className={`p-2 flex items-center gap-3 transition-all ${isActive('/profile') ? 'bg-primary-container text-black font-bold' : 'text-secondary-container hover:bg-secondary-container/30 hover:text-primary-container'}`}>
            <span className="material-symbols-outlined">grid_view</span>
            <span className="text-xs uppercase font-bold">DASHBOARD</span>
          </button>
          <button onClick={() => navigate('/play')} className={`p-2 flex items-center gap-3 transition-all ${isActive('/play') && !isActive('/battle') ? 'bg-primary-container text-black font-bold' : 'text-secondary-container hover:bg-secondary-container/30 hover:text-primary-container'}`}>
            <span className="material-symbols-outlined">swords</span>
            <span className="text-xs uppercase font-bold">BATTLE_INIT</span>
          </button>
          <button onClick={() => navigate('/leaderboard')} className={`p-2 flex items-center gap-3 transition-all ${isActive('/leaderboard') ? 'bg-primary-container text-black font-bold' : 'text-secondary-container hover:bg-secondary-container/30 hover:text-primary-container'}`}>
            <span className="material-symbols-outlined">leaderboard</span>
            <span className="text-xs uppercase font-bold">LADDER</span>
          </button>
          <button className={`p-2 flex items-center gap-3 transition-all text-secondary-container hover:bg-secondary-container/30 hover:text-primary-container`}>
            <span className="material-symbols-outlined">history</span>
            <span className="text-xs uppercase font-bold">REPLAYS</span>
          </button>
          {user?.email?.includes('@temp.sys') && (
            <button onClick={() => navigate('/signin')} className="p-2 mt-4 flex items-center gap-3 transition-all text-accent-bright hover:bg-secondary-container/30">
              <span className="material-symbols-outlined">login</span>
              <span className="text-xs uppercase font-bold">LOG IN / REGISTER</span>
            </button>
          )}
        </nav>
        <div className="p-4 mt-auto border-t border-secondary-container/20">
          <button onClick={() => navigate('/play')} className="w-full border border-primary-container text-primary-container py-2 text-xs font-bold uppercase hover:bg-primary-container hover:text-black transition-all">
            NEW_BATTLE
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="md:pl-64 pt-16 pb-8 min-h-screen flex items-start justify-center bg-surface relative z-10">
        <div className="w-full max-w-5xl px-4 md:px-8 mt-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full px-4 py-1 flex justify-between items-center z-50 bg-black border-t border-secondary-container/20">
        <div className="text-secondary-container font-body text-[8px] md:text-[10px] tracking-tighter uppercase">
            (C) 2024 LEETBATTLE_MAINFRAME // ALL_RIGHTS_RESERVED
        </div>
        <div className="hidden md:flex gap-6">
          <span className="text-primary-container font-body text-[10px] tracking-tighter">STATUS:NOMINAL</span>
          <span className="text-secondary-container font-body text-[10px] tracking-tighter">LATENCY:24MS</span>
          <span className="text-secondary-container font-body text-[10px] tracking-tighter">ENCRYPTION:ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const { session, loading, error } = useAuth();
  
  if (loading || !session) return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-primary-container font-mono text-sm tracking-widest text-shadow-glow animate-pulse">
        <div className="mb-4">CONNECTING_TO_MAINFRAME...</div>
        {error && <div className="text-error text-[10px] uppercase">WARN: {error}</div>}
      </div>
  );
  
  return (
    <Layout>
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] bg-error-container text-error px-4 py-2 text-xs font-bold uppercase border border-error">
          OFFLINE_MODE_ACTIVE: {error}
        </div>
      )}
      {children}
    </Layout>
  );
};

export default function App() {
  const { loading, session } = useAuth();

  if (loading) return (
      <div className="min-h-screen bg-black flex items-center justify-center text-primary-container font-mono text-sm tracking-widest text-shadow-glow animate-pulse">
        INITIALIZING_SYSTEMS...
      </div>
  );

  return (
    <>
      <Routes>
        <Route path="/signin" element={session && !session.user?.email?.includes('@temp.sys') ? <Navigate to="/play" /> : <SignIn />} />
        
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
