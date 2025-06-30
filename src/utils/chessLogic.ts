// 中国象棋游戏逻辑
import { ChessBoard, ChessPiece, ChessMove, ChessPieceType, Position, AIDifficulty } from "../types";
import { getRandomChoice, isInBounds, AI_SEARCH_DEPTHS, deepCopyBoard } from "./common";

// 专家级AI搜索参数
const EXPERT_SEARCH_DEPTHS = {
  [AIDifficulty.EASY]: 2,
  [AIDifficulty.MEDIUM]: 4,
  [AIDifficulty.HARD]: 8, // 专家级深度
};

const MAX_SEARCH_TIME = {
  [AIDifficulty.EASY]: 300,
  [AIDifficulty.MEDIUM]: 800,
  [AIDifficulty.HARD]: 3000, // 允许更长思考时间
};

// 置换表用于记忆化搜索
interface TranspositionEntry {
  depth: number;
  score: number;
  flag: "exact" | "lower" | "upper";
  bestMove?: ChessMove;
}

const transpositionTable = new Map<string, TranspositionEntry>();

// 历史启发表
const historyTable = new Map<string, number>();

// 杀手移动表
const killerMoves: ChessMove[][] = Array(20)
  .fill(null)
  .map(() => []);

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

// 棋子价值表 - 更精确的价值
export const getPieceValue = (type: ChessPieceType): number => {
  const values = {
    king: 100000, // 帅/将是无价的
    rook: 1000, // 车
    cannon: 550, // 炮
    horse: 450, // 马
    elephant: 250, // 相/象
    advisor: 250, // 士
    pawn: 100, // 兵/卒
  };
  return values[type];
};

