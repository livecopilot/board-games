// 五子棋游戏逻辑 - 专家级AI实现
import { GomokuBoard, GomokuPiece, GomokuMove, Position, AIDifficulty } from "../types";
import { getRandomChoice, isInBounds, AI_SEARCH_DEPTHS, deepCopyBoard } from "./common";

// 棋型模式定义
enum PatternType {
  FIVE = "FIVE", // 连五
  LIVE_FOUR = "LIVE_FOUR", // 活四
  RUSH_FOUR = "RUSH_FOUR", // 冲四
  LIVE_THREE = "LIVE_THREE", // 活三
  SLEEP_THREE = "SLEEP_THREE", // 眠三
  LIVE_TWO = "LIVE_TWO", // 活二
  SLEEP_TWO = "SLEEP_TWO", // 眠二
}

// 威胁等级
const PATTERN_SCORES = {
  [PatternType.FIVE]: 100000,
  [PatternType.LIVE_FOUR]: 10000,
  [PatternType.RUSH_FOUR]: 1000,
  [PatternType.LIVE_THREE]: 1000,
  [PatternType.SLEEP_THREE]: 100,
  [PatternType.LIVE_TWO]: 100,
  [PatternType.SLEEP_TWO]: 10,
};

// 置换表，用于缓存搜索结果
interface TranspositionEntry {
  depth: number;
  score: number;
  flag: "exact" | "lower" | "upper";
  bestMove?: Position;
}

const transpositionTable = new Map<string, TranspositionEntry>();

const getBoardKey = (board: GomokuBoard, player: "black" | "white"): string => {
  return player + board.map((row) => row.map((p) => (p ? p[0] : "-")).join("")).join("");
};

// 方向定义
const DIRECTIONS = [
  [0, 1], // 水平
  [1, 0], // 垂直
  [1, 1], // 主对角线
  [1, -1], // 副对角线
];

// 创建五子棋空棋盘 (15x15)
export const createGomokuBoard = (): GomokuBoard => {
  return Array(15)
    .fill(null)
    .map(() => Array(15).fill(null));
};

// 检查指定位置是否可以下棋
export const isValidGomokuMove = (board: GomokuBoard, position: Position): boolean => {
  const { row, col } = position;
  return isInBounds(row, col, 15, 15) && board[row][col] === null;
};

// 执行五子棋移动
export const makeGomokuMove = (board: GomokuBoard, move: GomokuMove): GomokuBoard => {
  if (!isValidGomokuMove(board, move.position)) {
    return board;
  }

  const newBoard = deepCopyBoard(board);
  newBoard[move.position.row][move.position.col] = move.player;
  return newBoard;
};

// 检查从指定位置开始的方向是否有五子连珠
const checkDirection = (
  board: GomokuBoard,
  row: number,
  col: number,
  deltaRow: number,
  deltaCol: number,
  player: GomokuPiece
): boolean => {
  let count = 1; // 包含当前位置

  // 向一个方向检查
  let r = row + deltaRow;
  let c = col + deltaCol;
  while (isInBounds(r, c, 15, 15) && board[r][c] === player) {
    count++;
    r += deltaRow;
    c += deltaCol;
  }

  // 向相反方向检查
  r = row - deltaRow;
  c = col - deltaCol;
  while (isInBounds(r, c, 15, 15) && board[r][c] === player) {
    count++;
    r -= deltaRow;
    c -= deltaCol;
  }

  return count >= 5;
};

// 检查五子棋胜利条件
export const checkGomokuWinner = (board: GomokuBoard): "black" | "white" | "draw" | null => {
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      const piece = board[row][col];
      if (piece) {
        for (const [deltaRow, deltaCol] of DIRECTIONS) {
          if (checkDirection(board, row, col, deltaRow, deltaCol, piece)) {
            return piece;
          }
        }
      }
    }
  }

  // 检查是否平局（棋盘已满）
  let isFull = true;
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      if (board[row][col] === null) {
        isFull = false;
        break;
      }
    }
    if (!isFull) break;
  }

  return isFull ? "draw" : null;
};

