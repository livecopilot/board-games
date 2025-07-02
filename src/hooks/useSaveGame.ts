import { useState, useCallback, useEffect } from "react";
import {
  saveGame,
  getSavedGames,
  loadGame,
  deleteSave,
  clearAllSaves,
  canSaveGame,
  GameType,
  SavedGame,
} from "../utils/saveUtils";

export const useSaveGame = (gameType: GameType) => {
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null); // 当前游戏的存档ID

  // 刷新存档列表
  const refreshSaves = useCallback(async () => {
    try {
      console.log(`[refreshSaves] 开始获取 ${gameType} 的存档列表`);
      const saves = await getSavedGames(gameType);
      console.log(`[refreshSaves] 获取到 ${saves.length} 个存档:`, saves);
      setSavedGames(saves);
      console.log(`[refreshSaves] 存档列表状态已更新`);
    } catch (error) {
      console.error("刷新存档列表失败:", error);
    }
  }, [gameType]);

  // 初始化时加载存档列表
  useEffect(() => {
    refreshSaves();
  }, [refreshSaves]);

  // 保存当前游戏状态
  const handleSaveGame = useCallback(
    async (
      gameState: any,
      isAIMode: boolean,
      aiDifficulty?: string,
      isNewGame: boolean = false // 新增：是否是新游戏
    ): Promise<boolean> => {
      console.log(`[useSaveGame] 尝试保存游戏，isNewGame: ${isNewGame}, currentGameId: ${currentGameId}`);

      // 检查是否可以保存
      const canSave = canSaveGame(gameState, gameType);
      console.log(`[useSaveGame] canSave结果: ${canSave}`);

      if (!canSave) {
        console.log(`[useSaveGame] 游戏状态不满足保存条件，跳过保存`);
        return false;
      }

      setIsSaving(true);
      try {
        let gameIdToUse: string | undefined;

        if (isNewGame || !currentGameId) {
          // 新游戏或没有当前游戏ID，创建新存档
          gameIdToUse = undefined;
          console.log(`[useSaveGame] 创建新存档`);
        } else {
          // 更新现有存档
          gameIdToUse = currentGameId;
          console.log(`[useSaveGame] 更新存档: ${gameIdToUse}`);
        }

        const saveId = await saveGame(gameType, gameState, isAIMode, aiDifficulty, gameIdToUse);
        console.log(`[useSaveGame] 保存成功，saveId: ${saveId}`);
        setCurrentGameId(saveId);
        console.log(`[useSaveGame] 开始刷新存档列表`);
        await refreshSaves();
        console.log(`[useSaveGame] 存档列表刷新完成`);
        return true;
      } catch (error) {
        console.error("保存游戏失败:", error);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [gameType, refreshSaves, currentGameId]
  );

  // 开始新游戏（重置当前游戏ID）
  const startNewGame = useCallback(() => {
    console.log(`[useSaveGame] 开始新游戏，重置currentGameId`);
    setCurrentGameId(null);
  }, []);

  // 加载指定存档
  const handleLoadGame = useCallback(
    async (saveId: string): Promise<SavedGame | null> => {
      setIsLoading(true);
      try {
        const savedGame = await loadGame(gameType, saveId);
        if (savedGame) {
          console.log(`[useSaveGame] 加载存档成功，设置currentGameId: ${saveId}`);
          setCurrentGameId(saveId);
        }
        return savedGame;
      } catch (error) {
        console.error("加载存档失败:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [gameType]
  );

  // 删除指定存档
  const handleDeleteSave = useCallback(
    async (saveId: string): Promise<boolean> => {
      try {
        await deleteSave(gameType, saveId);
        // 如果删除的是当前游戏的存档，清除currentGameId
        if (saveId === currentGameId) {
          console.log(`[useSaveGame] 删除的是当前游戏存档，清除currentGameId`);
          setCurrentGameId(null);
        }
        await refreshSaves();
        return true;
      } catch (error) {
        console.error("删除存档失败:", error);
        return false;
      }
    },
    [gameType, refreshSaves, currentGameId]
  );

  // 清空所有存档
  const handleClearAllSaves = useCallback(async (): Promise<boolean> => {
    try {
      await clearAllSaves(gameType);
      console.log(`[useSaveGame] 清空所有存档，重置currentGameId`);
      setCurrentGameId(null);
      await refreshSaves();
      return true;
    } catch (error) {
      console.error("清空存档失败:", error);
      return false;
    }
  }, [gameType, refreshSaves]);

  // 检查是否可以保存游戏
  const checkCanSave = useCallback(
    (gameState: any): boolean => {
      return canSaveGame(gameState, gameType);
    },
    [gameType]
  );

  return {
    savedGames,
    isSaving,
    isLoading,
    saveGame: handleSaveGame,
    loadGame: handleLoadGame,
    deleteSave: handleDeleteSave,
    clearAllSaves: handleClearAllSaves,
    refreshSaves,
    canSave: checkCanSave,
    startNewGame,
    currentGameId,
    setCurrentGameId, // 新增：允许外部设置currentGameId
  };
};
