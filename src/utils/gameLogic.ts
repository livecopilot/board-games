import { Board, CellValue, Position, AIDifficulty } from "../types";
import { CheckersBoard, CheckersPiece, CheckersMove, CheckersGameState } from "../types";

// 创建空棋盘
export const createEmptyBoard = (): Board => {
  return Array(3)
    .fill(null)
    .map(() => Array(3).fill(null));
};

// 检查胜利条件
export const checkWinner = (board: Board): CellValue | "draw" => {
  // 检查行
  for (let row = 0; row < 3; row++) {
    if (board[row][0] && board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
      return board[row][0];
    }
  }

  // 检查列
  for (let col = 0; col < 3; col++) {
    if (board[0][col] && board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
      return board[0][col];
    }
  }

  // 检查对角线
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
    return board[0][0];
  }

  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
    return board[0][2];
  }

  // 检查是否平局
  const isFull = board.every((row) => row.every((cell) => cell !== null));
  if (isFull) {
    return "draw";
  }

  return null;
};

// 检查位置是否有效
export const isValidMove = (board: Board, position: Position): boolean => {
  const { row, col } = position;
  return row >= 0 && row < 3 && col >= 0 && col < 3 && board[row][col] === null;
};

// 执行移动
export const makeMove = (board: Board, position: Position, player: CellValue): Board => {
  if (!isValidMove(board, position)) {
    return board;
  }

  const newBoard = board.map((row) => [...row]);
  newBoard[position.row][position.col] = player;
  return newBoard;
};

// 获取所有可用位置
export const getAvailableMoves = (board: Board): Position[] => {
  const moves: Position[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === null) {
        moves.push({ row, col });
      }
    }
  }
  return moves;
};

// 简单AI（随机移动）
export const getAIMove = (board: Board): Position | null => {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
};

// 井字棋智能AI（支持难度）
export const getTicTacToeAIMove = (board: Board, difficulty: AIDifficulty = AIDifficulty.MEDIUM): Position | null => {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;

  switch (difficulty) {
    case AIDifficulty.EASY:
      return getTicTacToeEasyAI(availableMoves);
    case AIDifficulty.MEDIUM:
      return getTicTacToeMediumAI(board, availableMoves);
    case AIDifficulty.HARD:
      return getTicTacToeHardAI(board, availableMoves);
    default:
      return getTicTacToeMediumAI(board, availableMoves);
  }
};

// 简单AI：纯随机
const getTicTacToeEasyAI = (availableMoves: Position[]): Position => {
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

// 中等AI：基本策略
const getTicTacToeMediumAI = (board: Board, availableMoves: Position[]): Position => {
  // 检查是否能获胜
  for (const move of availableMoves) {
    const testBoard = makeMove(board, move, "O");
    if (checkWinner(testBoard) === "O") {
      return move;
    }
  }

  // 检查是否需要阻止对手获胜
  for (const move of availableMoves) {
    const testBoard = makeMove(board, move, "X");
    if (checkWinner(testBoard) === "X") {
      return move;
    }
  }

  // 优先选择中心位置
  const center = { row: 1, col: 1 };
  if (availableMoves.some((move) => move.row === center.row && move.col === center.col)) {
    return center;
  }

  // 选择角落
  const corners = [
    { row: 0, col: 0 },
    { row: 0, col: 2 },
    { row: 2, col: 0 },
    { row: 2, col: 2 },
  ];
  const availableCorners = corners.filter((corner) =>
    availableMoves.some((move) => move.row === corner.row && move.col === corner.col)
  );
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // 随机选择
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

// 困难AI：Minimax算法
const getTicTacToeHardAI = (board: Board, availableMoves: Position[]): Position => {
  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    const newBoard = makeMove(board, move, "O");
    const score = ticTacToeMinimax(newBoard, 0, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

// Minimax算法实现
const ticTacToeMinimax = (board: Board, depth: number, isMaximizing: boolean): number => {
  const winner = checkWinner(board);

  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (winner === "draw") return 0;

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of availableMoves) {
      const newBoard = makeMove(board, move, "O");
      const eval_ = ticTacToeMinimax(newBoard, depth + 1, false);
      maxEval = Math.max(maxEval, eval_);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of availableMoves) {
      const newBoard = makeMove(board, move, "X");
      const eval_ = ticTacToeMinimax(newBoard, depth + 1, true);
      minEval = Math.min(minEval, eval_);
    }
    return minEval;
  }
};

// 跳棋相关函数

// 创建跳棋初始棋盘
export const createCheckersBoard = (): CheckersBoard => {
  const board: CheckersBoard = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // 放置黑方棋子 (顶部三行)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: "black", isKing: false };
      }
    }
  }

  // 放置红方棋子 (底部三行)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: "red", isKing: false };
      }
    }
  }

  return board;
};

// 检查位置是否在棋盘内
const isInBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

