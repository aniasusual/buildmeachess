import React from 'react';
import { getWinChance } from '../../chess/engine';

export function EvalBar({ centipawns = 0, isMate = false, mateIn = 0, turn = 'w' }) {
  // Win chance 0% to 100% for White
  let whitePercent = 50;

  if (isMate) {
    whitePercent = mateIn > 0 ? 100 : 0;
  } else {
    whitePercent = getWinChance(centipawns);
  }

  // Numerical display string
  let displayScore = "0.0";
  if (isMate) {
    displayScore = `M${Math.abs(mateIn)}`;
  } else {
    const pawns = (centipawns / 100).toFixed(1);
    displayScore = centipawns > 0 ? `+${pawns}` : `${pawns}`;
  }

  return (
    <div
      className="relative w-7 sm:w-8 h-full min-h-[300px] rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 shadow-lg flex flex-col justify-between select-none"
      title={`Evaluation: ${displayScore}`}
    >
      {/* Black's share (top) */}
      <div
        className="w-full bg-slate-950 transition-all duration-500 ease-out flex items-start justify-center pt-2"
        style={{ height: `${100 - whitePercent}%` }}
      >
        {whitePercent < 50 && (
          <span className="text-[10px] font-bold text-slate-300 font-mono drop-shadow">
            {displayScore}
          </span>
        )}
      </div>

      {/* Center divider line */}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-500/40 pointer-events-none" />

      {/* White's share (bottom) */}
      <div
        className="w-full bg-slate-100 transition-all duration-500 ease-out flex items-end justify-center pb-2"
        style={{ height: `${whitePercent}%` }}
      >
        {whitePercent >= 50 && (
          <span className="text-[10px] font-bold text-slate-800 font-mono drop-shadow">
            {displayScore}
          </span>
        )}
      </div>
    </div>
  );
}
