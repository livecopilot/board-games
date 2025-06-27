/*
 * @Author: changwj yoursfengzhilian@gmail.com
 * @Date: 2025-06-27 12:45:37
 * @LastEditors: changwj yoursfengzhilian@gmail.com
 * @LastEditTime: 2025-06-27 14:59:37
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
