import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { Copy, Check, FileInput, X, Sparkles } from 'lucide-react';

export function FenModal({ currentFen, onLoadFen, onClose }) {
  const [fenInput, setFenInput] = useState(currentFen);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const presets = [
    {
      name: "Standard Starting Position",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    },
    {
      name: "Lucena Position (Rook Endgame)",
      fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1"
    },
    {
      name: "Philidor Position (Rook Defense)",
      fen: "4k3/R7/8/8/8/8/1r6/4K3 b - - 0 1"
    },
    {
      name: "Queen vs King & Rook",
      fen: "8/8/8/4k3/8/8/r7/4K1Q1 w - - 0 1"
    },
    {
      name: "Pawn Race Endgame",
      fen: "8/5p2/8/5K2/8/8/4p3/4k3 w - - 0 1"
    },
    {
      name: "Opera Game Position",
      fen: "4kb1r/p2rqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 14"
    },
    {
      name: "Pawn Promotion Practice",
      fen: "8/2k1P3/8/8/8/8/8/4K3 w - - 0 1"
    }
  ];

  const handleApply = () => {
    try {
      const validator = new Chess();
      validator.load(fenInput.trim());
      onLoadFen(fenInput.trim());
      onClose();
    } catch {
      setError('Invalid FEN position string. Please verify chess notation.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFen);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white font-outfit">
            Load Position / FEN
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Paste any standard Forsyth-Edwards Notation (FEN) string or pick from training presets.
        </p>

        {/* Text Input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            FEN String
          </label>
          <textarea
            value={fenInput}
            onChange={(e) => {
              setFenInput(e.target.value);
              setError('');
            }}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 resize-none"
            placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          />
          {error && (
            <p className="text-xs text-rose-400 mt-1 font-medium">{error}</p>
          )}
        </div>

        {/* Presets List */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Study & Training Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setFenInput(preset.fen);
                  setError('');
                }}
                className="text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-amber-500/40 transition-colors text-xs text-slate-300 hover:text-white cursor-pointer truncate"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={handleCopy}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy Current"}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Load Position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