// 获取所有可用的五子棋移动位置
export const getGomokuAvailableMoves = (board: GomokuBoard): Position[] => {
  const moves: Position[] = [];
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      if (board[row][col] === null) {
        moves.push({ row, col });
      }
    }
  }
  return moves;
};

// 精确的棋型识别系统
class PatternMatcher {
  // 检测指定方向的棋型 - 简化版本，更准确
  static analyzeDirection(
    board: GomokuBoard,
    row: number,
    col: number,
    dr: number,
    dc: number,
    player: "black" | "white"
  ): PatternType[] {
    const patterns: PatternType[] = [];

    // 检查当前位置放置棋子后的各种模式
    const tempBoard = makeGomokuMove(board, { position: { row, col }, player });

    // 检查4个方向的连续情况
    const directions = [
      [1, 0], // 垂直
      [0, 1], // 水平
      [1, 1], // 对角线
      [1, -1], // 反对角线
    ];

    for (const [deltaR, deltaC] of directions) {
      if (deltaR === dr && deltaC === dc) {
        const pattern = this.checkLinePattern(tempBoard, row, col, deltaR, deltaC, player);
        if (pattern) {
          patterns.push(pattern);
        }
      }
    }

    return patterns;
  }

  // 检查一条线上的模式
  static checkLinePattern(
    board: GomokuBoard,
    row: number,
    col: number,
    dr: number,
    dc: number,
    player: "black" | "white"
  ): PatternType | null {
    const opponent = player === "black" ? "white" : "black";

    // 向两个方向扫描，统计连续棋子
    let count = 1; // 包含当前位置
    let leftBlocked = false;
    let rightBlocked = false;
    let leftEmpty = 0;
    let rightEmpty = 0;

    // 向前扫描
    let steps = 1;
    while (steps <= 4) {
      const r = row + dr * steps;
      const c = col + dc * steps;

      if (!isInBounds(r, c, 15, 15)) {
        rightBlocked = true;
        break;
      }

      const piece = board[r][c];
      if (piece === player) {
        count++;
      } else if (piece === opponent) {
        rightBlocked = true;
        break;
      } else {
        rightEmpty++;
        if (rightEmpty === 1) {
          // 检查空位后是否还有己方棋子
          const nextR = r + dr;
          const nextC = c + dc;
          if (isInBounds(nextR, nextC, 15, 15) && board[nextR][nextC] === player) {
            count++; // 跳跃模式
          } else {
            break;
          }
        } else {
          break;
        }
      }
      steps++;
    }

    // 向后扫描
    steps = 1;
    while (steps <= 4) {
      const r = row - dr * steps;
      const c = col - dc * steps;

      if (!isInBounds(r, c, 15, 15)) {
        leftBlocked = true;
        break;
      }

      const piece = board[r][c];
      if (piece === player) {
        count++;
      } else if (piece === opponent) {
        leftBlocked = true;
        break;
      } else {
        leftEmpty++;
        if (leftEmpty === 1) {
          // 检查空位后是否还有己方棋子
          const nextR = r - dr;
          const nextC = c - dc;
          if (isInBounds(nextR, nextC, 15, 15) && board[nextR][nextC] === player) {
            count++; // 跳跃模式
          } else {
            break;
          }
        } else {
          break;
        }
      }
      steps++;
    }

    // 根据连子数和阻挡情况判断棋型
    const openEnds = (!leftBlocked ? 1 : 0) + (!rightBlocked ? 1 : 0);

    if (count >= 5) {
      return PatternType.FIVE;
    } else if (count === 4) {
      if (openEnds === 2) return PatternType.LIVE_FOUR;
      if (openEnds === 1) return PatternType.RUSH_FOUR;
    } else if (count === 3) {
      if (openEnds === 2) return PatternType.LIVE_THREE;
      if (openEnds === 1) return PatternType.SLEEP_THREE;
    } else if (count === 2) {
      if (openEnds === 2) return PatternType.LIVE_TWO;
      if (openEnds === 1) return PatternType.SLEEP_TWO;
    }

    return null;
  }

