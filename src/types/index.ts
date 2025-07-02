/*
 * @Author: changwj yoursfengzhilian@gmail.com
 * @Date: 2025-06-27 12:45:37
 * @LastEditors: changwj yoursfengzhilian@gmail.com
 * @LastEditTime: 2025-06-30 13:58:44
 * @FilePath: /board-games/src/types/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 游戏类型定义
export interface GameResult {
  winner: "player1" | "player2" | "draw" | null;
  moves: number;
  duration: number;
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  wins: number;
  losses: number;
  draws: number;
}

export interface GameConfig {
  player1: Player;
  player2: Player;
  gameType: "tic-tac-toe" | "checkers" | "chess";
  difficulty?: "easy" | "medium" | "hard";
}

// AI难度枚举
export enum AIDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

// 井字棋相关类型
export type CellValue = "X" | "O" | null;
export type Board = CellValue[][];

// 棋盘位置
export interface Position {
  row: number;
  col: number;
}

// 游戏状态
export interface GameState {
  board: Board;
  currentPlayer: "X" | "O";
  isGameOver: boolean;
  winner: CellValue | "draw";
}

// 跳棋相关类型
export type CheckersPiece = {
  player: "red" | "black";
  isKing: boolean;
} | null;

export type CheckersBoard = CheckersPiece[][];

export interface CheckersMove {
  from: Position;
  to: Position;
  captured?: Position[];
}

export interface CheckersGameState {
  board: CheckersBoard;
  currentPlayer: "red" | "black";
  isGameOver: boolean;
  winner: "red" | "black" | "draw" | null;
  mustCapture?: Position; // 强制连续跳跃的位置
  lastMove?: CheckersMove;
}

// 中国象棋相关类型
export type ChessPieceType =
  | "king" // 帅/将
  | "advisor" // 士
  | "elephant" // 相/象
  | "horse" // 马
  | "rook" // 车
  | "cannon" // 炮
  | "pawn"; // 兵/卒

export type ChessPiece = {
  type: ChessPieceType;
  player: "red" | "black";
} | null;

export type ChessBoard = ChessPiece[][];

export interface ChessMove {
  from: Position;
  to: Position;
  captured?: ChessPiece;
}

export interface ChessGameState {
  board: ChessBoard;
  currentPlayer: "red" | "black";
  isGameOver: boolean;
  winner: "red" | "black" | "draw" | null;
  isInCheck?: boolean; // 是否被将军 - 已弃用
  redInCheck?: boolean; // 红方是否被将军
  blackInCheck?: boolean; // 黑方是否被将军
  lastMove?: ChessMove;
  moveHistory: ChessMove[];
}

// 五子棋相关类型
export type GomokuPiece = "black" | "white" | null;
export type GomokuBoard = GomokuPiece[][];

export interface GomokuMove {
  position: Position;
  player: "black" | "white";
}

export interface GomokuGameState {
  board: GomokuBoard;
  currentPlayer: "black" | "white";
  isGameOver: boolean;
  winner: "black" | "white" | "draw" | null;
  lastMove?: GomokuMove;
  moveHistory: GomokuMove[];
}
