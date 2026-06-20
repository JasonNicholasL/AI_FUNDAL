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

    function findWinningMove(targetPiece) {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (board[row][col] === 0) {
                    for (const dir of DIRECTIONS) {
                        let count = 1;

                        let scanRow = row + dir.dr, scanCol = col + dir.dc;
                        while (scanRow >= 0 && scanRow < GRID_SIZE && scanCol >= 0 && scanCol < GRID_SIZE && 
                               (board[scanRow][scanCol] === targetPiece || board[scanRow][scanCol] === targetPiece + 2)) {
                            count++;
                            scanRow += dir.dr;
                            scanCol += dir.dc;
                        }

                        scanRow = row - dir.dr; scanCol = col - dir.dc;
                        while (scanRow >= 0 && scanRow < GRID_SIZE && scanCol >= 0 && scanCol < GRID_SIZE && 
                               (board[scanRow][scanCol] === targetPiece || board[scanRow][scanCol] === targetPiece + 2)) {
                            count++;
                            scanRow -= dir.dr;
                            scanCol -= dir.dc;
                        }

                        if (count >= 4) return [row, col];
                    }
                }
            }
        }

        return null;
    }

    const playerPiece = piece === 1 ? 2 : 1;

    // Highest priority: always block player's immediate winning move.
    const blockingMove = findWinningMove(playerPiece);
    if (blockingMove) return blockingMove;

    // If no immediate threat from player, try to win.
    const winningMove = findWinningMove(piece);
    if (winningMove) return winningMove;

    // Otherwise, random valid move
    const validMoves = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (board[row][col] === 0) {
                validMoves.push([row, col]);
            }
        }
    }
    
    if (validMoves.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
}
