import React from 'react';

// SVG Chess Piece Component with Multiple Style Presets
// White pieces: Warm ivory with metallic rim & soft drop lighting
// Black pieces: Obsidian / Deep slate with high-contrast edge rim lighting

export function ChessPiece({ type, color, style = 'staunton', className = '' }) {
  const isWhite = color === 'w';

  // SVG fill and stroke definitions
  const whiteFill = "url(#whitePieceGrad)";
  const whiteStroke = "#334155";
  const whiteHighlight = "#ffffff";

  const blackFill = "url(#blackPieceGrad)";
  const blackStroke = "#090d16";
  const blackHighlight = "#94a3b8";

  const mainFill = isWhite ? whiteFill : blackFill;
  const strokeColor = isWhite ? whiteStroke : blackStroke;
  const highlightColor = isWhite ? whiteHighlight : blackHighlight;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full select-none pointer-events-none drop-shadow-md transition-transform duration-150 ${className}`}
      aria-label={`${isWhite ? 'White' : 'Black'} ${type}`}
    >
      <defs>
        {/* White Piece Gradient: Warm Ivory & Alabaster */}
        <linearGradient id="whitePieceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        {/* Black Piece Gradient: Obsidian, Gunmetal & Slate */}
        <linearGradient id="blackPieceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Subtle drop shadow filter for pieces */}
        <filter id="pieceShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity={isWhite ? "0.3" : "0.5"} />
        </filter>
      </defs>

      {/* Piece Vector Renderers */}
      {type === 'p' && (
        <g filter="url(#pieceShadow)">
          {/* Base */}
          <path
            d="M 28 84 L 72 84 C 72 80 68 76 63 75 L 37 75 C 32 76 28 80 28 84 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Stem & Waist */}
          <path
            d="M 38 75 C 38 64 42 52 41 46 C 41 43 45 42 50 42 C 55 42 59 43 59 46 C 58 52 62 64 62 75 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Collar ring */}
          <ellipse
            cx="50"
            cy="42"
            rx="13"
            ry="4.5"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3"
          />
          {/* Head sphere */}
          <circle
            cx="50"
            cy="27"
            r="14"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
          />
          {/* Specular highlight */}
          <ellipse
            cx="46"
            cy="23"
            rx="4.5"
            ry="3.5"
            fill={highlightColor}
            opacity={isWhite ? "0.8" : "0.35"}
          />
        </g>
      )}

      {type === 'r' && (
        <g filter="url(#pieceShadow)">
          {/* Base */}
          <path
            d="M 24 84 L 76 84 C 76 79 71 75 66 74 L 34 74 C 29 75 24 79 24 84 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Tower Body */}
          <path
            d="M 34 74 L 37 42 L 63 42 L 66 74 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Neck ring */}
          <rect
            x="32"
            y="38"
            width="36"
            height="5"
            rx="1.5"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3"
          />
          {/* Crenellated Castle Top */}
          <path
            d="M 28 38 L 28 20 L 37 20 L 37 27 L 45 27 L 45 20 L 55 20 L 55 27 L 63 27 L 63 20 L 72 20 L 72 38 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Center slit highlight */}
          <line
            x1="50"
            y1="46"
            x2="50"
            y2="66"
            stroke={highlightColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity={isWhite ? "0.6" : "0.3"}
          />
        </g>
      )}

      {type === 'n' && (
        <g filter="url(#pieceShadow)">
          {/* Base */}
          <path
            d="M 25 84 L 75 84 C 75 79 70 75 65 74 L 35 74 C 30 75 25 79 25 84 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Knight Head & Mane Profile */}
          <path
            d="M 35 74 C 34 65 31 56 26 48 C 24 45 25 41 29 41 C 32 41 35 44 38 46 C 36 38 38 29 44 22 C 45 20 49 19 51 22 C 52 24 51 27 50 30 C 56 25 64 24 70 29 C 74 32 75 38 72 44 C 75 46 76 50 74 54 C 72 58 68 60 66 60 C 67 65 67 70 65 74 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Knight Eye */}
          <circle
            cx="44"
            cy="33"
            r="3"
            fill={strokeColor}
          />
          <circle
            cx="43.5"
            cy="32.5"
            r="1"
            fill={highlightColor}
          />
          {/* Muzzle / Nostril */}
          <circle
            cx="29"
            cy="44"
            r="1.8"
            fill={strokeColor}
          />
          {/* Mane detail arcs */}
          <path
            d="M 58 35 C 64 40 65 47 64 54"
            fill="none"
            stroke={highlightColor}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={isWhite ? "0.7" : "0.35"}
          />
          <path
            d="M 49 44 C 53 50 54 58 52 64"
            fill="none"
            stroke={highlightColor}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={isWhite ? "0.7" : "0.35"}
          />
        </g>
      )}

      {type === 'b' && (
        <g filter="url(#pieceShadow)">
          {/* Base */}
          <path
            d="M 26 84 L 74 84 C 74 79 69 75 64 74 L 36 74 C 31 75 26 79 26 84 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Lower Collar */}
          <path
            d="M 37 74 C 38 64 42 54 41 48 C 45 49 55 49 59 48 C 58 54 62 64 63 74 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Neck ring */}
          <ellipse
            cx="50"
            cy="48"
            rx="14"
            ry="4.5"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3"
          />
          {/* Mitre Body */}
          <path
            d="M 37 46 C 34 38 37 24 50 18 C 63 24 66 38 63 46 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Mitre Cleft / Cross Slit */}
          <path
            d="M 45 28 L 57 38"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Top orb */}
          <circle
            cx="50"
            cy="15"
            r="3.5"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="2.5"
          />
          {/* Highlight curve */}
          <path
            d="M 43 32 C 43 38 45 42 47 44"
            fill="none"
            stroke={highlightColor}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={isWhite ? "0.8" : "0.3"}
          />
        </g>
      )}

      {type === 'q' && (
        <g filter="url(#pieceShadow)">
          {/* Base */}
          <path
            d="M 22 84 L 78 84 C 78 79 73 75 67 74 L 33 74 C 27 75 22 79 22 84 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Waist / Flaring dress */}
          <path
            d="M 34 74 C 36 62 38 52 32 40 L 68 40 C 62 52 64 62 66 74 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Coronet Ring */}
          <ellipse
            cx="50"
            cy="40"
            rx="19"
            ry="5.5"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3"
          />
          {/* Crown spikes */}
          <path
            d="M 31 39 L 24 23 L 38 31 L 50 19 L 62 31 L 76 23 L 69 39 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Jewels / Orbs on crown tips */}
          <circle cx="24" cy="22" r="3.2" fill={mainFill} stroke={strokeColor} strokeWidth="2.2" />
          <circle cx="38" cy="30" r="3.2" fill={mainFill} stroke={strokeColor} strokeWidth="2.2" />
          <circle cx="50" cy="17" r="4" fill={mainFill} stroke={strokeColor} strokeWidth="2.5" />
          <circle cx="62" cy="30" r="3.2" fill={mainFill} stroke={strokeColor} strokeWidth="2.2" />
          <circle cx="76" cy="22" r="3.2" fill={mainFill} stroke={strokeColor} strokeWidth="2.2" />
          {/* Center glow */}
          <ellipse
            cx="50"
            cy="56"
            rx="6"
            ry="12"
            fill={highlightColor}
            opacity={isWhite ? "0.6" : "0.2"}
          />
        </g>
      )}

      {type === 'k' && (
        <g filter="url(#pieceShadow)">
          {/* Base */}
          <path
            d="M 22 84 L 78 84 C 78 79 73 75 67 74 L 33 74 C 27 75 22 79 22 84 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Body stem */}
          <path
            d="M 34 74 C 36 60 40 48 34 38 L 66 38 C 60 48 64 60 66 74 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Neck ring */}
          <ellipse
            cx="50"
            cy="38"
            rx="18"
            ry="5.5"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3"
          />
          {/* Arching Crown */}
          <path
            d="M 32 37 C 29 28 35 23 50 24 C 65 23 71 28 68 37 Z"
            fill={mainFill}
            stroke={strokeColor}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {/* Royal Cross */}
          <path
            d="M 50 11 L 50 23 M 44 15 L 56 15"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="square"
          />
          {/* Cross inner fill */}
          <path
            d="M 50 12 L 50 22 M 45 15 L 55 15"
            stroke={isWhite ? "#fbbf24" : highlightColor}
            strokeWidth="1.8"
            strokeLinecap="square"
          />
          {/* Body highlight */}
          <ellipse
            cx="50"
            cy="55"
            rx="6"
            ry="13"
            fill={highlightColor}
            opacity={isWhite ? "0.6" : "0.2"}
          />
        </g>
      )}
    </svg>
  );
}
