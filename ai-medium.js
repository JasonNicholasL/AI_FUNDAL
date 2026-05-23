// Medium AI - MigoYugo
// Difficulty: Prefers winning moves, then positional strategy

function mediumAI(board, piece) {
    const GRID_SIZE = 8;
    const DIRECTIONS = [
        { dr: 0, dc: 1 },   // horizontal
        { dr: 1, dc: 0 },   // vertical
        { dr: 1, dc: 1 },   // diagonal \
        { dr: 1, dc: -1 }   // diagonal /
    ];
    
    // First, check for winning moves
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board[r][c] === 0) {
                for (const dir of DIRECTIONS) {
                    let count = 1;
                    
                    // Count in positive direction
                    let rr = r + dir.dr, cc = c + dir.dc;
                    while (rr >= 0 && rr < GRID_SIZE && cc >= 0 && cc < GRID_SIZE && 
                           (board[rr][cc] === piece || board[rr][cc] === piece + 2)) {
                        count++;
                        rr += dir.dr;
                        cc += dir.dc;
                    }
                    
                    // Count in negative direction
                    rr = r - dir.dr; cc = c - dir.dc;
                    while (rr >= 0 && rr < GRID_SIZE && cc >= 0 && cc < GRID_SIZE && 
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
    
    // Check for blocking opponent's winning move
    const opponent = piece === 1 ? 2 : 1;
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board[r][c] === 0) {
                for (const dir of DIRECTIONS) {
                    let count = 1;
                    
                    // Count opponent pieces
                    let rr = r + dir.dr, cc = c + dir.dc;
                    while (rr >= 0 && rr < GRID_SIZE && cc >= 0 && cc < GRID_SIZE && 
                           (board[rr][cc] === opponent || board[rr][cc] === opponent + 2)) {
                        count++;
                        rr += dir.dr;
                        cc += dir.dc;
                    }
                    
                    rr = r - dir.dr; cc = c - dir.dc;
                    while (rr >= 0 && rr < GRID_SIZE && cc >= 0 && cc < GRID_SIZE && 
                           (board[rr][cc] === opponent || board[rr][cc] === opponent + 2)) {
                        count++;
                        rr -= dir.dr;
                        cc -= dir.dc;
                    }
                    
                    if (count >= 4) return [r, c]; // Block opponent!
                }
            }
        }
    }
    
    // Score moves based on position value
    let bestMoves = [];
    let bestScore = -1;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board[r][c] === 0) {
                let score = 0;
                
                // Center positions are valuable
                const distFromCenter = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                score = 10 - distFromCenter;
                
                // Corners are decent
                if ((r === 0 || r === GRID_SIZE - 1) && (c === 0 || c === GRID_SIZE - 1)) {
                    score += 5;
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestMoves = [[r, c]];
                } else if (score === bestScore) {
                    bestMoves.push([r, c]);
                }
            }
        }
    }

    if (bestMoves.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[randomIndex];
}
