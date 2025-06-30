// 跳棋游戏逻辑 - 专家级AI实现
import { CheckersBoard, CheckersPiece, CheckersMove, Position, AIDifficulty } from "../types";
import { getRandomChoice, isInBounds, AI_SEARCH_DEPTHS, deepCopyBoard } from "./common";

// 置换表条目
interface TranspositionEntry {
  depth: number;
  score: number;
  flag: "exact" | "lower" | "upper";
  bestMove?: CheckersMove;
}

// 置换表
class TranspositionTable {
  private table: Map<string, TranspositionEntry> = new Map();
  private readonly maxSize = 1000000; // 1M entries

  // 生成棋盘哈希值
  private hashBoard(board: CheckersBoard, player: "red" | "black"): string {
    let hash = player;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          hash += `${row}${col}${piece.player[0]}${piece.isKing ? "K" : "N"}`;
        }
      }
    }
    return hash;
  }

  store(board: CheckersBoard, player: "red" | "black", entry: TranspositionEntry): void {
    if (this.table.size >= this.maxSize) {
      this.table.clear(); // 简单的清理策略
    }
    this.table.set(this.hashBoard(board, player), entry);
  }

  lookup(board: CheckersBoard, player: "red" | "black"): TranspositionEntry | null {
    return this.table.get(this.hashBoard(board, player)) || null;
  }

  clear(): void {
    this.table.clear();
  }
}

// 历史表和杀手启发
class SearchHeuristics {
  private historyTable: Map<string, number> = new Map();
  private killerMoves: CheckersMove[][] = [];
  private readonly MAX_PLY = 64;

  constructor() {
    // 初始化杀手移动表
    for (let i = 0; i < this.MAX_PLY; i++) {
      this.killerMoves[i] = [];
    }
  }

  // 记录历史得分
  recordHistory(move: CheckersMove, depth: number): void {
    const key = this.moveToString(move);
    const current = this.historyTable.get(key) || 0;
    this.historyTable.set(key, current + depth * depth);
  }

  // 获取历史得分
  getHistoryScore(move: CheckersMove): number {
    return this.historyTable.get(this.moveToString(move)) || 0;
  }

  // 记录杀手移动
  recordKiller(move: CheckersMove, ply: number): void {
    if (ply >= this.MAX_PLY) return;

    const killers = this.killerMoves[ply];
    if (!killers.some((killer) => this.movesEqual(killer, move))) {
      killers.unshift(move);
      if (killers.length > 2) killers.pop();
    }
  }

  // 检查是否为杀手移动
  isKillerMove(move: CheckersMove, ply: number): boolean {
    if (ply >= this.MAX_PLY) return false;
    return this.killerMoves[ply].some((killer) => this.movesEqual(killer, move));
  }

  private moveToString(move: CheckersMove): string {
    return `${move.from.row}${move.from.col}${move.to.row}${move.to.col}`;
  }

  private movesEqual(move1: CheckersMove, move2: CheckersMove): boolean {
    return (
      move1.from.row === move2.from.row &&
      move1.from.col === move2.from.col &&
      move1.to.row === move2.to.row &&
      move1.to.col === move2.to.col
    );
  }

  clear(): void {
    this.historyTable.clear();
    this.killerMoves.forEach((killers) => (killers.length = 0));
  }
}

// 全局搜索引擎实例
const transpositionTable = new TranspositionTable();
const searchHeuristics = new SearchHeuristics();

