import { useState, useCallback, useRef } from "react";
import { GameState, Position, CellValue, AIDifficulty } from "../types";
import { createEmptyBoard, checkWinner, makeMove, isValidMove, getTicTacToeAIMove } from "../utils/gameLogic";

export const useTicTacToe = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPlayer: "X",
    isGameOver: false,
    winner: null,
  });

  const [isAIMode, setIsAIMode] = useState(false);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);
  const [gameHistory, setGameHistory] = useState<GameState[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // 使用ref来跟踪AI移动状态，避免循环调用
  const aiMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 重置游戏
  const resetGame = useCallback(() => {
    // 清除AI移动的定时器
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = null;
    }

    const newState: GameState = {
      board: createEmptyBoard(),
      currentPlayer: "X",
      isGameOver: false,
      winner: null,
    };
    setGameState(newState);
    setGameHistory([newState]);
    setIsAIThinking(false);
  }, []);

  // 执行移动（内部函数，不直接触发AI）
  const executeMove = useCallback(
    (position: Position, triggerAI: boolean = true) => {
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

      // 只有在需要触发AI且满足条件时才触发AI移动
      if (triggerAI && isAIMode && !isGameOver && newState.currentPlayer === "O") {
        scheduleAIMove(newState);
      }

      return true;
    },
    [gameState, isAIMode]
  );

  // 玩家移动
  const playerMove = useCallback(
    (position: Position) => {
      if (isAIThinking) return false;
      return executeMove(position, true);
    },
    [executeMove, isAIThinking]
  );

  // 调度AI移动
  const scheduleAIMove = useCallback(
    (currentState: GameState) => {
      if (isAIThinking || currentState.isGameOver || currentState.currentPlayer !== "O") return;

      setIsAIThinking(true);

      // 根据难度设置思考时间
      const thinkingTime = {
        [AIDifficulty.EASY]: 300,
        [AIDifficulty.MEDIUM]: 600,
        [AIDifficulty.HARD]: 1000,
      }[aiDifficulty];

      aiMoveTimeoutRef.current = setTimeout(() => {
        // 直接在这里执行AI移动，确保使用正确的状态
        const aiPosition = getTicTacToeAIMove(currentState.board, aiDifficulty);
        if (aiPosition && isValidMove(currentState.board, aiPosition)) {
          const newBoard = makeMove(currentState.board, aiPosition, "O");
          const winner = checkWinner(newBoard);
          const isGameOver = winner !== null;

          const newState: GameState = {
            board: newBoard,
            currentPlayer: "X", // AI移动后轮到玩家
            isGameOver,
            winner,
          };

          setGameState(newState);
          setGameHistory((prev) => [...prev, newState]);
        }

        setIsAIThinking(false);
        aiMoveTimeoutRef.current = null;
      }, thinkingTime);
    },
    [aiDifficulty, isAIThinking]
  );

  // 切换AI模式
  const toggleAIMode = useCallback(() => {
    setIsAIMode((prev) => !prev);
    resetGame();
  }, [resetGame]);

  // 设置AI难度
  const setAIDifficultyLevel = useCallback((difficulty: AIDifficulty) => {
    setAIDifficulty(difficulty);
  }, []);

  // 撤销移动
  const undoMove = useCallback(() => {
    if (gameHistory.length <= 1 || isAIThinking) {
      return;
    }

    // 清除AI移动的定时器
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = null;
    }

    const newHistory = gameHistory.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];

    setGameState(previousState);
    setGameHistory(newHistory);
    setIsAIThinking(false);
  }, [gameHistory, isAIThinking]);

  // 恢复游戏状态
  const restoreGameState = useCallback(
    (restoredState: GameState, restoredAIMode: boolean, restoredAIDifficulty?: AIDifficulty) => {
      // 清除AI移动的定时器
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current);
        aiMoveTimeoutRef.current = null;
      }

      setGameState(restoredState);
      setGameHistory([restoredState]);
      setIsAIMode(restoredAIMode);
      if (restoredAIDifficulty) {
        setAIDifficulty(restoredAIDifficulty);
      }
      setIsAIThinking(false);

      // 如果是AI模式且轮到AI，触发AI移动
      if (restoredAIMode && restoredState.currentPlayer === "O" && !restoredState.isGameOver) {
        scheduleAIMove(restoredState);
      }
    },
    [scheduleAIMove]
  );

  return {
    gameState,
    isAIMode,
    aiDifficulty,
    isAIThinking,
    playerMove,
    resetGame,
    toggleAIMode,
    setAIDifficultyLevel,
    undoMove,
    canUndo: gameHistory.length > 1 && !isAIThinking,
    restoreGameState,
  };
};
