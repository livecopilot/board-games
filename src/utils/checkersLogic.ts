// 跳棋游戏逻辑
import { CheckersBoard, CheckersPiece, CheckersMove, Position, AIDifficulty } from "../types";
import { getRandomChoice, isInBounds, AI_SEARCH_DEPTHS, deepCopyBoard } from "./common";

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
      return getEasyAIMove(availableMoves);
    case AIDifficulty.MEDIUM:
      return getMediumAIMove(board, availableMoves, player);
    case AIDifficulty.HARD:
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
    return getRandomChoice(captureMoves);
  }

  // 否则随机选择
  return getRandomChoice(availableMoves);
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
    score: evaluateMoveBasic(board, move, player),
  }));

  evaluatedMoves.sort((a, b) => b.score - a.score);

  // 在前3个最佳移动中随机选择，增加变化性
  const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
  return getRandomChoice(topMoves).move;
};

// 专家级AI：高级算法实现
const getHardAIMove = (board: CheckersBoard, availableMoves: CheckersMove[], player: "red" | "black"): CheckersMove => {
  const startTime = Date.now();
  const timeLimit = 2000; // 2秒时间限制

  // 使用迭代加深搜索
  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  for (let depth = 1; depth <= 12; depth++) {
    if (Date.now() - startTime > timeLimit) break;

    let currentBestMove = availableMoves[0];
    let currentBestScore = -Infinity;

    // 移动排序：优先考虑吃子移动和之前的最佳移动
    const sortedMoves = sortMoves(board, availableMoves, player, bestMove);

    for (const move of sortedMoves) {
      if (Date.now() - startTime > timeLimit) break;

      const newBoard = makeCheckersMove(board, move);
      const score = negamax(newBoard, depth - 1, -Infinity, Infinity, getOpponent(player), startTime, timeLimit);

      if (score > currentBestScore) {
        currentBestScore = score;
        currentBestMove = move;
      }
    }

    if (Date.now() - startTime <= timeLimit) {
      bestMove = currentBestMove;
      bestScore = currentBestScore;
    }
  }

  return bestMove;
};

// Negamax算法（更高级的minimax变体）
const negamax = (
  board: CheckersBoard,
  depth: number,
  alpha: number,
  beta: number,
  player: "red" | "black",
  startTime: number,
  timeLimit: number
): number => {
  if (Date.now() - startTime > timeLimit) return 0;

  const winner = checkCheckersWinner(board, player);
  if (winner === player) return 1000 + depth;
  if (winner && winner !== player) return -1000 - depth;

  if (depth <= 0) {
    return evaluateBoardAdvanced(board, player);
  }

  const moves = getCheckersAvailableMoves(board, player);
  if (moves.length === 0) return -1000 - depth;

  let maxScore = -Infinity;

  for (const move of moves) {
    const newBoard = makeCheckersMove(board, move);
    const score = -negamax(newBoard, depth - 1, -beta, -alpha, getOpponent(player), startTime, timeLimit);

    maxScore = Math.max(maxScore, score);
    alpha = Math.max(alpha, score);

    if (alpha >= beta) break; // Beta剪枝
  }

  return maxScore;
};

// 移动排序（提高剪枝效率）
const sortMoves = (
  board: CheckersBoard,
  moves: CheckersMove[],
  player: "red" | "black",
  previousBestMove?: CheckersMove
): CheckersMove[] => {
  const sortedMoves = [...moves];

  sortedMoves.sort((a, b) => {
    // 优先考虑之前的最佳移动
    if (previousBestMove && movesEqual(a, previousBestMove)) return -1;
    if (previousBestMove && movesEqual(b, previousBestMove)) return 1;

    // 优先考虑吃子移动
    const aCaptureValue = (a.captured?.length || 0) * 100;
    const bCaptureValue = (b.captured?.length || 0) * 100;

    // 优先考虑升王的移动
    const aKingValue = willBecomeKing(board, a, player) ? 50 : 0;
    const bKingValue = willBecomeKing(board, b, player) ? 50 : 0;

    return bCaptureValue + bKingValue - (aCaptureValue + aKingValue);
  });

  return sortedMoves;
};

