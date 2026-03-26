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
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-14 bg-slate-950/50 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
        <div className="flex items-center gap-8">
          <h1 onClick={() => navigate('/play')} className="cursor-pointer text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent font-headline tracking-tight">
            LeetBattle
          </h1>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => navigate('/play')} className={`transition-colors ${isActive('/play') ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'}`}>Arena</button>
            <button onClick={() => navigate('/leaderboard')} className={`transition-colors ${isActive('/leaderboard') ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'}`}>Leaderboard</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-slate-300">{user?.user_metadata?.username || "Guest"}</span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest">{user?.email?.includes('@temp.sys') ? 'UNREGISTERED' : 'VERIFIED'}</span>
          </div>
          <button title="Settings" className="p-1 text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">settings</span>
          </button>
          <button title="Sign Out" onClick={() => { disconnectSocket(); supabase.auth.signOut(); }} className="p-1 text-slate-400 hover:text-error transition-colors">
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </header>
      
      {/* SideNavBar (Floating Glassmorphism) */}
      <nav className="fixed left-4 top-20 bottom-4 w-64 flex-col py-6 bg-slate-950/40 backdrop-blur-2xl rounded-xl hidden lg:flex shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-sm">terminal</span>
            </div>
            <div>
              <h2 className="font-headline font-black text-indigo-500 text-sm tracking-widest uppercase">LEETBATTLE</h2>
              <p className="text-[10px] text-slate-500 tracking-[0.2em]">MASTER TIER</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1 px-2">
          <button onClick={() => navigate('/profile')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive('/profile') ? 'text-indigo-400 bg-indigo-500/10 border-l-2 border-indigo-500 rounded-r-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">dashboard</span>
            <span className="font-headline uppercase tracking-widest text-xs">Dashboard</span>
          </button>
          <button onClick={() => navigate('/play')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive('/play') && !isActive('/battle') ? 'text-indigo-400 bg-indigo-500/10 border-l-2 border-indigo-500 rounded-r-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">swords</span>
            <span className="font-headline uppercase tracking-widest text-xs">Arena</span>
          </button>
          <button onClick={() => navigate('/leaderboard')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${isActive('/leaderboard') ? 'text-indigo-400 bg-indigo-500/10 border-l-2 border-indigo-500 rounded-r-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">leaderboard</span>
            <span className="font-headline uppercase tracking-widest text-xs">Leaderboard</span>
          </button>
          {user?.email?.includes('@temp.sys') && (
            <button onClick={() => navigate('/signin')} className={`flex items-center gap-3 px-4 py-3 mt-4 text-primary rounded-lg transition-all duration-300 group hover:bg-white/5`}>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">login</span>
              <span className="font-headline uppercase tracking-widest text-xs">Log In / Register</span>
            </button>
          )}
        </div>
        <div className="px-4 mt-auto">
          <button onClick={() => navigate('/play')} className="w-full py-3 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(163,166,255,0.3)]">
            START MATCH
          </button>
        </div>
      </nav>

      {/* Main Canvas */}
      <main className="lg:ml-[18rem] pt-20 px-4 md:px-6 pb-12 relative z-10 flex justify-center">
        <div className="w-full max-w-6xl">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 w-full h-16 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-4 z-50">
        <button onClick={() => navigate('/play')} className={`flex flex-col items-center gap-1 ${isActive('/play') && !isActive('/battle') ? 'text-indigo-400' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined text-xl">swords</span>
          <span className="text-[10px] font-bold">Arena</span>
        </button>
        <button onClick={() => navigate('/leaderboard')} className={`flex flex-col items-center gap-1 ${isActive('/leaderboard') ? 'text-indigo-400' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined text-xl">leaderboard</span>
          <span className="text-[10px] font-bold">Rank</span>
        </button>
        <button onClick={() => navigate('/profile')} className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-indigo-400' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined text-xl">person</span>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
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
