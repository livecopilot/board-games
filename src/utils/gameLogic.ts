import { Board, CellValue, Position, AIDifficulty } from "../types";
import { CheckersBoard, CheckersPiece, CheckersMove, CheckersGameState } from "../types";
import { ChessBoard, ChessPiece, ChessMove, ChessPieceType } from "../types";
import { GomokuBoard, GomokuPiece, GomokuMove } from "../types";

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

// 中国象棋相关函数

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

// 检查位置是否在棋盘内
const isChessInBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < 10 && col >= 0 && col < 9;
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
    return row <= 4; // 红方过河是到达0-4行
  } else {
    return row >= 5; // 黑方过河是到达5-9行
  }
};

// 获取单个棋子的可能移动
export const getChessPieceMoves = (board: ChessBoard, position: Position, piece: ChessPiece): ChessMove[] => {
  if (!piece) return [];

  const moves: ChessMove[] = [];
  const { row, col } = position;

  // 定义直线移动方向（车和炮都会用到）
  const rookDirections = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  switch (piece.type) {
    case "king": // 帅/将
      // 只能在九宫格内移动，一次只能走一格
      const kingMoves = [
        { row: row - 1, col },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 },
      ];

      for (const move of kingMoves) {
        if (isChessInBounds(move.row, move.col) && isInPalace(move.row, move.col, piece.player)) {
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
      break;

    case "advisor": // 士
      // 只能在九宫格内斜向移动
      const advisorMoves = [
        { row: row - 1, col: col - 1 },
        { row: row - 1, col: col + 1 },
        { row: row + 1, col: col - 1 },
        { row: row + 1, col: col + 1 },
      ];

      for (const move of advisorMoves) {
        if (isChessInBounds(move.row, move.col) && isInPalace(move.row, move.col, piece.player)) {
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
      break;

    case "elephant": // 相/象
      // 斜向移动两格，不能过河，不能被拦
      const elephantMoves = [
        { row: row - 2, col: col - 2, block: { row: row - 1, col: col - 1 } },
        { row: row - 2, col: col + 2, block: { row: row - 1, col: col + 1 } },
        { row: row + 2, col: col - 2, block: { row: row + 1, col: col - 1 } },
        { row: row + 2, col: col + 2, block: { row: row + 1, col: col + 1 } },
      ];

      for (const move of elephantMoves) {
        if (
          isChessInBounds(move.row, move.col) &&
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
      break;

    case "horse": // 马
      // 走日字，不能被拦马腿
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
        if (isChessInBounds(move.row, move.col) && !board[move.block.row][move.block.col]) {
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
      break;

    case "rook": // 车
      // 直线移动，不能跳过棋子

      for (const dir of rookDirections) {
        for (let i = 1; i < 10; i++) {
          const newRow = row + dir.row * i;
          const newCol = col + dir.col * i;

          if (!isChessInBounds(newRow, newCol)) break;

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
      break;

    case "cannon": // 炮
      // 直线移动，吃子时需要跳过一个棋子
      for (const dir of rookDirections) {
        let hasJumped = false;

        for (let i = 1; i < 10; i++) {
          const newRow = row + dir.row * i;
          const newCol = col + dir.col * i;

          if (!isChessInBounds(newRow, newCol)) break;

          const target = board[newRow][newCol];
          if (target) {
            if (!hasJumped) {
              hasJumped = true; // 第一次遇到棋子，作为炮架
            } else {
              // 第二次遇到棋子，可以吃子
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
            // 没有炮架时可以移动到空位
            moves.push({
              from: position,
              to: { row: newRow, col: newCol },
            });
          }
        }
      }
      break;

    case "pawn": // 兵/卒
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
        if (isChessInBounds(move.row, move.col)) {
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
      break;
  }

  return moves;
};

// 获取所有可能的移动
export const getChessAvailableMoves = (board: ChessBoard, player: "red" | "black"): ChessMove[] => {
  const moves: ChessMove[] = [];

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const pieceMoves = getChessPieceMoves(board, { row, col }, piece);
        moves.push(...pieceMoves);
      }
    }
  }

  return moves;
};

// 执行象棋移动
export const makeChessMove = (board: ChessBoard, move: ChessMove): ChessBoard => {
  const newBoard = board.map((row) => [...row]);

  newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
  newBoard[move.from.row][move.from.col] = null;

  return newBoard;
};

// 检查是否被将军
export const isInCheck = (board: ChessBoard, player: "red" | "black"): boolean => {
  // 找到己方的帅/将
  let kingPos: Position | null = null;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.type === "king" && piece.player === player) {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false;

  // 检查对方所有棋子是否能攻击到帅/将
  const opponent = player === "red" ? "black" : "red";
  const opponentMoves = getChessAvailableMoves(board, opponent);

  return opponentMoves.some((move) => move.to.row === kingPos!.row && move.to.col === kingPos!.col);
};

// 检查是否将死
export const isCheckmate = (board: ChessBoard, player: "red" | "black"): boolean => {
  if (!isInCheck(board, player)) return false;

  const moves = getChessAvailableMoves(board, player);

  // 尝试每一个可能的移动，看是否能解除将军
  for (const move of moves) {
    const newBoard = makeChessMove(board, move);
    if (!isInCheck(newBoard, player)) {
      return false; // 找到一个移动可以解除将军
    }
  }

  return true; // 所有移动都无法解除将军
};

// 检查象棋胜利条件
export const checkChessWinner = (
  board: ChessBoard,
  currentPlayer: "red" | "black"
): "red" | "black" | "draw" | null => {
  // 首先检查双方是否还有帅/将
  let redKingExists = false;
  let blackKingExists = false;

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece && piece.type === "king") {
        if (piece.player === "red") {
          redKingExists = true;
        } else {
          blackKingExists = true;
        }
      }
    }
  }

  // 如果任何一方的帅/将被吃掉，游戏结束
  if (!redKingExists) {
    return "black"; // 红方帅被吃，黑方胜利
  }
  if (!blackKingExists) {
    return "red"; // 黑方将被吃，红方胜利
  }

  // 检查是否将死
  if (isCheckmate(board, currentPlayer)) {
    return currentPlayer === "red" ? "black" : "red";
  }

  // 检查是否无子可动 (困毙)
  const moves = getChessAvailableMoves(board, currentPlayer);
  if (moves.length === 0) {
    return currentPlayer === "red" ? "black" : "red";
  }

  return null;
};

// 简单的象棋AI
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
    return captureMoves[Math.floor(Math.random() * captureMoves.length)];
  }

  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

// 中等AI：基本策略
const getChessMediumAI = (board: ChessBoard, availableMoves: ChessMove[], player: "red" | "black"): ChessMove => {
  // 总是优先吃子
  const captureMoves = availableMoves.filter((move) => move.captured);
  if (captureMoves.length > 0) {
    return captureMoves[Math.floor(Math.random() * captureMoves.length)];
  }

  // 评估位置价值
  const evaluatedMoves = availableMoves.map((move) => ({
    move,
    score: evaluateChessMove(board, move, player),
  }));

  evaluatedMoves.sort((a, b) => b.score - a.score);

  // 在前3个最佳移动中随机选择
  const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
  return topMoves[Math.floor(Math.random() * topMoves.length)].move;
};

// 困难AI：基础minimax
const getChessHardAI = (board: ChessBoard, availableMoves: ChessMove[], player: "red" | "black"): ChessMove => {
  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    const newBoard = makeChessMove(board, move);
    const score = evaluateChessBoard(newBoard, player);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

// 评估象棋移动价值
const evaluateChessMove = (board: ChessBoard, move: ChessMove, player: "red" | "black"): number => {
  let score = 0;

  // 吃子价值
  if (move.captured) {
    const pieceValues = {
      king: 1000,
      rook: 9,
      cannon: 4,
      horse: 4,
      elephant: 2,
      advisor: 2,
      pawn: 1,
    };
    score += pieceValues[move.captured.type] * 10;
  }

  // 中心控制价值
  const centerDistance = Math.abs(4 - move.to.row) + Math.abs(4 - move.to.col);
  score += (8 - centerDistance) * 0.5;

  return score;
};

// 评估象棋棋盘
const evaluateChessBoard = (board: ChessBoard, player: "red" | "black"): number => {
  let score = 0;

  const pieceValues = {
    king: 1000,
    rook: 9,
    cannon: 4,
    horse: 4,
    elephant: 2,
    advisor: 2,
    pawn: 1,
  };

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = pieceValues[piece.type];
        if (piece.player === player) {
          score += value;
        } else {
          score -= value;
        }
      }
    }
  }

  return score;
};

// ======================== 五子棋相关函数 ========================

// 创建五子棋空棋盘 (15x15)
export const createGomokuBoard = (): GomokuBoard => {
  return Array(15)
    .fill(null)
    .map(() => Array(15).fill(null));
};

// 检查位置是否在五子棋棋盘内
const isGomokuInBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < 15 && col >= 0 && col < 15;
};

