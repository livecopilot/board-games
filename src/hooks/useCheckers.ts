import { useState, useCallback, useRef, useEffect } from "react";
import { CheckersGameState, Position, CheckersMove, AIDifficulty } from "../types";
import {
  createCheckersBoard,
  checkCheckersWinner,
  makeCheckersMove,
  getCheckersAvailableMoves,
  getCheckersAIMove,
  canContinueCapture,
} from "../utils/gameLogic";

export const useCheckers = () => {
  const [gameState, setGameState] = useState<CheckersGameState>({
    board: createCheckersBoard(),
    currentPlayer: "red",
    isGameOver: false,
    winner: null,
  });

  const [isAIMode, setIsAIMode] = useState(false);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);
  const [gameHistory, setGameHistory] = useState<CheckersGameState[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [availableMoves, setAvailableMoves] = useState<CheckersMove[]>([]);
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
  const safeSetGameState = useCallback((newState: CheckersGameState | ((prev: CheckersGameState) => CheckersGameState)) => {
    if (isMountedRef.current) {
      setGameState(newState);
    }
  }, []);

  const safeSetGameHistory = useCallback((newHistory: CheckersGameState[] | ((prev: CheckersGameState[]) => CheckersGameState[])) => {
    if (isMountedRef.current) {
      setGameHistory(newHistory);
    }
  }, []);

  const safeSetSelectedPiece = useCallback((piece: Position | null) => {
    if (isMountedRef.current) {
      setSelectedPiece(piece);
    }
  }, []);

  const safeSetAvailableMoves = useCallback((moves: CheckersMove[]) => {
    if (isMountedRef.current) {
      setAvailableMoves(moves);
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

    const newState: CheckersGameState = {
      board: createCheckersBoard(),
      currentPlayer: "red",
      isGameOver: false,
      winner: null,
    };
    safeSetGameState(newState);
    safeSetGameHistory([newState]);
    safeSetSelectedPiece(null);
    safeSetAvailableMoves([]);
    safeSetIsAIThinking(false);
  }, [safeSetGameState, safeSetGameHistory, safeSetSelectedPiece, safeSetAvailableMoves, safeSetIsAIThinking]);

  // 选择棋子
  const selectPiece = useCallback(
    (position: Position) => {
      if (gameState.isGameOver || isAIThinking) return;

      const piece = gameState.board[position.row][position.col];

      // 如果点击的不是当前玩家的棋子，取消选择
      if (!piece || piece.player !== gameState.currentPlayer) {
        setSelectedPiece(null);
        setAvailableMoves([]);
        return;
      }

      // 如果有强制跳跃，只能选择那个棋子
      if (
        gameState.mustCapture &&
        (gameState.mustCapture.row !== position.row || gameState.mustCapture.col !== position.col)
      ) {
        return;
      }

      setSelectedPiece(position);

      // 获取这个棋子的可用移动
      const moves = getCheckersAvailableMoves(gameState.board, gameState.currentPlayer, gameState.mustCapture).filter(
        (move) => move.from.row === position.row && move.from.col === position.col
      );

      setAvailableMoves(moves);
    },
    [gameState, isAIThinking]
  );

  // 执行移动（内部函数，不直接触发AI）
  const executeMove = useCallback(
    (move: CheckersMove, triggerAI: boolean = true) => {
      if (gameState.isGameOver) return false;

      const newBoard = makeCheckersMove(gameState.board, move);
      let nextPlayer = gameState.currentPlayer;
      let mustCapture: Position | undefined;

      // 检查是否需要继续跳跃
      if (move.captured && move.captured.length > 0 && canContinueCapture(newBoard, move.to)) {
        mustCapture = move.to;
        // 继续当前玩家的回合
      } else {
        // 切换玩家
        nextPlayer = gameState.currentPlayer === "red" ? "black" : "red";
        mustCapture = undefined;
      }

      const winner = checkCheckersWinner(newBoard, nextPlayer);
      const isGameOver = winner !== null;

      const newState: CheckersGameState = {
        board: newBoard,
        currentPlayer: nextPlayer,
        isGameOver,
        winner,
        mustCapture,
        lastMove: move,
      };

      setGameState(newState);
      setGameHistory((prev) => [...prev, newState]);
      setSelectedPiece(mustCapture || null);
      setAvailableMoves([]);

      // 只有在需要触发AI且满足条件时才触发AI移动
      if (triggerAI && isAIMode && !isGameOver && nextPlayer === "black" && !mustCapture) {
        scheduleAIMove(newState);
      }

      return true;
    },
    [gameState, isAIMode]
  );

  // 玩家移动
  const makeMove = useCallback(
    (move: CheckersMove) => {
      return executeMove(move, true);
    },
    [executeMove]
  );

  // 调度AI移动
  const scheduleAIMove = useCallback(
    (currentState: CheckersGameState) => {
      if (isAIThinking || currentState.isGameOver || currentState.currentPlayer !== "black") return;

      setIsAIThinking(true);

      // 根据难度设置思考时间
      const thinkingTime = {
        [AIDifficulty.EASY]: 500,
        [AIDifficulty.MEDIUM]: 1000,
        [AIDifficulty.HARD]: 1500,
      }[aiDifficulty];

      aiMoveTimeoutRef.current = setTimeout(() => {
        // 直接在这里执行AI移动，确保使用正确的状态
        const aiMoveResult = getCheckersAIMove(currentState.board, "black", aiDifficulty);
        if (aiMoveResult) {
          const newBoard = makeCheckersMove(currentState.board, aiMoveResult);
          let nextPlayer = currentState.currentPlayer;
          let mustCapture: Position | undefined;

          // 检查是否需要继续跳跃
          if (
            aiMoveResult.captured &&
            aiMoveResult.captured.length > 0 &&
            canContinueCapture(newBoard, aiMoveResult.to)
          ) {
            mustCapture = aiMoveResult.to;
            // 继续当前玩家的回合
          } else {
            // 切换玩家
            nextPlayer = currentState.currentPlayer === "red" ? "black" : "red";
            mustCapture = undefined;
          }

          const winner = checkCheckersWinner(newBoard, nextPlayer);
          const isGameOver = winner !== null;

          const newState: CheckersGameState = {
            board: newBoard,
            currentPlayer: nextPlayer,
            isGameOver,
            winner,
            mustCapture,
            lastMove: aiMoveResult,
          };

          setGameState(newState);
          setGameHistory((prev) => [...prev, newState]);
          setSelectedPiece(mustCapture || null);
          setAvailableMoves([]);
        }

        setIsAIThinking(false);
        aiMoveTimeoutRef.current = null;
      }, thinkingTime);
    },
    [aiDifficulty, isAIThinking]
  );

  // 尝试移动到指定位置
  const moveTo = useCallback(
    (position: Position) => {
      if (!selectedPiece || isAIThinking) return false;

      const validMove = availableMoves.find((move) => move.to.row === position.row && move.to.col === position.col);

      if (validMove) {
        return makeMove(validMove);
      }

      return false;
    },
    [selectedPiece, availableMoves, makeMove, isAIThinking]
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
    if (gameHistory.length <= 1 || isAIThinking) return;

    // 清除AI移动的定时器
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = null;
    }

    const newHistory = gameHistory.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];

    setGameState(previousState);
    setGameHistory(newHistory);
    setSelectedPiece(null);
    setAvailableMoves([]);
    setIsAIThinking(false);
  }, [gameHistory, isAIThinking]);

  // 指定玩家撤销移动（双人模式专用）
  const undoMoveForPlayer = useCallback((player: "red" | "black") => {
    if (gameHistory.length <= 1 || isAIThinking) return;

    // 在双人模式下，检查最后一步移动是否是该玩家下的
    if (!isAIMode) {
      const currentState = gameHistory[gameHistory.length - 1];
      // 跳棋中，当前轮到的玩家就是下一个要下的，所以最后下的是相反的玩家
      const lastMovePlayer = currentState.currentPlayer === "red" ? "black" : "red";
      
      // 只能撤销自己的移动
      if (lastMovePlayer !== player) return;
    }

    // 调用原有的撤销逻辑
    undoMove();
  }, [gameHistory, isAIMode, isAIThinking, undoMove]);

  // 检查指定玩家是否可以撤销（双人模式专用）
  const canUndoForPlayer = useCallback((player: "red" | "black"): boolean => {
    if (gameHistory.length <= 1 || isAIThinking) return false;

    // 在AI模式下，只有红方（玩家）可以撤销
    if (isAIMode) {
      return player === "red";
    }

    // 在双人模式下，检查最后一步移动是否是该玩家下的
    const currentState = gameHistory[gameHistory.length - 1];
    // 跳棋中，当前轮到的玩家就是下一个要下的，所以最后下的是相反的玩家
    const lastMovePlayer = currentState.currentPlayer === "red" ? "black" : "red";
    
    return lastMovePlayer === player;
  }, [gameHistory, isAIMode, isAIThinking]);

  // 获取可移动的位置（用于高亮显示）
  const getValidMoves = useCallback(() => {
    return availableMoves.map((move) => move.to);
  }, [availableMoves]);

  // 恢复游戏状态
  const restoreGameState = useCallback(
    (restoredState: CheckersGameState, restoredAIMode: boolean, restoredAIDifficulty?: AIDifficulty) => {
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
      setSelectedPiece(null);
      setAvailableMoves([]);
      setIsAIThinking(false);

      // 如果是AI模式且轮到AI，触发AI移动
      if (
        restoredAIMode &&
        restoredState.currentPlayer === "black" &&
        !restoredState.isGameOver &&
        !restoredState.mustCapture
      ) {
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
    selectedPiece,
    selectPiece,
    moveTo,
    resetGame,
    toggleAIMode,
    setAIDifficultyLevel,
    undoMove,
    canUndo: gameHistory.length > 1 && !isAIThinking,
    getValidMoves,
    restoreGameState,
    undoMoveForPlayer,
    canUndoForPlayer,
  };
};
