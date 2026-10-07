import React, { useRef, useEffect } from 'react';
import { ChevronFirst, ChevronLeft, ChevronRight, ChevronLast, BookOpen, Copy, Download, Check } from 'lucide-react';
import { identifyOpening } from '../../chess/openings';

export function MoveHistory({
  history = [],
  currentPlyIndex = -1,
  onNavigatePly,
  onCopyPgn,
  onCopyFen,
  onDownloadPgn,
  fen = ""
}) {
  const scrollRef = useRef(null);
  const [copiedPgn, setCopiedPgn] = React.useState(false);
  const [copiedFen, setCopiedFen] = React.useState(false);

  // Group moves into turns: [ { number: 1, white: Move, black: Move }, ... ]
  const turns = [];
  for (let i = 0; i < history.length; i += 2) {
    turns.push({
      turnNum: Math.floor(i / 2) + 1,
      white: history[i],
      whiteIndex: i,
      black: history[i + 1] || null,
      blackIndex: i + 1
    });
  }

  // Active opening identification
  const sanList = history.map(h => h.san);
  const opening = identifyOpening(sanList);

  // Auto-scroll to bottom of move list when moves added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  const handleCopyPgn = () => {
    onCopyPgn?.();
    setCopiedPgn(true);
    setTimeout(() => setCopiedPgn(false), 2000);
  };

  const handleCopyFen = () => {
    onCopyFen?.();
    setCopiedFen(true);
    setTimeout(() => setCopiedFen(false), 2000);
  };

  const maxPly = history.length - 1;
  const isAtStart = currentPlyIndex === -1;
  const isAtEnd = currentPlyIndex === maxPly;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl overflow-hidden">
      {/* Opening Header */}
      <div className="flex items-center gap-2 pb-2.5 mb-2 border-b border-slate-800/80">
        <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-200 truncate font-outfit">
              {opening.name}
            </span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {opening.eco}
            </span>
          </div>
        </div>
      </div>

      {/* Move List Scrollable Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-0.5 pr-1 font-mono text-xs select-none min-h-[160px] max-h-[320px] scrollbar-thin scrollbar-thumb-slate-700"
      >
        {turns.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 italic text-xs py-8">
            Moves will appear here
          </div>
        ) : (
          turns.map(({ turnNum, white, whiteIndex, black, blackIndex }) => (
            <div
              key={turnNum}
              className="grid grid-cols-[36px_1fr_1fr] items-center py-1 px-2 rounded hover:bg-slate-800/40 transition-colors"
            >
              {/* Turn Number */}
              <span className="text-slate-500 font-semibold">{turnNum}.</span>

              {/* White Move */}
              <button
                onClick={() => onNavigatePly?.(whiteIndex)}
                className={`text-left px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                  currentPlyIndex === whiteIndex
                    ? 'bg-amber-500/25 text-amber-300 font-bold shadow-xs'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {white.san}
              </button>

              {/* Black Move */}
              {black ? (
                <button
                  onClick={() => onNavigatePly?.(blackIndex)}
                  className={`text-left px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                    currentPlyIndex === blackIndex
                      ? 'bg-amber-500/25 text-amber-300 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {black.san}
                </button>
              ) : (
                <span />
              )}
            </div>
          ))
        )}
      </div>

      {/* Navigation Buttons: First, Prev, Next, Last */}
      <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNavigatePly?.(-1)}
            disabled={isAtStart}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="First Move"
          >
            <ChevronFirst className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigatePly?.(Math.max(-1, currentPlyIndex - 1))}
            disabled={isAtStart}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Previous Move"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigatePly?.(Math.min(maxPly, currentPlyIndex + 1))}
            disabled={isAtEnd}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Next Move"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigatePly?.(maxPly)}
            disabled={isAtEnd}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Current / Last Move"
          >
            <ChevronLast className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons: Copy PGN, Copy FEN, Download PGN */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyFen}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            title="Copy FEN Position"
          >
            {copiedFen ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-[10px] font-mono font-bold">FEN</span>}
          </button>
          <button
            onClick={handleCopyPgn}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            title="Copy PGN Game Record"
          >
            {copiedPgn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onDownloadPgn}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            title="Download PGN File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
