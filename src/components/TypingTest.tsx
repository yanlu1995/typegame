import { useState, useEffect, useRef, useMemo } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { RefreshCw, Play, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const QUOTES = [
  "The only limit to our realization of tomorrow will be our doubts of today.",
  "In the end, it's not the years in your life that count. It's the life in your years.",
  "Many of life's failures are people who did not realize how close they were to success when they gave up.",
  "If you want to live a happy life, tie it to a goal, not to people or things.",
  "Never let the fear of striking out keep you from playing the game.",
  "Money and success don't change people; they merely amplify what is already there.",
  "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma.",
  "Not how long, but how well you have lived is the main thing.",
  "If life were predictable it would cease to be life, and be without flavor.",
  "The whole secret of a successful life is to find out what is one's destiny to do, and then do it.",
  "In order to write about life first you must live it.",
  "The big lesson in life, baby, is never be scared of anyone or anything.",
  "Sing like no one's listening, love like you've never been hurt, dance like nobody's watching, and live like it's heaven on earth.",
  "Curiosity about life in all of its aspects, I think, is still the secret of great creative people.",
  "Life is not a problem to be solved, but a reality to be experienced."
];

function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

export function TypingTest() {
  const [quote, setQuote] = useState(getRandomQuote());
  const [input, setInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const resetTest = () => {
    setQuote(getRandomQuote());
    setInput('');
    setIsStarted(false);
    setIsFinished(false);
    setStartTime(null);
    setEndTime(null);
    setSubmitError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;

    const value = e.target.value;
    
    if (!isStarted && value.length > 0) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    setInput(value);

    if (value === quote) {
      setIsFinished(true);
      setEndTime(Date.now());
    }
  };

  const stats = useMemo(() => {
    if (!startTime) return { wpm: 0, accuracy: 0, time: 0 };
    
    const currentEndTime = endTime || Date.now();
    const timeInSeconds = (currentEndTime - startTime) / 1000;
    const timeInMinutes = timeInSeconds / 60;
    
    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === quote[i]) {
        correctChars++;
      }
    }
    const accuracy = input.length > 0 ? (correctChars / input.length) * 100 : 100;
    
    // Calculate WPM (standard is 5 chars per word)
    const wordsTyped = correctChars / 5;
    const wpm = timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0;

    return { wpm, accuracy, time: timeInSeconds };
  }, [input, quote, startTime, endTime]);

  useEffect(() => {
    if (isFinished && auth.currentUser) {
      submitScore();
    }
  }, [isFinished]);

  const submitScore = async () => {
    if (!auth.currentUser) return;
    
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      await addDoc(collection(db, 'scores'), {
        uid: auth.currentUser.uid,
        username: auth.currentUser.displayName || 'Anonymous',
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        time: stats.time,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error submitting score:", error);
      setSubmitError("Failed to submit score. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Render the quote with correct/incorrect highlighting
  const renderQuote = () => {
    return quote.split('').map((char, index) => {
      let colorClass = "text-[#94a3b8]"; // not typed yet
      
      if (index < input.length) {
        if (input[index] === char) {
          colorClass = "text-[#f8fafc]"; // correct
        } else {
          colorClass = "bg-[#f87171]/30 text-[#f87171] rounded-[2px]"; // incorrect
        }
      } else if (index === input.length && isStarted && !isFinished) {
        colorClass = "border-l-2 border-[#38bdf8] animate-[blink_1s_infinite_step-end]"; // current cursor
      }

      return (
        <span key={index} className={cn("transition-colors duration-75", colorClass)}>
          {char}
        </span>
      );
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      resetTest();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-10 p-4 sm:p-10">
      <div className="flex gap-10 mb-5">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[1px] text-[#94a3b8]">WPM</span>
          <span className="text-[32px] font-bold text-[#38bdf8] font-mono">{stats.wpm}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[1px] text-[#94a3b8]">Accuracy</span>
          <span className="text-[32px] font-bold text-[#38bdf8] font-mono">{stats.accuracy.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[1px] text-[#94a3b8]">Time</span>
          <span className="text-[32px] font-bold text-[#38bdf8] font-mono">{stats.time.toFixed(1)}s</span>
        </div>
      </div>

      <div 
        className="font-mono text-[28px] leading-[1.6] text-[#94a3b8] relative cursor-text min-h-[160px]"
        onClick={() => inputRef.current?.focus()}
      >
        {renderQuote()}
      </div>

      <div className="relative mt-5">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isFinished}
          className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-6 font-mono text-[20px] text-[#f8fafc] outline-none disabled:opacity-50 transition-all"
          placeholder={isStarted ? "" : "Start typing to begin..."}
          autoFocus
        />
      </div>

      <div className="text-[#94a3b8] text-[13px] text-center mt-auto">
        Press <span className="bg-[#334155] px-1.5 py-0.5 rounded text-white">Enter</span> to restart test
      </div>

      {isFinished && (
        <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-xl font-bold text-[#f8fafc]">
            Test Complete! 🎉
          </div>
          
          {!auth.currentUser && (
            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-3 rounded-lg border border-amber-500/20">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">Sign in to save your score to the leaderboard!</p>
            </div>
          )}

          {submitError && (
            <div className="text-[#f87171] text-sm font-medium">{submitError}</div>
          )}

          <button
            onClick={resetTest}
            className="flex items-center gap-2 px-6 py-3 bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-[#0f172a] rounded-xl font-bold uppercase tracking-wide transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
