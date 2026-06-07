// Easy AI - MigoYugo
// Difficulty: Random valid moves, prioritizes winning moves
// ai_easy.js
function dapatkanLangkahMudah(board, currentTurn) {
    // Panggil fungsi easyAI Anda di bawah
    // Di index.html: 2 = White, 1 = Black
    const hasilLangkah = easyAI(board, currentTurn);
    
    // Jika ada langkah yang ditemukan, ubah format array [r, c] menjadi objek {r, c}
    if (hasilLangkah) {
        return { 
            r: hasilLangkah[0], 
            c: hasilLangkah[1] 
        };
    }
    
    return null; // Jika papan penuh / tidak ada langkah valid
}
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