  // 获取指定方向的棋子序列
  static getLine(
    board: GomokuBoard,
    row: number,
    col: number,
    dr: number,
    dc: number,
    length: number
  ): (GomokuPiece | "boundary")[] {
    const line: (GomokuPiece | "boundary")[] = [];
    const halfLen = Math.floor(length / 2);

    for (let i = -halfLen; i <= halfLen; i++) {
      const r = row + i * dr;
      const c = col + i * dc;

      if (isInBounds(r, c, 15, 15)) {
        line.push(board[r][c]);
      } else {
        line.push("boundary");
      }
    }

    return line;
  }

  // 保留原有的模式匹配算法作为备用
  static matchPattern(line: (GomokuPiece | "boundary")[], player: "black" | "white"): PatternType | null {
    const len = line.length;
    const opponent = player === "black" ? "white" : "black";

    // 计算连续棋子和空位
    let consecutive = 0;
    let leftOpen = false;
    let rightOpen = false;
    let leftBlock = false;
    let rightBlock = false;

    // 找到第一个和最后一个己方棋子的位置
    let firstPlayer = -1;
    let lastPlayer = -1;

    for (let i = 0; i < len; i++) {
      if (line[i] === player) {
        if (firstPlayer === -1) firstPlayer = i;
        lastPlayer = i;
        consecutive++;
      }
    }

    if (consecutive === 0) return null;

    // 检查两端的情况
    if (firstPlayer > 0) {
      if (line[firstPlayer - 1] === null) leftOpen = true;
      else if (line[firstPlayer - 1] === opponent || line[firstPlayer - 1] === "boundary") leftBlock = true;
    }

    if (lastPlayer < len - 1) {
      if (line[lastPlayer + 1] === null) rightOpen = true;
      else if (line[lastPlayer + 1] === opponent || line[lastPlayer + 1] === "boundary") rightBlock = true;
    }

    // 检查中间是否有空隙
    let hasGap = false;
    for (let i = firstPlayer + 1; i < lastPlayer; i++) {
      if (line[i] !== player) {
        hasGap = true;
        break;
      }
    }

    // 如果有空隙，需要特殊处理
    if (hasGap) {
      return this.analyzeGappedPattern(line, player, firstPlayer, lastPlayer);
    }

    // 根据连子数和开放情况判断棋型
    const openEnds = (leftOpen ? 1 : 0) + (rightOpen ? 1 : 0);

    if (consecutive >= 5) {
      return PatternType.FIVE;
    } else if (consecutive === 4) {
      if (openEnds === 2) return PatternType.LIVE_FOUR;
      if (openEnds === 1) return PatternType.RUSH_FOUR;
    } else if (consecutive === 3) {
      if (openEnds === 2) return PatternType.LIVE_THREE;
      if (openEnds === 1) return PatternType.SLEEP_THREE;
    } else if (consecutive === 2) {
      if (openEnds === 2) return PatternType.LIVE_TWO;
      if (openEnds === 1) return PatternType.SLEEP_TWO;
    }

    return null;
  }

  // 分析有空隙的模式（如.XX.X.）
  static analyzeGappedPattern(
    line: (GomokuPiece | "boundary")[],
    player: "black" | "white",
    firstPlayer: number,
    lastPlayer: number
  ): PatternType | null {
    const span = lastPlayer - firstPlayer + 1;
    const gapCount = span - this.countPlayer(line, player, firstPlayer, lastPlayer);

    if (span <= 5 && gapCount === 1) {
      // 活三或眠三变形
      const leftOpen = firstPlayer > 0 && line[firstPlayer - 1] === null;
      const rightOpen = lastPlayer < line.length - 1 && line[lastPlayer + 1] === null;
      const openEnds = (leftOpen ? 1 : 0) + (rightOpen ? 1 : 0);

      if (openEnds === 2) return PatternType.LIVE_THREE;
      if (openEnds === 1) return PatternType.SLEEP_THREE;
    }

    return null;
  }

  // 计算指定范围内玩家棋子数量
  static countPlayer(
    line: (GomokuPiece | "boundary")[],
    player: "black" | "white",
    start: number,
    end: number
  ): number {
    let count = 0;
    for (let i = start; i <= end; i++) {
      if (line[i] === player) count++;
    }
    return count;
  }
}

