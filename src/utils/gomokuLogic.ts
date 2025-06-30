// 五子棋游戏逻辑
import { GomokuBoard, GomokuPiece, GomokuMove, Position, AIDifficulty } from "../types";
import { getRandomChoice, isInBounds, AI_SEARCH_DEPTHS, deepCopyBoard } from "./common";

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
  // 四个方向：水平、垂直、左斜、右斜
  const directions = [
    [0, 1], // 水平
    [1, 0], // 垂直
    [1, 1], // 左斜
    [1, -1], // 右斜
  ];

  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      const piece = board[row][col];
      if (piece) {
        for (const [deltaRow, deltaCol] of directions) {
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
      return getGomokuEasyAI(availableMoves, player);
    case AIDifficulty.MEDIUM:
      return getGomokuMediumAI(board, availableMoves, player);
    case AIDifficulty.HARD:
      return getGomokuHardAI(board, availableMoves, player);
    default:
      return getGomokuMediumAI(board, availableMoves, player);
  }
};

// 简单AI：随机移动，稍微偏向中心
const getGomokuEasyAI = (availableMoves: Position[], player: "black" | "white"): GomokuMove => {
  // 如果是第一步，下在中心附近
  if (availableMoves.length === 225) {
    const center = 7;
    const nearCenter = [
      { row: center, col: center },
      { row: center - 1, col: center },
      { row: center + 1, col: center },
      { row: center, col: center - 1 },
      { row: center, col: center + 1 },
    ];
    const randomCenter = getRandomChoice(nearCenter);
    return { position: randomCenter, player };
  }

  // 否则随机选择
  const randomPosition = getRandomChoice(availableMoves);
  return { position: randomPosition, player };
};

// 中等AI：基于位置评估
const getGomokuMediumAI = (board: GomokuBoard, availableMoves: Position[], player: "black" | "white"): GomokuMove => {
  // 先检查能否立即获胜
  for (const position of availableMoves) {
    const testBoard = makeGomokuMove(board, { position, player });
    if (checkGomokuWinner(testBoard) === player) {
      return { position, player };
    }
  }

  // 检查是否需要阻止对手获胜
  const opponent = player === "black" ? "white" : "black";
  for (const position of availableMoves) {
    const testBoard = makeGomokuMove(board, { position, player: opponent });
    if (checkGomokuWinner(testBoard) === opponent) {
      return { position, player };
    }
  }

  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  for (const position of availableMoves) {
    const score = evaluateGomokuPosition(board, position, player);
    if (score > bestScore) {
      bestScore = score;
      bestMove = position;
    }
  }

  return { position: bestMove, player };
};

// 专家级AI：高级算法实现
const getGomokuHardAI = (board: GomokuBoard, availableMoves: Position[], player: "black" | "white"): GomokuMove => {
  const startTime = Date.now();
  const timeLimit = 3000; // 3秒时间限制

  // 先检查能否立即获胜
  for (const position of availableMoves) {
    const testBoard = makeGomokuMove(board, { position, player });
    if (checkGomokuWinner(testBoard) === player) {
      return { position, player };
    }
  }

  // 检查是否需要阻止对手获胜
  const opponent = player === "black" ? "white" : "black";
  for (const position of availableMoves) {
    const testBoard = makeGomokuMove(board, { position, player: opponent });
    if (checkGomokuWinner(testBoard) === opponent) {
      return { position, player };
    }
  }

  // 使用迭代加深搜索
  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  // 限制搜索范围以提高性能
  const candidatePositions = filterNearbyPositions(board, availableMoves);

  for (let depth = 1; depth <= 6; depth++) {
    if (Date.now() - startTime > timeLimit) break;

    let currentBestMove = bestMove;
    let currentBestScore = -Infinity;

    // 移动排序
    const sortedMoves = sortGomokuMoves(board, candidatePositions, player, bestMove);

    for (const position of sortedMoves) {
      if (Date.now() - startTime > timeLimit) break;

      const testBoard = makeGomokuMove(board, { position, player });
      const score = gomokuNegamax(testBoard, depth - 1, -Infinity, Infinity, opponent, startTime, timeLimit);

      if (score > currentBestScore) {
        currentBestScore = score;
        currentBestMove = position;
      }
    }

    if (Date.now() - startTime <= timeLimit) {
      bestMove = currentBestMove;
      bestScore = currentBestScore;
    }
  }

  return { position: bestMove, player };
};

