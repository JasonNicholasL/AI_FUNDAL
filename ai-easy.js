// Easy AI - MigoYugo
// Difficulty: Random valid moves, prioritizes winning moves

function easyAI(board, piece) {
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
                // Test this move
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
                    
                    if (count >= 4) return [r, c]; // Winning move!
                }
            }
        }
    }
    
    // Otherwise, random valid move
    const validMoves = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (board[r][c] === 0) {
                validMoves.push([r, c]);
            }
        }
    }
    
    if (validMoves.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
}
