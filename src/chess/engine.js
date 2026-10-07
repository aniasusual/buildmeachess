// Comprehensive Chess AI Engine & Position Evaluator
import { Chess } from 'chess.js';
import { getBookMove } from './openings.js';

export const AI_LEVELS = [
  {
    id: 1,
    name: "Novice",
    elo: 800,
    depth: 1,
    blunderRate: 0.35,
    description: "Learning the basics. Frequently makes tactical mistakes.",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
  },
  {
    id: 2,
    name: "Casual",
    elo: 1200,
    depth: 2,
    blunderRate: 0.15,
    description: "Knows standard rules and captures hanging pieces.",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30"
  },
  {
    id: 3,
    name: "Club Player",
    elo: 1600,
    depth: 3,
    blunderRate: 0.04,
    description: "Solid positional fundamentals and active piece play.",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  },
  {
    id: 4,
    name: "Master",
    elo: 2000,
    depth: 4,
    blunderRate: 0.0,
    description: "Deep calculation with tactical capture verification.",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  },
  {
    id: 5,
    name: "Grandmaster",
    elo: 2400,
    depth: 4,
    blunderRate: 0.0,
    useQuiescence: true,
    description: "Formidable tactical foresight, opening book, and positional mastery.",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30"
  }
];

export const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 335,
  r: 500,
  q: 900,
  k: 20000
};

// Piece Square Tables (White's view: row 0 = rank 8, row 7 = rank 1)
const PST_MG = {
  p: [
    [0,   0,   0,   0,   0,   0,   0,   0],
    [50,  50,  50,  50,  50,  50,  50,  50],
    [10,  15,  25,  35,  35,  25,  15,  10],
    [5,   5,  20,  30,  30,  20,   5,   5],
    [0,   0,  10,  25,  25,  10,   0,   0],
    [5,  -5, -10,   5,   5, -10,  -5,   5],
    [5,  10,  10, -20, -20,  10,  10,   5],
    [0,   0,   0,   0,   0,   0,   0,   0]
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20,   0,   5,   5,   0, -20, -40],
    [-30,   5,  15,  20,  20,  15,   5, -30],
    [-30,   5,  20,  25,  25,  20,   5, -30],
    [-30,   0,  15,  20,  20,  15,   0, -30],
    [-30,   5,  10,  15,  15,  10,   5, -30],
    [-40, -20,   0,   5,   5,   0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10,   5,   0,   0,   0,   0,   5, -10],
    [-10,  10,  10,  15,  15,  10,  10, -10],
    [-10,   5,  10,  15,  15,  10,   5, -10],
    [-10,   0,  10,  15,  15,  10,   0, -10],
    [-10,  10,  10,  10,  10,  10,  10, -10],
    [-10,   5,   0,   0,   0,   0,   5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20]
  ],
  r: [
    [0,   0,   0,   5,   5,   0,   0,   0],
    [15,  20,  20,  20,  20,  20,  20,  15],
    [-5,   0,   0,   0,   0,   0,   0,  -5],
    [-5,   0,   0,   0,   0,   0,   0,  -5],
    [-5,   0,   0,   0,   0,   0,   0,  -5],
    [-5,   0,   0,   0,   0,   0,   0,  -5],
    [-5,   0,   0,   0,   0,   0,   0,  -5],
    [0,   0,   0,   5,   5,   0,   0,   0]
  ],
  q: [
    [-20, -10, -10,  -5,  -5, -10, -10, -20],
    [-10,   0,   5,   0,   0,   0,   0, -10],
    [-10,   5,   5,   5,   5,   5,   0, -10],
    [-5,    0,   5,   5,   5,   5,   0,  -5],
    [0,     0,   5,   5,   5,   5,   0,  -5],
    [-10,   5,   5,   5,   5,   5,   0, -10],
    [-10,   0,   5,   0,   0,   0,   0, -10],
    [-20, -10, -10,  -5,  -5, -10, -10, -20]
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20,   20,   0, -10, -10,   0,  20,  20],
    [20,   30,  10,   0,   0,  10,  30,  20]
  ]
};

