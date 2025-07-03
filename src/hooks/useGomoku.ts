import { useState, useCallback, useRef, useEffect } from "react";
import { GomokuGameState, GomokuMove, Position, AIDifficulty } from "../types";
import {
  createGomokuBoard,
  makeGomokuMove,
  checkGomokuWinner,
  getGomokuAIMove,
  getGomokuAvailableMoves,
  isValidGomokuMove,
} from "../utils/gameLogic";

export const useGomoku = () => {
  const [gameState, setGameState] = useState<GomokuGameState>(() => ({
    board: createGomokuBoard(),
    currentPlayer: "black", // 黑棋先行
    isGameOver: false,
    winner: null,
    moveHistory: [],
  }));

  const [isAIMode, setIsAIMode] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);
  const [isAIThinking, setIsAIThinking] = useState(false);

  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 添加组件挂载状态跟踪
  const isMountedRef = useRef(true);

  // 清理AI定时器
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }
    };
  }, []);

  // 安全的 setState 函数
  const safeSetGameState = useCallback((newState: GomokuGameState | ((prev: GomokuGameState) => GomokuGameState)) => {
    if (isMountedRef.current) {
      setGameState(newState);
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

  const safeSetAiDifficulty = useCallback((difficulty: AIDifficulty) => {
    if (isMountedRef.current) {
      setAiDifficulty(difficulty);
    }
  }, []);

  // 检查位置是否可以落子
  const canPlacePiece = useCallback(
    (position: Position): boolean => {
      if (gameState.isGameOver || isAIThinking) return false;
      return isValidGomokuMove(gameState.board, position);
    },
    [gameState.board, gameState.isGameOver, isAIThinking]
  );

  // 执行移动
  const executeMove = useCallback((move: GomokuMove) => {
    setGameState((prevState) => {
      const newBoard = makeGomokuMove(prevState.board, move);
      const nextPlayer = prevState.currentPlayer === "black" ? "white" : "black";
      const winner = checkGomokuWinner(newBoard);

      return {
        ...prevState,
        board: newBoard,
        currentPlayer: nextPlayer,
        isGameOver: !!winner,
        winner,
        lastMove: move,
        moveHistory: [...prevState.moveHistory, move],
      };
    });
  }, []);

  // 在指定位置落子
  const placePiece = useCallback(
    (position: Position) => {
      if (!canPlacePiece(position)) return false;

      const move: GomokuMove = {
        position,
        player: gameState.currentPlayer,
      };

      executeMove(move);
      return true;
    },
    [canPlacePiece, gameState.currentPlayer, executeMove]
  );

  // AI移动调度
  const scheduleAIMove = useCallback(() => {
    if (isAIThinking) return;

    setIsAIThinking(true);

    const delay =
      aiDifficulty === AIDifficulty.EASY
        ? Math.random() * 300 + 200 // 200-500ms
        : aiDifficulty === AIDifficulty.MEDIUM
        ? Math.random() * 500 + 400 // 400-900ms
        : Math.random() * 700 + 600; // 600-1300ms

    aiTimeoutRef.current = setTimeout(() => {
      setGameState((currentState) => {
        const aiMove = getGomokuAIMove(currentState.board, currentState.currentPlayer, aiDifficulty);

        if (aiMove) {
          const newBoard = makeGomokuMove(currentState.board, aiMove);
          const nextPlayer = currentState.currentPlayer === "black" ? "white" : "black";
          const winner = checkGomokuWinner(newBoard);

          setIsAIThinking(false);

          return {
            ...currentState,
            board: newBoard,
            currentPlayer: nextPlayer,
            isGameOver: !!winner,
            winner,
            lastMove: aiMove,
            moveHistory: [...currentState.moveHistory, aiMove],
          };
        } else {
          setIsAIThinking(false);
          return currentState;
        }
      });
    }, delay);
  }, [aiDifficulty, isAIThinking]);

  // 检查是否需要AI移动
  useEffect(() => {
    if (isAIMode && gameState.currentPlayer === "white" && !gameState.isGameOver && !isAIThinking) {
      scheduleAIMove();
    }
  }, [isAIMode, gameState.currentPlayer, gameState.isGameOver, isAIThinking, scheduleAIMove]);

  // 重置游戏
  const resetGame = useCallback(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }

    setGameState({
      board: createGomokuBoard(),
      currentPlayer: "black",
      isGameOver: false,
      winner: null,
      moveHistory: [],
    });
    setIsAIThinking(false);
  }, []);

  // 撤销移动
  const undoMove = useCallback(() => {
    if (gameState.moveHistory.length === 0 || isAIThinking) return;

    // 在AI模式下，需要撤销两步（玩家和AI的移动）
    const stepsToUndo = isAIMode ? 2 : 1;
    const newHistoryLength = Math.max(0, gameState.moveHistory.length - stepsToUndo);

    // 重新构建棋盘
    let newBoard = createGomokuBoard();
    const newHistory = gameState.moveHistory.slice(0, newHistoryLength);

    for (const move of newHistory) {
      newBoard = makeGomokuMove(newBoard, move);
    }

    const currentPlayer = newHistoryLength % 2 === 0 ? "black" : "white";
    const winner = checkGomokuWinner(newBoard);

    setGameState({
      board: newBoard,
      currentPlayer,
      isGameOver: !!winner,
      winner,
      lastMove: newHistory[newHistory.length - 1] || undefined,
      moveHistory: newHistory,
    });
  }, [gameState.moveHistory, isAIMode, isAIThinking]);

  // 指定玩家撤销移动（双人模式专用）
  const undoMoveForPlayer = useCallback((player: "black" | "white") => {
    if (gameState.moveHistory.length === 0 || isAIThinking) return;

    // 在双人模式下，检查最后一步移动是否是该玩家下的
    if (!isAIMode) {
      const lastMoveIndex = gameState.moveHistory.length - 1;
      const lastMovePlayer = lastMoveIndex % 2 === 0 ? "black" : "white";
      
      // 只能撤销自己的移动
      if (lastMovePlayer !== player) return;
    }

    // 调用原有的撤销逻辑
    undoMove();
  }, [gameState.moveHistory, isAIMode, isAIThinking, undoMove]);

  // 检查是否可以撤销
  const canUndo = gameState.moveHistory.length > 0 && !isAIThinking;

  // 检查指定玩家是否可以撤销（双人模式专用）
  const canUndoForPlayer = useCallback((player: "black" | "white"): boolean => {
    if (gameState.moveHistory.length === 0 || isAIThinking) return false;

    // 在AI模式下，只有黑方（玩家）可以撤销
    if (isAIMode) {
      return player === "black";
    }

    // 在双人模式下，检查最后一步移动是否是该玩家下的
    const lastMoveIndex = gameState.moveHistory.length - 1;
    const lastMovePlayer = lastMoveIndex % 2 === 0 ? "black" : "white";
    
    return lastMovePlayer === player;
  }, [gameState.moveHistory, isAIMode, isAIThinking]);

  // 切换AI模式
  const toggleAIMode = useCallback(() => {
    setIsAIMode((prev) => !prev);
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    setIsAIThinking(false);
    resetGame();
  }, [resetGame]);

  // 设置AI难度
  const setAIDifficultyLevel = useCallback((difficulty: AIDifficulty) => {
    setAiDifficulty(difficulty);
  }, []);

  // 恢复游戏状态
  const restoreGameState = useCallback(
    (restoredState: GomokuGameState, restoredAIMode: boolean, restoredAIDifficulty?: AIDifficulty) => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }

      setGameState(restoredState);
      setIsAIMode(restoredAIMode);
      if (restoredAIDifficulty) {
        setAiDifficulty(restoredAIDifficulty);
      }
      setIsAIThinking(false);

      // 如果是AI模式且轮到AI，触发AI移动
      if (restoredAIMode && restoredState.currentPlayer === "white" && !restoredState.isGameOver) {
        setTimeout(() => scheduleAIMove(), 100);
      }
    },
    [scheduleAIMove]
  );

  return {
    gameState,
    isAIMode,
    aiDifficulty,
    isAIThinking,
    placePiece,
    canPlacePiece,
    resetGame,
    undoMove,
    undoMoveForPlayer,
    canUndo,
    canUndoForPlayer,
    toggleAIMode,
    setAIDifficultyLevel,
    restoreGameState,
  };
};
