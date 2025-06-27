import { Board, CellValue, Position } from "../types";

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
