import { useState, useCallback } from "react";
import { GameState, Position, CellValue } from "../types";
import { createEmptyBoard, checkWinner, makeMove, isValidMove, getAIMove } from "../utils/gameLogic";

export const useTicTacToe = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayer: "X",
    isGameOver: false,
    winner: null,
  });

  const [isAIMode, setIsAIMode] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameState[]>([]);

  // 重置游戏
  const resetGame = useCallback(() => {
    const newState: GameState = {
      board: createEmptyBoard(),
      currentPlayer: "X",
      isGameOver: false,
      winner: null,
    };
    setGameState(newState);
    setGameHistory([newState]);
  }, []);

  // 执行玩家移动
  const playerMove = useCallback(
    (position: Position) => {
      if (gameState.isGameOver || !isValidMove(gameState.board, position)) {
        return false;
      }

      const newBoard = makeMove(gameState.board, position, gameState.currentPlayer);
      const winner = checkWinner(newBoard);
      const isGameOver = winner !== null;

      const newState: GameState = {
        board: newBoard,
        currentPlayer: gameState.currentPlayer === "X" ? "O" : "X",
        isGameOver,
        winner,
      };

      setGameState(newState);
      setGameHistory((prev) => [...prev, newState]);

      // 如果是AI模式且游戏未结束且下一个玩家是O，触发AI移动
      if (isAIMode && !isGameOver && newState.currentPlayer === "O") {
        setTimeout(() => {
          aiMove(newState);
        }, 500); // 延迟500ms使AI移动更自然
      }

      return true;
    },
    [gameState, isAIMode]
  );

  // AI移动
  const aiMove = useCallback((currentState: GameState) => {
    if (currentState.isGameOver) {
      return;
    }

    const aiPosition = getAIMove(currentState.board);
    if (!aiPosition) {
      return;
    }

    const newBoard = makeMove(currentState.board, aiPosition, "O");
    const winner = checkWinner(newBoard);
    const isGameOver = winner !== null;

    const newState: GameState = {
      board: newBoard,
      currentPlayer: "X",
      isGameOver,
      winner,
    };

    setGameState(newState);
    setGameHistory((prev) => [...prev, newState]);
  }, []);

  // 切换AI模式
  const toggleAIMode = useCallback(() => {
    setIsAIMode((prev) => !prev);
    resetGame();
  }, [resetGame]);

  // 撤销移动
  const undoMove = useCallback(() => {
    if (gameHistory.length <= 1) {
      return;
    }

    const newHistory = gameHistory.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];

    setGameState(previousState);
    setGameHistory(newHistory);
  }, [gameHistory]);

  return {
    gameState,
    isAIMode,
    playerMove,
    resetGame,
    toggleAIMode,
    undoMove,
    canUndo: gameHistory.length > 1,
  };
};