// 64个位置的精确权重表
const POSITION_WEIGHTS = [
  [0, 4, 0, 4, 0, 4, 0, 4],
  [4, 0, 3, 0, 3, 0, 3, 0],
  [0, 3, 0, 2, 0, 2, 0, 4],
  [4, 0, 2, 0, 1, 0, 3, 0],
  [0, 3, 0, 1, 0, 2, 0, 4],
  [4, 0, 2, 0, 2, 0, 3, 0],
  [0, 3, 0, 3, 0, 3, 0, 4],
  [4, 0, 4, 0, 4, 0, 4, 0],
];

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
export const getPieceMoves = (
  board: CheckersBoard,
  position: Position,
  mustCapture?: boolean,
  depth: number = 0
): CheckersMove[] => {
  const piece = board[position.row][position.col];
  if (!piece) return [];

  const moves: CheckersMove[] = [];
  const directions = getMoveDirections(piece);

  for (const dir of directions) {
    let currentRow = position.row + dir.row;
    let currentCol = position.col + dir.col;

    if (!isInBounds(currentRow, currentCol, 8, 8)) continue;

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

      if (isInBounds(jumpRow, jumpCol, 8, 8) && !board[jumpRow][jumpCol]) {
        const move: CheckersMove = {
          from: position,
          to: { row: jumpRow, col: jumpCol },
          captured: [{ row: currentRow, col: currentCol }],
        };

        // 检查是否可以继续跳跃（深度限制防止无限递归）
        if (depth < 10) {
          const tempBoard = makeCheckersMove(board, move);
          const continueMoves = getPieceMoves(tempBoard, { row: jumpRow, col: jumpCol }, true, depth + 1);

          if (continueMoves.length > 0) {
            // 将连续跳跃合并
            for (const continueMove of continueMoves) {
              moves.push({
                from: position,
                to: continueMove.to,
                captured: [...move.captured!, ...(continueMove.captured || [])],
              });
            }
          } else {
            moves.push(move);
          }
        } else {
          moves.push(move);
        }
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
  const newBoard = deepCopyBoard(board);
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

// 专家级搜索引擎
class CheckersSearchEngine {
  private static readonly MAX_DEPTH = 20;
  private static readonly TIME_LIMIT = 2000; // 2秒

  // 主搜索入口
  static search(board: CheckersBoard, player: "red" | "black"): CheckersMove {
    const startTime = Date.now();
    const availableMoves = getCheckersAvailableMoves(board, player);

    if (availableMoves.length === 0) {
      throw new Error("No available moves");
    }

    if (availableMoves.length === 1) {
      return availableMoves[0];
    }

    let bestMove = availableMoves[0];
    let bestScore = -Infinity;

    // 迭代加深搜索
    for (let depth = 1; depth <= this.MAX_DEPTH; depth++) {
      if (Date.now() - startTime > this.TIME_LIMIT) break;

      const result = this.negamaxRoot(board, depth, -Infinity, Infinity, player, startTime, this.TIME_LIMIT);

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = result.move || bestMove;
      }

      // 如果找到必胜，提前返回
      if (bestScore >= 900) break;
    }

    return bestMove;
  }

  // 根节点搜索
  private static negamaxRoot(
    board: CheckersBoard,
    depth: number,
    alpha: number,
    beta: number,
    player: "red" | "black",
    startTime: number,
    timeLimit: number
  ): { score: number; move?: CheckersMove } {
    const moves = getCheckersAvailableMoves(board, player);
    const sortedMoves = this.sortMoves(board, moves, player, 0);

    let maxScore = -Infinity;
    let bestMove: CheckersMove | undefined;

    for (const move of sortedMoves) {
      if (Date.now() - startTime > timeLimit) break;

      const newBoard = makeCheckersMove(board, move);
      const score = -this.negamax(
        newBoard,
        depth - 1,
        -beta,
        -alpha,
        this.getOpponent(player),
        1,
        startTime,
        timeLimit
      );

      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }

      alpha = Math.max(alpha, score);
      if (alpha >= beta) break;
    }

    return { score: maxScore, move: bestMove };
  }

  // Negamax搜索算法 + Alpha-Beta剪枝 + 置换表
  private static negamax(
    board: CheckersBoard,
    depth: number,
    alpha: number,
    beta: number,
    player: "red" | "black",
    ply: number,
    startTime: number,
    timeLimit: number
  ): number {
    if (Date.now() - startTime > timeLimit) return 0;

    const originalAlpha = alpha;

    // 置换表查找
    const ttEntry = transpositionTable.lookup(board, player);
    if (ttEntry && ttEntry.depth >= depth) {
      if (ttEntry.flag === "exact") return ttEntry.score;
      if (ttEntry.flag === "lower") alpha = Math.max(alpha, ttEntry.score);
      if (ttEntry.flag === "upper") beta = Math.min(beta, ttEntry.score);
      if (alpha >= beta) return ttEntry.score;
    }

    // 终端检查
    const winner = checkCheckersWinner(board, player);
    if (winner === player) return 1000 + depth;
    if (winner && winner !== player) return -1000 - depth;

    if (depth <= 0) {
      return this.evaluateBoard(board, player);
    }

    const moves = getCheckersAvailableMoves(board, player);
    if (moves.length === 0) return -1000 - depth;

    // 移动排序
    const sortedMoves = this.sortMoves(board, moves, player, ply, ttEntry?.bestMove);

    let maxScore = -Infinity;
    let bestMove: CheckersMove | undefined;

    for (let i = 0; i < sortedMoves.length; i++) {
      const move = sortedMoves[i];
      const newBoard = makeCheckersMove(board, move);

      let score: number;

      // 主变搜索 (Principal Variation Search)
      if (i === 0) {
        score = -this.negamax(
          newBoard,
          depth - 1,
          -beta,
          -alpha,
          this.getOpponent(player),
          ply + 1,
          startTime,
          timeLimit
        );
      } else {
        // 空窗搜索
        score = -this.negamax(
          newBoard,
          depth - 1,
          -alpha - 1,
          -alpha,
          this.getOpponent(player),
          ply + 1,
          startTime,
          timeLimit
        );
        if (score > alpha && score < beta) {
          // 重新搜索
          score = -this.negamax(
            newBoard,
            depth - 1,
            -beta,
            -alpha,
            this.getOpponent(player),
            ply + 1,
            startTime,
            timeLimit
          );
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }

      alpha = Math.max(alpha, score);
      if (alpha >= beta) {
        // 记录杀手移动和历史得分
        if (!move.captured || move.captured.length === 0) {
          searchHeuristics.recordKiller(move, ply);
          searchHeuristics.recordHistory(move, depth);
        }
        break;
      }
    }

    // 存储到置换表
    let flag: "exact" | "lower" | "upper";
    if (maxScore <= originalAlpha) flag = "upper";
    else if (maxScore >= beta) flag = "lower";
    else flag = "exact";

    transpositionTable.store(board, player, {
      depth,
      score: maxScore,
      flag,
      bestMove,
    });

    return maxScore;
  }

  // 高级移动排序
  private static sortMoves(
    board: CheckersBoard,
    moves: CheckersMove[],
    player: "red" | "black",
    ply: number,
    hashMove?: CheckersMove
  ): CheckersMove[] {
    const scored = moves.map((move) => {
      let score = 0;

      // 置换表最佳移动优先级最高
      if (hashMove && this.movesEqual(move, hashMove)) {
        score += 10000;
      }

      // 吃子移动优先
      if (move.captured && move.captured.length > 0) {
        score += 1000 + move.captured.length * 100;

        // 计算吃子价值
        for (const pos of move.captured) {
          const capturedPiece = board[pos.row][pos.col];
          if (capturedPiece) {
            score += capturedPiece.isKing ? 300 : 100;
          }
        }
      }

      // 升王移动
      if (this.willBecomeKing(board, move, player)) {
        score += 500;
      }

      // 杀手启发
      if (searchHeuristics.isKillerMove(move, ply)) {
        score += 200;
      }

      // 历史启发
      score += searchHeuristics.getHistoryScore(move) / 1000;

      // 位置改进
      const piece = board[move.from.row][move.from.col];
      if (piece) {
        const fromValue = POSITION_WEIGHTS[move.from.row][move.from.col];
        const toValue = POSITION_WEIGHTS[move.to.row][move.to.col];
        score += (toValue - fromValue) * 10;
      }

      return { move, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((item) => item.move);
  }

  // 专家级棋盘评估函数
  private static evaluateBoard(board: CheckersBoard, player: "red" | "black"): number {
    const opponent = this.getOpponent(player);

    let playerScore = 0;
    let opponentScore = 0;
    let playerPieces = 0;
    let opponentPieces = 0;
    let playerKings = 0;
    let opponentKings = 0;

    // 计算基础分数
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (!piece) continue;

        const pieceValue = this.evaluatePiece(board, { row, col }, piece);

        if (piece.player === player) {
          playerScore += pieceValue;
          playerPieces++;
          if (piece.isKing) playerKings++;
        } else {
          opponentScore += pieceValue;
          opponentPieces++;
          if (piece.isKing) opponentKings++;
        }
      }
    }

    let score = playerScore - opponentScore;

    // 棋子数量优势
    score += (playerPieces - opponentPieces) * 100;
    score += (playerKings - opponentKings) * 50;

    // 机动性评估
    const playerMoves = getCheckersAvailableMoves(board, player);
    const opponentMoves = getCheckersAvailableMoves(board, opponent);
    score += (playerMoves.length - opponentMoves.length) * 5;

    // 残局评估
    if (playerPieces + opponentPieces <= 8) {
      score += this.evaluateEndgame(board, player);
    }

    // 开局评估
    if (playerPieces + opponentPieces >= 20) {
      score += this.evaluateOpening(board, player);
    }

    return score;
  }

  // 棋子价值评估
  private static evaluatePiece(board: CheckersBoard, position: Position, piece: CheckersPiece): number {
    if (!piece) return 0;

    let value = 0;
    const { row, col } = position;

    // 基础价值
    value += piece.isKing ? 300 : 100;

    // 位置价值
    value += POSITION_WEIGHTS[row][col] * 5;

    // 升王接近度
    if (!piece.isKing) {
      if (piece.player === "red") {
        value += (7 - row) * 8; // 越接近顶部越有价值
      } else {
        value += row * 8; // 越接近底部越有价值
      }
    }

    // 中心控制（王棋）
    if (piece.isKing) {
      const centerDistance = Math.abs(3.5 - row) + Math.abs(3.5 - col);
      value += Math.max(0, 7 - centerDistance) * 5;
    }

    // 保护价值
    value += this.getProtectionValue(board, position, piece.player) * 15;

    // 威胁价值
    value += this.getThreatValue(board, position, piece.player) * 20;

    // 边缘惩罚
    if (col === 0 || col === 7) {
      value -= piece.isKing ? 5 : 15;
    }

    // 后排安全性（普通棋子）
    if (!piece.isKing) {
      if ((piece.player === "red" && row >= 6) || (piece.player === "black" && row <= 1)) {
        value += 20;
      }
    }

    return value;
  }

  // 开局评估
  private static evaluateOpening(board: CheckersBoard, player: "red" | "black"): number {
    let score = 0;

    // 中心控制
    const centerPositions = [
      { row: 3, col: 2 },
      { row: 3, col: 4 },
      { row: 3, col: 6 },
      { row: 4, col: 1 },
      { row: 4, col: 3 },
      { row: 4, col: 5 },
      { row: 4, col: 7 },
    ];

    for (const pos of centerPositions) {
      const piece = board[pos.row][pos.col];
      if (piece && piece.player === player) {
        score += piece.isKing ? 15 : 10;
      }
    }

    // 开局发展
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.player === player && !piece.isKing) {
          // 鼓励向前发展
          if (player === "red" && row < 5) score += 5;
          if (player === "black" && row > 2) score += 5;
        }
      }
    }

    return score;
  }

  // 残局评估
  private static evaluateEndgame(board: CheckersBoard, player: "red" | "black"): number {
    let score = 0;
    const opponent = this.getOpponent(player);

    // 找到王的位置
    const playerKings: Position[] = [];
    const opponentKings: Position[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.isKing) {
          if (piece.player === player) {
            playerKings.push({ row, col });
          } else {
            opponentKings.push({ row, col });
          }
        }
      }
    }

    // 王的活跃度
    score += playerKings.length * 50 - opponentKings.length * 50;

    // 驱赶对手到边缘
    for (const kingPos of opponentKings) {
      const edgeDistance = Math.min(kingPos.row, 7 - kingPos.row, kingPos.col, 7 - kingPos.col);
      score += (4 - edgeDistance) * 10;
    }

    return score;
  }

  // 保护价值计算
  private static getProtectionValue(board: CheckersBoard, position: Position, player: "red" | "black"): number {
    let protection = 0;
    const directions = [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];

    for (const dir of directions) {
      const protectorRow = position.row + dir.row;
      const protectorCol = position.col + dir.col;

      if (isInBounds(protectorRow, protectorCol, 8, 8)) {
        const protector = board[protectorRow][protectorCol];
        if (protector && protector.player === player) {
          protection += protector.isKing ? 2 : 1;
        }
      }
    }

    return protection;
  }

  // 威胁价值计算
  private static getThreatValue(board: CheckersBoard, position: Position, player: "red" | "black"): number {
    let threats = 0;
    const piece = board[position.row][position.col];
    if (!piece) return 0;

    const directions = getMoveDirections(piece);

    for (const dir of directions) {
      const targetRow = position.row + dir.row;
      const targetCol = position.col + dir.col;

      if (isInBounds(targetRow, targetCol, 8, 8)) {
        const target = board[targetRow][targetCol];
        if (target && target.player !== player) {
          const jumpRow = targetRow + dir.row;
          const jumpCol = targetCol + dir.col;

          if (isInBounds(jumpRow, jumpCol, 8, 8) && !board[jumpRow][jumpCol]) {
            threats += target.isKing ? 5 : 3;
          }
        }
      }
    }

    return threats;
  }

  private static willBecomeKing(board: CheckersBoard, move: CheckersMove, player: "red" | "black"): boolean {
    const piece = board[move.from.row][move.from.col];
    if (!piece || piece.isKing) return false;
    return (player === "red" && move.to.row === 0) || (player === "black" && move.to.row === 7);
  }

  private static getOpponent(player: "red" | "black"): "red" | "black" {
    return player === "red" ? "black" : "red";
  }

  private static movesEqual(move1: CheckersMove, move2: CheckersMove): boolean {
    return (
      move1.from.row === move2.from.row &&
      move1.from.col === move2.from.col &&
      move1.to.row === move2.to.row &&
      move1.to.col === move2.to.col
    );
  }
}

