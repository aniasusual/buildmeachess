import React from 'react';
import { Clock, Shield, Bot, User } from 'lucide-react';

export function ClockTimer({
  playerName = 'Player',
  isBot = false,
  elo = 1200,
  secondsRemaining = 600,
  isActive = false,
  color = 'w',
  isUnlimited = false,
  capturedComponent = null
}) {
  const isWhite = color === 'w';

  // Format time display (MM:SS or SS.s when under 20 seconds)
  const formatTime = (secs) => {
    if (isUnlimited) return '∞';
    if (secs <= 0) return '00:00';

    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);

    if (secs < 20) {
      const tenths = Math.floor((secs % 1) * 10);
      return `${String(s).padStart(2, '0')}.${tenths}`;
    }

    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isLowTime = !isUnlimited && secondsRemaining < 30 && secondsRemaining > 0;
  const isTimeOut = !isUnlimited && secondsRemaining <= 0;

  return (
    <div
      className={`flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl border transition-all duration-300 ${
        isActive
          ? 'bg-slate-800/90 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
          : 'bg-slate-900/60 border-slate-800/70 opacity-90'
      }`}
    >
      {/* Player Information & Avatar */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm border shadow-inner ${
            isWhite
              ? 'bg-slate-100 text-slate-900 border-slate-300'
              : 'bg-slate-950 text-slate-100 border-slate-700'
          }`}
        >
          {isBot ? <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" /> : <User className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate font-outfit">
              {playerName}
            </span>
            <span className="text-[10px] text-slate-400 font-mono px-1 py-0.2 rounded bg-slate-800/80 border border-slate-700/60">
              {elo}
            </span>
          </div>

          {/* Captured pieces slot */}
          {capturedComponent && (
            <div className="mt-1">
              {capturedComponent}
            </div>
          )}
        </div>
      </div>

      {/* Clock Digital Display */}
      <div
        className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-mono text-sm sm:text-base font-bold transition-all shadow-inner ${
          isTimeOut
            ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
            : isLowTime
            ? 'bg-amber-950/70 border-amber-500 text-amber-300 animate-pulse'
            : isActive
            ? 'bg-slate-950 border-amber-500/40 text-amber-300'
            : 'bg-slate-950/70 border-slate-800 text-slate-400'
        }`}
      >
        <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400 animate-spin-slow' : 'text-slate-500'}`} />
        <span>{formatTime(secondsRemaining)}</span>
      </div>
    </div>
  );
}
