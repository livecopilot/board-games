// 游戏逻辑统一入口点
// 从各个分离的逻辑文件中重新导出函数

// 井字棋相关导出
export {
  createEmptyBoard,
  checkWinner,
  isValidMove,
  makeMove,
  getAvailableMoves,
  getAIMove,
  getTicTacToeAIMove,
} from "./ticTacToeLogic";

// 跳棋相关导出
export {
  createCheckersBoard,
  getPieceMoves,
  getCheckersAvailableMoves,
  makeCheckersMove,
  checkCheckersWinner,
  getCheckersAIMove,
  canContinueCapture,
} from "./checkersLogic";

// 中国象棋相关导出
export {
  createChessBoard,
  getChessPieceMoves,
  getChessAvailableMoves,
  makeChessMove,
  isInCheck,
  isCheckmate,
  checkChessWinner,
  getChessAIMove,
  getPieceValue,
} from "./chessLogic";

// 五子棋相关导出
export {
  createGomokuBoard,
  isValidGomokuMove,
  makeGomokuMove,
  checkGomokuWinner,
  getGomokuAvailableMoves,
  getGomokuAIMove,
} from "./gomokuLogic";
