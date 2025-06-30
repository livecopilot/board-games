// 中国象棋游戏逻辑
import { ChessBoard, ChessPiece, ChessMove, ChessPieceType, Position, AIDifficulty } from "../types";
import { getRandomChoice, isInBounds, AI_SEARCH_DEPTHS, deepCopyBoard } from "./common";

// 创建中国象棋初始棋盘
export const createChessBoard = (): ChessBoard => {
  const board: ChessBoard = Array(10)
    .fill(null)
    .map(() => Array(9).fill(null));

  // 放置黑方棋子 (顶部)
  board[0][0] = { type: "rook", player: "black" };
  board[0][1] = { type: "horse", player: "black" };
  board[0][2] = { type: "elephant", player: "black" };
  board[0][3] = { type: "advisor", player: "black" };
  board[0][4] = { type: "king", player: "black" };
  board[0][5] = { type: "advisor", player: "black" };
  board[0][6] = { type: "elephant", player: "black" };
  board[0][7] = { type: "horse", player: "black" };
  board[0][8] = { type: "rook", player: "black" };

  board[2][1] = { type: "cannon", player: "black" };
  board[2][7] = { type: "cannon", player: "black" };

  for (let i = 0; i < 9; i += 2) {
    board[3][i] = { type: "pawn", player: "black" };
  }

  // 放置红方棋子 (底部)
  board[9][0] = { type: "rook", player: "red" };
  board[9][1] = { type: "horse", player: "red" };
  board[9][2] = { type: "elephant", player: "red" };
  board[9][3] = { type: "advisor", player: "red" };
  board[9][4] = { type: "king", player: "red" };
  board[9][5] = { type: "advisor", player: "red" };
  board[9][6] = { type: "elephant", player: "red" };
  board[9][7] = { type: "horse", player: "red" };
  board[9][8] = { type: "rook", player: "red" };

  board[7][1] = { type: "cannon", player: "red" };
  board[7][7] = { type: "cannon", player: "red" };

  for (let i = 0; i < 9; i += 2) {
    board[6][i] = { type: "pawn", player: "red" };
  }

  return board;
};

// 检查是否在九宫格内
const isInPalace = (row: number, col: number, player: "red" | "black"): boolean => {
  if (player === "red") {
    return row >= 7 && row <= 9 && col >= 3 && col <= 5;
  } else {
    return row >= 0 && row <= 2 && col >= 3 && col <= 5;
  }
};

// 检查是否过河
const hasCrossedRiver = (row: number, player: "red" | "black"): boolean => {
  if (player === "red") {
    return row <= 4;
  } else {
    return row >= 5;
  }
};

// 棋子价值表
export const getPieceValue = (type: ChessPieceType): number => {
  const values = {
    king: 10000,
    rook: 9,
    cannon: 4.5,
    horse: 4,
    elephant: 2,
    advisor: 2,
    pawn: 1,
  };
  return values[type];
};

// 执行象棋移动
export const makeChessMove = (board: ChessBoard, move: ChessMove): ChessBoard => {
  const newBoard = deepCopyBoard(board);

  newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
  newBoard[move.from.row][move.from.col] = null;

  return newBoard;
};

// 找到指定玩家的王
const findKing = (board: ChessBoard, player: "red" | "black"): Position | null => {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.type === "king" && piece.player === player) {
        return { row, col };
      }
    }
  }
  return null;
};

// 将帅移动
const getKingMoves = (board: ChessBoard, position: Position, piece: NonNullable<ChessPiece>): ChessMove[] => {
  const moves: ChessMove[] = [];
  const { row, col } = position;

  const kingMoves = [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ];

  for (const move of kingMoves) {
    if (isInBounds(move.row, move.col, 10, 9) && isInPalace(move.row, move.col, piece.player)) {
      const target = board[move.row][move.col];
      if (!target || target.player !== piece.player) {
        moves.push({
          from: position,
          to: move,
          captured: target || undefined,
        });
      }
    }
  }

  return moves;
};

