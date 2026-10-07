// Chess Opening Book & ECO Classifier

export const OPENINGS = [
  { name: "Ruy Lopez", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"], eco: "C60" },
  { name: "Ruy Lopez: Berlin Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "Nf6"], eco: "C65" },
  { name: "Ruy Lopez: Morphy Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"], eco: "C70" },
  { name: "Italian Game", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"], eco: "C50" },
  { name: "Italian Game: Giuoco Piano", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"], eco: "C53" },
  { name: "Italian Game: Two Knights Defense", moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"], eco: "C55" },
  { name: "Scotch Game", moves: ["e4", "e5", "Nf3", "Nc6", "d4"], eco: "C45" },
  { name: "Four Knights Game", moves: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6"], eco: "C47" },
  { name: "Petrov's Defense", moves: ["e4", "e5", "Nf3", "Nf6"], eco: "C42" },
  { name: "King's Gambit", moves: ["e4", "e5", "f4"], eco: "C30" },
  { name: "Vienna Game", moves: ["e4", "e5", "Nc3"], eco: "C25" },
  { name: "Sicilian Defense", moves: ["e4", "c5"], eco: "B20" },
  { name: "Sicilian: Open", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4"], eco: "B50" },
  { name: "Sicilian: Najdorf", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"], eco: "B90" },
  { name: "Sicilian: Dragon", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"], eco: "B70" },
  { name: "Sicilian: Scheveningen", moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e6"], eco: "B80" },
  { name: "French Defense", moves: ["e4", "e6"], eco: "C00" },
  { name: "French Defense: Advance", moves: ["e4", "e6", "d4", "d5", "e5"], eco: "C02" },
  { name: "French Defense: Winawer", moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4"], eco: "C15" },
  { name: "Caro-Kann Defense", moves: ["e4", "c6"], eco: "B10" },
  { name: "Caro-Kann: Advance", moves: ["e4", "c6", "d4", "d5", "e5"], eco: "B12" },
  { name: "Caro-Kann: Classical", moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5"], eco: "B18" },
  { name: "Scandinavian Defense", moves: ["e4", "d5"], eco: "B01" },
  { name: "Alekhine's Defense", moves: ["e4", "Nf6"], eco: "B02" },
  { name: "Pirc Defense", moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"], eco: "B07" },
  { name: "Queen's Gambit", moves: ["d4", "d5", "c4"], eco: "D06" },
  { name: "Queen's Gambit Accepted", moves: ["d4", "d5", "c4", "dxc4"], eco: "D20" },
  { name: "Queen's Gambit Declined", moves: ["d4", "d5", "c4", "e6"], eco: "D30" },
  { name: "Slav Defense", moves: ["d4", "d5", "c4", "c6"], eco: "D10" },
  { name: "Semi-Slav Defense", moves: ["d4", "d5", "c4", "c6", "Nf3", "Nf6", "Nc3", "e6"], eco: "D43" },
  { name: "King's Indian Defense", moves: ["d4", "Nf6", "c4", "g6"], eco: "E60" },
  { name: "Nimzo-Indian Defense", moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"], eco: "E20" },
  { name: "Queen's Indian Defense", moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6"], eco: "E12" },
  { name: "Grünfeld Defense", moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"], eco: "D80" },
  { name: "London System", moves: ["d4", "d5", "Bf4"], eco: "D00" },
  { name: "English Opening", moves: ["c4"], eco: "A10" },
  { name: "Reti Opening", moves: ["Nf3"], eco: "A04" },
  { name: "Bird's Opening", moves: ["f4"], eco: "A02" },
  { name: "King's Fianchetto", moves: ["g3"], eco: "A00" }
];

export function identifyOpening(moveHistorySan) {
  if (!moveHistorySan || moveHistorySan.length === 0) {
    return { name: "Starting Position", eco: "A00" };
  }

  let matched = null;
  let maxMatchedLen = 0;

  for (const op of OPENINGS) {
    if (op.moves.length <= moveHistorySan.length) {
      let isPrefix = true;
      for (let i = 0; i < op.moves.length; i++) {
        if (op.moves[i] !== moveHistorySan[i]) {
          isPrefix = false;
          break;
        }
      }
      if (isPrefix && op.moves.length > maxMatchedLen) {
        maxMatchedLen = op.moves.length;
        matched = op;
      }
    }
  }

  if (matched) return matched;

  // Partial match check
  for (const op of OPENINGS) {
    if (op.moves.length > moveHistorySan.length) {
      let isPrefix = true;
      for (let i = 0; i < moveHistorySan.length; i++) {
        if (op.moves[i] !== moveHistorySan[i]) {
          isPrefix = false;
          break;
        }
      }
      if (isPrefix) {
        return { name: `${op.name} (line)`, eco: op.eco };
      }
    }
  }

  return { name: "Unorthodox / Custom Opening", eco: "A00" };
}

// AI Book Moves generator
export function getBookMove(moveHistorySan) {
  const candidates = [];
  const currLen = moveHistorySan.length;

  for (const op of OPENINGS) {
    if (op.moves.length > currLen) {
      let matches = true;
      for (let i = 0; i < currLen; i++) {
        if (op.moves[i] !== moveHistorySan[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        candidates.push(op.moves[currLen]);
      }
    }
  }

  if (candidates.length > 0) {
    // Pick randomly among authentic book options
    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    return choice;
  }
  return null;
}