// 五子棋Negamax算法
const gomokuNegamax = (
  board: GomokuBoard,
  depth: number,
  alpha: number,
  beta: number,
  player: "black" | "white",
  startTime: number,
  timeLimit: number
): number => {
  if (Date.now() - startTime > timeLimit) return 0;

  const winner = checkGomokuWinner(board);
  if (winner === player) return 1000 + depth;
  if (winner && winner !== player) return -1000 - depth;

  if (depth <= 0) {
    return evaluateGomokuBoard(board, player);
  }

  const moves = filterNearbyPositions(board, getGomokuAvailableMoves(board));
  if (moves.length === 0) return 0;

  let maxScore = -Infinity;

  for (const position of moves) {
    const newBoard = makeGomokuMove(board, { position, player });
    const score = -gomokuNegamax(
      newBoard,
      depth - 1,
      -beta,
      -alpha,
      player === "black" ? "white" : "black",
      startTime,
      timeLimit
    );

    maxScore = Math.max(maxScore, score);
    alpha = Math.max(alpha, score);

    if (alpha >= beta) break;
  }

  return maxScore;
};

// 移动排序
const sortGomokuMoves = (
  board: GomokuBoard,
  moves: Position[],
  player: "black" | "white",
  previousBestMove?: Position
): Position[] => {
  const sortedMoves = [...moves];

  sortedMoves.sort((a, b) => {
    // 优先考虑之前的最佳移动
    if (previousBestMove && a.row === previousBestMove.row && a.col === previousBestMove.col) return -1;
    if (previousBestMove && b.row === previousBestMove.row && b.col === previousBestMove.col) return 1;

    // 按评估分数排序
    const scoreA = evaluateGomokuPosition(board, a, player);
    const scoreB = evaluateGomokuPosition(board, b, player);

    return scoreB - scoreA;
  });

  return sortedMoves;
};

// 评估位置的战略价值
const evaluateGomokuPosition = (board: GomokuBoard, position: Position, player: "black" | "white"): number => {
  const { row, col } = position;
  let score = 0;

  // 四个方向：水平、垂直、左斜、右斜
  const directions = [
    [0, 1], // 水平
    [1, 0], // 垂直
    [1, 1], // 左斜
    [1, -1], // 右斜
  ];

  for (const [deltaRow, deltaCol] of directions) {
    score += evaluateDirection(board, row, col, deltaRow, deltaCol, player);
  }

  // 中心位置加分
  const center = 7;
  const distanceFromCenter = Math.abs(row - center) + Math.abs(col - center);
  score += Math.max(0, 15 - distanceFromCenter);

  return score;
};

// 评估某个方向的得分
const evaluateDirection = (
  board: GomokuBoard,
  row: number,
  col: number,
  deltaRow: number,
  deltaCol: number,
  player: "black" | "white"
): number => {
  let score = 0;
  const opponent = player === "black" ? "white" : "black";

  // 检查各种模式的得分
  for (let len = 2; len <= 7; len++) {
    const segment = getSegment(board, row, col, deltaRow, deltaCol, len);

    // 创建包含当前位置的测试段
    const testSegment = [...segment];
    const centerIndex = Math.floor(testSegment.length / 2);
    testSegment[centerIndex] = player;

    score += evaluateSegment(testSegment, player);
    score -= evaluateSegment(testSegment, opponent) * 0.8; // 防守权重稍低
  }

  return score;
};