// 威胁分析器 - 重写版本，更准确的威胁识别
class ThreatAnalyzer {
  // 分析位置的威胁等级 - 简化版本
  static analyzeThreat(board: GomokuBoard, position: Position, player: "black" | "white"): number {
    let totalScore = 0;
    const { row, col } = position;

    // 检查4个方向
    const directions = [
      [1, 0], // 垂直
      [0, 1], // 水平
      [1, 1], // 对角线
      [1, -1], // 反对角线
    ];

    for (const [dr, dc] of directions) {
      const score = this.analyzeDirectionThreat(board, row, col, dr, dc, player);
      totalScore += score;
    }

    // 位置价值加成
    totalScore += this.getPositionValue(position);

    return totalScore;
  }

  // 分析单个方向的威胁
  static analyzeDirectionThreat(
    board: GomokuBoard,
    row: number,
    col: number,
    dr: number,
    dc: number,
    player: "black" | "white"
  ): number {
    const opponent = player === "black" ? "white" : "black";

    // 模拟在该位置放置棋子
    const tempBoard = [...board.map((row) => [...row])];
    tempBoard[row][col] = player;

    // 统计连续棋子数
    let count = 1; // 包含当前位置
    let leftOpen = true;
    let rightOpen = true;

    // 向前扫描
    for (let i = 1; i <= 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;

      if (!isInBounds(r, c, 15, 15)) {
        rightOpen = false;
        break;
      }

      const piece = tempBoard[r][c];
      if (piece === player) {
        count++;
      } else if (piece === opponent) {
        rightOpen = false;
        break;
      } else {
        break; // 空位，停止计数
      }
    }

    // 向后扫描
    for (let i = 1; i <= 4; i++) {
      const r = row - dr * i;
      const c = col - dc * i;

      if (!isInBounds(r, c, 15, 15)) {
        leftOpen = false;
        break;
      }

      const piece = tempBoard[r][c];
      if (piece === player) {
        count++;
      } else if (piece === opponent) {
        leftOpen = false;
        break;
      } else {
        break; // 空位，停止计数
      }
    }

    // 根据连子数和开放状态计算分数
    const openEnds = (leftOpen ? 1 : 0) + (rightOpen ? 1 : 0);

    if (count >= 5) {
      return 100000; // 连五
    } else if (count === 4) {
      if (openEnds === 2) return 10000; // 活四
      if (openEnds === 1) return 1000; // 冲四
    } else if (count === 3) {
      if (openEnds === 2) return 1000; // 活三
      if (openEnds === 1) return 100; // 眠三
    } else if (count === 2) {
      if (openEnds === 2) return 100; // 活二
      if (openEnds === 1) return 10; // 眠二
    }

    return 0;
  }

  // 检测必胜威胁（活四、双三等）
  static checkVCFThreat(board: GomokuBoard, position: Position, player: "black" | "white"): boolean {
    const { row, col } = position;
    let liveFourCount = 0;
    let liveThreeCount = 0;

    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1],
    ];

    for (const [dr, dc] of directions) {
      const score = this.analyzeDirectionThreat(board, row, col, dr, dc, player);

      if (score >= 10000) liveFourCount++; // 活四
      if (score >= 1000 && score < 10000) liveThreeCount++; // 活三
    }

    return liveFourCount > 0 || liveThreeCount >= 2;
  }

  // 获取位置价值（中心更有价值）
  static getPositionValue(position: Position): number {
    const { row, col } = position;
    const center = 7;
    const distance = Math.max(Math.abs(row - center), Math.abs(col - center));
    return Math.max(0, 8 - distance);
  }

  // 检测防守紧急程度 - 简化版本
  static getDefensePriority(board: GomokuBoard, position: Position, opponent: "black" | "white"): number {
    // 检查对手在该位置是否能直接获胜
    const testBoard = makeGomokuMove(board, { position, player: opponent });
    if (checkGomokuWinner(testBoard) === opponent) {
      return 1000000; // 最高防守优先级
    }

    // 检查对手威胁
    const threatScore = this.analyzeThreat(board, position, opponent);

    // 特别关注活四和活三的威胁
    if (threatScore >= 10000) {
      return 500000; // 对手活四，必须防守
    } else if (threatScore >= 1000) {
      return 100000; // 对手活三，高优先级防守
    }

    return threatScore;
  }
}

