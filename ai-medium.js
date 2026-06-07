/**
 * Medium AI - MigoYugo
 * Strategy: Negamax with Alpha-Beta Pruning (Depth 3)
 * Preserves your instant wins/blocks and your distance-from-center positional heuristic!
 */

function dapatkanLangkahMedium(board, currentTurn) {
    // Panggil fungsi easyAI Anda di bawah
    // Di index.html: 2 = White, 1 = Black
    const hasilLangkah = mediumAI(board, currentTurn);
    
    // Jika ada langkah yang ditemukan, ubah format array [r, c] menjadi objek {r, c}
    if (hasilLangkah) {
        return { 
            r: hasilLangkah[0], 
            c: hasilLangkah[1] 
        };
    }
    
    return null; // Jika papan penuh / tidak ada langkah valid
}

function mediumAI(board, piece) {
    const GRID_SIZE = 8;
    const opponentPiece = piece === 1 ? 2 : 1;
    
    const DIRECTIONS = [
        { dr: 0, dc: 1 },   // horizontal
        { dr: 1, dc: 0 },   // vertical
        { dr: 1, dc: 1 },   // diagonal \
        { dr: 1, dc: -1 }  // diagonal /
    ];

    /**
     * 1. HELPER: Your exact line counting logic refactored into a reusable function
     */
    function countLineLength(currentBoard, r, c, targetPiece) {
        let maxCount = 1;
        for (const dir of DIRECTIONS) {
            let count = 1;
            
            // Positive direction
            let rr = r + dir.dr, cc = c + dir.dc;
            while (rr >= 0 && rr < GRID_SIZE && cc >= 0 && cc < GRID_SIZE && 
                   (currentBoard[rr][cc] === targetPiece || currentBoard[rr][cc] === targetPiece + 2)) {
                count++; rr += dir.dr; cc += dir.dc;
            }
            
            // Negative direction
            rr = r - dir.dr; cc = c - dir.dc;
            while (rr >= 0 && rr < GRID_SIZE && cc >= 0 && cc < GRID_SIZE && 
                   (currentBoard[rr][cc] === targetPiece || currentBoard[rr][cc] === targetPiece + 2)) {
                count++; rr -= dir.dr; cc -= dir.dc;
            }
            
            if (count > maxCount) maxCount = count;
        }
        return maxCount;
    }

    /**
     * 2. HEURISTIC EVALUATION: Your distance-from-center & tactical points
     * Evaluates the board state from the perspective of 'currentPiece'
     */
    function evaluateBoard(currentBoard, currentPiece) {
        const enemyPiece = currentPiece === 1 ? 2 : 1;
        let score = 0;

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                
                // If it's a piece we own, calculate its positional value using YOUR formula
                if (currentBoard[r][c] === currentPiece || currentBoard[r][c] === currentPiece + 2) {
                    const distFromCenter = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                    score += (10 - distFromCenter);
                    
                    // Corner bonus
                    if ((r === 0 || r === GRID_SIZE - 1) && (c === 0 || c === GRID_SIZE - 1)) {
                        score += 5;
                    }
                } 
                // Deduct points for enemy positioning
                else if (currentBoard[r][c] === enemyPiece || currentBoard[r][c] === enemyPiece + 2) {
                    const distFromCenter = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                    score -= (10 - distFromCenter);
                    
                    if ((r === 0 || r === GRID_SIZE - 1) && (c === 0 || c === GRID_SIZE - 1)) {
                        score -= 5;
                    }
                }
            }
        }
        return score;
    }

    /**
     * 3. STATE SPACE SEARCH: Negamax Loop with Alpha-Beta Pruning
     */
    function negamaxAB(currentBoard, depth, alpha, beta, currentPiece) {
        const enemyPiece = currentPiece === 1 ? 2 : 1;

        // Base Case 1: Prioritize Immediate Terminal Wins / Blocks (Your exact rules)
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (currentBoard[r][c] === 0) {
                    if (countLineLength(currentBoard, r, c, currentPiece) >= 4) return { score: 100000 };
                    if (countLineLength(currentBoard, r, c, enemyPiece) >= 4) return { score: -90000 };
                }
            }
        }

        // Base Case 2: Depth Limit Cutoff reached -> Score board state
        if (depth === 0) {
            return { score: evaluateBoard(currentBoard, currentPiece) };
        }

        let bestScore = -Infinity;
        let bestMove = null;

        // Generate Transitions (Legal Moves)
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (currentBoard[r][c] === 0) {
                    
                    // Transition: Apply Action
                    currentBoard[r][c] = currentPiece;

                    // Recursive search (Notice inverted alpha/beta for negamax)
                    let result = negamaxAB(currentBoard, depth - 1, -beta, -alpha, enemyPiece);
                    let currentScore = -result.score;

                    // Backtrack: Undo Action
                    currentBoard[r][c] = 0;

                    // Maximize value
                    if (currentScore > bestScore) {
                        bestScore = currentScore;
                        bestMove = [r, c];
                    }

                    // Prune branches
                    alpha = Math.max(alpha, currentScore);
                    if (alpha >= beta) {
                        break; 
                    }
                }
            }
            if (alpha >= beta) break;
        }

        // Fallback to guarantee a move is returned
        if (bestMove === null) {
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (currentBoard[r][c] === 0) return { score: 0, move: [r, c] };
                }
            }
        }

        return { score: bestScore, move: bestMove };
    }

    // Initialize state-space search loop at depth 3
    const finalDecision = negamaxAB(board, 3, -Infinity, Infinity, piece);
    return finalDecision.move;
}