// 位置价值表
const POSITION_VALUES = {
  king: [
    [0, 0, 0, 8, 8, 8, 0, 0, 0],
    [0, 0, 0, 8, 8, 8, 0, 0, 0],
    [0, 0, 0, 8, 8, 8, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 8, 8, 8, 0, 0, 0],
    [0, 0, 0, 8, 8, 8, 0, 0, 0],
    [0, 0, 0, 8, 8, 8, 0, 0, 0],
  ],
  advisor: [
    [0, 0, 0, 20, 0, 20, 0, 0, 0],
    [0, 0, 0, 0, 23, 0, 0, 0, 0],
    [0, 0, 0, 20, 0, 20, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 20, 0, 20, 0, 0, 0],
    [0, 0, 0, 0, 23, 0, 0, 0, 0],
    [0, 0, 0, 20, 0, 20, 0, 0, 0],
  ],
  elephant: [
    [0, 0, 20, 0, 0, 0, 20, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [18, 0, 0, 0, 23, 0, 0, 0, 18],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [18, 0, 0, 0, 23, 0, 0, 0, 18],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 20, 0, 0, 0, 20, 0, 0],
  ],
  horse: [
    [90, 90, 90, 96, 90, 96, 90, 90, 90],
    [90, 96, 103, 97, 94, 97, 103, 96, 90],
    [92, 98, 99, 103, 99, 103, 99, 98, 92],
    [93, 108, 100, 107, 100, 107, 100, 108, 93],
    [90, 100, 99, 103, 104, 103, 99, 100, 90],
    [90, 98, 101, 102, 103, 102, 101, 98, 90],
    [92, 94, 98, 95, 98, 95, 98, 94, 92],
    [93, 92, 94, 95, 92, 95, 94, 92, 93],
    [85, 90, 92, 93, 78, 93, 92, 90, 85],
    [88, 85, 90, 88, 90, 88, 90, 85, 88],
  ],
  rook: [
    [180, 200, 200, 200, 206, 200, 200, 200, 180],
    [200, 200, 200, 200, 200, 200, 200, 200, 200],
    [180, 200, 200, 200, 200, 200, 200, 200, 180],
    [180, 200, 200, 200, 200, 200, 200, 200, 180],
    [180, 200, 200, 200, 200, 200, 200, 200, 180],
    [180, 200, 200, 200, 200, 200, 200, 200, 180],
    [180, 200, 200, 200, 200, 200, 200, 200, 180],
    [180, 200, 200, 200, 200, 200, 200, 200, 180],
    [180, 200, 200, 200, 200, 200, 200, 200, 180],
    [180, 200, 200, 200, 206, 200, 200, 200, 180],
  ],
  cannon: [
    [100, 100, 96, 91, 90, 91, 96, 100, 100],
    [98, 98, 96, 92, 89, 92, 96, 98, 98],
    [97, 97, 96, 91, 92, 91, 96, 97, 97],
    [96, 99, 99, 98, 100, 98, 99, 99, 96],
    [96, 99, 99, 98, 100, 98, 99, 99, 96],
    [96, 99, 99, 98, 100, 98, 99, 99, 96],
    [97, 97, 96, 91, 92, 91, 96, 97, 97],
    [98, 98, 96, 92, 89, 92, 96, 98, 98],
    [100, 100, 96, 91, 90, 91, 96, 100, 100],
    [100, 100, 96, 91, 90, 91, 96, 100, 100],
  ],
  pawn: [
    [9, 9, 9, 11, 13, 11, 9, 9, 9],
    [19, 24, 34, 42, 44, 42, 34, 24, 19],
    [19, 24, 32, 37, 37, 37, 32, 24, 19],
    [19, 23, 27, 29, 30, 29, 27, 23, 19],
    [14, 18, 20, 27, 29, 27, 20, 18, 14],
    [7, 0, 13, 0, 16, 0, 13, 0, 7],
    [7, 0, 7, 0, 15, 0, 7, 0, 7],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
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

// 象棋AI - 重构版本
export const getChessAIMove = (
  board: ChessBoard,
  player: "red" | "black",
  difficulty: AIDifficulty = AIDifficulty.MEDIUM
): ChessMove | null => {
  const availableMoves = getChessAvailableMoves(board, player);
  if (availableMoves.length === 0) return null;

  switch (difficulty) {
    case AIDifficulty.EASY:
      return getChessImprovedEasyAI(board, availableMoves, player);
    case AIDifficulty.MEDIUM:
      return getChessImprovedMediumAI(board, availableMoves, player);
    case AIDifficulty.HARD:
      return getChessExpertAI(board, availableMoves, player);
    default:
      return getChessImprovedMediumAI(board, availableMoves, player);
  }
};

// 改进的简单AI
const getChessImprovedEasyAI = (board: ChessBoard, availableMoves: ChessMove[], player: "red" | "black"): ChessMove => {
  const opponent = player === "red" ? "black" : "red";

  // 1. 优先逃避将军
  if (isInCheck(board, player)) {
    return getRandomChoice(availableMoves);
  }

  // 2. 优先将军对手
  const checkMoves = availableMoves.filter((move) => {
    const newBoard = makeChessMove(board, move);
    return isInCheck(newBoard, opponent);
  });
  if (checkMoves.length > 0 && Math.random() < 0.8) {
    return getRandomChoice(checkMoves);
  }

  // 3. 优先吃高价值棋子
  const captureMoves = availableMoves.filter((move) => move.captured);
  if (captureMoves.length > 0 && Math.random() < 0.85) {
    captureMoves.sort((a, b) => getPieceValue(b.captured!.type) - getPieceValue(a.captured!.type));
    return Math.random() < 0.7 ? captureMoves[0] : getRandomChoice(captureMoves.slice(0, 3));
  }

  // 4. 简单位置评估
  const evaluatedMoves = availableMoves.map((move) => ({
    move,
    score: evaluateSimpleMove(board, move, player),
  }));

  evaluatedMoves.sort((a, b) => b.score - a.score);

  // 在前5个最佳移动中随机选择
  const topMoves = evaluatedMoves.slice(0, Math.min(5, evaluatedMoves.length));
  return getRandomChoice(topMoves).move;
};

// 改进的中等AI
const getChessImprovedMediumAI = (
  board: ChessBoard,
  availableMoves: ChessMove[],
  player: "red" | "black"
): ChessMove => {
  const startTime = Date.now();
  const maxTime = MAX_SEARCH_TIME[AIDifficulty.MEDIUM];
  const depth = EXPERT_SEARCH_DEPTHS[AIDifficulty.MEDIUM];

  const result = minimax(board, depth, -Infinity, Infinity, true, player, startTime, maxTime);

  if (result.move) {
    return result.move;
  }

  // 后备方案：使用评估函数
  const evaluatedMoves = availableMoves.map((move) => ({
    move,
    score: evaluateAdvancedMove(board, move, player),
  }));

  evaluatedMoves.sort((a, b) => b.score - a.score);

  // 在前3个最佳移动中随机选择
  const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
  return getRandomChoice(topMoves).move;
};

// 专家级AI
const getChessExpertAI = (board: ChessBoard, availableMoves: ChessMove[], player: "red" | "black"): ChessMove => {
  const startTime = Date.now();
  const maxTime = MAX_SEARCH_TIME[AIDifficulty.HARD];
  const depth = EXPERT_SEARCH_DEPTHS[AIDifficulty.HARD];

  // 迭代加深搜索
  let bestMove: ChessMove | undefined;
  let bestScore = -Infinity;

  for (let currentDepth = 1; currentDepth <= depth; currentDepth++) {
    if (Date.now() - startTime > maxTime * 0.8) break;

    const result = minimax(board, currentDepth, -Infinity, Infinity, true, player, startTime, maxTime);

    if (result.move && result.score > bestScore) {
      bestMove = result.move;
      bestScore = result.score;
    }

    // 如果找到必胜移动，立即返回
    if (bestScore > 50000) break;
  }

  if (bestMove) {
    return bestMove;
  }

  // 后备方案：详细评估
  const evaluatedMoves = availableMoves.map((move) => ({
    move,
    score: evaluateExpertMove(board, move, player),
  }));

  evaluatedMoves.sort((a, b) => b.score - a.score);
  return evaluatedMoves[0].move;
};

// 简单移动评估
const evaluateSimpleMove = (board: ChessBoard, move: ChessMove, player: "red" | "black"): number => {
  let score = 0;

  // 吃子价值
  if (move.captured) {
    score += getPieceValue(move.captured.type) * 8;
  }

  // 中心控制
  const centerDistance = Math.abs(4.5 - move.to.row) + Math.abs(4 - move.to.col);
  score += (8 - centerDistance) * 2;

  // 将军检查
  const newBoard = makeChessMove(board, move);
  if (isInCheck(newBoard, player === "red" ? "black" : "red")) {
    score += 40;
  }

  return score;
};

// 高级移动评估
const evaluateAdvancedMove = (board: ChessBoard, move: ChessMove, player: "red" | "black"): number => {
  const newBoard = makeChessMove(board, move);
  const currentScore = evaluatePosition(board, player);
  const newScore = evaluatePosition(newBoard, player);

  let score = newScore - currentScore;

  // 额外的战术考量
  if (move.captured) {
    score += getPieceValue(move.captured.type) * 5;
  }

  const opponent = player === "red" ? "black" : "red";
  if (isInCheck(newBoard, opponent)) {
    score += 100;
  }

  return score;
};

// 专家级移动评估
const evaluateExpertMove = (board: ChessBoard, move: ChessMove, player: "red" | "black"): number => {
  const newBoard = makeChessMove(board, move);

  // 深度为2的minimax评估
  const result = minimax(newBoard, 2, -Infinity, Infinity, false, player, Date.now(), 200);

  return result.score;
};

// 高级局面评估函数
const evaluatePosition = (board: ChessBoard, player: "red" | "black"): number => {
  let score = 0;
  const opponent = player === "red" ? "black" : "red";

  // 基础材料价值和位置价值
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece) {
        const pieceValue = getPieceValue(piece.type);
        const positionValue = getPositionValue(piece.type, row, col, piece.player);
        const totalValue = pieceValue + positionValue;

        if (piece.player === player) {
          score += totalValue;
        } else {
          score -= totalValue;
        }
      }
    }
  }

  // 将军惩罚
  if (isInCheck(board, player)) {
    score -= 500;
  }
  if (isInCheck(board, opponent)) {
    score += 500;
  }

  // 移动能力评估
  const playerMoves = getChessAvailableMoves(board, player).length;
  const opponentMoves = getChessAvailableMoves(board, opponent).length;
  score += (playerMoves - opponentMoves) * 10;

  // 中心控制评估
  const centerSquares = [
    { row: 4, col: 3 },
    { row: 4, col: 4 },
    { row: 4, col: 5 },
    { row: 5, col: 3 },
    { row: 5, col: 4 },
    { row: 5, col: 5 },
  ];

  for (const pos of centerSquares) {
    const piece = board[pos.row][pos.col];
    if (piece) {
      if (piece.player === player) {
        score += 15;
      } else {
        score -= 15;
      }
    }
  }

  // 棋子保护和攻击评估
  score += evaluatePieceProtection(board, player);

  return score;
};

