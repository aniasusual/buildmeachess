import React, { useEffect } from 'react';
import { ChessPiece } from './ChessPiece';

export function PromotionDialog({ color, onSelect, onCancel }) {
  const pieces = [
    { type: 'q', name: 'Queen', key: 'Q' },
    { type: 'n', name: 'Knight', key: 'N' },
    { type: 'r', name: 'Rook', key: 'R' },
    { type: 'b', name: 'Bishop', key: 'B' },
  ];

  // Keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e) {
      const k = e.key.toLowerCase();
      if (k === 'q') onSelect('q');
      else if (k === 'n') onSelect('n');
      else if (k === 'r') onSelect('r');
      else if (k === 'b') onSelect('b');
      else if (e.key === 'Escape') onCancel?.();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelect, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <h3 className="text-xl font-bold text-slate-100 tracking-wide mb-1 font-outfit">
          Promote Pawn
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Select a piece to replace your advanced pawn
        </p>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {pieces.map(({ type, name, key }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="group flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-150 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
              title={`Promote to ${name} (${key})`}
            >
              <div className="w-14 h-14 p-1 transition-transform group-hover:scale-110">
                <ChessPiece type={type} color={color} />
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-amber-400 mt-1">
                {name}
              </span>
              <kbd className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-700/50 mt-1 font-mono">
                {key}
              </kbd>
            </button>
          ))}
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer py-1"
          >
            Cancel Move (Esc)
          </button>
        )}
      </div>
    </div>
  );
}
