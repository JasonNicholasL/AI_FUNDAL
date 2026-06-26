// Hard AI - MigoYugo
// Difficulty: Minimax with alpha-beta pruning, optimized for 4-in-a-row wins

const DIRECTIONS = [
  { dr: 0, dc: 1 }, // horizontal
  { dr: 1, dc: 0 }, // vertical
  { dr: 1, dc: 1 }, // diagonal \
  { dr: 1, dc: -1 }, // diagonal /
];

// Matriks bobot untuk penguasaan area tengah
const POSITION_BONUS = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 3, 3, 3, 3, 2, 1],
  [1, 2, 3, 4, 4, 3, 2, 1],
  [1, 2, 3, 4, 4, 3, 2, 1],
  [1, 2, 3, 3, 3, 3, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

function dapatkanLangkahHard(board, currentTurn) {
  // Panggil fungsi utama AI Medium Anda (misal namanya mediumAI)
  const hasilLangkah = hardAI(board, currentTurn);

  // Jika ada langkah yang ditemukan, ubah format array [r, c] menjadi objek { r, c }
  if (hasilLangkah) {
    return {
      r: hasilLangkah[0],
      c: hasilLangkah[1],
    };
  }

  return null; // Antisipasi jika papan penuh / tidak ada langkah valid
}

function hardAI(board, piece) {
  const depth = 4; // Look ahead 4 moves
  const stats = { visited: 0, pruned: 0 };
  const { move } = minimax(
    JSON.parse(JSON.stringify(board)),
    piece,
    depth,
    -Infinity,
    Infinity,
    true,
    stats,
  );

  console.log(
    `[Hard AI] nodes before pruning: ${stats.visited}, nodes after pruning: ${stats.visited - stats.pruned}, pruned: ${stats.pruned}`,
  );

  return move || findBestFallbackMove(board, piece);
}

function minimax(board, piece, depth, alpha, beta, isMaximizing, stats) {
  stats.visited += 1;
  const opponent = piece === 1 ? 2 : 1;
  const myYugo = piece + 2;
  const oppYugo = opponent + 2;

  // 1. Cek Kemenangan Igo (4 Yugo berurutan)
  if (checkIgoWin(board, myYugo)) {
    return { score: 100000 + depth, move: null };
  }
  if (checkIgoWin(board, oppYugo)) {
    return { score: -100000 - depth, move: null };
  }

  // 2. Dapatkan langkah yang sah (Sesuai aturan No Long Lines)
  let validMoves = getLegalMoves(board, isMaximizing ? piece : opponent);

  // 3. Terminal Node (Batas depth atau papan penuh/Wego)
  if (depth === 0 || validMoves.length === 0) {
    return { score: evaluateBoard(board, piece), move: null };
  }

  // 4. MOVE ORDERING: Urutkan langkah agar Alpha-Beta Pruning maksimal
  const currentPlayer = isMaximizing ? piece : opponent;
  validMoves.sort((a, b) => {
    let scoreA =
      POSITION_BONUS[a[0]][a[1]] +
      (checkCreatesYugo(board, a[0], a[1], currentPlayer) ? 50 : 0);
    let scoreB =
      POSITION_BONUS[b[0]][b[1]] +
      (checkCreatesYugo(board, b[0], b[1], currentPlayer) ? 50 : 0);
    return scoreB - scoreA; // Descending
  });

  let bestMove = null;

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const [r, c] of validMoves) {
      // Simulasi akurat termasuk ledakan Yugo
      const boardCopy = simulateMove(board, r, c, piece);

      const { score } = minimax(
        boardCopy,
        piece,
        depth - 1,
        alpha,
        beta,
        false,
        stats,
      );
      if (score > maxScore) {
        maxScore = score;
        bestMove = [r, c];
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) {
        stats.pruned += 1;
        break; // Pruning
      }
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const [r, c] of validMoves) {
      const boardCopy = simulateMove(board, r, c, opponent);

      const { score } = minimax(boardCopy, piece, depth - 1, alpha, beta, true, stats);
      if (score < minScore) {
        minScore = score;
        bestMove = [r, c];
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) {
        stats.pruned += 1;
        break; // Pruning
      }
    }
    return { score: minScore, move: bestMove };
  }
}

