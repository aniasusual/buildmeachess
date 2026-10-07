import React from 'react';
import { ChessPiece } from './ChessPiece';

export function CapturedPieces({ capturedList = [], advantage = 0, pieceColor = 'w', pieceStyle = 'staunton' }) {
  // Sort pieces by standard value order: p, n, b, r, q
  const order = { p: 1, n: 2, b: 3, r: 4, q: 5 };
  const sorted = [...capturedList].sort((a, b) => (order[a] || 0) - (order[b] || 0));

  // Count piece occurrences
  const counts = {};
  for (const p of sorted) {
    counts[p] = (counts[p] || 0) + 1;
  }

  const uniquePieces = Object.keys(counts);

  return (
    <div className="flex items-center gap-1.5 min-h-[28px] px-2 py-1 rounded-lg bg-slate-900/40 border border-slate-800/50 backdrop-blur-xs">
      <div className="flex items-center -space-x-1 overflow-x-auto py-0.5">
        {uniquePieces.map((type) => (
          <div key={type} className="flex items-center relative">
            <div className="w-5 h-5 flex-shrink-0">
              <ChessPiece type={type} color={pieceColor} style={pieceStyle} />
            </div>
            {counts[type] > 1 && (
              <span className="text-[10px] font-bold text-slate-400 font-mono -ml-0.5 mr-1">
                {counts[type]}
              </span>
            )}
          </div>
        ))}
        {uniquePieces.length === 0 && (
          <span className="text-[11px] text-slate-500 italic px-1">None</span>
        )}
      </div>

      {advantage > 0 && (
        <span className="ml-auto text-xs font-bold font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded shadow-xs">
          +{advantage}
        </span>
      )}
    </div>
  );
}
