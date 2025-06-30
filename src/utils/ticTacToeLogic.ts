// 井字棋游戏逻辑
import { Board, CellValue, Position, AIDifficulty } from "../types";
import { getRandomChoice, isInBounds, AI_SEARCH_DEPTHS } from "./common";

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
  return isInBounds(row, col, 3, 3) && board[row][col] === null;
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

  return getRandomChoice(availableMoves);
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
  return getRandomChoice(availableMoves);
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
    return getRandomChoice(availableCorners);
  }

  // 随机选择
  return getRandomChoice(availableMoves);
};

// 困难AI：完美的Minimax算法（不可击败）
const getTicTacToeHardAI = (board: Board, availableMoves: Position[]): Position => {
  // 使用开局书优化
  const openingMove = getOpeningMove(board);
  if (openingMove) {
    return openingMove;
  }

  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    const newBoard = makeMove(board, move, "O");
    const score = minimax(newBoard, 0, false, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

// 开局书（优化开局性能）
const getOpeningMove = (board: Board): Position | null => {
  const moveCount = 9 - getAvailableMoves(board).length;
  
  // 第一步：选择中心
  if (moveCount === 0) {
    return { row: 1, col: 1 };
  }
  
  // 第二步：如果对手占了中心，选择角落
  if (moveCount === 1 && board[1][1] === "X") {
    return { row: 0, col: 0 };
  }
  
  // 第二步：如果对手占了角落，选择中心
  if (moveCount === 1 && board[1][1] === null) {
    return { row: 1, col: 1 };
  }
  
  return null;
};

// 优化的Minimax算法（带Alpha-Beta剪枝）
const minimax = (
  board: Board, 
  depth: number, 
  isMaximizing: boolean, 
  alpha: number, 
  beta: number
): number => {
  const winner = checkWinner(board);

  // 终端状态评估，考虑深度以优先快速胜利
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (winner === "draw") return 0;

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of availableMoves) {
      const newBoard = makeMove(board, move, "O");
      const eval_ = minimax(newBoard, depth + 1, false, alpha, beta);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break; // Alpha-Beta剪枝
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of availableMoves) {
      const newBoard = makeMove(board, move, "X");
      const eval_ = minimax(newBoard, depth + 1, true, alpha, beta);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break; // Alpha-Beta剪枝
    }
    return minEval;
  }
}; 