function getLegalMoves(board, piece) {
  let legal = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === 0) {
        if (!violatesNoLongLines(board, r, c, piece)) {
          legal.push([r, c]);
        }
      }
    }
  }
  return legal;
}

function simulateMove(board, r, c, piece) {
  const copy = JSON.parse(JSON.stringify(board));
  const yugoPiece = piece + 2;
  copy[r][c] = piece;

  let createdYugo = false;
  let squaresToRemove = [];

  // Cek ledakan (4 baris)
  for (const dir of DIRECTIONS) {
    let lineSquares = [[r, c]];
    let rr = r + dir.dr,
      cc = c + dir.dc;
    while (
      rr >= 0 &&
      rr < 8 &&
      cc >= 0 &&
      cc < 8 &&
      (copy[rr][cc] === piece || copy[rr][cc] === yugoPiece)
    ) {
      lineSquares.push([rr, cc]);
      rr += dir.dr;
      cc += dir.dc;
    }
    rr = r - dir.dr;
    cc = c - dir.dc;
    while (
      rr >= 0 &&
      rr < 8 &&
      cc >= 0 &&
      cc < 8 &&
      (copy[rr][cc] === piece || copy[rr][cc] === yugoPiece)
    ) {
      lineSquares.push([rr, cc]);
      rr -= dir.dr;
      cc -= dir.dc;
    }

    if (lineSquares.length === 4) {
      createdYugo = true;
      squaresToRemove.push(...lineSquares);
    }
  }

  // Bersihkan Migo, sisakan Yugo lama, ubah kotak tengah jadi Yugo
  if (createdYugo) {
    for (const [sr, sc] of squaresToRemove) {
      if (copy[sr][sc] === piece) {
        copy[sr][sc] = 0;
      }
    }
    copy[r][c] = yugoPiece;
  }

  return copy;
}

function checkIgoWin(board, yugoPiece) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === yugoPiece) {
        for (const dir of DIRECTIONS) {
          let count = 1;
          let rr = r + dir.dr,
            cc = c + dir.dc;
          while (
            rr >= 0 &&
            rr < 8 &&
            cc >= 0 &&
            cc < 8 &&
            board[rr][cc] === yugoPiece
          ) {
            count++;
            rr += dir.dr;
            cc += dir.dc;
          }
          if (count >= 4) return true;
        }
      }
    }
  }
  return false;
}

function violatesNoLongLines(board, r, c, piece) {
  const yugo = piece + 2;
  for (const dir of DIRECTIONS) {
    let count = 1;
    let rr = r + dir.dr,
      cc = c + dir.dc;
    while (
      rr >= 0 &&
      rr < 8 &&
      cc >= 0 &&
      cc < 8 &&
      (board[rr][cc] === piece || board[rr][cc] === yugo)
    ) {
      count++;
      rr += dir.dr;
      cc += dir.dc;
    }
    rr = r - dir.dr;
    cc = c - dir.dc;
    while (
      rr >= 0 &&
      rr < 8 &&
      cc >= 0 &&
      cc < 8 &&
      (board[rr][cc] === piece || board[rr][cc] === yugo)
    ) {
      count++;
      rr -= dir.dr;
      cc -= dir.dc;
    }
    if (count > 4) return true; // Ilegal membuat baris > 4
  }
  return false;
}

function checkCreatesYugo(board, r, c, piece) {
  const yugo = piece + 2;
  for (const dir of DIRECTIONS) {
    let count = 1;
    let rr = r + dir.dr,
      cc = c + dir.dc;
    while (
      rr >= 0 &&
      rr < 8 &&
      cc >= 0 &&
      cc < 8 &&
      (board[rr][cc] === piece || board[rr][cc] === yugo)
    ) {
      count++;
      rr += dir.dr;
      cc += dir.dc;
    }
    rr = r - dir.dr;
    cc = c - dir.dc;
    while (
      rr >= 0 &&
      rr < 8 &&
      cc >= 0 &&
      cc < 8 &&
      (board[rr][cc] === piece || board[rr][cc] === yugo)
    ) {
      count++;
      rr -= dir.dr;
      cc -= dir.dc;
    }
    if (count === 4) return true; // Tepat 4 berarti memicu Yugo
  }
  return false;
}

