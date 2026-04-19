import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Auth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#94a3b8]" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#94a3b8] hidden sm:inline-block">
            Logged in as <strong className="text-[#f8fafc] font-semibold">{user.displayName}</strong>
          </span>
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-8 h-8 rounded-full border border-white/10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                {user.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/5 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline-block">Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          className="bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Sign in with Google
        </button>
      )}
    </div>
  );
}