// 高级搜索算法
class GomokuSearchEngine {
  private static readonly MAX_DEPTH = 10;
  private static readonly TIME_LIMIT = 3000; // 3秒

  // 主搜索入口
  static search(board: GomokuBoard, player: "black" | "white"): Position {
    const startTime = Date.now();
    const availableMoves = this.getCandidateMoves(board);

    if (availableMoves.length === 0) {
      return { row: 7, col: 7 }; // 中心位置
    }

    // 立即获胜检查
    for (const position of availableMoves) {
      const testBoard = makeGomokuMove(board, { position, player });
      if (checkGomokuWinner(testBoard) === player) {
        return position;
      }
    }

    // 防守检查 - 阻止对手获胜
    const opponent = player === "black" ? "white" : "black";
    for (const position of availableMoves) {
      const priority = ThreatAnalyzer.getDefensePriority(board, position, opponent);
      if (priority >= 1000000) {
        return position;
      }
    }

    // VCF检查 - 寻找必胜威胁
    for (const position of availableMoves) {
      if (ThreatAnalyzer.checkVCFThreat(board, position, player)) {
        return position;
      }
    }

    // 迭代加深搜索
    let bestMove = availableMoves[0];
    let bestScore = -Infinity;

    for (let depth = 2; depth <= this.MAX_DEPTH; depth += 2) {
      if (Date.now() - startTime > this.TIME_LIMIT) break;

      const result = this.negamaxSearch(board, depth, -Infinity, Infinity, player, startTime, this.TIME_LIMIT);

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = result.move || bestMove;
      }

      // 如果找到必胜着法，提前返回
      if (bestScore >= 50000) break;
    }

    return bestMove;
  }

  // Negamax搜索算法
  static negamaxSearch(
    board: GomokuBoard,
    depth: number,
    alpha: number,
    beta: number,
    player: "black" | "white",
    startTime: number,
    timeLimit: number
  ): { score: number; move?: Position } {
    if (Date.now() - startTime > timeLimit) {
      return { score: 0 };
    }

    const originalAlpha = alpha;
    const boardKey = getBoardKey(board, player);
    const cachedEntry = transpositionTable.get(boardKey);

    if (cachedEntry && cachedEntry.depth >= depth) {
      if (cachedEntry.flag === "exact") {
        return { score: cachedEntry.score, move: cachedEntry.bestMove };
      } else if (cachedEntry.flag === "lower") {
        alpha = Math.max(alpha, cachedEntry.score);
      } else if (cachedEntry.flag === "upper") {
        beta = Math.min(beta, cachedEntry.score);
      }
      if (alpha >= beta) {
        return { score: cachedEntry.score, move: cachedEntry.bestMove };
      }
    }

    const winner = checkGomokuWinner(board);
    if (winner) {
      if (winner === player) return { score: 100000 + depth };
      if (winner === "draw") return { score: 0 };
      return { score: -100000 - depth };
    }

    if (depth <= 0) {
      return { score: this.evaluateBoard(board, player) };
    }

    const candidates = this.getCandidateMoves(board);
    if (candidates.length === 0) return { score: 0 };

    // 移动排序
    const sortedMoves = this.sortMoves(board, candidates, player);

    let maxScore = -Infinity;
    let bestMove: Position | undefined;

    for (const position of sortedMoves) {
      if (Date.now() - startTime > timeLimit) break;

      const newBoard = makeGomokuMove(board, { position, player });
      const result = this.negamaxSearch(
        newBoard,
        depth - 1,
        -beta,
        -alpha,
        player === "black" ? "white" : "black",
        startTime,
        timeLimit
      );

      const score = -result.score;

      if (score > maxScore) {
        maxScore = score;
        bestMove = position;
      }

      alpha = Math.max(alpha, score);
      if (alpha >= beta) break; // Alpha-Beta剪枝
    }

    let flag: "exact" | "lower" | "upper" = "upper";
    if (maxScore > originalAlpha) {
      flag = "exact";
    }
    if (maxScore >= beta) {
      flag = "lower";
    }

    transpositionTable.set(boardKey, {
      depth,
      score: maxScore,
      flag,
      bestMove,
    });

    return { score: maxScore, move: bestMove };
  }

  // 智能候选位置生成
  static getCandidateMoves(board: GomokuBoard): Position[] {
    const allMoves = getGomokuAvailableMoves(board);

    // 如果是开局，返回中心位置
    if (allMoves.length === 225) {
      return [{ row: 7, col: 7 }];
    }

    // 过滤出有价值的候选位置
    const candidates: Position[] = [];
    const searchRadius = 2;

    for (const move of allMoves) {
      let hasNearbyPiece = false;

      outerLoop: for (let dr = -searchRadius; dr <= searchRadius; dr++) {
        for (let dc = -searchRadius; dc <= searchRadius; dc++) {
          const r = move.row + dr;
          const c = move.col + dc;

          if (isInBounds(r, c, 15, 15) && board[r][c] !== null) {
            hasNearbyPiece = true;
            break outerLoop;
          }
        }
      }

      if (hasNearbyPiece) {
        candidates.push(move);
      }
    }

    // 如果候选位置太多，只保留最有价值的前20个
    if (candidates.length > 20) {
      const scored = candidates.map((pos) => ({
        position: pos,
        score: ThreatAnalyzer.analyzeThreat(board, pos, "black") + ThreatAnalyzer.analyzeThreat(board, pos, "white"),
      }));

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, 20).map((item) => item.position);
    }

    return candidates.length > 0 ? candidates : allMoves.slice(0, 20);
  }

  // 移动排序优化
  static sortMoves(board: GomokuBoard, moves: Position[], player: "black" | "white"): Position[] {
    const opponent = player === "black" ? "white" : "black";

    const scoredMoves = moves.map((position) => {
      let score = 0;

      // 攻击价值
      score += ThreatAnalyzer.analyzeThreat(board, position, player);

      // 防守价值
      score += ThreatAnalyzer.getDefensePriority(board, position, opponent) * 0.9;

      // VCF威胁加分
      if (ThreatAnalyzer.checkVCFThreat(board, position, player)) {
        score += 50000;
      }

      return { position, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves.map((item) => item.position);
  }

  // 棋盘评估函数
  static evaluateBoard(board: GomokuBoard, player: "black" | "white"): number {
    let score = 0;
    const opponent = player === "black" ? "white" : "black";

    // 评估所有空位的价值
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        if (board[row][col] === null) {
          const playerScore = ThreatAnalyzer.analyzeThreat(board, { row, col }, player);
          const opponentScore = ThreatAnalyzer.analyzeThreat(board, { row, col }, opponent);

          score += playerScore - opponentScore * 0.9;
        }
      }
    }

    return score;
  }
}

