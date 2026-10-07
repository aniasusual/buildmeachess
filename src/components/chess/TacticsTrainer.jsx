import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import confetti from 'canvas-confetti';
import { Lightbulb, CheckCircle2, XCircle, RotateCcw, ArrowRight, Award, HelpCircle, Eye } from 'lucide-react';
import { CHESS_PUZZLES } from '../../chess/puzzles';
import { ChessBoard } from './ChessBoard';
import { soundEngine } from '../../chess/audio';

export function TacticsTrainer({ theme, pieceStyle }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const currentPuzzle = CHESS_PUZZLES[puzzleIndex];

  const [chess, setChess] = useState(() => new Chess(currentPuzzle.fen));
  const [stepIndex, setStepIndex] = useState(0); // Current move in solution array
  const [status, setStatus] = useState('playing'); // 'playing' | 'solved' | 'failed'
  const [showHint, setShowHint] = useState(false);
  const [revealedSolution, setRevealedSolution] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [playerRating, setPlayerRating] = useState(1200);

  // Reset when puzzle changes
  useEffect(() => {
    const newChess = new Chess(currentPuzzle.fen);
    setChess(newChess);
    setStepIndex(0);
    setStatus('playing');
    setShowHint(false);
    setRevealedSolution(false);
    setLastMove(null);
  }, [puzzleIndex, currentPuzzle.fen]);

  function isMoveMatch(actualMove, expectedSan, positionFen) {
    if (actualMove.san === expectedSan) return true;
    const normActual = actualMove.san.replace(/[+#]/g, '');
    const normExpected = expectedSan.replace(/[+#]/g, '');
    if (normActual === normExpected) return true;
    try {
      const temp = new Chess(positionFen);
      const expectedMove = temp.move(expectedSan);
      if (expectedMove && actualMove.from === expectedMove.from && actualMove.to === expectedMove.to) {
        return true;
      }
    } catch {}
    return false;
  }

  // Handle player attempt
  const handleMove = (moveAttempt) => {
    if (status === 'solved') return null;

    try {
      const tempGame = new Chess(chess.fen());
      const executed = tempGame.move(moveAttempt);
      if (!executed) return null;

      const expectedSan = currentPuzzle.solution[stepIndex];

      // Check if move matches expected solution
      if (isMoveMatch(executed, expectedSan, chess.fen())) {
        setChess(tempGame);
        setLastMove({ from: executed.from, to: executed.to });
        const nextStep = stepIndex + 1;
        setStepIndex(nextStep);

        // Check if puzzle is fully completed
        if (nextStep >= currentPuzzle.solution.length) {
          setStatus('solved');
          soundEngine.playVictory();
          setPlayerRating(prev => prev + 15);
          try {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          } catch {}
          return executed;
        }

        // If opponent has an automatic response move
        const opponentSan = currentPuzzle.solution[nextStep];
        if (opponentSan) {
          setTimeout(() => {
            try {
              const replyGame = new Chess(tempGame.fen());
              let opMove = null;
              try {
                opMove = replyGame.move(opponentSan);
              } catch {
                const legal = replyGame.moves({ verbose: true });
                const match = legal.find(m => isMoveMatch(m, opponentSan, tempGame.fen()));
                if (match) opMove = replyGame.move(match);
              }
              if (opMove) {
                setChess(replyGame);
                setLastMove({ from: opMove.from, to: opMove.to });
                setStepIndex(nextStep + 1);
                soundEngine.playMove();

                // If opponent move completes puzzle
                if (nextStep + 1 >= currentPuzzle.solution.length) {
                  setStatus('solved');
                  soundEngine.playVictory();
                  setPlayerRating(prev => prev + 15);
                  try {
                    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
                  } catch {}
                }
              }
            } catch {}
          }, 350);
        }

        return executed;
      } else {
        // Incorrect move
        setStatus('failed');
        soundEngine.playDefeat();
        setTimeout(() => {
          setStatus('playing');
        }, 1800);
        return null;
      }
    } catch {
      return null;
    }
  };

  const handleResetPuzzle = () => {
    setChess(new Chess(currentPuzzle.fen));
    setStepIndex(0);
    setStatus('playing');
    setShowHint(false);
    setRevealedSolution(false);
    setLastMove(null);
  };

  const handleNextPuzzle = () => {
    setPuzzleIndex((puzzleIndex + 1) % CHESS_PUZZLES.length);
  };

  const handlePrevPuzzle = () => {
    setPuzzleIndex((puzzleIndex - 1 + CHESS_PUZZLES.length) % CHESS_PUZZLES.length);
  };

  const isFlipped = currentPuzzle.turn === 'b';

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center max-w-6xl mx-auto w-full px-2 sm:px-4">
      {/* Board Column */}
      <div className="w-full lg:w-auto flex flex-col items-center flex-1">
        <ChessBoard
          chess={chess}
          onMove={handleMove}
          flipped={isFlipped}
          theme={theme}
          pieceStyle={pieceStyle}
          lastMove={lastMove}
          disabled={status === 'solved'}
        />
      </div>

      {/* Puzzle Details & Controls Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Puzzle Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              {currentPuzzle.theme}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentPuzzle.rating} Elo</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white font-outfit mb-1">
            {currentPuzzle.title}
          </h3>
          <p className="text-xs font-medium text-slate-300 mb-4 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
            {currentPuzzle.goal}
          </p>

          {/* Player Turn Indicator */}
          <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 text-xs">
            <span
              className={`w-3.5 h-3.5 rounded-full border shadow-sm ${
                currentPuzzle.turn === 'w' ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-600'
              }`}
            />
            <span className="font-semibold text-slate-200">
              {currentPuzzle.turn === 'w' ? "White to move" : "Black to move"}
            </span>
          </div>

          {/* Feedback Status Alert */}
          {status === 'solved' && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm mb-1 text-emerald-200">Puzzle Solved! (+15)</p>
                <p className="text-[11px] text-emerald-300/90">{currentPuzzle.explanation}</p>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
              <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="font-medium">That move is not best. Try again!</span>
            </div>
          )}

          {/* Hint Drawer */}
          {showHint && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2 animate-fade-in">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{currentPuzzle.hint}</span>
            </div>
          )}

          {/* Revealed Solution */}
          {revealedSolution && (
            <div className="mb-4 p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs animate-fade-in">
              <p className="font-bold text-amber-300 mb-1">Full Solution:</p>
              <p className="font-mono">{currentPuzzle.solution.join(" ")}</p>
            </div>
          )}

          {/* Puzzle Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setShowHint(prev => !prev)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              {showHint ? "Hide Hint" : "Hint"}
            </button>
            <button
              onClick={handleResetPuzzle}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Retry
            </button>
          </div>

          <button
            onClick={() => setRevealedSolution(prev => !prev)}
            className="w-full py-2 px-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700/40 mb-4"
          >
            <Eye className="w-3.5 h-3.5" />
            {revealedSolution ? "Hide Solution" : "Reveal Solution"}
          </button>

          {/* Next / Prev Puzzle Navigation */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handlePrevPuzzle}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Prev
            </button>
            <span className="text-xs text-slate-400 font-mono">
              {puzzleIndex + 1} of {CHESS_PUZZLES.length}
            </span>
            <button
              onClick={handleNextPuzzle}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tactical Rating Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Your Tactics Rating</p>
            <p className="text-xl font-extrabold text-amber-400 font-mono">{playerRating}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