// 士移动
const getAdvisorMoves = (board: ChessBoard, position: Position, piece: NonNullable<ChessPiece>): ChessMove[] => {
  const moves: ChessMove[] = [];
  const { row, col } = position;

  const advisorMoves = [
    { row: row - 1, col: col - 1 },
    { row: row - 1, col: col + 1 },
    { row: row + 1, col: col - 1 },
    { row: row + 1, col: col + 1 },
  ];

  for (const move of advisorMoves) {
    if (isInBounds(move.row, move.col, 10, 9) && isInPalace(move.row, move.col, piece.player)) {
      const target = board[move.row][move.col];
      if (!target || target.player !== piece.player) {
        moves.push({
          from: position,
          to: move,
          captured: target || undefined,
        });
      }
    }
  }

  return moves;
};

// 相象移动
const getElephantMoves = (board: ChessBoard, position: Position, piece: NonNullable<ChessPiece>): ChessMove[] => {
  const moves: ChessMove[] = [];
  const { row, col } = position;

  const elephantMoves = [
    { row: row - 2, col: col - 2, block: { row: row - 1, col: col - 1 } },
    { row: row - 2, col: col + 2, block: { row: row - 1, col: col + 1 } },
    { row: row + 2, col: col - 2, block: { row: row + 1, col: col - 1 } },
    { row: row + 2, col: col + 2, block: { row: row + 1, col: col + 1 } },
  ];

  for (const move of elephantMoves) {
    if (
      isInBounds(move.row, move.col, 10, 9) &&
      !hasCrossedRiver(move.row, piece.player) &&
      !board[move.block.row][move.block.col]
    ) {
      const target = board[move.row][move.col];
      if (!target || target.player !== piece.player) {
        moves.push({
          from: position,
          to: { row: move.row, col: move.col },
          captured: target || undefined,
        });
      }
    }
  }

  return moves;
};

// 马移动
const getHorseMoves = (board: ChessBoard, position: Position, piece: NonNullable<ChessPiece>): ChessMove[] => {
  const moves: ChessMove[] = [];
  const { row, col } = position;

  const horseMoves = [
    { row: row - 2, col: col - 1, block: { row: row - 1, col } },
    { row: row - 2, col: col + 1, block: { row: row - 1, col } },
    { row: row - 1, col: col - 2, block: { row, col: col - 1 } },
    { row: row - 1, col: col + 2, block: { row, col: col + 1 } },
    { row: row + 1, col: col - 2, block: { row, col: col - 1 } },
    { row: row + 1, col: col + 2, block: { row, col: col + 1 } },
    { row: row + 2, col: col - 1, block: { row: row + 1, col } },
    { row: row + 2, col: col + 1, block: { row: row + 1, col } },
  ];

  for (const move of horseMoves) {
    if (isInBounds(move.row, move.col, 10, 9) && !board[move.block.row][move.block.col]) {
      const target = board[move.row][move.col];
      if (!target || target.player !== piece.player) {
        moves.push({
          from: position,
          to: { row: move.row, col: move.col },
          captured: target || undefined,
        });
      }
    }
  }

  return moves;
};

// 车移动
const getRookMoves = (board: ChessBoard, position: Position, piece: NonNullable<ChessPiece>): ChessMove[] => {
  const moves: ChessMove[] = [];
  const { row, col } = position;

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  for (const dir of directions) {
    for (let i = 1; i < 10; i++) {
      const newRow = row + dir.row * i;
      const newCol = col + dir.col * i;

      if (!isInBounds(newRow, newCol, 10, 9)) break;

      const target = board[newRow][newCol];
      if (target) {
        if (target.player !== piece.player) {
          moves.push({
            from: position,
            to: { row: newRow, col: newCol },
            captured: target,
          });
        }
        break;
      } else {
        moves.push({
          from: position,
          to: { row: newRow, col: newCol },
        });
      }
    }
  }

  return moves;
};

