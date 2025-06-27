import { Board, CellValue, Position } from "../types";
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
export const getCheckersAIMove = (board: CheckersBoard, player: "red" | "black"): CheckersMove | null => {
  const availableMoves = getCheckersAvailableMoves(board, player);
  if (availableMoves.length === 0) return null;

  // 优先选择吃子移动
  const captureMoves = availableMoves.filter((move) => move.captured && move.captured.length > 0);
  if (captureMoves.length > 0) {
    return captureMoves[Math.floor(Math.random() * captureMoves.length)];
  }

  // 否则随机选择移动
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

// 检查是否可以继续跳跃
export const canContinueCapture = (board: CheckersBoard, position: Position): boolean => {
  const moves = getPieceMoves(board, position, true);
  return moves.some((move) => move.captured && move.captured.length > 0);
};
