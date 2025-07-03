import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Text,
  ScrollView,
  VStack,
  HStack,
  Heading,
  Pressable,
  Button,
} from 'native-base';
import { Platform } from 'react-native';
import Modal from 'react-native-modal';
import GomokuBoard from '../components/GomokuBoard';
import GomokuControls from '../components/GomokuControls';
import { useGomoku } from '../hooks/useGomoku';
import { AIDifficulty } from '../types';
import type { GomokuScreenProps } from '../types/navigation';
import IconFont from 'react-native-vector-icons/Ionicons';
import { View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useSaveGame } from '../hooks/useSaveGame';
import SaveGameModal from '../components/SaveGameModal';

const GomokuScreen: React.FC<GomokuScreenProps> = ({ navigation }) => {
  const {
    gameState,
    isAIMode,
    isAIThinking,
    placePiece,
    resetGame,
    toggleAIMode,
    setAIDifficultyLevel,
    undoMove,
    undoMoveForPlayer,
    canUndo,
    canUndoForPlayer,
    restoreGameState,
    aiDifficulty,
  } = useGomoku();

  // 存档相关
  const {
    savedGames,
    isSaving,
    isLoading: isSaveLoading,
    saveGame: handleSaveGame,
    loadGame: handleLoadGame,
    refreshSaves,
    canSave,
    startNewGame,
    currentGameId,
  } = useSaveGame('gomoku');

  // 弹框状态
  const [showRules, setShowRules] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  // 使用 ref 来跟踪确认退出状态，避免闭包问题
  const isConfirmedExitRef = useRef(false);

  // 添加组件挂载状态跟踪
  const isMountedRef = useRef(true);

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 设置默认困难难度
  React.useEffect(() => {
    setAIDifficultyLevel(AIDifficulty.HARD);
  }, []);

  // 拦截所有返回操作（包括侧滑返回）
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // 如果已经确认退出，允许正常返回
      if (isConfirmedExitRef.current) {
        return;
      }
      
      // 阻止默认行为
      e.preventDefault();
      
      // 显示退出确认弹框
      if (isMountedRef.current) {
        setShowExitDialog(true);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleBackPress = () => {
    if (isMountedRef.current) {
      setShowExitDialog(true);
    }
  };

  const confirmExit = () => {
    if (!isMountedRef.current) return;
    
    setShowExitDialog(false);
    isConfirmedExitRef.current = true;
    
    // 立即执行导航
    navigation.dispatch(CommonActions.goBack());
  };

  // 自动保存游戏状态
  const autoSaveGame = React.useCallback((isFirstMove: boolean = false) => {
    console.log(`[GomokuScreen] autoSaveGame called, isFirstMove: ${isFirstMove}, currentGameId: ${currentGameId}`);
    if (canSave(gameState)) {
      // 如果是第一次移动或者没有当前游戏ID，则创建新存档
      const isNewGame = isFirstMove || !currentGameId;
      handleSaveGame(gameState, isAIMode, aiDifficulty, isNewGame);
    }
  }, [gameState, isAIMode, aiDifficulty, canSave, handleSaveGame, currentGameId]);

  // 监听游戏状态变化，自动保存
  React.useEffect(() => {
    // 只有在有移动发生时才保存
    if (gameState.moveHistory && gameState.moveHistory.length > 0 && canSave(gameState)) {
      // 延迟保存，确保游戏状态已完全更新
      const timer = setTimeout(() => {
        const isFirstMove = !currentGameId && gameState.moveHistory.length === 1;
        console.log(`[GomokuScreen] 检测到游戏状态变化，自动保存，isFirstMove: ${isFirstMove}, 移动数: ${gameState.moveHistory.length}`);
        autoSaveGame(isFirstMove);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [gameState.moveHistory, autoSaveGame, currentGameId, canSave]);

  // 处理存档加载
  const onLoadSave = React.useCallback(async (saveId: string) => {
    const savedGame = await handleLoadGame(saveId);
    if (savedGame) {
      console.log(`[GomokuScreen] 加载存档成功，恢复游戏状态`);
      restoreGameState(
        savedGame.gameState,
        savedGame.isAIMode,
        savedGame.aiDifficulty as AIDifficulty
      );
    }
  }, [handleLoadGame, restoreGameState]);

  // 重置游戏并开始新的存档
  const handleResetGame = React.useCallback(() => {
    console.log(`[GomokuScreen] 重置游戏并开始新存档`);
    startNewGame();
    resetGame();
  }, [startNewGame, resetGame]);

  const handleCellPress = (position: { row: number; col: number }) => {
    const success = placePiece(position);
    if (success) {
      console.log(`[GomokuScreen] 落子成功`);
      // 落子成功后，useEffect会自动处理保存
    }
  };

  return (
    <Box flex={1} bg="#000015" safeArea>
      {/* 科技风格背景 */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="#000015" zIndex={-1}>
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="50%"
          bg="rgba(139, 69, 19, 0.03)"
        />
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="30%"
          bg="rgba(255, 128, 0, 0.02)"
        />
      </Box>

      {/* 顶部栏 */}
      <HStack
        alignItems="center"
        px={5}
        py={3}
        borderBottomWidth={1}
        borderBottomColor="rgba(139, 69, 19, 0.2)"
      >
        {/* 左侧：返回按钮 */}
        <Box flex={1}>
          <Pressable
            onPress={handleBackPress}
            _pressed={{ bg: "rgba(139, 69, 19, 0.3)" }}
            borderRadius="lg"
            bg="rgba(139, 69, 19, 0.2)"
            borderWidth={2}
            borderColor="rgba(139, 69, 19, 0.6)"
            px={3}
            py={2}
            alignSelf="flex-start"
            shadow={3}
          >
            <HStack alignItems="center" space={1}>
              <IconFont name="arrow-back" size={16} color="rgba(255, 255, 255, 0.9)" />
              <Text
                color="rgba(255, 255, 255, 0.9)"
                fontWeight="bold"
                fontSize="sm"
                fontFamily="mono"
              >
                返回
              </Text>
            </HStack>
          </Pressable>
        </Box>

        {/* 中间：标题 */}
        <Box flex={1} alignItems="center">
          <Heading
            size="lg"
            color="white"
            fontFamily="mono"
            fontWeight="300"
            letterSpacing={1}
          >
            五子棋
          </Heading>
        </Box>

        {/* 右侧：功能按钮 */}
        <Box flex={1}>
          <HStack space={2} justifyContent="flex-end">
            <Pressable
              onPress={() => setShowSaveModal(true)}
              _pressed={{ bg: "rgba(139, 69, 19, 0.3)" }}
              borderRadius="lg"
              bg="rgba(139, 69, 19, 0.2)"
              borderWidth={2}
              borderColor="rgba(139, 69, 19, 0.6)"
              px={2}
              py={2}
              shadow={3}
            >
              <IconFont name="archive" size={16} color="rgba(255, 255, 255, 0.9)" />
            </Pressable>
            <Pressable
              onPress={() => setShowRules(true)}
              _pressed={{ bg: "rgba(139, 69, 19, 0.3)" }}
              borderRadius="lg"
              bg="rgba(139, 69, 19, 0.2)"
              borderWidth={2}
              borderColor="rgba(139, 69, 19, 0.6)"
              px={2}
              py={2}
              shadow={3}
            >
              <IconFont name="book" size={16} color="rgba(255, 255, 255, 0.9)" />
            </Pressable>
          </HStack>
        </Box>
      </HStack>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {/* 游戏棋盘 */}
        <Box alignItems="center" mb={5}>
          {/* 对方控制器（双人模式下显示） */}
          {!isAIMode && (
            <View style={{ marginBottom: 15, transform: [{ rotate: '180deg' }] }}>
              <HStack alignItems="flex-start" px={4} space={3} w="100%">
                {/* 白方左侧：游戏状态显示 */}
                <VStack flex={1} space={2} minH="90px" justifyContent="flex-start">
                  <Box
                    bg={gameState.currentPlayer === 'white' ? "rgba(139, 69, 19, 0.3)" : "rgba(139, 69, 19, 0.05)"}
                    borderWidth={2}
                    borderColor={gameState.currentPlayer === 'white' ? "rgba(139, 69, 19, 0.8)" : "rgba(139, 69, 19, 0.2)"}
                    borderRadius="lg"
                    p={3}
                    w="100%"
                    alignItems="center"
                    shadow={gameState.currentPlayer === 'white' ? 5 : 2}
                    mt={2}
                  >
                    {/* 游戏状态显示 - 从白方视角 */}
                    {gameState.isGameOver ? (
                      <VStack alignItems="center" space={1}>
                        <Text
                          fontSize="md"
                          fontWeight="bold"
                          color={gameState.winner === 'white' ? '#00ff88' : gameState.winner === 'black' ? '#ffffff' : '#ffd700'}
                          fontFamily="mono"
                          letterSpacing={1}
                          textAlign="center"
                          numberOfLines={2}
                        >
                          {gameState.winner === 'white' ? '🎉 我方获胜！' : 
                           gameState.winner === 'black' ? '😔 对方获胜' : 
                           '🤝 平局'}
                        </Text>
                        <Text
                          fontSize="xs"
                          color="rgba(255, 255, 255, 0.7)"
                          fontFamily="mono"
                          textAlign="center"
                        >
                          {gameState.winner === 'white' ? '恭喜你赢得了比赛！' : 
                           gameState.winner === 'black' ? '很遗憾，你输了' : 
                           '势均力敌，不分胜负'}
                        </Text>
                      </VStack>
                    ) : (
                      <VStack alignItems="center" space={1}>
                        <Text
                          fontSize="md"
                          fontWeight="bold"
                          color={gameState.currentPlayer === 'white' ? '#00ff88' : '#ffffff'}
                          fontFamily="mono"
                          letterSpacing={1}
                          textAlign="center"
                          numberOfLines={2}
                        >
                          {gameState.currentPlayer === 'white' ? '🎯 轮到我方了！' : '⏳ 等待对方...'}
                        </Text>
                        
                        <Text
                          fontSize="xs"
                          color="white"
                          fontFamily="mono"
                          textAlign="center"
                        >
                          白棋（我方）
                        </Text>
                      </VStack>
                    )}
                  </Box>
                </VStack>

                {/* 白方右侧：简化控制按钮 */}
                <VStack flex={1} mt={2} minH="90px" space={2}>
                  {/* 操作按钮行 */}
                  <HStack space={2} w="100%">
                    {/* 重新开始按钮 */}
                    <Pressable
                      onPress={handleResetGame}
                      bg="rgba(128, 0, 255, 0.2)"
                      borderWidth={1}
                      borderColor="rgba(128, 0, 255, 0.6)"
                      borderRadius="lg"
                      px={2}
                      py={2}
                      flex={1}
                      alignItems="center"
                      _pressed={{ bg: "rgba(128, 0, 255, 0.3)" }}
                      shadow={2}
                    >
                      <HStack alignItems="center" space={1}>
                        <IconFont name="refresh" size={12} color="rgba(255, 255, 255, 0.9)" />
                        <Text
                          color="rgba(255, 255, 255, 0.9)"
                          fontWeight="bold"
                          fontSize="xs"
                          fontFamily="mono"
                        >
                          重新开始
                        </Text>
                      </HStack>
                    </Pressable>

                    {/* 撤销按钮 */}
                    <Pressable
                      onPress={() => undoMoveForPlayer('white')}
                      isDisabled={!canUndoForPlayer('white')}
                      bg={canUndoForPlayer('white') ? "rgba(255, 128, 0, 0.2)" : "rgba(80, 80, 80, 0.15)"}
                      borderWidth={1}
                      borderColor={canUndoForPlayer('white') ? "rgba(255, 128, 0, 0.7)" : "rgba(80, 80, 80, 0.4)"}
                      borderRadius="lg"
                      px={2}
                      py={2}
                      flex={1}
                      alignItems="center"
                      _pressed={canUndoForPlayer('white') ? { bg: "rgba(255, 128, 0, 0.3)" } : {}}
                      shadow={canUndoForPlayer('white') ? 2 : 0}
                      opacity={canUndoForPlayer('white') ? 1 : 0.5}
                    >
                      <HStack alignItems="center" space={1}>
                        <IconFont name="arrow-undo" size={12} color={canUndoForPlayer('white') ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 120, 120, 0.7)"} />
                        <Text
                          color={canUndoForPlayer('white') ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 120, 120, 0.7)"}
                          fontWeight="bold"
                          fontSize="xs"
                          fontFamily="mono"
                        >
                          悔棋
                        </Text>
                      </HStack>
                    </Pressable>
                  </HStack>
                </VStack>
              </HStack>
            </View>
          )}

          <GomokuBoard
            board={gameState.board}
            onCellPress={handleCellPress}
            disabled={gameState.isGameOver || isAIThinking || (isAIMode && gameState.currentPlayer === 'white')}
            lastMove={gameState.lastMove}
            isAIMode={isAIMode}
          />
        </Box>

        {/* 游戏控制 */}
        <GomokuControls
          currentPlayer={gameState.currentPlayer}
          winner={gameState.winner}
          isGameOver={gameState.isGameOver}
          isAIMode={isAIMode}
          isAIThinking={isAIThinking}
          canUndo={canUndo}
          canUndoForPlayer={canUndoForPlayer}
          onReset={handleResetGame}
          onUndo={undoMove}
          onUndoForPlayer={undoMoveForPlayer}
          onToggleAI={toggleAIMode}
        />
      </ScrollView>

      {/* 游戏规则弹框 */}
      <Modal
        isVisible={showRules}
        onBackdropPress={() => setShowRules(false)}
        {...(Platform.OS === 'android' && { onBackButtonPress: () => setShowRules(false) })}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.7}
        style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
      >
        <Box
          bg="#000015"
          borderColor="rgba(139, 69, 19, 0.3)"
          borderWidth={1}
          borderRadius="lg"
          w="90%"
          maxH="80%"
          shadow={5}
        >
          {/* 头部 */}
          <HStack
            justifyContent="space-between"
            alignItems="center"
            bg="rgba(139, 69, 19, 0.1)"
            borderTopRadius="lg"
            borderBottomWidth={1}
            borderBottomColor="rgba(139, 69, 19, 0.3)"
            px={4}
            py={3}
          >
            <Text fontSize="lg" fontWeight="bold" color="rgba(139, 69, 19, 0.9)" fontFamily="mono">
              游戏规则
            </Text>
            <Pressable
              onPress={() => setShowRules(false)}
              _pressed={{ bg: "rgba(139, 69, 19, 0.1)" }}
              borderRadius="md"
              px={2}
              py={1}
            >
              <Text
                color="rgba(139, 69, 19, 0.9)"
                fontWeight="bold"
                fontSize="sm"
                fontFamily="mono"
              >
                关闭
              </Text>
            </Pressable>
          </HStack>

          {/* 内容 */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={3} p={4}>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="rgba(139, 69, 19, 0.9)" />
                <Text fontSize="sm" color="white" flex={1}>
                  15×15棋盘，黑棋先行，白棋后手
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="rgba(139, 69, 19, 0.9)" />
                <Text fontSize="sm" color="white" flex={1}>
                  在棋盘交叉点落子，不能悔棋
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="rgba(139, 69, 19, 0.9)" />
                <Text fontSize="sm" color="white" flex={1}>
                  横、竖、斜任一方向连成5子即获胜
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="rgba(139, 69, 19, 0.9)" />
                <Text fontSize="sm" color="white" flex={1}>
                  棋盘下满无人获胜则为平局
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="rgba(139, 69, 19, 0.9)" />
                <Text fontSize="sm" color="white" flex={1}>
                  支持人机对战和双人对战模式
                </Text>
              </HStack>
            </VStack>
          </ScrollView>
        </Box>
      </Modal>

      {/* 退出确认弹框 */}
      <Modal
        isVisible={showExitDialog}
        onBackdropPress={() => setShowExitDialog(false)}
        {...(Platform.OS === 'android' && { onBackButtonPress: () => setShowExitDialog(false) })}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.7}
        style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
      >
        <Box
          bg="#000015"
          borderColor="rgba(139, 69, 19, 0.3)"
          borderWidth={1}
          borderRadius="lg"
          w="85%"
          shadow={5}
        >
          <HStack
            justifyContent="space-between"
            alignItems="center"
            bg="rgba(139, 69, 19, 0.1)"
            borderTopRadius="lg"
            borderBottomWidth={1}
            borderBottomColor="rgba(139, 69, 19, 0.3)"
            px={4}
            py={3}
          >
            <Text fontSize="lg" fontWeight="bold" color="rgba(139, 69, 19, 0.9)" fontFamily="mono">
              退出游戏
            </Text>
            <Pressable
              onPress={() => setShowExitDialog(false)}
              _pressed={{ bg: "rgba(139, 69, 19, 0.1)" }}
              borderRadius="md"
              px={2}
              py={1}
            >
              <Text
                color="rgba(139, 69, 19, 0.9)"
                fontWeight="bold"
                fontSize="sm"
                fontFamily="mono"
              >
                关闭
              </Text>
            </Pressable>
          </HStack>

          <Box p={4}>
            <Text color="white" fontSize="md" textAlign="center">
              确定要退出游戏返回主菜单吗？
            </Text>
          </Box>

          <Box
            bg="rgba(139, 69, 19, 0.05)"
            borderBottomRadius="lg"
            borderTopWidth={1}
            borderTopColor="rgba(139, 69, 19, 0.2)"
            p={4}
          >
            <HStack space={2}>
              <Pressable
                flex={1}
                onPress={() => setShowExitDialog(false)}
                bg="rgba(128, 128, 128, 0.2)"
                borderWidth={2}
                borderColor="rgba(128, 128, 128, 0.5)"
                borderRadius="lg"
                py={3}
                alignItems="center"
                _pressed={{ bg: "rgba(128, 128, 128, 0.3)" }}
                shadow={2}
              >
                <Text color="rgba(255, 255, 255, 0.9)" fontWeight="bold" fontFamily="mono">
                  取消
                </Text>
              </Pressable>
              <Pressable
                flex={1}
                onPress={confirmExit}
                bg="rgba(139, 69, 19, 0.3)"
                borderWidth={2}
                borderColor="rgba(139, 69, 19, 0.7)"
                borderRadius="lg"
                py={3}
                alignItems="center"
                _pressed={{ bg: "rgba(139, 69, 19, 0.4)" }}
                shadow={3}
              >
                <Text color="rgba(255, 255, 255, 0.9)" fontWeight="bold" fontFamily="mono">
                  确认退出
                </Text>
              </Pressable>
            </HStack>
          </Box>
        </Box>
      </Modal>

      {/* 存档管理弹框 */}
      <SaveGameModal
        isVisible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        savedGames={savedGames}
        onLoadGame={onLoadSave}
        isLoading={isSaveLoading}
        gameType="gomoku"
        themeColor="rgba(139, 69, 19, 0.9)"
      />
    </Box>
  );
};

export default GomokuScreen; 