// 获取可移动的方向
const getMoveDirections = (piece: CheckersPiece): { row: number; col: number }[] => {
  if (!piece) return [];

  if (piece.isKing) {
    return [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
  }

  // 普通棋子只能向前移动
  if (piece.player === "red") {
    return [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
    ];
  } else {
    return [
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
  }
};

// 获取单个棋子的所有可能移动
export const getPieceMoves = (board: CheckersBoard, position: Position, mustCapture?: boolean): CheckersMove[] => {
  const piece = board[position.row][position.col];
  if (!piece) return [];

  const moves: CheckersMove[] = [];
  const directions = getMoveDirections(piece);

  for (const dir of directions) {
    let currentRow = position.row + dir.row;
    let currentCol = position.col + dir.col;

    if (!isInBounds(currentRow, currentCol)) continue;

    const targetCell = board[currentRow][currentCol];

    if (!targetCell) {
      // 空格，可以移动（如果不是强制吃子）
      if (!mustCapture) {
        moves.push({
          from: position,
          to: { row: currentRow, col: currentCol },
        });
      }
    } else if (targetCell.player !== piece.player) {
      // 敌方棋子，检查能否跳跃
      const jumpRow = currentRow + dir.row;
      const jumpCol = currentCol + dir.col;

      if (isInBounds(jumpRow, jumpCol) && !board[jumpRow][jumpCol]) {
        moves.push({
          from: position,
          to: { row: jumpRow, col: jumpCol },
          captured: [{ row: currentRow, col: currentCol }],
        });
      }
    }
  }

  return moves;
};

// 获取所有可用移动
export const getCheckersAvailableMoves = (
  board: CheckersBoard,
  player: "red" | "black",
  mustCaptureFrom?: Position
): CheckersMove[] => {
  const moves: CheckersMove[] = [];
  const captureMoves: CheckersMove[] = [];

  if (mustCaptureFrom) {
    // 强制连续跳跃
    return getPieceMoves(board, mustCaptureFrom, true);
  }

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const pieceMoves = getPieceMoves(board, { row, col });

        pieceMoves.forEach((move) => {
          if (move.captured && move.captured.length > 0) {
            captureMoves.push(move);
          } else {
            moves.push(move);
          }
        });
      }
    }
  }

  // 如果有吃子移动，必须选择吃子
  return captureMoves.length > 0 ? captureMoves : moves;
};

// 执行跳棋移动
export const makeCheckersMove = (board: CheckersBoard, move: CheckersMove): CheckersBoard => {
  const newBoard = board.map((row) => [...row]);
  const piece = newBoard[move.from.row][move.from.col];

  if (!piece) return board;

  // 移动棋子
  newBoard[move.from.row][move.from.col] = null;
  newBoard[move.to.row][move.to.col] = piece;

  // 移除被吃掉的棋子
  if (move.captured) {
    move.captured.forEach((pos) => {
      newBoard[pos.row][pos.col] = null;
    });
  }

  // 检查是否升级为王
  if (!piece.isKing) {
    if ((piece.player === "red" && move.to.row === 0) || (piece.player === "black" && move.to.row === 7)) {
      newBoard[move.to.row][move.to.col] = { ...piece, isKing: true };
    }
  }

  return newBoard;
};

// 检查跳棋胜利条件
export const checkCheckersWinner = (
  board: CheckersBoard,
  currentPlayer: "red" | "black"
): "red" | "black" | "draw" | null => {
  let redPieces = 0;
  let blackPieces = 0;

  // 计算棋子数量
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.player === "red") redPieces++;
        else blackPieces++;
      }
    }
  }

  // 检查是否有一方没有棋子
  if (redPieces === 0) return "black";
  if (blackPieces === 0) return "red";

  // 检查当前玩家是否还能移动
  const availableMoves = getCheckersAvailableMoves(board, currentPlayer);
  if (availableMoves.length === 0) {
    return currentPlayer === "red" ? "black" : "red";
  }

  return null;
};

// 简单的跳棋AI
export const getCheckersAIMove = (
  board: CheckersBoard,
  player: "red" | "black",
  difficulty: string = "medium"
): CheckersMove | null => {
  const availableMoves = getCheckersAvailableMoves(board, player);
  if (availableMoves.length === 0) return null;

  switch (difficulty) {
    case "easy":
      return getEasyAIMove(availableMoves);
    case "medium":
      return getMediumAIMove(board, availableMoves, player);
    case "hard":
      return getHardAIMove(board, availableMoves, player);
    default:
      return getMediumAIMove(board, availableMoves, player);
  }
};

