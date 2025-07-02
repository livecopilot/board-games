import AsyncStorage from "@react-native-async-storage/async-storage";

// 存档类型
export type GameType = "checkers" | "chess" | "gomoku" | "tictactoe";

// 存档数据结构
export interface SavedGame {
  id: string;
  gameType: GameType;
  gameState: any; // 游戏状态，根据不同游戏类型会有不同的结构
  timestamp: number;
  isAIMode: boolean;
  aiDifficulty?: string;
  displayName: string; // 显示名称，格式：年月日时分秒
}

// 最大存档数量
const MAX_SAVES = 5;

// 生成存档键
const getSaveKey = (gameType: GameType) => `game_saves_${gameType}`;

// 生成唯一ID
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 格式化时间显示
const formatDisplayName = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// 保存游戏存档
export const saveGame = async (
  gameType: GameType,
  gameState: any,
  isAIMode: boolean,
  aiDifficulty?: string,
  gameId?: string // 新增：游戏ID，用于更新现有存档
): Promise<string> => {
  // 返回存档ID
  try {
    console.log(`[存档] 开始保存 ${gameType} 游戏，gameId: ${gameId}`);

    const key = getSaveKey(gameType);
    const existingSaves = await getSavedGames(gameType);

    let saveId: string;
    let updatedSaves: SavedGame[];

    if (gameId) {
      // 更新现有存档
      console.log(`[存档] 更新现有存档: ${gameId}`);
      const existingIndex = existingSaves.findIndex((save) => save.id === gameId);

      if (existingIndex !== -1) {
        // 找到现有存档，更新它
        const updatedSave: SavedGame = {
          ...existingSaves[existingIndex],
          gameState: JSON.parse(JSON.stringify(gameState)), // 深度复制
          timestamp: Date.now(),
          isAIMode,
          aiDifficulty,
          displayName: formatDisplayName(Date.now()),
        };

        updatedSaves = [...existingSaves];
        updatedSaves[existingIndex] = updatedSave;

        // 将更新的存档移到列表开头
        updatedSaves = [updatedSave, ...updatedSaves.filter((_, index) => index !== existingIndex)];
        saveId = gameId;
      } else {
        // 未找到现有存档，创建新的
        console.log(`[存档] 未找到现有存档，创建新存档`);
        saveId = generateId();
        const newSave: SavedGame = {
          id: saveId,
          gameType,
          gameState: JSON.parse(JSON.stringify(gameState)),
          timestamp: Date.now(),
          isAIMode,
          aiDifficulty,
          displayName: formatDisplayName(Date.now()),
        };

        updatedSaves = [newSave, ...existingSaves];
      }
    } else {
      // 创建新存档
      console.log(`[存档] 创建新存档`);
      saveId = generateId();
      const newSave: SavedGame = {
        id: saveId,
        gameType,
        gameState: JSON.parse(JSON.stringify(gameState)),
        timestamp: Date.now(),
        isAIMode,
        aiDifficulty,
        displayName: formatDisplayName(Date.now()),
      };

      updatedSaves = [newSave, ...existingSaves];
    }

    // 保持最多5个存档
    const limitedSaves = updatedSaves.slice(0, MAX_SAVES);

    await AsyncStorage.setItem(key, JSON.stringify(limitedSaves));
    console.log(`[存档] 保存成功，存档ID: ${saveId}`);

    return saveId;
  } catch (error) {
    console.error("保存游戏失败:", error);
    throw new Error("保存游戏失败");
  }
};

// 获取游戏存档列表
export const getSavedGames = async (gameType: GameType): Promise<SavedGame[]> => {
  try {
    const key = getSaveKey(gameType);
    const savedData = await AsyncStorage.getItem(key);

    if (!savedData) {
      return [];
    }

    const saves: SavedGame[] = JSON.parse(savedData);
    // 按时间倒序排序
    return saves.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("读取存档失败:", error);
    return [];
  }
};

