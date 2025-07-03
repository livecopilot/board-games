import { useState, useCallback, useRef, useEffect } from "react";
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
  // 添加组件挂载状态跟踪
  const isMountedRef = useRef(true);

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current);
        aiMoveTimeoutRef.current = null;
      }
    };
  }, []);

  // 安全的 setState 函数
  const safeSetGameState = useCallback((newState: GameState | ((prev: GameState) => GameState)) => {
    if (isMountedRef.current) {
      setGameState(newState);
    }
  }, []);

  const safeSetGameHistory = useCallback((newHistory: GameState[] | ((prev: GameState[]) => GameState[])) => {
    if (isMountedRef.current) {
      setGameHistory(newHistory);
    }
  }, []);

  const safeSetIsAIThinking = useCallback((thinking: boolean) => {
    if (isMountedRef.current) {
      setIsAIThinking(thinking);
    }
  }, []);

  const safeSetIsAIMode = useCallback((mode: boolean | ((prev: boolean) => boolean)) => {
    if (isMountedRef.current) {
      setIsAIMode(mode);
    }
  }, []);

  const safeSetAIDifficulty = useCallback((difficulty: AIDifficulty) => {
    if (isMountedRef.current) {
      setAIDifficulty(difficulty);
    }
  }, []);

  // 重置游戏
  const resetGame = useCallback(() => {
    // 清除AI移动的定时器
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = null;
    }

    if (!isMountedRef.current) return;

    const newState: GameState = {
      board: createEmptyBoard(),
      currentPlayer: "X",
      isGameOver: false,
      winner: null,
    };
    safeSetGameState(newState);
    safeSetGameHistory([newState]);
    safeSetIsAIThinking(false);
  }, [safeSetGameState, safeSetGameHistory, safeSetIsAIThinking]);

  // 执行移动（内部函数，不直接触发AI）
  const executeMove = useCallback(
    (position: Position, triggerAI: boolean = true) => {
      if (!isMountedRef.current || gameState.isGameOver || !isValidMove(gameState.board, position)) {
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

      safeSetGameState(newState);
      safeSetGameHistory((prev) => [...prev, newState]);

      // 只有在需要触发AI且满足条件时才触发AI移动
      if (triggerAI && isAIMode && !isGameOver && newState.currentPlayer === "O") {
        scheduleAIMove(newState);
      }

      return true;
    },
    [gameState, isAIMode, safeSetGameState, safeSetGameHistory]
  );

  // 玩家移动
  const playerMove = useCallback(
    (position: Position) => {
      if (!isMountedRef.current || isAIThinking) return false;
      return executeMove(position, true);
    },
    [executeMove, isAIThinking]
  );

  // 调度AI移动
  const scheduleAIMove = useCallback(
    (currentState: GameState) => {
      if (!isMountedRef.current || isAIThinking || currentState.isGameOver || currentState.currentPlayer !== "O")
        return;

      safeSetIsAIThinking(true);

      // 根据难度设置思考时间
      const thinkingTime = {
        [AIDifficulty.EASY]: 300,
        [AIDifficulty.MEDIUM]: 600,
        [AIDifficulty.HARD]: 1000,
      }[aiDifficulty];

      aiMoveTimeoutRef.current = setTimeout(() => {
        // 检查组件是否仍然挂载
        if (!isMountedRef.current) {
          return;
        }

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

          safeSetGameState(newState);
          safeSetGameHistory((prev) => [...prev, newState]);
        }

        safeSetIsAIThinking(false);
        aiMoveTimeoutRef.current = null;
      }, thinkingTime);
    },
    [aiDifficulty, isAIThinking, safeSetIsAIThinking, safeSetGameState, safeSetGameHistory]
  );

  // 切换AI模式
  const toggleAIMode = useCallback(() => {
    if (!isMountedRef.current) return;
    safeSetIsAIMode((prev) => !prev);
    resetGame();
  }, [resetGame, safeSetIsAIMode]);

  // 设置AI难度
  const setAIDifficultyLevel = useCallback(
    (difficulty: AIDifficulty) => {
      safeSetAIDifficulty(difficulty);
    },
    [safeSetAIDifficulty]
  );

  // 撤销移动
  const undoMove = useCallback(() => {
    if (!isMountedRef.current || gameHistory.length <= 1 || isAIThinking) {
      return;
    }

    // 清除AI移动的定时器
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = null;
    }

    const newHistory = gameHistory.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];

    safeSetGameState(previousState);
    safeSetGameHistory(newHistory);
    safeSetIsAIThinking(false);
  }, [gameHistory, isAIThinking, safeSetGameState, safeSetGameHistory, safeSetIsAIThinking]);

  // 指定玩家撤销移动（双人模式专用）
  const undoMoveForPlayer = useCallback((player: "X" | "O") => {
    if (!isMountedRef.current || gameHistory.length <= 1 || isAIThinking) {
      return;
    }

    // 在双人模式下，检查最后一步移动是否是该玩家下的
    if (!isAIMode) {
      const currentState = gameHistory[gameHistory.length - 1];
      // 井字棋中，当前轮到的玩家就是下一个要下的，所以最后下的是相反的玩家
      const lastMovePlayer = currentState.currentPlayer === "X" ? "O" : "X";
      
      // 只能撤销自己的移动
      if (lastMovePlayer !== player) return;
    }

    // 调用原有的撤销逻辑
    undoMove();
  }, [gameHistory, isAIMode, isAIThinking, undoMove]);

  // 检查指定玩家是否可以撤销（双人模式专用）
  const canUndoForPlayer = useCallback((player: "X" | "O"): boolean => {
    if (!isMountedRef.current || gameHistory.length <= 1 || isAIThinking) {
      return false;
    }

    // 在AI模式下，只有X方（玩家）可以撤销
    if (isAIMode) {
      return player === "X";
    }

    // 在双人模式下，检查最后一步移动是否是该玩家下的
    const currentState = gameHistory[gameHistory.length - 1];
    // 井字棋中，当前轮到的玩家就是下一个要下的，所以最后下的是相反的玩家
    const lastMovePlayer = currentState.currentPlayer === "X" ? "O" : "X";
    
    return lastMovePlayer === player;
  }, [gameHistory, isAIMode, isAIThinking]);

  // 恢复游戏状态
  const restoreGameState = useCallback(
    (restoredState: GameState, restoredAIMode: boolean, restoredAIDifficulty?: AIDifficulty) => {
      if (!isMountedRef.current) return;

      // 清除AI移动的定时器
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current);
        aiMoveTimeoutRef.current = null;
      }

      safeSetGameState(restoredState);
      safeSetGameHistory([restoredState]);
      safeSetIsAIMode(restoredAIMode);
      if (restoredAIDifficulty) {
        safeSetAIDifficulty(restoredAIDifficulty);
      }
      safeSetIsAIThinking(false);

      // 如果是AI模式且轮到AI，触发AI移动
      if (restoredAIMode && restoredState.currentPlayer === "O" && !restoredState.isGameOver) {
        scheduleAIMove(restoredState);
      }
    },
    [scheduleAIMove, safeSetGameState, safeSetGameHistory, safeSetIsAIMode, safeSetAIDifficulty, safeSetIsAIThinking]
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
    undoMoveForPlayer,
    canUndoForPlayer,
  };
};