// 评估棋子保护和攻击
const evaluatePieceProtection = (board: ChessBoard, player: "red" | "black"): number => {
  let score = 0;
  const opponent = player === "red" ? "black" : "red";

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const attackers = countAttackers(board, { row, col }, opponent);
        const defenders = countAttackers(board, { row, col }, player);

        if (attackers > 0) {
          const pieceValue = getPieceValue(piece.type);
          if (defenders < attackers) {
            score -= pieceValue * 0.5; // 受威胁的棋子
          } else if (defenders > attackers) {
            score += pieceValue * 0.2; // 受保护的棋子
          }
        }
      }
    }
  }

  return score;
};

// 计算攻击某个位置的棋子数量
const countAttackers = (board: ChessBoard, position: Position, player: "red" | "black"): number => {
  let count = 0;

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const moves = getChessPieceMoves(board, { row, col }, piece);
        if (moves.some((move) => move.to.row === position.row && move.to.col === position.col)) {
          count++;
        }
      }
    }
  }

  return count;
};

// 移动排序 - 用于提高Alpha-Beta剪枝效率
const orderMoves = (board: ChessBoard, moves: ChessMove[], player: "red" | "black", depth: number): ChessMove[] => {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // 优先考虑吃子移动
    if (a.captured) scoreA += getPieceValue(a.captured.type) * 10;
    if (b.captured) scoreB += getPieceValue(b.captured.type) * 10;

    // 优先考虑将军移动
    const boardA = makeChessMove(board, a);
    const boardB = makeChessMove(board, b);
    const opponent = player === "red" ? "black" : "red";

    if (isInCheck(boardA, opponent)) scoreA += 300;
    if (isInCheck(boardB, opponent)) scoreB += 300;

    // 历史启发
    const keyA = getMoveKey(a);
    const keyB = getMoveKey(b);
    scoreA += historyTable.get(keyA) || 0;
    scoreB += historyTable.get(keyB) || 0;

    // 杀手移动
    if (killerMoves[depth]?.some((km) => movesEqual(km, a))) scoreA += 200;
    if (killerMoves[depth]?.some((km) => movesEqual(km, b))) scoreB += 200;

    return scoreB - scoreA;
  });
};