// 检查指定位置是否可以下棋
export const isValidGomokuMove = (board: GomokuBoard, position: Position): boolean => {
  const { row, col } = position;
  return isGomokuInBounds(row, col) && board[row][col] === null;
};

// 执行五子棋移动
export const makeGomokuMove = (board: GomokuBoard, move: GomokuMove): GomokuBoard => {
  if (!isValidGomokuMove(board, move.position)) {
    return board;
  }

  const newBoard = board.map((row) => [...row]);
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
  while (isGomokuInBounds(r, c) && board[r][c] === player) {
    count++;
    r += deltaRow;
    c += deltaCol;
  }

  // 向相反方向检查
  r = row - deltaRow;
  c = col - deltaCol;
  while (isGomokuInBounds(r, c) && board[r][c] === player) {
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
  const patterns = [
    { pattern: [player, player, player, player], score: 1000 }, // 四连
    { pattern: [null, player, player, player, null], score: 500 }, // 活三
    { pattern: [player, player, player], score: 100 }, // 三连
    { pattern: [null, player, player, null], score: 50 }, // 活二
    { pattern: [player, player], score: 10 }, // 二连
  ];

  // 防守模式（阻止对手）
  const defensivePatterns = [
    { pattern: [opponent, opponent, opponent, opponent], score: 900 }, // 阻止对手四连
    { pattern: [null, opponent, opponent, opponent, null], score: 400 }, // 阻止对手活三
    { pattern: [opponent, opponent, opponent], score: 80 }, // 阻止对手三连
  ];

  // 检查正向和反向
  for (let i = 1; i <= 4; i++) {
    const segment: GomokuPiece[] = [];
    for (let j = -i; j <= i; j++) {
      const r = row + j * deltaRow;
      const c = col + j * deltaCol;
      if (isGomokuInBounds(r, c)) {
        segment.push(j === 0 ? player : board[r][c]);
      }
    }

    // 检查攻击模式
    for (const { pattern, score: patternScore } of patterns) {
      if (matchesPattern(segment, pattern)) {
        score += patternScore;
      }
    }

    // 检查防守模式
    for (const { pattern, score: patternScore } of defensivePatterns) {
      if (matchesPattern(segment, pattern)) {
        score += patternScore;
      }
    }
  }

  return score;
};

// 检查序列是否匹配模式
const matchesPattern = (segment: GomokuPiece[], pattern: GomokuPiece[]): boolean => {
  if (segment.length < pattern.length) return false;

  for (let i = 0; i <= segment.length - pattern.length; i++) {
    let matches = true;
    for (let j = 0; j < pattern.length; j++) {
      if (pattern[j] !== null && segment[i + j] !== pattern[j]) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }

  return false;
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
    // 15x15 = 225
    const center = 7;
    const nearCenter = [
      { row: center, col: center },
      { row: center - 1, col: center },
      { row: center + 1, col: center },
      { row: center, col: center - 1 },
      { row: center, col: center + 1 },
    ];
    const randomCenter = nearCenter[Math.floor(Math.random() * nearCenter.length)];
    return { position: randomCenter, player };
  }

  // 否则随机选择
  const randomPosition = availableMoves[Math.floor(Math.random() * availableMoves.length)];
  return { position: randomPosition, player };
};

// 中等AI：基于位置评估
const getGomokuMediumAI = (board: GomokuBoard, availableMoves: Position[], player: "black" | "white"): GomokuMove => {
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

// 困难AI：更深度的搜索和评估
const getGomokuHardAI = (board: GomokuBoard, availableMoves: Position[], player: "black" | "white"): GomokuMove => {
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

  // 使用更好的评估算法
  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  // 限制搜索范围以提高性能（只考虑已有棋子周围的位置）
  const candidatePositions = filterNearbyPositions(board, availableMoves);

  for (const position of candidatePositions) {
    let score = evaluateGomokuPosition(board, position, player);

    // 对每个候选位置进行一步前瞻
    const testBoard = makeGomokuMove(board, { position, player });
    const futureOpponentMoves = getGomokuAvailableMoves(testBoard);

    // 评估对手最佳回应
    let bestOpponentScore = -Infinity;
    for (let i = 0; i < Math.min(5, futureOpponentMoves.length); i++) {
      const opponentPos = futureOpponentMoves[i];
      const opponentScore = evaluateGomokuPosition(testBoard, opponentPos, opponent);
      bestOpponentScore = Math.max(bestOpponentScore, opponentScore);
    }

    score -= bestOpponentScore * 0.5; // 减少对手的最佳得分影响

    if (score > bestScore) {
      bestScore = score;
      bestMove = position;
    }
  }

  return { position: bestMove, player };
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

        if (isGomokuInBounds(checkRow, checkCol) && board[checkRow][checkCol] !== null) {
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

  return nearbyPositions.length > 0 ? nearbyPositions : availableMoves.slice(0, 10);
};
