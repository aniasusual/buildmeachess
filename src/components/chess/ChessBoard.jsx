import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChessPiece } from './ChessPiece';
import { soundEngine } from '../../chess/audio';
import { PromotionDialog } from './PromotionDialog';

export function ChessBoard({
  chess,
  onMove,
  flipped = false,
  theme,
  disabled = false,
  showHints = true,
  showCoordinates = true,
  hintMove = null,
  lastMove = null,
  pieceStyle = 'staunton',
  boardSize = 'w-full max-w-[620px] aspect-square'
}) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [arrows, setArrows] = useState([]);
  const [markedSquares, setMarkedSquares] = useState({});

  // Drag-and-drop state
  const [dragging, setDragging] = useState(null);
  const boardRef = useRef(null);
  const rightClickStart = useRef(null);

  // Files and ranks ordering based on orientation
  const files = flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = flipped ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Check state
  const inCheck = chess.inCheck();
  const turn = chess.turn();

  // Find king square currently in check
  let checkSquare = null;
  if (inCheck) {
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          checkSquare = p.square;
          break;
        }
      }
      if (checkSquare) break;
    }
  }

  // Update legal moves for selected piece
  const updateValidMoves = useCallback((square) => {
    if (!square || disabled) {
      setValidMoves([]);
      return;
    }
    const moves = chess.moves({ square, verbose: true });
    setValidMoves(moves);
  }, [chess, disabled]);

  // Handle square click
  const handleSquareClick = (square) => {
    if (disabled) return;

    // Clear tactical arrows on left click
    if (arrows.length > 0 || Object.keys(markedSquares).length > 0) {
      setArrows([]);
      setMarkedSquares({});
    }

    const piece = chess.get(square);

    // If already selected, clicking another friendly piece switches selection
    if (piece && piece.color === turn) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        setSelectedSquare(square);
        updateValidMoves(square);
      }
      return;
    }

    // If destination square is a valid move
    if (selectedSquare) {
      const move = validMoves.find(m => m.to === square);
      if (move) {
        attemptMove(selectedSquare, square);
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  };

  // Attempt move (checks for promotion)
  const attemptMove = (from, to, promotion = null) => {
    const piece = chess.get(from);
    if (!piece) return;

    // Check if move is a pawn promotion
    const isPawn = piece.type === 'p';
    const isPromotingRank = (piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1');

    if (isPawn && isPromotingRank && !promotion) {
      setPendingPromotion({ from, to, color: piece.color });
      return;
    }

    try {
      const moveResult = onMove({
        from,
        to,
        promotion: promotion || 'q'
      });

      if (moveResult) {
        // Sound trigger
        if (chess.isGameOver()) {
          soundEngine.playVictory();
        } else if (chess.inCheck()) {
          soundEngine.playCheck();
        } else if (moveResult.captured) {
          soundEngine.playCapture();
        } else if (moveResult.flags.includes('k') || moveResult.flags.includes('q')) {
          soundEngine.playCastle();
        } else {
          soundEngine.playMove();
        }
      }
    } catch {
      // invalid move caught
    }

    setSelectedSquare(null);
    setValidMoves([]);
  };

  const handlePromotionSelect = (pieceType) => {
    if (!pendingPromotion) return;
    const { from, to } = pendingPromotion;
    setPendingPromotion(null);
    attemptMove(from, to, pieceType);
  };

  // Drag-and-drop pointer handlers
  const handlePointerDown = (e, square) => {
    if (disabled || e.button !== 0) return; // Only left button
    const piece = chess.get(square);
    if (!piece || piece.color !== turn) return;

    setSelectedSquare(square);
    updateValidMoves(square);

    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragging({
      square,
      piece,
      x: e.clientX,
      y: e.clientY
    });
  };

  // Track drag position on window
  useEffect(() => {
    if (!dragging) return;

    const handlePointerMove = (e) => {
      setDragging(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    };

    const handlePointerUp = (e) => {
      if (!dragging || !boardRef.current) {
        setDragging(null);
        return;
      }

      const rect = boardRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      if (relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height) {
        const squareWidth = rect.width / 8;
        const squareHeight = rect.height / 8;

        const colIndex = Math.floor(relX / squareWidth);
        const rowIndex = Math.floor(relY / squareHeight);

        if (colIndex >= 0 && colIndex < 8 && rowIndex >= 0 && rowIndex < 8) {
          const targetFile = files[colIndex];
          const targetRank = ranks[rowIndex];
          const targetSquare = `${targetFile}${targetRank}`;

          if (targetSquare !== dragging.square) {
            const moves = chess.moves({ square: dragging.square, verbose: true });
            const valid = moves.find(m => m.to === targetSquare);
            if (valid) {
              attemptMove(dragging.square, targetSquare);
            }
          }
        }
      }

      setDragging(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragging, chess, files, ranks]);

  // Right-click tactical markings (arrows & highlights)
  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const handleSquareMouseDown = (e, square) => {
    if (e.button === 2) {
      // Right click
      e.preventDefault();
      rightClickStart.current = square;
    }
  };

  const handleSquareMouseUp = (e, square) => {
    if (e.button === 2) {
      e.preventDefault();
      const start = rightClickStart.current;
      rightClickStart.current = null;

      if (start && start === square) {
        // Toggle square highlight
        setMarkedSquares(prev => {
          const next = { ...prev };
          if (next[square]) delete next[square];
          else next[square] = true;
          return next;
        });
      } else if (start && start !== square) {
        // Toggle arrow
        setArrows(prev => {
          const exists = prev.findIndex(a => a.from === start && a.to === square);
          if (exists >= 0) {
            return prev.filter((_, i) => i !== exists);
          } else {
            return [...prev, { from: start, to: square }];
          }
        });
      }
    }
  };

  // Convert square to pixel center for arrows (0 to 100 percentage)
  const getSquareCenter = (square) => {
    const file = square[0];
    const rank = square[1];
    const colIndex = files.indexOf(file);
    const rowIndex = ranks.indexOf(rank);
    return {
      x: (colIndex + 0.5) * 12.5,
      y: (rowIndex + 0.5) * 12.5
    };
  };

  return (
    <div className={`relative ${boardSize} select-none mx-auto shadow-2xl rounded-2xl overflow-hidden border-4 transition-all duration-300`}
      style={{ borderColor: theme.border }}
      ref={boardRef}
      onContextMenu={handleContextMenu}
    >
      {/* 8x8 Board Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {ranks.map((rank, rowIndex) =>
          files.map((file, colIndex) => {
            const square = `${file}${rank}`;
            const isLight = (colIndex + rowIndex) % 2 === 0;
            const piece = chess.get(square);

            const isSelected = selectedSquare === square;
            const isCheck = checkSquare === square;
            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
            const isMarked = !!markedSquares[square];
            const isHint = hintMove && (hintMove.from === square || hintMove.to === square);

            const validMoveTarget = validMoves.find(m => m.to === square);
            const isCapture = validMoveTarget && (piece || validMoveTarget.flags.includes('e'));

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                onMouseDown={(e) => handleSquareMouseDown(e, square)}
                onMouseUp={(e) => handleSquareMouseUp(e, square)}
                onPointerDown={(e) => handlePointerDown(e, square)}
                className="relative flex items-center justify-center transition-colors cursor-pointer select-none group"
                style={{
                  backgroundColor: isLight ? theme.light : theme.dark
                }}
                data-square={square}
              >
                {/* Square Highlight Overlays */}
                {isSelected && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity"
                    style={{ backgroundColor: theme.selected }}
                  />
                )}
                {isLastMove && !isSelected && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity"
                    style={{ backgroundColor: theme.lastMove }}
                  />
                )}
                {isCheck && (
                  <div
                    className="absolute inset-0 pointer-events-none animate-pulse rounded-full blur-[2px]"
                    style={{ backgroundColor: theme.check }}
                  />
                )}
                {isMarked && (
                  <div
                    className="absolute inset-0 pointer-events-none bg-amber-400/40"
                  />
                )}
                {isHint && (
                  <div
                    className="absolute inset-0 pointer-events-none border-2 border-emerald-400/70 bg-emerald-400/20 animate-pulse"
                  />
                )}

                {/* Coordinate Labels */}
                {showCoordinates && (
                  <>
                    {/* Rank numbers on leftmost column */}
                    {colIndex === 0 && (
                      <span
                        className="absolute top-1 left-1.5 text-[10px] sm:text-xs font-bold leading-none select-none pointer-events-none font-mono"
                        style={{ color: isLight ? theme.dark : theme.light, opacity: 0.85 }}
                      >
                        {rank}
                      </span>
                    )}
                    {/* File letters on bottom row */}
                    {rowIndex === 7 && (
                      <span
                        className="absolute bottom-1 right-1.5 text-[10px] sm:text-xs font-bold leading-none select-none pointer-events-none font-mono"
                        style={{ color: isLight ? theme.dark : theme.light, opacity: 0.85 }}
                      >
                        {file}
                      </span>
                    )}
                  </>
                )}

                {/* Chess Piece on Square */}
                {piece && !(dragging && dragging.square === square) && (
                  <div className="w-[88%] h-[88%] flex items-center justify-center relative z-10 transform transition-transform group-active:scale-95">
                    <ChessPiece
                      type={piece.type}
                      color={piece.color}
                      style={pieceStyle}
                    />
                  </div>
                )}

                {/* Legal Move Indicators */}
                {showHints && validMoveTarget && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    {isCapture ? (
                      /* Capture Ring Indicator */
                      <div
                        className="w-[84%] h-[84%] rounded-full border-4 border-dashed animate-spin-slow transition-transform scale-100"
                        style={{ borderColor: theme.validCapture }}
                      />
                    ) : (
                      /* Empty Destination Dot */
                      <div
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shadow-md"
                        style={{ backgroundColor: theme.validMove }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SVG Overlay for Tactical Arrows */}
      {arrows.length > 0 && (
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="4"
              markerHeight="4"
              refX="2.5"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 4 2, 0 4" fill={theme.arrow} opacity="0.85" />
            </marker>
          </defs>
          {arrows.map((arr, i) => {
            const start = getSquareCenter(arr.from);
            const end = getSquareCenter(arr.to);
            return (
              <line
                key={i}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={theme.arrow}
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.85"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </svg>
      )}

      {/* Floating Ghost Piece for Drag & Drop */}
      {dragging && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 scale-110 drop-shadow-2xl"
          style={{
            left: `${dragging.x}px`,
            top: `${dragging.y}px`,
            width: '64px',
            height: '64px'
          }}
        >
          <ChessPiece
            type={dragging.piece.type}
            color={dragging.piece.color}
            style={pieceStyle}
          />
        </div>
      )}

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <PromotionDialog
          color={pendingPromotion.color}
          onSelect={handlePromotionSelect}
          onCancel={() => setPendingPromotion(null)}
        />
      )}
    </div>
  );
}
