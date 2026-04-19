/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Auth } from './components/Auth';
import { TypingTest } from './components/TypingTest';
import { Leaderboard } from './components/Leaderboard';
import { Keyboard, Trophy } from 'lucide-react';
import { cn } from './lib/utils';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="flex items-center gap-2">
      <Link 
        to="/" 
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm",
          location.pathname === "/" 
            ? "bg-[#38bdf8]/10 text-[#38bdf8]" 
            : "text-[#94a3b8] hover:bg-white/5 hover:text-[#f8fafc]"
        )}
      >
        <Keyboard className="w-4 h-4" />
        <span className="hidden sm:inline-block">Practice</span>
      </Link>
      <Link 
        to="/leaderboard" 
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm",
          location.pathname === "/leaderboard" 
            ? "bg-[#38bdf8]/10 text-[#38bdf8]" 
            : "text-[#94a3b8] hover:bg-white/5 hover:text-[#f8fafc]"
        )}
      >
        <Trophy className="w-4 h-4" />
        <span className="hidden sm:inline-block">Leaderboard</span>
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] font-sans selection:bg-[#38bdf8]/30 selection:text-[#38bdf8] flex flex-col">
        <header className="sticky top-0 z-10 h-[70px] px-6 sm:px-10 flex items-center justify-between bg-[#0f172a]/80 backdrop-blur-[10px] border-b border-white/10">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-extrabold text-2xl tracking-tight text-[#38bdf8]">TypeMaster</span>
            </Link>
            <Navigation />
          </div>
          <Auth />
        </header>

        <main className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <Routes>
            <Route path="/" element={<TypingTest />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