// 跳棋AI
export const getCheckersAIMove = (
  board: CheckersBoard,
  player: "red" | "black",
  difficulty: AIDifficulty = AIDifficulty.MEDIUM
): CheckersMove | null => {
  const availableMoves = getCheckersAvailableMoves(board, player);
  if (availableMoves.length === 0) return null;

  switch (difficulty) {
    case AIDifficulty.EASY:
      return getEasyAIMove(board, availableMoves, player);
    case AIDifficulty.MEDIUM:
      return getMediumAIMove(board, availableMoves, player);
    case AIDifficulty.HARD:
      return getHardAIMove(board, player);
    default:
      return getMediumAIMove(board, availableMoves, player);
  }
};

// 简单AI：随机为主，基础策略
const getEasyAIMove = (board: CheckersBoard, availableMoves: CheckersMove[], player: "red" | "black"): CheckersMove => {
  const captureMoves = availableMoves.filter((move) => move.captured && move.captured.length > 0);

  // 50%概率选择吃子移动（如果有的话）
  if (captureMoves.length > 0 && Math.random() < 0.5) {
    return getRandomChoice(captureMoves);
  }

  // 30%概率选择最佳位置
  if (Math.random() < 0.3) {
    const scoredMoves = availableMoves.map((move) => ({
      move,
      score: CheckersSearchEngine["evaluatePiece"](board, move.to, board[move.from.row][move.from.col]),
    }));
    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0].move;
  }

  // 否则随机选择
  return getRandomChoice(availableMoves);
};

