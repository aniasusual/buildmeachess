import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import {
  Crown,
  Bot,
  Users,
  Award,
  Sliders,
  RotateCcw,
  Flag,
  Lightbulb,
  Compass,
  Volume2,
  VolumeX,
  FlipHorizontal,
  PlusCircle,
  FileText,
  Play,
  Pause,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';

import { ChessBoard } from './components/chess/ChessBoard';
import { EvalBar } from './components/chess/EvalBar';
import { ClockTimer } from './components/chess/ClockTimer';
import { CapturedPieces } from './components/chess/CapturedPieces';
import { MoveHistory } from './components/chess/MoveHistory';
import { GameOverModal } from './components/chess/GameOverModal';
import { TacticsTrainer } from './components/chess/TacticsTrainer';
import { FenModal } from './components/chess/FenModal';
import { SettingsDrawer } from './components/chess/SettingsDrawer';

import { BOARD_THEMES } from './chess/themes';
import { AI_LEVELS, getAIMove, getHintMove, evaluateBoard, getMaterialStatus } from './chess/engine';
import { soundEngine } from './chess/audio';

// Time control options in seconds (0 = unlimited)
const TIME_CONTROLS = [
  { id: 'unlimited', name: 'Untimed', seconds: 0 },
  { id: 'bullet-1', name: '1 min', seconds: 60 },
  { id: 'blitz-3', name: '3 min', seconds: 180 },
  { id: 'blitz-5', name: '5 min', seconds: 300 },
  { id: 'rapid-10', name: '10 min', seconds: 600 },
  { id: 'rapid-15', name: '15 min', seconds: 900 },
  { id: 'classical-30', name: '30 min', seconds: 1800 }
];

export default function App() {
  // Navigation Mode: 'bot' | 'pass-and-play' | 'tactics' | 'sandbox'
  const [gameMode, setGameMode] = useState('bot');

  // Game Engine instance
  const [chess, setChess] = useState(() => new Chess());
  const [history, setHistory] = useState([]);
  const [currentPlyIndex, setCurrentPlyIndex] = useState(-1);

  // Board presentation & settings
  const [theme, setTheme] = useState(BOARD_THEMES[0]);
  const [pieceStyle, setPieceStyle] = useState('staunton');
  const [flipped, setFlipped] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [showEvalBar, setShowEvalBar] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [autoFlip, setAutoFlip] = useState(true);

  // Match Configuration
  const [playerColor, setPlayerColor] = useState('w'); // 'w' | 'b' | 'random'
  const [actualPlayerColor, setActualPlayerColor] = useState('w');
  const [aiLevelId, setAiLevelId] = useState(3);
  const [timeControl, setTimeControl] = useState(TIME_CONTROLS[3]); // 5 min default

  // Clocks
  const [whiteTime, setWhiteTime] = useState(300);
  const [blackTime, setBlackTime] = useState(300);
  const [isClockRunning, setIsClockRunning] = useState(false);

  // AI & Engine Status
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [centipawns, setCentipawns] = useState(10);
  const [hintMove, setHintMove] = useState(null);
  const [lastMove, setLastMove] = useState(null);

  // Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFenModalOpen, setIsFenModalOpen] = useState(false);
  const [gameOverData, setGameOverData] = useState(null);

  // Reference for stable timer loop
  const chessRef = useRef(chess);
  chessRef.current = chess;

  const currentLevel = AI_LEVELS.find(l => l.id === aiLevelId) || AI_LEVELS[2];

  // Material & Captures breakdown
  const material = getMaterialStatus(chess);

  // Initialize or reset game
  const resetGame = useCallback((newPlayerColor = playerColor, newTimeControl = timeControl) => {
    const newChess = new Chess();
    setChess(newChess);
    setHistory([]);
    setCurrentPlyIndex(-1);
    setHintMove(null);
    setLastMove(null);
    setGameOverData(null);
    setIsAiThinking(false);

    // Resolve color
    let assignedColor = newPlayerColor;
    if (newPlayerColor === 'random') {
      assignedColor = Math.random() < 0.5 ? 'w' : 'b';
    }
    setActualPlayerColor(assignedColor);
    setFlipped(assignedColor === 'b');

    // Reset clocks
    setWhiteTime(newTimeControl.seconds);
    setBlackTime(newTimeControl.seconds);
    setIsClockRunning(newTimeControl.seconds > 0);

    // Initial evaluation
    setCentipawns(evaluateBoard(newChess));

    // If bot plays first (Player is Black)
    if (gameMode === 'bot' && assignedColor === 'b') {
      triggerAiMove(newChess, []);
    }
  }, [playerColor, timeControl, gameMode]);

  // Trigger AI calculation
  const triggerAiMove = async (gameInstance, currentMoves) => {
    if (gameInstance.isGameOver()) return;
    setIsAiThinking(true);

    try {
      const result = await getAIMove(gameInstance, aiLevelId, currentMoves.map(m => m.san));
      if (result && result.move) {
        const executed = gameInstance.move(result.move);
        if (executed) {
          setChess(new Chess(gameInstance.fen()));
          setHistory(gameInstance.history({ verbose: true }));
          setCurrentPlyIndex(gameInstance.history().length - 1);
          setLastMove({ from: executed.from, to: executed.to });
          setCentipawns(evaluateBoard(gameInstance));

          // Sound triggers
          if (gameInstance.isGameOver()) {
            soundEngine.playDefeat();
          } else if (gameInstance.inCheck()) {
            soundEngine.playCheck();
          } else if (executed.captured) {
            soundEngine.playCapture();
          } else if (executed.flags.includes('k') || executed.flags.includes('q')) {
            soundEngine.playCastle();
          } else {
            soundEngine.playMove();
          }

          checkGameEnding(gameInstance);
        }
      }
    } catch (err) {
      console.error("AI Move error:", err);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Inspect game end conditions
  const checkGameEnding = (gameInstance) => {
    if (gameInstance.isCheckmate()) {
      const winner = gameInstance.turn() === 'w' ? 'b' : 'w';
      const isPlayerWin = gameMode === 'bot' ? winner === actualPlayerColor : true;
      setGameOverData({
        winner,
        reason: `Checkmate! ${winner === 'w' ? 'White' : 'Black'} has delivered mate.`,
        isPlayerWinner: isPlayerWin
      });
      setIsClockRunning(false);
    } else if (gameInstance.isDraw()) {
      let reason = "Game drawn";
      if (gameInstance.isStalemate()) reason = "Draw by Stalemate (no legal moves)";
      else if (gameInstance.isThreefoldRepetition()) reason = "Draw by Threefold Repetition";
      else if (gameInstance.isInsufficientMaterial()) reason = "Draw by Insufficient Material";
      else reason = "Draw by 50-Move Rule";

      setGameOverData({
        winner: 'draw',
        reason,
        isPlayerWinner: false
      });
      setIsClockRunning(false);
    }
  };

  // Human player makes a move
  const handleBoardMove = (moveInput) => {
    if (isAiThinking) return null;
    if (chess.isGameOver()) return null;

    try {
      const nextGame = new Chess(chess.fen());
      const moveResult = nextGame.move(moveInput);

      if (moveResult) {
        setChess(nextGame);
        const newHistory = nextGame.history({ verbose: true });
        setHistory(newHistory);
        setCurrentPlyIndex(newHistory.length - 1);
        setLastMove({ from: moveResult.from, to: moveResult.to });
        setHintMove(null);
        setCentipawns(evaluateBoard(nextGame));

        // Auto flip for local 2-player pass & play
        if (gameMode === 'pass-and-play' && autoFlip) {
          setFlipped(nextGame.turn() === 'b');
        }

        checkGameEnding(nextGame);

        // If playing against AI, trigger AI response
        if (gameMode === 'bot' && !nextGame.isGameOver()) {
          const isNextTurnAi = nextGame.turn() !== actualPlayerColor;
          if (isNextTurnAi) {
            triggerAiMove(nextGame, newHistory);
          }
        }

        return moveResult;
      }
    } catch {
      return null;
    }
    return null;
  };

  // Clock countdown timer
  useEffect(() => {
    if (!isClockRunning || timeControl.seconds === 0 || gameOverData) return;

    const interval = setInterval(() => {
      const activeTurn = chessRef.current.turn();

      if (activeTurn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            setIsClockRunning(false);
            setGameOverData({
              winner: 'b',
              reason: 'Black wins on time forfeit (White ran out of time)',
              isPlayerWinner: actualPlayerColor === 'b'
            });
            return 0;
          }
          if (prev < 15 && prev % 2 === 0) soundEngine.playTick();
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setIsClockRunning(false);
            setGameOverData({
              winner: 'w',
              reason: 'White wins on time forfeit (Black ran out of time)',
              isPlayerWinner: actualPlayerColor === 'w'
            });
            return 0;
          }
          if (prev < 15 && prev % 2 === 0) soundEngine.playTick();
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isClockRunning, timeControl.seconds, gameOverData, actualPlayerColor]);

  // Request engine hint
  const handleRequestHint = async () => {
    if (isAiThinking || chess.isGameOver()) return;
    const bestMove = await getHintMove(chess);
    if (bestMove) {
      setHintMove({ from: bestMove.from, to: bestMove.to });
    }
  };

  // Takeback / Undo last move
  const handleTakeback = () => {
    if (history.length === 0 || isAiThinking) return;

    const undoGame = new Chess();
    // In bot mode, undo both AI move and Player move
    const stepsBack = gameMode === 'bot' ? (chess.turn() === actualPlayerColor ? 2 : 1) : 1;
    const targetPly = Math.max(0, history.length - stepsBack);

    for (let i = 0; i < targetPly; i++) {
      undoGame.move(history[i]);
    }

    setChess(undoGame);
    const newHist = undoGame.history({ verbose: true });
    setHistory(newHist);
    setCurrentPlyIndex(newHist.length - 1);
    setHintMove(null);
    setLastMove(newHist.length > 0 ? { from: newHist[newHist.length - 1].from, to: newHist[newHist.length - 1].to } : null);
    setCentipawns(evaluateBoard(undoGame));
    soundEngine.playMove();
  };

  // Navigate history plies
  const handleNavigatePly = (plyIndex) => {
    if (plyIndex < -1 || plyIndex >= history.length) return;
    setCurrentPlyIndex(plyIndex);

    const replayGame = new Chess();
    for (let i = 0; i <= plyIndex; i++) {
      replayGame.move(history[i]);
    }
    setChess(replayGame);
    if (plyIndex >= 0) {
      const m = history[plyIndex];
      setLastMove({ from: m.from, to: m.to });
    } else {
      setLastMove(null);
    }
    setCentipawns(evaluateBoard(replayGame));
  };

  // Resign match
  const handleResign = () => {
    if (chess.isGameOver()) return;
    const currentTurn = chess.turn();
    const winner = currentTurn === 'w' ? 'b' : 'w';
    setGameOverData({
      winner,
      reason: `${currentTurn === 'w' ? 'White' : 'Black'} has resigned.`,
      isPlayerWinner: winner === actualPlayerColor
    });
    setIsClockRunning(false);
    soundEngine.playDefeat();
  };

  // Load custom FEN position
  const handleLoadFen = (fenString) => {
    try {
      const loadedGame = new Chess(fenString);
      setChess(loadedGame);
      setHistory([]);
      setCurrentPlyIndex(-1);
      setHintMove(null);
      setLastMove(null);
      setGameOverData(null);
      setCentipawns(evaluateBoard(loadedGame));
      soundEngine.playMove();
    } catch (e) {
      console.error("Failed to load FEN", e);
    }
  };

  // Copy PGN
  const handleCopyPgn = () => {
    navigator.clipboard.writeText(chess.pgn());
  };

  // Copy FEN
  const handleCopyFen = () => {
    navigator.clipboard.writeText(chess.fen());
  };

  // Download PGN
  const handleDownloadPgn = () => {
    const pgnText = chess.pgn();
    const blob = new Blob([pgnText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-game-${Date.now()}.pgn`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Audio mute/unmute
  const toggleSound = () => {
    const next = soundEngine.toggle();
    setSoundEnabled(next);
  };

  // Determine top and bottom players based on orientation
  const isWhiteAtBottom = !flipped;
  const topColor = isWhiteAtBottom ? 'b' : 'w';
  const bottomColor = isWhiteAtBottom ? 'w' : 'b';

  const topTime = isWhiteAtBottom ? blackTime : whiteTime;
  const bottomTime = isWhiteAtBottom ? whiteTime : blackTime;

  const topName = gameMode === 'bot'
    ? (actualPlayerColor === 'w' ? `Bot (${currentLevel.name})` : 'You')
    : (isWhiteAtBottom ? 'Black Player' : 'White Player');

  const bottomName = gameMode === 'bot'
    ? (actualPlayerColor === 'w' ? 'You' : `Bot (${currentLevel.name})`)
    : (isWhiteAtBottom ? 'White Player' : 'Black Player');

  const isTopBot = gameMode === 'bot' && actualPlayerColor === (isWhiteAtBottom ? 'w' : 'b');
  const isBottomBot = gameMode === 'bot' && actualPlayerColor !== (isWhiteAtBottom ? 'w' : 'b');

  const topElo = isTopBot ? currentLevel.elo : 1500;
  const bottomElo = isBottomBot ? currentLevel.elo : 1500;

  const isTopActive = chess.turn() === topColor && isClockRunning;
  const isBottomActive = chess.turn() === bottomColor && isClockRunning;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* =========================================================================
          Top Header Navigation & Controls Bar
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider font-outfit uppercase bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  APEX CHESS
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25 font-bold">
                  MASTER EDITION
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block -mt-0.5">
                Grandmaster Engine &bull; Tactical Trainer &bull; Precision Analytics
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setGameMode('bot')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                gameMode === 'bot'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>vs Bot</span>
            </button>
            <button
              onClick={() => setGameMode('pass-and-play')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                gameMode === 'pass-and-play'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pass & Play</span>
              <span className="sm:hidden">2P</span>
            </button>
            <button
              onClick={() => setGameMode('tactics')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                gameMode === 'tactics'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Puzzles</span>
            </button>
            <button
              onClick={() => setGameMode('sandbox')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                gameMode === 'sandbox'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Analysis</span>
              <span className="sm:hidden">Sand</span>
            </button>
          </nav>

          {/* Quick Utility Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition-colors cursor-pointer"
              title={soundEnabled ? "Mute Sounds" : "Unmute Sounds"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={() => setFlipped(prev => !prev)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition-colors cursor-pointer"
              title="Flip Board Orientation"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition-colors cursor-pointer"
              title="Customization & Themes"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          Secondary Controls / Configuration Bar (Game Mode Specific)
          ========================================================================= */}
      {gameMode !== 'tactics' && (
        <div className="bg-slate-900/60 border-b border-slate-800 px-3 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left Controls: Bot Level & Time */}
            <div className="flex flex-wrap items-center gap-2">
              {gameMode === 'bot' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-semibold">Bot:</span>
                  <select
                    value={aiLevelId}
                    onChange={(e) => setAiLevelId(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {AI_LEVELS.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.name} ({lvl.elo} Elo)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Time Control */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold">Clock:</span>
                <select
                  value={timeControl.id}
                  onChange={(e) => {
                    const tc = TIME_CONTROLS.find(t => t.id === e.target.value);
                    if (tc) {
                      setTimeControl(tc);
                      resetGame(playerColor, tc);
                    }
                  }}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {TIME_CONTROLS.map((tc) => (
                    <option key={tc.id} value={tc.id}>
                      {tc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Player Color in Bot Mode */}
              {gameMode === 'bot' && (
                <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
                  <button
                    onClick={() => {
                      setPlayerColor('w');
                      resetGame('w');
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                      playerColor === 'w' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    White
                  </button>
                  <button
                    onClick={() => {
                      setPlayerColor('random');
                      resetGame('random');
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                      playerColor === 'random' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Random
                  </button>
                  <button
                    onClick={() => {
                      setPlayerColor('b');
                      resetGame('b');
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                      playerColor === 'b' ? 'bg-slate-950 text-white border border-slate-700 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Black
                  </button>
                </div>
              )}
            </div>

            {/* Right Controls: New Game & FEN Preset */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFenModalOpen(true)}
                className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>FEN</span>
              </button>
              <button
                onClick={() => resetGame()}
                className="py-1 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Game</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Main Body Content Arena
          ========================================================================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-4 lg:p-6 flex flex-col justify-center">
        {gameMode === 'tactics' ? (
          /* Tactics Puzzles Mode */
          <TacticsTrainer theme={theme} pieceStyle={pieceStyle} />
        ) : (
          /* Standard Live Chess Arena (Bot, Pass & Play, Sandbox) */
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start justify-center">
            {/* 1. Evaluation Bar (Optional) */}
            {showEvalBar && (
              <div className="hidden lg:block h-[580px] pt-12 pb-12">
                <EvalBar
                  centipawns={centipawns}
                  turn={chess.turn()}
                  isMate={chess.isCheckmate()}
                  mateIn={chess.isCheckmate() ? (chess.turn() === 'w' ? -1 : 1) : 0}
                />
              </div>
            )}

            {/* 2. Central Chessboard Column */}
            <div className="w-full lg:w-auto flex flex-col items-center max-w-[620px] mx-auto flex-1">
              {/* Top Player Card (Clock + Captures) */}
              <div className="w-full mb-2">
                <ClockTimer
                  playerName={topName}
                  isBot={isTopBot}
                  elo={topElo}
                  secondsRemaining={topTime}
                  isActive={isTopActive}
                  color={topColor}
                  isUnlimited={timeControl.seconds === 0}
                  capturedComponent={
                    <CapturedPieces
                      capturedList={topColor === 'w' ? material.capturedWhite : material.capturedBlack}
                      advantage={topColor === 'w' ? material.whiteAdvantage : material.blackAdvantage}
                      pieceColor={topColor === 'w' ? 'b' : 'w'}
                      pieceStyle={pieceStyle}
                    />
                  }
                />
              </div>

              {/* Interactive Chess Board Component */}
              <div className="relative w-full">
                <ChessBoard
                  chess={chess}
                  onMove={handleBoardMove}
                  flipped={flipped}
                  theme={theme}
                  pieceStyle={pieceStyle}
                  showHints={showHints}
                  showCoordinates={showCoordinates}
                  hintMove={hintMove}
                  lastMove={lastMove}
                  disabled={isAiThinking || !!gameOverData}
                />

                {/* AI Thinking Overlay Banner */}
                {isAiThinking && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 border border-amber-500/50 rounded-full px-4 py-1.5 shadow-xl flex items-center gap-2 backdrop-blur-md animate-fade-in">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      {currentLevel.name} calculating...
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Player Card (Clock + Captures) */}
              <div className="w-full mt-2">
                <ClockTimer
                  playerName={bottomName}
                  isBot={isBottomBot}
                  elo={bottomElo}
                  secondsRemaining={bottomTime}
                  isActive={isBottomActive}
                  color={bottomColor}
                  isUnlimited={timeControl.seconds === 0}
                  capturedComponent={
                    <CapturedPieces
                      capturedList={bottomColor === 'w' ? material.capturedWhite : material.capturedBlack}
                      advantage={bottomColor === 'w' ? material.whiteAdvantage : material.blackAdvantage}
                      pieceColor={bottomColor === 'w' ? 'b' : 'w'}
                      pieceStyle={pieceStyle}
                    />
                  }
                />
              </div>

              {/* Match Control Buttons */}
              <div className="w-full mt-3 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleTakeback}
                    disabled={history.length === 0 || isAiThinking}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Undo Last Move"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </button>
                  <button
                    onClick={handleRequestHint}
                    disabled={isAiThinking || chess.isGameOver()}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Ask Engine for Best Move"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hint</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleResign}
                    disabled={chess.isGameOver()}
                    className="py-1.5 px-3 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 disabled:opacity-30 disabled:cursor-not-allowed text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Resign</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Right Sidebar: Move History & Game Information */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              {/* Move History Panel */}
              <div className="h-[420px]">
                <MoveHistory
                  history={history}
                  currentPlyIndex={currentPlyIndex}
                  onNavigatePly={handleNavigatePly}
                  onCopyPgn={handleCopyPgn}
                  onCopyFen={handleCopyFen}
                  onDownloadPgn={handleDownloadPgn}
                  fen={chess.fen()}
                />
              </div>

              {/* Current Status Pill Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Turn Status
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Turn {Math.floor(history.length / 2) + 1}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span
                    className={`w-4 h-4 rounded-full border shadow-sm ${
                      chess.turn() === 'w' ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-600'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate font-outfit">
                      {chess.turn() === 'w' ? "White's Turn" : "Black's Turn"}
                    </p>
                    {chess.inCheck() && (
                      <p className="text-[11px] text-rose-400 font-bold animate-pulse">
                        Check in effect!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          Modals & Overlay Drawers
          ========================================================================= */}
      {/* Game Over Modal */}
      {gameOverData && (
        <GameOverModal
          winner={gameOverData.winner}
          reason={gameOverData.reason}
          isPlayerWinner={gameOverData.isPlayerWinner}
          onRematch={() => resetGame()}
          onNewGame={() => resetGame()}
          onClose={() => setGameOverData(null)}
        />
      )}

      {/* Load FEN Dialog */}
      {isFenModalOpen && (
        <FenModal
          currentFen={chess.fen()}
          onLoadFen={handleLoadFen}
          onClose={() => setIsFenModalOpen(false)}
        />
      )}

      {/* Theme & Preferences Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onSelectTheme={setTheme}
        pieceStyle={pieceStyle}
        onSelectPieceStyle={setPieceStyle}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        showHints={showHints}
        onToggleHints={() => setShowHints(prev => !prev)}
        showEvalBar={showEvalBar}
        onToggleEvalBar={() => setShowEvalBar(prev => !prev)}
        showCoordinates={showCoordinates}
        onToggleCoordinates={() => setShowCoordinates(prev => !prev)}
        autoFlip={autoFlip}
        onToggleAutoFlip={() => setAutoFlip(prev => !prev)}
      />
    </div>
  );
}
