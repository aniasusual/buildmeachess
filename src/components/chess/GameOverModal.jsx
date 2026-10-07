import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Eye, Award, X } from 'lucide-react';

export function GameOverModal({
  winner,
  reason,
  onRematch,
  onNewGame,
  onClose,
  isPlayerWinner = false
}) {
  useEffect(() => {
    if (isPlayerWinner) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore confetti failures
      }
    }
  }, [isPlayerWinner]);

  let resultTitle = "Game Drawn";
  let subtitle = reason || "Draw agreed";
  let titleColor = "text-amber-300";

  if (winner === 'w') {
    resultTitle = "White is Victorious!";
    titleColor = "text-amber-400";
  } else if (winner === 'b') {
    resultTitle = "Black is Victorious!";
    titleColor = "text-indigo-400";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy / Emblem */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-300/10 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 drop-shadow" />
        </div>

        {/* Title & Reason */}
        <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-wide font-outfit mb-2 ${titleColor}`}>
          {resultTitle}
        </h2>
        <p className="text-slate-300 font-medium text-sm sm:text-base mb-6">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onRematch}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <RefreshCw className="w-4 h-4" />
            Rematch
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Review Board
          </button>
        </div>
      </div>
    </div>
  );
}
