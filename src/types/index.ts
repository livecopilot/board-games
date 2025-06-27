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
