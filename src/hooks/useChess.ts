import { useState, useCallback, useRef, useEffect } from "react";
import { ChessGameState, ChessMove, Position, AIDifficulty, ChessPiece } from "../types";
import {
  createChessBoard,
  getChessPieceMoves,
  makeChessMove,
  checkChessWinner,
  getChessAIMove,
  isInCheck,
  getChessAvailableMoves,
} from "../utils/gameLogic";

export const useChess = () => {
  const [gameState, setGameState] = useState<ChessGameState>(() => ({
    board: createChessBoard(),
    currentPlayer: "red",
    isGameOver: false,
    winner: null,
    isInCheck: false,
    moveHistory: [],
  }));

  const [isAIMode, setIsAIMode] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);

  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 清理AI定时器
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, []);

  // 获取当前选中棋子的可移动位置
  const getValidMoves = useCallback((): Position[] => {
    if (!selectedPiece) return [];

    const piece = gameState.board[selectedPiece.row][selectedPiece.col];
    if (!piece || piece.player !== gameState.currentPlayer) return [];

    const moves = getChessPieceMoves(gameState.board, selectedPiece, piece);
    return moves.map((move) => move.to);
  }, [gameState.board, selectedPiece, gameState.currentPlayer]);

  // 选择棋子
  const selectPiece = useCallback(
    (position: Position) => {
      if (gameState.isGameOver || isAIThinking) return;

      const piece = gameState.board[position.row][position.col];
      if (!piece || piece.player !== gameState.currentPlayer) {
        setSelectedPiece(null);
        return;
      }

      setSelectedPiece(position);
    },
    [gameState.board, gameState.currentPlayer, gameState.isGameOver, isAIThinking]
  );

  // 执行移动
  const executeMove = useCallback((move: ChessMove) => {
    setGameState((prevState) => {
      const newBoard = makeChessMove(prevState.board, move);
      const nextPlayer = prevState.currentPlayer === "red" ? "black" : "red";
      const winner = checkChessWinner(newBoard, nextPlayer);
      const inCheck = isInCheck(newBoard, nextPlayer);

      return {
        ...prevState,
        board: newBoard,
        currentPlayer: nextPlayer,
        isGameOver: !!winner,
        winner,
        isInCheck: inCheck,
        lastMove: move,
        moveHistory: [...prevState.moveHistory, move],
      };
    });

    setSelectedPiece(null);
  }, []);

  // 移动到指定位置
  const moveTo = useCallback(
    (position: Position) => {
      if (!selectedPiece || gameState.isGameOver || isAIThinking) return;

      const piece = gameState.board[selectedPiece.row][selectedPiece.col];
      if (!piece || piece.player !== gameState.currentPlayer) return;

      const validMoves = getChessPieceMoves(gameState.board, selectedPiece, piece);
      const move = validMoves.find((m) => m.to.row === position.row && m.to.col === position.col);

      if (move) {
        executeMove(move);
      }
    },
    [selectedPiece, gameState.board, gameState.currentPlayer, gameState.isGameOver, isAIThinking, executeMove]
  );

  // AI移动调度
  const scheduleAIMove = useCallback(() => {
    if (isAIThinking) return;

    setIsAIThinking(true);
    setSelectedPiece(null);

    const delay =
      aiDifficulty === AIDifficulty.EASY
        ? Math.random() * 200 + 300 // 300-500ms
        : aiDifficulty === AIDifficulty.MEDIUM
        ? Math.random() * 400 + 600 // 600-1000ms
        : Math.random() * 500 + 1000; // 1000-1500ms

    aiTimeoutRef.current = setTimeout(() => {
      setGameState((currentState) => {
        const aiMove = getChessAIMove(currentState.board, currentState.currentPlayer, aiDifficulty);

        if (aiMove) {
          const newBoard = makeChessMove(currentState.board, aiMove);
          const nextPlayer = currentState.currentPlayer === "red" ? "black" : "red";
          const winner = checkChessWinner(newBoard, nextPlayer);
          const inCheck = isInCheck(newBoard, nextPlayer);

          setIsAIThinking(false);

          return {
            ...currentState,
            board: newBoard,
            currentPlayer: nextPlayer,
            isGameOver: !!winner,
            winner,
            isInCheck: inCheck,
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
    if (isAIMode && gameState.currentPlayer === "black" && !gameState.isGameOver && !isAIThinking) {
      scheduleAIMove();
    }
  }, [isAIMode, gameState.currentPlayer, gameState.isGameOver, isAIThinking, scheduleAIMove]);

  // 重置游戏
  const resetGame = useCallback(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }

    setGameState({
      board: createChessBoard(),
      currentPlayer: "red",
      isGameOver: false,
      winner: null,
      isInCheck: false,
      moveHistory: [],
    });
    setSelectedPiece(null);
    setIsAIThinking(false);
  }, []);

  // 撤销移动
  const undoMove = useCallback(() => {
    if (gameState.moveHistory.length === 0 || isAIThinking) return;

    // 在AI模式下，需要撤销两步（玩家和AI的移动）
    const stepsToUndo = isAIMode ? 2 : 1;
    const newHistoryLength = Math.max(0, gameState.moveHistory.length - stepsToUndo);

    // 重新构建棋盘
    let newBoard = createChessBoard();
    const newHistory = gameState.moveHistory.slice(0, newHistoryLength);

    for (const move of newHistory) {
      newBoard = makeChessMove(newBoard, move);
    }

    const currentPlayer = newHistoryLength % 2 === 0 ? "red" : "black";
    const winner = checkChessWinner(newBoard, currentPlayer);
    const inCheck = isInCheck(newBoard, currentPlayer);

    setGameState({
      board: newBoard,
      currentPlayer,
      isGameOver: !!winner,
      winner,
      isInCheck: inCheck,
      lastMove: newHistory[newHistory.length - 1] || undefined,
      moveHistory: newHistory,
    });

    setSelectedPiece(null);
  }, [gameState.moveHistory, isAIMode, isAIThinking]);

  // 切换AI模式
  const toggleAIMode = useCallback(() => {
    setIsAIMode((prev) => !prev);
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    setIsAIThinking(false);
    setSelectedPiece(null);
    resetGame();
  }, [resetGame]);

  // 设置AI难度
  const setAIDifficultyLevel = useCallback((difficulty: AIDifficulty) => {
    setAiDifficulty(difficulty);
  }, []);

  // 检查是否可以撤销
  const canUndo = gameState.moveHistory.length > 0 && !isAIThinking;

  return {
    gameState,
    isAIMode,
    aiDifficulty,
    isAIThinking,
    selectedPiece,
    selectPiece,
    moveTo,
    resetGame,
    undoMove,
    toggleAIMode,
    setAIDifficultyLevel,
    canUndo,
    getValidMoves,
  };
};