// 五子棋AI移动
export const getGomokuAIMove = (
  board: GomokuBoard,
  player: "black" | "white",
  difficulty: AIDifficulty = AIDifficulty.MEDIUM
): GomokuMove | null => {
  const availableMoves = getGomokuAvailableMoves(board);
  if (availableMoves.length === 0) return null;

  switch (difficulty) {
    case AIDifficulty.EASY:
      return getGomokuEasyAI(board, availableMoves, player);
    case AIDifficulty.MEDIUM:
      return getGomokuMediumAI(board, availableMoves, player);
    case AIDifficulty.HARD:
      return getGomokuHardAI(board, player);
    default:
      return getGomokuMediumAI(board, availableMoves, player);
  }
};

// 简单AI：随机移动，优先中心和攻防基础位置
const getGomokuEasyAI = (board: GomokuBoard, availableMoves: Position[], player: "black" | "white"): GomokuMove => {
  // 如果是第一步，下在中心
  if (availableMoves.length === 225) {
    return { position: { row: 7, col: 7 }, player };
  }

  const opponent = player === "black" ? "white" : "black";

  // 立即获胜检查
  for (const position of availableMoves) {
    const testBoard = makeGomokuMove(board, { position, player });
    if (checkGomokuWinner(testBoard) === player) {
      return { position, player };
    }
  }

  // 防守检查 - 阻止对手获胜
  for (const position of availableMoves) {
    const testBoard = makeGomokuMove(board, { position, player: opponent });
    if (checkGomokuWinner(testBoard) === opponent) {
      return { position, player };
    }
  }

  // 30%概率选择最佳位置，70%随机
  if (Math.random() < 0.3) {
    let bestMove = availableMoves[0];
    let bestScore = -Infinity;

    for (const position of availableMoves.slice(0, Math.min(10, availableMoves.length))) {
      // 只考虑前10个位置
      const attackScore = ThreatAnalyzer.analyzeThreat(board, position, player);
      const defenseScore = ThreatAnalyzer.getDefensePriority(board, position, opponent);
      const score = attackScore + defenseScore * 0.5;

      if (score > bestScore) {
        bestScore = score;
        bestMove = position;
      }
    }

    return { position: bestMove, player };
  }

  // 随机选择附近位置
  const nearbyMoves = GomokuSearchEngine.getCandidateMoves(board);
  const randomPosition = getRandomChoice(nearbyMoves.length > 0 ? nearbyMoves : availableMoves);
  return { position: randomPosition, player };
};