// 炮移动
const getCannonMoves = (board: ChessBoard, position: Position, piece: NonNullable<ChessPiece>): ChessMove[] => {
  const moves: ChessMove[] = [];
  const { row, col } = position;

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  for (const dir of directions) {
    let hasJumped = false;

    for (let i = 1; i < 10; i++) {
      const newRow = row + dir.row * i;
      const newCol = col + dir.col * i;

      if (!isInBounds(newRow, newCol, 10, 9)) break;

      const target = board[newRow][newCol];
      if (target) {
        if (!hasJumped) {
          hasJumped = true;
        } else {
          if (target.player !== piece.player) {
            moves.push({
              from: position,
              to: { row: newRow, col: newCol },
              captured: target,
            });
          }
          break;
        }
      } else if (!hasJumped) {
        moves.push({
          from: position,
          to: { row: newRow, col: newCol },
        });
      }
    }
  }

  return moves;
};

// 兵卒移动
const getPawnMoves = (board: ChessBoard, position: Position, piece: NonNullable<ChessPiece>): ChessMove[] => {
  const moves: ChessMove[] = [];
  const { row, col } = position;

  const direction = piece.player === "red" ? -1 : 1;
  const pawnMoves = [];

  // 向前移动
  pawnMoves.push({ row: row + direction, col });

  // 如果已过河，可以左右移动
  if (hasCrossedRiver(row, piece.player)) {
    pawnMoves.push({ row, col: col - 1 });
    pawnMoves.push({ row, col: col + 1 });
  }

  for (const move of pawnMoves) {
    if (isInBounds(move.row, move.col, 10, 9)) {
      const target = board[move.row][move.col];
      if (!target || target.player !== piece.player) {
        moves.push({
          from: position,
          to: move,
          captured: target || undefined,
        });
      }
    }
  }

  return moves;
};

// 获取单个棋子的可能移动
export const getChessPieceMoves = (board: ChessBoard, position: Position, piece: ChessPiece): ChessMove[] => {
  if (!piece) return [];

  // 现在 piece 不再是 null，我们可以安全地调用私有函数
  const nonNullPiece = piece as NonNullable<ChessPiece>;

  switch (nonNullPiece.type) {
    case "king":
      return getKingMoves(board, position, nonNullPiece);
    case "advisor":
      return getAdvisorMoves(board, position, nonNullPiece);
    case "elephant":
      return getElephantMoves(board, position, nonNullPiece);
    case "horse":
      return getHorseMoves(board, position, nonNullPiece);
    case "rook":
      return getRookMoves(board, position, nonNullPiece);
    case "cannon":
      return getCannonMoves(board, position, nonNullPiece);
    case "pawn":
      return getPawnMoves(board, position, nonNullPiece);
    default:
      return [];
  }
};

// 获取所有可能的移动
export const getChessAvailableMoves = (board: ChessBoard, player: "red" | "black"): ChessMove[] => {
  const moves: ChessMove[] = [];

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const pieceMoves = getChessPieceMoves(board, { row, col }, piece);
        // 过滤掉会导致自己被将军的移动
        const validMoves = pieceMoves.filter((move) => {
          const newBoard = makeChessMove(board, move);
          return !isInCheck(newBoard, player);
        });
        moves.push(...validMoves);
      }
    }
  }

  return moves;
};

// 检查是否被将军
export const isInCheck = (board: ChessBoard, player: "red" | "black"): boolean => {
  const kingPos = findKing(board, player);
  if (!kingPos) return false;

  const opponent = player === "red" ? "black" : "red";

  // 检查对方所有棋子是否能攻击到帅/将
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.player === opponent) {
        const moves = getChessPieceMoves(board, { row, col }, piece);
        if (moves.some((move) => move.to.row === kingPos.row && move.to.col === kingPos.col)) {
          return true;
        }
      }
    }
  }

  return false;
};

// 检查是否将死
export const isCheckmate = (board: ChessBoard, player: "red" | "black"): boolean => {
  if (!isInCheck(board, player)) return false;

  const moves = getChessAvailableMoves(board, player);
  return moves.length === 0;
};

