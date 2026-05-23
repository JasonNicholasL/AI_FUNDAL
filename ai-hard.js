// Hard AI - MigoYugo
// Difficulty: Minimax with alpha-beta pruning, optimized for 4-in-a-row wins

function hardAI(board, piece) {
    const depth = 4; // Look ahead 4 moves
    const { move } = minimax(JSON.parse(JSON.stringify(board)), piece, depth, -Infinity, Infinity, true);
    return move || findBestMove(board, piece);
}

function minimax(board, piece, depth, alpha, beta, isMaximizing) {
    const opponent = piece === 1 ? 2 : 1;
    
    // Check for immediate win conditions
    const myWin = findWinningMove(board, piece);
    const opponentWin = findWinningMove(board, opponent);
    
    if (myWin) {
        return { score: 10000, move: myWin };
    }
    if (opponentWin) {
        return { score: 5000, move: opponentWin }; // Block opponent's win
    }
    
    // Terminal conditions
    if (depth === 0) {
        return { score: evaluateBoard(board, piece), move: null };
    }
    
    let validMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === 0) {
                validMoves.push([r, c]);
            }
        }
    }
    
    if (validMoves.length === 0) {
        return { score: evaluateBoard(board, piece), move: null };
    }

    let bestMove = null;

    if (isMaximizing) {
        let maxScore = -Infinity;
        for (const [r, c] of validMoves) {
            const boardCopy = JSON.parse(JSON.stringify(board));
            boardCopy[r][c] = piece;
            
            const { score } = minimax(boardCopy, opponent, depth - 1, alpha, beta, false);
            if (score > maxScore) {
                maxScore = score;
                bestMove = [r, c];
            }
            alpha = Math.max(alpha, score);
            if (beta <= alpha) break;
        }
        return { score: maxScore, move: bestMove };
    } else {
        let minScore = Infinity;
        for (const [r, c] of validMoves) {
            const boardCopy = JSON.parse(JSON.stringify(board));
            boardCopy[r][c] = opponent;
            
            const { score } = minimax(boardCopy, piece, depth - 1, alpha, beta, true);
            if (score < minScore) {
                minScore = score;
                bestMove = [r, c];
            }
            beta = Math.min(beta, score);
            if (beta <= alpha) break;
        }
        return { score: minScore, move: bestMove };
    }
}

function findWinningMove(board, piece) {
    const DIRECTIONS = [
        { dr: 0, dc: 1 },   // horizontal
        { dr: 1, dc: 0 },   // vertical
        { dr: 1, dc: 1 },   // diagonal \
        { dr: 1, dc: -1 }   // diagonal /
    ];
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === 0) {
                for (const dir of DIRECTIONS) {
                    let count = 1;
                    
                    let rr = r + dir.dr, cc = c + dir.dc;
                    while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && 
                           (board[rr][cc] === piece || board[rr][cc] === piece + 2)) {
                        count++;
                        rr += dir.dr;
                        cc += dir.dc;
                    }
                    
                    rr = r - dir.dr; cc = c - dir.dc;
                    while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && 
                           (board[rr][cc] === piece || board[rr][cc] === piece + 2)) {
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

    // Check for 3-in-a-row patterns (potential winning moves)
    const DIRECTIONS = [
        { dr: 0, dc: 1 },
        { dr: 1, dc: 0 },
        { dr: 1, dc: 1 },
        { dr: 1, dc: -1 }
    ];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === piece || board[r][c] === piece + 2) {
                for (const dir of DIRECTIONS) {
                    let count = 1;
                    
                    let rr = r + dir.dr, cc = c + dir.dc;
                    while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && 
                           (board[rr][cc] === piece || board[rr][cc] === piece + 2)) {
                        count++;
                        rr += dir.dr;
                        cc += dir.dc;
                    }
                    
                    rr = r - dir.dr; cc = c - dir.dc;
                    while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && 
                           (board[rr][cc] === piece || board[rr][cc] === piece + 2)) {
                        count++;
                        rr -= dir.dr;
                        cc -= dir.dc;
                    }
                    
                    if (count === 3) score += 10;
                    if (count === 2) score += 3;
                }
            }
        }
    }

    // Count red pieces (worth a lot!)
    let redCount = 0, opponentRedCount = 0;
    const redPiece = piece === 2 ? 4 : 3;
    const opponentRed = opponent === 2 ? 4 : 3;
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === redPiece) redCount++;
            else if (board[r][c] === opponentRed) opponentRedCount++;
        }
    }
    
    score += redCount * 100 - opponentRedCount * 100;

    return score;
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