// 获取指定长度的线段
const getSegment = (
  board: GomokuBoard,
  row: number,
  col: number,
  deltaRow: number,
  deltaCol: number,
  length: number
): GomokuPiece[] => {
  const segment: GomokuPiece[] = [];
  const halfLen = Math.floor(length / 2);

  for (let i = -halfLen; i <= halfLen; i++) {
    const r = row + i * deltaRow;
    const c = col + i * deltaCol;

    if (isInBounds(r, c, 15, 15)) {
      segment.push(board[r][c]);
    } else {
      segment.push("blocked" as any); // 边界视为阻挡
    }
  }

  return segment;
};

// 评估线段价值
const evaluateSegment = (segment: GomokuPiece[], player: "black" | "white"): number => {
  let score = 0;
  const len = segment.length;

  // 计算连续棋子数量
  let consecutive = 0;
  let openEnds = 0;

  for (let i = 0; i < len; i++) {
    if (segment[i] === player) {
      consecutive++;
    }
  }

  // 检查两端是否开放
  if (segment[0] === null) openEnds++;
  if (segment[len - 1] === null) openEnds++;

  // 根据连子数和开放端数评分
  if (consecutive >= 5) {
    score += 10000; // 五连
  } else if (consecutive === 4) {
    if (openEnds === 2) {
      score += 1000; // 活四
    } else if (openEnds === 1) {
      score += 100; // 冲四
    }
  } else if (consecutive === 3) {
    if (openEnds === 2) {
      score += 100; // 活三
    } else if (openEnds === 1) {
      score += 10; // 眠三
    }
  } else if (consecutive === 2) {
    if (openEnds === 2) {
      score += 10; // 活二
    } else if (openEnds === 1) {
      score += 1; // 眠二
    }
  }

  return score;
};

// 评估整个棋盘
const evaluateGomokuBoard = (board: GomokuBoard, player: "black" | "white"): number => {
  let score = 0;

  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      if (board[row][col] === null) {
        const positionScore = evaluateGomokuPosition(board, { row, col }, player);
        const opponentScore = evaluateGomokuPosition(board, { row, col }, player === "black" ? "white" : "black");
        score += positionScore - opponentScore * 0.8;
      }
    }
  }

  return score;
};

// 过滤出已有棋子附近的位置（提高AI性能）
const filterNearbyPositions = (board: GomokuBoard, availableMoves: Position[]): Position[] => {
  if (availableMoves.length === 225) {
    // 空棋盘
    return [{ row: 7, col: 7 }]; // 返回中心位置
  }

  const nearbyPositions: Position[] = [];
  const searchRadius = 2;

  for (const move of availableMoves) {
    let hasNearbyPiece = false;

    for (let deltaRow = -searchRadius; deltaRow <= searchRadius; deltaRow++) {
      for (let deltaCol = -searchRadius; deltaCol <= searchRadius; deltaCol++) {
        const checkRow = move.row + deltaRow;
        const checkCol = move.col + deltaCol;

        if (isInBounds(checkRow, checkCol, 15, 15) && board[checkRow][checkCol] !== null) {
          hasNearbyPiece = true;
          break;
        }
      }
      if (hasNearbyPiece) break;
    }

    if (hasNearbyPiece) {
      nearbyPositions.push(move);
    }
  }

  // 如果没有找到附近位置，返回评估最高的前20个位置
  if (nearbyPositions.length === 0) {
    const evaluatedMoves = availableMoves.map((pos) => ({
      position: pos,
      score: evaluateGomokuPosition(board, pos, "black") + evaluateGomokuPosition(board, pos, "white"),
    }));

    evaluatedMoves.sort((a, b) => b.score - a.score);
    return evaluatedMoves.slice(0, Math.min(20, evaluatedMoves.length)).map((item) => item.position);
  }

  return nearbyPositions.length > 30 ? nearbyPositions.slice(0, 30) : nearbyPositions;
};