// 检查象棋胜利条件
export const checkChessWinner = (
  board: ChessBoard,
  currentPlayer: "red" | "black"
): "red" | "black" | "draw" | null => {
  // 检查是否有帅/将被吃掉
  const redKing = findKing(board, "red");
  const blackKing = findKing(board, "black");

  if (!redKing) return "black";
  if (!blackKing) return "red";

  // 检查是否将死
  if (isCheckmate(board, currentPlayer)) {
    return currentPlayer === "red" ? "black" : "red";
  }

  // 检查是否无子可动
  const moves = getChessAvailableMoves(board, currentPlayer);
  if (moves.length === 0) {
    return currentPlayer === "red" ? "black" : "red";
  }

  return null;
};

// 象棋AI
export const getChessAIMove = (
  board: ChessBoard,
  player: "red" | "black",
  difficulty: AIDifficulty = AIDifficulty.MEDIUM
): ChessMove | null => {
  const availableMoves = getChessAvailableMoves(board, player);
  if (availableMoves.length === 0) return null;

  switch (difficulty) {
    case AIDifficulty.EASY:
      return getChessEasyAI(availableMoves);
    case AIDifficulty.MEDIUM:
      return getChessMediumAI(board, availableMoves, player);
    case AIDifficulty.HARD:
      return getChessHardAI(board, availableMoves, player);
    default:
      return getChessMediumAI(board, availableMoves, player);
  }
};

// 简单AI：随机移动，优先吃子
const getChessEasyAI = (availableMoves: ChessMove[]): ChessMove => {
  const captureMoves = availableMoves.filter((move) => move.captured);

  if (captureMoves.length > 0 && Math.random() < 0.7) {
    return getRandomChoice(captureMoves);
  }

  return getRandomChoice(availableMoves);
};

// 中等AI：基本策略
const getChessMediumAI = (board: ChessBoard, availableMoves: ChessMove[], player: "red" | "black"): ChessMove => {
  // 优先级1：逃避将军
  if (isInCheck(board, player)) {
    return getRandomChoice(availableMoves);
  }

  // 优先级2：将军对手
  const checkMoves = availableMoves.filter((move) => {
    const newBoard = makeChessMove(board, move);
    return isInCheck(newBoard, player === "red" ? "black" : "red");
  });
  if (checkMoves.length > 0) {
    return getRandomChoice(checkMoves);
  }

  // 优先级3：吃子
  const captureMoves = availableMoves.filter((move) => move.captured);
  if (captureMoves.length > 0) {
    // 按被吃棋子价值排序
    captureMoves.sort((a, b) => getPieceValue(b.captured!.type) - getPieceValue(a.captured!.type));
    return captureMoves[0];
  }

  // 评估位置价值
  const evaluatedMoves = availableMoves.map((move) => ({
    move,
    score: evaluateChessMove(board, move, player),
  }));

  evaluatedMoves.sort((a, b) => b.score - a.score);

  // 在前3个最佳移动中随机选择
  const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
  return getRandomChoice(topMoves).move;
};

// 困难AI：高级策略
const getChessHardAI = (board: ChessBoard, availableMoves: ChessMove[], player: "red" | "black"): ChessMove => {
  // 简化版本：使用更好的评估函数
  const evaluatedMoves = availableMoves.map((move) => ({
    move,
    score: evaluateChessMove(board, move, player),
  }));

  evaluatedMoves.sort((a, b) => b.score - a.score);
  return evaluatedMoves[0].move;
};

// 评估象棋移动价值
const evaluateChessMove = (board: ChessBoard, move: ChessMove, player: "red" | "black"): number => {
  let score = 0;

  // 吃子价值
  if (move.captured) {
    score += getPieceValue(move.captured.type) * 10;
  }

  // 中心控制价值
  const centerDistance = Math.abs(4.5 - move.to.row) + Math.abs(4 - move.to.col);
  score += (8 - centerDistance) * 0.5;

  // 将军加分
  const newBoard = makeChessMove(board, move);
  if (isInCheck(newBoard, player === "red" ? "black" : "red")) {
    score += 50;
  }

  return score;
};