// 检查移动是否相等
const movesEqual = (move1: CheckersMove, move2: CheckersMove): boolean => {
  return (
    move1.from.row === move2.from.row &&
    move1.from.col === move2.from.col &&
    move1.to.row === move2.to.row &&
    move1.to.col === move2.to.col
  );
};

// 检查移动是否会升王
const willBecomeKing = (board: CheckersBoard, move: CheckersMove, player: "red" | "black"): boolean => {
  const piece = board[move.from.row][move.from.col];
  if (!piece || piece.isKing) return false;

  return (player === "red" && move.to.row === 0) || (player === "black" && move.to.row === 7);
};

// 获取对手
const getOpponent = (player: "red" | "black"): "red" | "black" => {
  return player === "red" ? "black" : "red";
};

// 高级棋盘评估函数
const evaluateBoardAdvanced = (board: CheckersBoard, player: "red" | "black"): number => {
  let score = 0;
  const opponent = getOpponent(player);

  // 位置权重表
  const positionWeights = [
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 3, 0, 3, 0, 2],
    [1, 0, 3, 0, 4, 0, 3, 0],
    [0, 3, 0, 4, 0, 3, 0, 1],
    [2, 0, 3, 0, 3, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
  ];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      let pieceValue = 0;

      // 基础价值
      pieceValue += piece.isKing ? 10 : 5;

      // 位置价值
      pieceValue += positionWeights[row][col];

      // 升王接近度
      if (!piece.isKing) {
        if (piece.player === "red") {
          pieceValue += (7 - row) * 0.5; // 越接近顶部越有价值
        } else {
          pieceValue += row * 0.5; // 越接近底部越有价值
        }
      }

      // 王棋在中心的价值
      if (piece.isKing) {
        const centerDistance = Math.abs(3.5 - row) + Math.abs(3.5 - col);
        pieceValue += (7 - centerDistance) * 0.3;
      }

      // 保护价值（有友方棋子保护）
      pieceValue += getProtectionValue(board, { row, col }, piece.player);

      // 威胁价值（能威胁对方棋子）
      pieceValue += getThreatValue(board, { row, col }, piece.player);

      // 根据归属加分或减分
      if (piece.player === player) {
        score += pieceValue;
      } else {
        score -= pieceValue;
      }
    }
  }

  // 机动性评估
  const playerMoves = getCheckersAvailableMoves(board, player);
  const opponentMoves = getCheckersAvailableMoves(board, opponent);
  score += (playerMoves.length - opponentMoves.length) * 2;

  // 中心控制
  score += getCenterControl(board, player) * 3;

  return score;
};

// 基础移动评估（中等难度使用）
const evaluateMoveBasic = (board: CheckersBoard, move: CheckersMove, player: "red" | "black"): number => {
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

// 获取保护价值
const getProtectionValue = (board: CheckersBoard, position: Position, player: "red" | "black"): number => {
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
        protection += 1;
      }
    }
  }

  return protection * 0.5;
};

// 获取威胁价值
const getThreatValue = (board: CheckersBoard, position: Position, player: "red" | "black"): number => {
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
          threats += target.isKing ? 3 : 2;
        }
      }
    }
  }

  return threats * 0.3;
};

// 获取中心控制价值
const getCenterControl = (board: CheckersBoard, player: "red" | "black"): number => {
  let control = 0;
  const centerSquares = [
    { row: 3, col: 2 },
    { row: 3, col: 4 },
    { row: 3, col: 6 },
    { row: 4, col: 1 },
    { row: 4, col: 3 },
    { row: 4, col: 5 },
    { row: 4, col: 7 },
  ];

  for (const square of centerSquares) {
    const piece = board[square.row][square.col];
    if (piece && piece.player === player) {
      control += piece.isKing ? 2 : 1;
    }
  }

  return control;
};

// 检查是否可以继续跳跃
export const canContinueCapture = (board: CheckersBoard, position: Position): boolean => {
  const moves = getPieceMoves(board, position, true);
  return moves.some((move) => move.captured && move.captured.length > 0);
};