// 中等AI：基于威胁分析的策略 - 增强版本
const getGomokuMediumAI = (board: GomokuBoard, availableMoves: Position[], player: "black" | "white"): GomokuMove => {
  const opponent = player === "black" ? "white" : "black";

  // 第一步下中心
  if (availableMoves.length === 225) {
    return { position: { row: 7, col: 7 }, player };
  }

  // 立即获胜检查
  for (const position of availableMoves) {
    const testBoard = makeGomokuMove(board, { position, player });
    if (checkGomokuWinner(testBoard) === player) {
      return { position, player };
    }
  }

  // 防守检查 - 阻止对手获胜
  for (const position of availableMoves) {
    const testBoard = makeGomokuMove(board, { position, player: opponent });
    if (checkGomokuWinner(testBoard) === opponent) {
      return { position, player };
    }
  }

  // 防守活四威胁
  for (const position of availableMoves) {
    const opponentThreat = ThreatAnalyzer.getDefensePriority(board, position, opponent);
    if (opponentThreat >= 500000) {
      // 对手活四
      return { position, player };
    }
  }

  // 创造自己的活四
  for (const position of availableMoves) {
    const myThreat = ThreatAnalyzer.analyzeThreat(board, position, player);
    if (myThreat >= 10000) {
      // 我方活四
      return { position, player };
    }
  }

  // 防守活三威胁
  let bestDefenseMove: Position | null = null;
  let highestDefensePriority = 0;

  for (const position of availableMoves) {
    const opponentThreat = ThreatAnalyzer.getDefensePriority(board, position, opponent);
    if (opponentThreat >= 100000 && opponentThreat > highestDefensePriority) {
      highestDefensePriority = opponentThreat;
      bestDefenseMove = position;
    }
  }

  if (bestDefenseMove) {
    return { position: bestDefenseMove, player };
  }

  // 威胁分析 - 寻找最佳攻击位置
  const candidates = GomokuSearchEngine.getCandidateMoves(board);
  let bestMove = candidates[0] || availableMoves[0];
  let bestScore = -Infinity;

  for (const position of candidates) {
    let score = 0;

    // 攻击价值
    const attackScore = ThreatAnalyzer.analyzeThreat(board, position, player);
    score += attackScore;

    // 防守价值
    const defenseScore = ThreatAnalyzer.getDefensePriority(board, position, opponent);
    score += defenseScore * 0.8;

    // VCF威胁检查（双三、活四等）
    if (ThreatAnalyzer.checkVCFThreat(board, position, player)) {
      score += 10000;
    }

    // 位置价值（中心控制）
    score += ThreatAnalyzer.getPositionValue(position) * 2;

    // 连接性评估 - 优先选择与已有棋子相邻的位置
    let connectionBonus = 0;
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dr, dc] of directions) {
      const r = position.row + dr;
      const c = position.col + dc;
      if (isInBounds(r, c, 15, 15) && board[r][c] === player) {
        connectionBonus += 20;
      }
    }
    score += connectionBonus;

    if (score > bestScore) {
      bestScore = score;
      bestMove = position;
    }
  }

  return { position: bestMove, player };
};

// 专家级AI：使用完整的搜索引擎
const getGomokuHardAI = (board: GomokuBoard, player: "black" | "white"): GomokuMove => {
  const position = GomokuSearchEngine.search(board, player);
  return { position, player };
};