// 辅助函数
const getMoveKey = (move: ChessMove): string => {
  return `${move.from.row},${move.from.col}-${move.to.row},${move.to.col}`;
};

const movesEqual = (a: ChessMove, b: ChessMove): boolean => {
  return a.from.row === b.from.row && a.from.col === b.from.col && a.to.row === b.to.row && a.to.col === b.to.col;
};

const getBoardKey = (board: ChessBoard): string => {
  return board.map((row) => row.map((piece) => (piece ? `${piece.player[0]}${piece.type[0]}` : "0")).join("")).join("");
};

// Minimax算法与Alpha-Beta剪枝
const minimax = (
  board: ChessBoard,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  player: "red" | "black",
  startTime: number,
  maxTime: number
): { score: number; move?: ChessMove } => {
  // 时间限制检查
  if (Date.now() - startTime > maxTime) {
    return { score: evaluatePosition(board, player) };
  }

  const boardKey = getBoardKey(board);
  const cachedEntry = transpositionTable.get(boardKey);

  // 置换表查找
  if (cachedEntry && cachedEntry.depth >= depth) {
    if (cachedEntry.flag === "exact") {
      return { score: cachedEntry.score, move: cachedEntry.bestMove };
    } else if (cachedEntry.flag === "lower" && cachedEntry.score >= beta) {
      return { score: beta };
    } else if (cachedEntry.flag === "upper" && cachedEntry.score <= alpha) {
      return { score: alpha };
    }
  }

  if (depth === 0) {
    return { score: quiescenceSearch(board, alpha, beta, maximizingPlayer, player, startTime, maxTime) };
  }

  const currentPlayer = maximizingPlayer ? player : player === "red" ? "black" : "red";
  let moves = getChessAvailableMoves(board, currentPlayer);

  if (moves.length === 0) {
    if (isInCheck(board, currentPlayer)) {
      // 被将死
      return { score: maximizingPlayer ? -100000 + depth : 100000 - depth };
    } else {
      // 和棋
      return { score: 0 };
    }
  }

  moves = orderMoves(board, moves, currentPlayer, depth);

  let bestMove: ChessMove | undefined;
  let flag: "exact" | "lower" | "upper" = "upper";

  if (maximizingPlayer) {
    let maxScore = -Infinity;

    for (const move of moves) {
      const newBoard = makeChessMove(board, move);
      const result = minimax(newBoard, depth - 1, alpha, beta, false, player, startTime, maxTime);

      if (result.score > maxScore) {
        maxScore = result.score;
        bestMove = move;
      }

      alpha = Math.max(alpha, result.score);

      if (beta <= alpha) {
        // Beta剪枝
        updateHistoryTable(move, depth);
        updateKillerMoves(move, depth);
        flag = "lower";
        break;
      }
    }

    if (alpha > -Infinity) flag = "exact";

    // 更新置换表
    transpositionTable.set(boardKey, {
      depth,
      score: maxScore,
      flag,
      bestMove,
    });

    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;

    for (const move of moves) {
      const newBoard = makeChessMove(board, move);
      const result = minimax(newBoard, depth - 1, alpha, beta, true, player, startTime, maxTime);

      if (result.score < minScore) {
        minScore = result.score;
        bestMove = move;
      }

      beta = Math.min(beta, result.score);

      if (beta <= alpha) {
        // Alpha剪枝
        updateHistoryTable(move, depth);
        updateKillerMoves(move, depth);
        flag = "upper";
        break;
      }
    }

    if (beta < Infinity) flag = "exact";

    // 更新置换表
    transpositionTable.set(boardKey, {
      depth,
      score: minScore,
      flag,
      bestMove,
    });

    return { score: minScore, move: bestMove };
  }
};