// 中等AI：策略导向，3层搜索
const getMediumAIMove = (
  board: CheckersBoard,
  availableMoves: CheckersMove[],
  player: "red" | "black"
): CheckersMove => {
  // 优先选择多个吃子的移动
  const captureMoves = availableMoves.filter((move) => move.captured && move.captured.length > 0);

  if (captureMoves.length > 0) {
    captureMoves.sort((a, b) => (b.captured?.length || 0) - (a.captured?.length || 0));

    // 如果有明显最佳吃子，直接选择
    if (captureMoves[0].captured!.length > 1) {
      return captureMoves[0];
    }
  }

  // 使用简化搜索
  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    const newBoard = makeCheckersMove(board, move);
    const score = minimax(newBoard, 3, false, player === "red" ? "black" : "red", player);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

// 专家级AI：使用完整搜索引擎
const getHardAIMove = (board: CheckersBoard, player: "red" | "black"): CheckersMove => {
  return CheckersSearchEngine.search(board, player);
};

// 简化的minimax算法（中等难度用）
const minimax = (
  board: CheckersBoard,
  depth: number,
  isMaximizing: boolean,
  currentPlayer: "red" | "black",
  originalPlayer: "red" | "black"
): number => {
  const winner = checkCheckersWinner(board, currentPlayer);
  if (winner === originalPlayer) return 1000;
  if (winner && winner !== originalPlayer) return -1000;

  if (depth === 0) {
    return evaluateBasic(board, originalPlayer);
  }

  const moves = getCheckersAvailableMoves(board, currentPlayer);
  if (moves.length === 0) return isMaximizing ? -1000 : 1000;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = makeCheckersMove(board, move);
      const eval1 = minimax(newBoard, depth - 1, false, currentPlayer === "red" ? "black" : "red", originalPlayer);
      maxEval = Math.max(maxEval, eval1);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = makeCheckersMove(board, move);
      const eval1 = minimax(newBoard, depth - 1, true, currentPlayer === "red" ? "black" : "red", originalPlayer);
      minEval = Math.min(minEval, eval1);
    }
    return minEval;
  }
};

// 基础评估函数（中等难度用）
const evaluateBasic = (board: CheckersBoard, player: "red" | "black"): number => {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      let pieceValue = piece.isKing ? 50 : 25;
      pieceValue += POSITION_WEIGHTS[row][col] * 2;

      if (piece.player === player) {
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