function findWinningMove(board, piece) {
  const DIRECTIONS = [
    { dr: 0, dc: 1 }, // horizontal
    { dr: 1, dc: 0 }, // vertical
    { dr: 1, dc: 1 }, // diagonal \
    { dr: 1, dc: -1 }, // diagonal /
  ];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === 0) {
        for (const dir of DIRECTIONS) {
          let count = 1;

          let rr = r + dir.dr,
            cc = c + dir.dc;
          while (
            rr >= 0 &&
            rr < 8 &&
            cc >= 0 &&
            cc < 8 &&
            (board[rr][cc] === piece || board[rr][cc] === piece + 2)
          ) {
            count++;
            rr += dir.dr;
            cc += dir.dc;
          }

          rr = r - dir.dr;
          cc = c - dir.dc;
          while (
            rr >= 0 &&
            rr < 8 &&
            cc >= 0 &&
            cc < 8 &&
            (board[rr][cc] === piece || board[rr][cc] === piece + 2)
          ) {
            count++;
            rr -= dir.dr;
            cc -= dir.dc;
          }

          if (count >= 4) return [r, c];
        }
      }
    }
  }
  return null;
}

function evaluateBoard(board, piece) {
  let score = 0;
  const opponent = piece === 1 ? 2 : 1;
  const myYugo = piece + 2;
  const oppYugo = opponent + 2;

  let myYugoCount = 0;
  let oppYugoCount = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = board[r][c];

      // 1. Prioritas Utama: Jumlah Yugo (Persiapan menang Wego)
      if (cell === myYugo) myYugoCount++;
      else if (cell === oppYugo) oppYugoCount++;

      // 2. Evaluasi Posisi Area (Menguasai tengah)
      if (cell === piece || cell === myYugo) {
        score += POSITION_BONUS[r][c] * 5;
      } else if (cell === opponent || cell === oppYugo) {
        score -= POSITION_BONUS[r][c] * 5;
      }

      // 3. Evaluasi Ancaman (Cek kotak kosong)
      if (cell === 0) {
        for (const dir of DIRECTIONS) {
          let myCount = countLineForEval(board, r, c, dir, piece, myYugo);
          let oppCount = countLineForEval(board, r, c, dir, opponent, oppYugo);

          // Potensi AI bikin Yugo
          if (myCount === 3) score += 60;
          if (myCount === 2) score += 10;

          // Bahaya! Lawan mau bikin Yugo (Blokir!)
          if (oppCount === 3) score -= 80;
          if (oppCount === 2) score -= 15;
        }
      }
    }
  }

  score += myYugoCount * 5000 - oppYugoCount * 5000;
  return score;
}

function countLineForEval(board, r, c, dir, piece, yugo) {
  let count = 0;
  let rr = r + dir.dr,
    cc = c + dir.dc;
  while (
    rr >= 0 &&
    rr < 8 &&
    cc >= 0 &&
    cc < 8 &&
    (board[rr][cc] === piece || board[rr][cc] === yugo)
  ) {
    count++;
    rr += dir.dr;
    cc += dir.dc;
  }
  rr = r - dir.dr;
  cc = c - dir.dc;
  while (
    rr >= 0 &&
    rr < 8 &&
    cc >= 0 &&
    cc < 8 &&
    (board[rr][cc] === piece || board[rr][cc] === yugo)
  ) {
    count++;
    rr -= dir.dr;
    cc -= dir.dc;
  }
  return count;
}

function findBestFallbackMove(board, piece) {
  let validMoves = getLegalMoves(board, piece);
  if (validMoves.length === 0) return null;

  // Fallback: Cari yang paling dekat dengan tengah
  validMoves.sort((a, b) => {
    let distA = Math.abs(a[0] - 3.5) + Math.abs(a[1] - 3.5);
    let distB = Math.abs(b[0] - 3.5) + Math.abs(b[1] - 3.5);
    return distA - distB; // Ascending
  });

  return validMoves[0];
}

function findBestMove(board, piece) {
  // Fallback: find winning move
  const winMove = findWinningMove(board, piece);
  if (winMove) return winMove;

  // Otherwise, find move closest to center
  let bestMove = null;
  let bestDist = Infinity;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === 0) {
        const dist = Math.abs(r - 3.5) + Math.abs(c - 3.5);
        if (dist < bestDist) {
          bestDist = dist;
          bestMove = [r, c];
        }
      }
    }
  }

  return bestMove;
}