// King endgame PST (king is encouraged to centralize)
const PST_KING_EG = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10,   0,  10,  10,  10,  10,   0, -10],
  [-10,  10,  20,  25,  25,  20,  10, -10],
  [-10,  10,  25,  30,  30,  25,  10, -10],
  [-10,  10,  25,  30,  30,  25,  10, -10],
  [-10,  10,  20,  25,  25,  20,  10, -10],
  [-10,   0,  10,  10,  10,  10,   0, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20]
];

// Helper to determine if position is in endgame phase
function isEndgame(board) {
  let queens = 0;
  let minorMajorCount = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        if (p.type === 'q') queens++;
        if (p.type === 'r' || p.type === 'b' || p.type === 'n') minorMajorCount++;
      }
    }
  }
  return queens === 0 || (queens === 2 && minorMajorCount <= 2);
}

// Evaluate position from White's perspective in centipawns
export function evaluateBoard(chess) {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -30000 : 30000;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    return 0;
  }

  let totalEvaluation = 0;
  const board = chess.board();
  const endgame = isEndgame(board);

  // Material & PST
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const val = PIECE_VALUES[piece.type];
        const pstRow = piece.color === 'w' ? r : 7 - r;
        const pstCol = piece.color === 'w' ? c : 7 - c;

        let posVal = 0;
        if (piece.type === 'k' && endgame) {
          posVal = PST_KING_EG[pstRow][pstCol];
        } else if (PST_MG[piece.type]) {
          posVal = PST_MG[piece.type][pstRow][pstCol];
        }

        const score = val + posVal;
        totalEvaluation += piece.color === 'w' ? score : -score;
      }
    }
  }

  // Slight bonus for side to move
  const tempo = chess.turn() === 'w' ? 10 : -10;
  return totalEvaluation + tempo;
}

// Order moves to improve alpha-beta pruning speed: MVV-LVA + promotions + checks
function orderMoves(moves) {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.captured) {
      scoreA += 10 * PIECE_VALUES[a.captured] - PIECE_VALUES[a.piece];
    }
    if (a.promotion) {
      scoreA += PIECE_VALUES[a.promotion] + 500;
    }
    if (a.san && a.san.includes('+')) {
      scoreA += 150;
    }

    if (b.captured) {
      scoreB += 10 * PIECE_VALUES[b.captured] - PIECE_VALUES[b.piece];
    }
    if (b.promotion) {
      scoreB += PIECE_VALUES[b.promotion] + 500;
    }
    if (b.san && b.san.includes('+')) {
      scoreB += 150;
    }

    return scoreB - scoreA;
  });
}

