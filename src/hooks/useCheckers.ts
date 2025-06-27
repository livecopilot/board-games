import { useState, useCallback } from "react";
import { CheckersGameState, Position, CheckersMove } from "../types";
import { 
  createCheckersBoard, 
  checkCheckersWinner, 
  makeCheckersMove, 
  getCheckersAvailableMoves,
  getCheckersAIMove,
  canContinueCapture
} from "../utils/gameLogic";

export const useCheckers = () => {
  const [gameState, setGameState] = useState<CheckersGameState>({
    board: createCheckersBoard(),
    currentPlayer: "red",
    isGameOver: false,
    winner: null,
  });

  const [isAIMode, setIsAIMode] = useState(false);
  const [gameHistory, setGameHistory] = useState<CheckersGameState[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [availableMoves, setAvailableMoves] = useState<CheckersMove[]>([]);

  // 重置游戏
  const resetGame = useCallback(() => {
    const newState: CheckersGameState = {
      board: createCheckersBoard(),
      currentPlayer: "red",
      isGameOver: false,
      winner: null,
    };
    setGameState(newState);
    setGameHistory([newState]);
    setSelectedPiece(null);
    setAvailableMoves([]);
  }, []);

  // 选择棋子
  const selectPiece = useCallback((position: Position) => {
    if (gameState.isGameOver) return;
    
    const piece = gameState.board[position.row][position.col];
    
    // 如果点击的不是当前玩家的棋子，取消选择
    if (!piece || piece.player !== gameState.currentPlayer) {
      setSelectedPiece(null);
      setAvailableMoves([]);
      return;
    }

    // 如果有强制跳跃，只能选择那个棋子
    if (gameState.mustCapture && 
        (gameState.mustCapture.row !== position.row || gameState.mustCapture.col !== position.col)) {
      return;
    }

    setSelectedPiece(position);
    
    // 获取这个棋子的可用移动
    const moves = getCheckersAvailableMoves(
      gameState.board, 
      gameState.currentPlayer, 
      gameState.mustCapture
    ).filter(move => 
      move.from.row === position.row && move.from.col === position.col
    );
    
    setAvailableMoves(moves);
  }, [gameState]);

  // 执行移动
  const makeMove = useCallback((move: CheckersMove) => {
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
    setGameHistory(prev => [...prev, newState]);
    setSelectedPiece(mustCapture || null);
    setAvailableMoves([]);

    // 如果是AI模式且游戏未结束且下一个玩家是黑方，触发AI移动
    if (isAIMode && !isGameOver && nextPlayer === "black" && !mustCapture) {
      setTimeout(() => {
        aiMove(newState);
      }, 800);
    }

    return true;
  }, [gameState, isAIMode]);

  // 尝试移动到指定位置
  const moveTo = useCallback((position: Position) => {
    if (!selectedPiece) return false;

    const validMove = availableMoves.find(move => 
      move.to.row === position.row && move.to.col === position.col
    );

    if (validMove) {
      return makeMove(validMove);
    }

    return false;
  }, [selectedPiece, availableMoves, makeMove]);

  // AI移动
  const aiMove = useCallback((currentState: CheckersGameState) => {
    if (currentState.isGameOver) return;

    const aiMoveResult = getCheckersAIMove(currentState.board, "black");
    if (!aiMoveResult) return;

    makeMove(aiMoveResult);
  }, [makeMove]);

  // 切换AI模式
  const toggleAIMode = useCallback(() => {
    setIsAIMode(prev => !prev);
    resetGame();
  }, [resetGame]);

  // 撤销移动
  const undoMove = useCallback(() => {
    if (gameHistory.length <= 1) return;

    const newHistory = gameHistory.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];

    setGameState(previousState);
    setGameHistory(newHistory);
    setSelectedPiece(null);
    setAvailableMoves([]);
  }, [gameHistory]);

  // 获取可移动的位置（用于高亮显示）
  const getValidMoves = useCallback(() => {
    return availableMoves.map(move => move.to);
  }, [availableMoves]);

  return {
    gameState,
    isAIMode,
    selectedPiece,
    selectPiece,
    moveTo,
    resetGame,
    toggleAIMode,
    undoMove,
    canUndo: gameHistory.length > 1,
    getValidMoves,
  };
}; 