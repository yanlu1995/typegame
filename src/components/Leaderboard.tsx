import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Trophy, Clock, Target, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface Score {
  id: string;
  uid: string;
  username: string;
  wpm: number;
  accuracy: number;
  time: number;
  createdAt: any;
}

export function Leaderboard() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'scores'),
      orderBy('wpm', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newScores = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Score[];
      setScores(newScores);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaderboard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#1e293b] rounded-xl border border-white/10 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="text-[16px] font-semibold text-[#f8fafc] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#38bdf8]" />
          Global Leaderboard
        </h3>
        <span className="bg-[#4ade80]/10 text-[#4ade80] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
          ● Live
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-[#94a3b8]">Loading scores...</div>
        ) : scores.length === 0 ? (
          <div className="p-8 text-center text-[#94a3b8]">No scores yet. Be the first to play!</div>
        ) : (
          <div className="flex flex-col">
            {scores.map((score, index) => {
              const isCurrentUser = auth.currentUser?.uid === score.uid;
              
              return (
                <div 
                  key={score.id} 
                  className={cn(
                    "p-4 px-6 grid grid-cols-[24px_1fr_60px] items-center border-b border-white/5",
                    isCurrentUser ? "bg-[#38bdf8]/10 border-l-[3px] border-l-[#38bdf8]" : ""
                  )}
                >
                  <span className="text-[#94a3b8] text-sm font-semibold">{index + 1}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#f8fafc]">
                      {score.username} {isCurrentUser && "(You)"}
                    </span>
                    <span className="text-[11px] text-[#94a3b8]">
                      {score.accuracy.toFixed(0)}% Acc • {score.time.toFixed(1)}s
                    </span>
                  </div>
                  <span className="text-right font-bold text-[#38bdf8] font-mono">
                    {score.wpm.toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