// Quiescence search to avoid horizon effect on captures
function quiescence(chess, alpha, beta, isMaximizing, qDepth = 2) {
  const standPat = evaluateBoard(chess);
  if (qDepth === 0 || chess.isGameOver()) {
    return standPat;
  }

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    // Only capture moves
    const captureMoves = orderMoves(chess.moves({ verbose: true })).filter(m => m.captured);
    for (const move of captureMoves) {
      chess.move(move);
      const score = quiescence(chess, alpha, beta, false, qDepth - 1);
      chess.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (beta > standPat) beta = standPat;

    const captureMoves = orderMoves(chess.moves({ verbose: true })).filter(m => m.captured);
    for (const move of captureMoves) {
      chess.move(move);
      const score = quiescence(chess, alpha, beta, true, qDepth - 1);
      chess.undo();

      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
    return beta;
  }
}

// Minimax with Alpha-Beta Pruning
function minimax(chess, depth, alpha, beta, isMaximizing, useQuiescence = false) {
  if (depth === 0) {
    if (useQuiescence) {
      return quiescence(chess, alpha, beta, isMaximizing);
    }
    return evaluateBoard(chess);
  }

  if (chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = orderMoves(chess.moves({ verbose: true }));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false, useQuiescence);
      chess.undo();

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true, useQuiescence);
      chess.undo();

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// Find AI move according to level
export async function getAIMove(chess, levelId = 3, moveHistorySan = []) {
  const level = AI_LEVELS.find(l => l.id === levelId) || AI_LEVELS[2];
  const legalMoves = chess.moves({ verbose: true });

  if (legalMoves.length === 0) return null;

  // 1. Check opening book for higher levels (Club, Master, Grandmaster)
  if (level.elo >= 1500 && moveHistorySan.length < 12) {
    const bookSan = getBookMove(moveHistorySan);
    if (bookSan) {
      const matchingMove = legalMoves.find(m => m.san === bookSan);
      if (matchingMove) {
        // Small organic delay to feel natural
        await new Promise(r => setTimeout(r, 220));
        return { move: matchingMove, score: 0, isBook: true };
      }
    }
  }

  // 2. Intentional blunder chance for lower levels
  if (level.blunderRate > 0 && Math.random() < level.blunderRate) {
    await new Promise(r => setTimeout(r, 200));
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return { move: randomMove, score: 0, isBlunder: true };
  }

  // 3. Search best move using Alpha-Beta
  const isMaximizing = chess.turn() === 'w';
  const orderedMoves = orderMoves(legalMoves);
  let bestMove = orderedMoves[0];
  let bestScore = isMaximizing ? -Infinity : Infinity;

  // Allow UI thread frame render
  await new Promise(r => setTimeout(r, 50));

  for (const move of orderedMoves) {
    chess.move(move);
    const score = minimax(
      chess,
      level.depth - 1,
      -Infinity,
      Infinity,
      !isMaximizing,
      !!level.useQuiescence
    );
    chess.undo();

    // Add slight random noise for Casual level to create diverse games
    const noisyScore = level.elo <= 1200 ? score + (Math.random() * 40 - 20) : score;

    if (isMaximizing) {
      if (noisyScore > bestScore) {
        bestScore = noisyScore;
        bestMove = move;
      }
    } else {
      if (noisyScore < bestScore) {
        bestScore = noisyScore;
        bestMove = move;
      }
    }
  }

  return { move: bestMove, score: bestScore };
}

// Find recommended hint for human player
export async function getHintMove(chess) {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const isMaximizing = chess.turn() === 'w';
  const orderedMoves = orderMoves(legalMoves);
  let bestMove = orderedMoves[0];
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of orderedMoves) {
    chess.move(move);
    const score = minimax(chess, 2, -Infinity, Infinity, !isMaximizing, true);
    chess.undo();

    if (isMaximizing ? (score > bestScore) : (score < bestScore)) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// Calculate material breakdown for both sides
export function getMaterialStatus(chess) {
  const board = chess.board();
  const capturedWhite = []; // Pieces white has lost (black has captured)
  const capturedBlack = []; // Pieces black has lost (white has captured)

  const counts = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
  };

  const initialCounts = { p: 8, n: 2, b: 2, r: 2, q: 1 };

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type !== 'k') {
        counts[p.color][p.type]++;
      }
    }
  }

  // Calculate missing pieces
  for (const type of ['p', 'n', 'b', 'r', 'q']) {
    const missingWhite = initialCounts[type] - counts.w[type];
    for (let i = 0; i < missingWhite; i++) {
      capturedWhite.push(type);
    }

    const missingBlack = initialCounts[type] - counts.b[type];
    for (let i = 0; i < missingBlack; i++) {
      capturedBlack.push(type);
    }
  }

  let whitePoints = 0;
  let blackPoints = 0;

  for (const type of ['p', 'n', 'b', 'r', 'q']) {
    whitePoints += counts.w[type] * (PIECE_VALUES[type] / 100);
    blackPoints += counts.b[type] * (PIECE_VALUES[type] / 100);
  }

  const advantage = whitePoints - blackPoints;

  return {
    capturedWhite, // pieces lost by white
    capturedBlack, // pieces lost by black
    whiteAdvantage: advantage > 0 ? advantage : 0,
    blackAdvantage: advantage < 0 ? -advantage : 0,
    advantage
  };
}

// Win chance logistic curve for Eval Bar
export function getWinChance(centipawns) {
  // Lichess formula: 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
  const clamped = Math.max(-1000, Math.min(1000, centipawns));
  const chance = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * clamped)) - 1);
  return Math.max(2, Math.min(98, Math.round(chance)));
}