// 静态搜索 - 避免水平线效应
const quiescenceSearch = (
  board: ChessBoard,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  player: "red" | "black",
  startTime: number,
  maxTime: number,
  maxDepth: number = 6
): number => {
  if (Date.now() - startTime > maxTime || maxDepth <= 0) {
    return evaluatePosition(board, player);
  }

  const standPat = evaluatePosition(board, player);

  if (maximizingPlayer) {
    if (standPat >= beta) return beta;
    alpha = Math.max(alpha, standPat);
  } else {
    if (standPat <= alpha) return alpha;
    beta = Math.min(beta, standPat);
  }

  const currentPlayer = maximizingPlayer ? player : player === "red" ? "black" : "red";
  const moves = getChessAvailableMoves(board, currentPlayer);

  // 只考虑吃子移动和将军移动
  const captureMoves = moves.filter((move) => {
    if (move.captured) return true;
    const newBoard = makeChessMove(board, move);
    return isInCheck(newBoard, currentPlayer === "red" ? "black" : "red");
  });

  for (const move of captureMoves) {
    const newBoard = makeChessMove(board, move);
    const score = quiescenceSearch(newBoard, alpha, beta, !maximizingPlayer, player, startTime, maxTime, maxDepth - 1);

    if (maximizingPlayer) {
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    } else {
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
  }

  return maximizingPlayer ? alpha : beta;
};

// 更新历史表
const updateHistoryTable = (move: ChessMove, depth: number): void => {
  const key = getMoveKey(move);
  const currentValue = historyTable.get(key) || 0;
  historyTable.set(key, currentValue + depth * depth);
};

// 更新杀手移动
const updateKillerMoves = (move: ChessMove, depth: number): void => {
  if (!killerMoves[depth]) killerMoves[depth] = [];

  // 避免重复
  if (!killerMoves[depth].some((km) => movesEqual(km, move))) {
    killerMoves[depth].unshift(move);
    if (killerMoves[depth].length > 2) {
      killerMoves[depth].pop();
    }
  }
};

// 获取棋子位置价值
const getPositionValue = (type: ChessPieceType, row: number, col: number, player: "red" | "black"): number => {
  if (!POSITION_VALUES[type]) return 0;

  // 黑方需要翻转行坐标
  const adjustedRow = player === "black" ? row : 9 - row;
  return POSITION_VALUES[type][adjustedRow][col] || 0;
};