// 简单AI：随机移动，稍微偏向吃子
const getEasyAIMove = (availableMoves: CheckersMove[]): CheckersMove => {
  const captureMoves = availableMoves.filter((move) => move.captured && move.captured.length > 0);

  // 70%概率选择吃子移动（如果有的话）
  if (captureMoves.length > 0 && Math.random() < 0.7) {
    return captureMoves[Math.floor(Math.random() * captureMoves.length)];
  }

  // 否则随机选择
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

// 中等AI：优先吃子，考虑基本策略
const getMediumAIMove = (
  board: CheckersBoard,
  availableMoves: CheckersMove[],
  player: "red" | "black"
): CheckersMove => {
  const captureMoves = availableMoves.filter((move) => move.captured && move.captured.length > 0);

  // 总是优先选择吃子移动
  if (captureMoves.length > 0) {
    // 选择吃子最多的移动
    captureMoves.sort((a, b) => (b.captured?.length || 0) - (a.captured?.length || 0));
    return captureMoves[0];
  }

  // 没有吃子移动时，评估位置价值
  const evaluatedMoves = availableMoves.map((move) => ({
    move,
    score: evaluateMove(board, move, player),
  }));

  evaluatedMoves.sort((a, b) => b.score - a.score);

  // 在前3个最佳移动中随机选择，增加变化性
  const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
  return topMoves[Math.floor(Math.random() * topMoves.length)].move;
};

// 困难AI：使用minimax算法
const getHardAIMove = (board: CheckersBoard, availableMoves: CheckersMove[], player: "red" | "black"): CheckersMove => {
  const captureMoves = availableMoves.filter((move) => move.captured && move.captured.length > 0);

  // 总是优先选择吃子移动
  if (captureMoves.length > 0) {
    // 对吃子移动也进行深度评估
    const evaluatedCaptures = captureMoves.map((move) => ({
      move,
      score: minimax(board, move, 3, false, player, -Infinity, Infinity),
    }));

    evaluatedCaptures.sort((a, b) => b.score - a.score);
    return evaluatedCaptures[0].move;
  }

  // 使用minimax算法选择最佳移动
  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    const score = minimax(board, move, 3, false, player, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

// 评估移动的价值（中等难度使用）
const evaluateMove = (board: CheckersBoard, move: CheckersMove, player: "red" | "black"): number => {
  let score = 0;

  // 基础移动得分
  score += 1;

  // 向前移动加分
  if (player === "black" && move.to.row > move.from.row) {
    score += 2;
  } else if (player === "red" && move.to.row < move.from.row) {
    score += 2;
  }

  // 靠近边缘减分（避免被困）
  if (move.to.col === 0 || move.to.col === 7) {
    score -= 1;
  }

  // 接近对方底线加分（准备升王）
  const piece = board[move.from.row][move.from.col];
  if (piece && !piece.isKing) {
    if (player === "black" && move.to.row === 6) {
      score += 5; // 即将升王
    } else if (player === "red" && move.to.row === 1) {
      score += 5; // 即将升王
    } else if (player === "black" && move.to.row > 4) {
      score += 2; // 向前推进
    } else if (player === "red" && move.to.row < 3) {
      score += 2; // 向前推进
    }
  }

  // 王棋移动加分
  if (piece?.isKing) {
    score += 1;
  }

  return score;
};

// Minimax算法（困难难度使用）
const minimax = (
  board: CheckersBoard,
  move: CheckersMove,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: "red" | "black",
  alpha: number,
  beta: number
): number => {
  if (depth === 0) {
    return evaluateBoard(board, aiPlayer);
  }

  const newBoard = makeCheckersMove(board, move);
  const currentPlayer = isMaximizing ? aiPlayer : aiPlayer === "red" ? "black" : "red";
  const moves = getCheckersAvailableMoves(newBoard, currentPlayer);

  if (moves.length === 0) {
    // 无法移动，游戏结束
    return isMaximizing ? -1000 : 1000;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const nextMove of moves) {
      const eval_ = minimax(newBoard, nextMove, depth - 1, false, aiPlayer, alpha, beta);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break; // Alpha-beta剪枝
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const nextMove of moves) {
      const eval_ = minimax(newBoard, nextMove, depth - 1, true, aiPlayer, alpha, beta);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break; // Alpha-beta剪枝
    }
    return minEval;
  }
};

// 评估棋盘状态（困难难度使用）
const evaluateBoard = (board: CheckersBoard, aiPlayer: "red" | "black"): number => {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      let pieceValue = 0;

      // 基础棋子价值
      pieceValue += piece.isKing ? 5 : 3;

      // 位置价值
      if (piece.isKing) {
        // 王棋在中心更有价值
        const centerDistance = Math.abs(3.5 - row) + Math.abs(3.5 - col);
        pieceValue += (7 - centerDistance) * 0.5;
      } else {
        // 普通棋子向前推进有价值
        if (piece.player === "black") {
          pieceValue += row * 0.5; // 越往下越有价值
        } else {
          pieceValue += (7 - row) * 0.5; // 越往上越有价值
        }
      }

      // 边缘惩罚
      if (col === 0 || col === 7) {
        pieceValue -= 0.5;
      }

      // 根据是否是AI棋子加分或减分
      if (piece.player === aiPlayer) {
        score += pieceValue;
      } else {
        score -= pieceValue;
      }
    }
  }

  return score;
};

// 检查是否可以继续跳跃
export const canContinueCapture = (board: CheckersBoard, position: Position): boolean => {
  const moves = getPieceMoves(board, position, true);
  return moves.some((move) => move.captured && move.captured.length > 0);
};