// 加载特定存档
export const loadGame = async (gameType: GameType, saveId: string): Promise<SavedGame | null> => {
  try {
    const saves = await getSavedGames(gameType);
    return saves.find((save) => save.id === saveId) || null;
  } catch (error) {
    console.error("加载存档失败:", error);
    return null;
  }
};

// 删除存档
export const deleteSave = async (gameType: GameType, saveId: string): Promise<void> => {
  try {
    const key = getSaveKey(gameType);
    const saves = await getSavedGames(gameType);
    const filteredSaves = saves.filter((save) => save.id !== saveId);

    await AsyncStorage.setItem(key, JSON.stringify(filteredSaves));
  } catch (error) {
    console.error("删除存档失败:", error);
    throw new Error("删除存档失败");
  }
};

// 清空所有存档
export const clearAllSaves = async (gameType: GameType): Promise<void> => {
  try {
    const key = getSaveKey(gameType);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("清空存档失败:", error);
    throw new Error("清空存档失败");
  }
};

// 检查是否可以保存（游戏是否有进度）
export const canSaveGame = (gameState: any, gameType: GameType): boolean => {
  let canSave = false;

  switch (gameType) {
    case "checkers":
      // 跳棋：检查是否有移动发生（有lastMove或棋子总数少于24个）
      if (gameState.lastMove) {
        canSave = true;
        console.log(`[canSaveGame] 跳棋 - 有lastMove，可以保存`);
      } else {
        // 检查棋盘上的棋子总数是否少于24个（说明有棋子被吃掉）
        let totalPieces = 0;
        for (let row = 0; row < gameState.board.length; row++) {
          for (let col = 0; col < gameState.board[row].length; col++) {
            if (gameState.board[row][col]) {
              totalPieces++;
            }
          }
        }
        canSave = totalPieces < 24;
        console.log(`[canSaveGame] 跳棋 - 棋子总数: ${totalPieces}, canSave: ${canSave}`);
      }
      break;

    case "chess":
      // 中国象棋：检查是否有移动历史
      canSave = gameState.moveHistory && gameState.moveHistory.length > 0;
      console.log(`[canSaveGame] 中国象棋 - 移动历史长度: ${gameState.moveHistory?.length || 0}, canSave: ${canSave}`);
      break;

    case "gomoku":
      // 五子棋：检查是否有移动历史
      canSave = gameState.moveHistory && gameState.moveHistory.length > 0;
      console.log(`[canSaveGame] 五子棋 - 移动历史长度: ${gameState.moveHistory?.length || 0}, canSave: ${canSave}`);
      break;

    case "tictactoe":
      // 井字棋：检查棋盘是否有棋子
      canSave = gameState.board && gameState.board.some((row: any[]) => row.some((cell: any) => cell !== null));
      console.log(`[canSaveGame] 井字棋 - 棋盘有棋子: ${canSave}`);
      break;

    default:
      canSave = false;
      console.log(`[canSaveGame] 未知游戏类型: ${gameType}`);
  }

  console.log(`[canSaveGame] ${gameType} 最终结果: ${canSave}`);
  return canSave;
};

// 检查是否是初始跳棋棋盘
const isInitialCheckersBoard = (board: any[][]): boolean => {
  // 计算总棋子数量
  let totalPieces = 0;
  let redPieces = 0;
  let blackPieces = 0;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const piece = board[row][col];
      if (piece) {
        totalPieces++;
        if (piece.player === "red") redPieces++;
        if (piece.player === "black") blackPieces++;
      }
    }
  }

  console.log(`[isInitialCheckersBoard] 总棋子: ${totalPieces}, 红棋: ${redPieces}, 黑棋: ${blackPieces}`);

  // 初始跳棋应该有24个棋子（每方12个）
  // 如果棋子数量不是24，说明已经有棋子被吃掉，棋盘发生了变化
  const isInitial = totalPieces === 24 && redPieces === 12 && blackPieces === 12;
  console.log(`[isInitialCheckersBoard] 是否为初始棋盘: ${isInitial}`);

  return isInitial;
};
