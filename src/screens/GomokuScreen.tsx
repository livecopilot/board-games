import React, { useState } from 'react';
import {
  Box,
  Text,
  ScrollView,
  VStack,
  HStack,
  Heading,
  Pressable,
} from 'native-base';
import Modal from 'react-native-modal';
import GomokuBoard from '../components/GomokuBoard';
import GomokuControls from '../components/GomokuControls';
import { useGomoku } from '../hooks/useGomoku';
import { AIDifficulty } from '../types';
import type { GomokuScreenProps } from '../types/navigation';
import IconFont from 'react-native-vector-icons/Ionicons';
import { View } from 'react-native';

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
    canUndo,
  } = useGomoku();

  // 弹框状态
  const [showRules, setShowRules] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // 设置默认困难难度
  React.useEffect(() => {
    setAIDifficultyLevel(AIDifficulty.HARD);
  }, []);

  const handleBackPress = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    navigation.goBack();
  };

  const handleCellPress = (position: { row: number; col: number }) => {
    placePiece(position);
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
              onPress={() => setShowRules(true)}
              _pressed={{ bg: "rgba(139, 69, 19, 0.3)" }}
              borderRadius="lg"
              bg="rgba(139, 69, 19, 0.2)"
              borderWidth={2}
              borderColor="rgba(139, 69, 19, 0.6)"
              px={3}
              py={2}
              shadow={3}
            >
              <HStack alignItems="center" space={1}>
                <IconFont name="book" size={14} color="rgba(255, 255, 255, 0.9)" />
                <Text
                  color="rgba(255, 255, 255, 0.9)"
                  fontWeight="bold"
                  fontSize="sm"
                  fontFamily="mono"
                >
                  规则
                </Text>
              </HStack>
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
                {/* 对方左侧：游戏状态显示 */}
                <VStack flex={1} space={2} minH="90px" justifyContent="flex-start">
                  <Box
                    bg="rgba(139, 69, 19, 0.1)"
                    borderWidth={2}
                    borderColor="rgba(139, 69, 19, 0.3)"
                    borderRadius="lg"
                    p={3}
                    w="100%"
                    alignItems="center"
                    shadow={3}
                    mt={2}
                  >
                    {/* 游戏状态显示 */}
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
                          {gameState.winner === 'white' ? '🎉 白方获胜！' : 
                           gameState.winner === 'black' ? '对方获胜' : 
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
                          {gameState.currentPlayer === 'white' ? '🎯 轮到你了！' : '⏳ 等待对方...'}
                        </Text>
                        
                        {/* 当前玩家指示器 */}
                        {!gameState.isGameOver && (
                          <VStack alignItems="center" mt={0.5} space={1}>
                            <HStack alignItems="center" space={2}>
                              <Box
                                w="14px"
                                h="14px"
                                borderRadius="full"
                                bg="#ffffff"
                                borderWidth={2}
                                borderColor={gameState.currentPlayer === 'white' ? '#00ff88' : '#e0e0e0'}
                                shadow={2}
                              />
                              <Text
                                fontSize="xs"
                                color="white"
                                fontFamily="mono"
                              >
                                白棋（对方）
                              </Text>
                            </HStack>
                            <Text
                              fontSize="xs"
                              color="rgba(255, 255, 255, 0.6)"
                              fontFamily="mono"
                              textAlign="center"
                            >
                              本地双人对战
                            </Text>
                          </VStack>
                        )}
                      </VStack>
                    )}
                  </Box>
                </VStack>

                {/* 对方右侧：简化控制按钮 */}
                <VStack flex={1} mt={2} minH="90px" space={2}>
                  {/* 操作按钮行 */}
                  <HStack space={2} w="100%">
                    {/* 重新开始按钮 */}
                    <Pressable
                      onPress={resetGame}
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
                      onPress={undoMove}
                      isDisabled={!canUndo}
                      bg={canUndo ? "rgba(255, 128, 0, 0.2)" : "rgba(80, 80, 80, 0.15)"}
                      borderWidth={1}
                      borderColor={canUndo ? "rgba(255, 128, 0, 0.7)" : "rgba(80, 80, 80, 0.4)"}
                      borderRadius="lg"
                      px={2}
                      py={2}
                      flex={1}
                      alignItems="center"
                      _pressed={canUndo ? { bg: "rgba(255, 128, 0, 0.3)" } : {}}
                      shadow={canUndo ? 2 : 0}
                      opacity={canUndo ? 1 : 0.5}
                    >
                      <HStack alignItems="center" space={1}>
                        <IconFont name="arrow-undo" size={12} color={canUndo ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 120, 120, 0.7)"} />
                        <Text
                          color={canUndo ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 120, 120, 0.7)"}
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
          onReset={resetGame}
          onUndo={undoMove}
          onToggleAI={toggleAIMode}
        />
      </ScrollView>

      {/* 游戏规则弹框 */}
      <Modal
        isVisible={showRules}
        onBackdropPress={() => setShowRules(false)}
        onBackButtonPress={() => setShowRules(false)}
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
        onBackButtonPress={() => setShowExitDialog(false)}
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
              确定要退出当前游戏吗？进度将不会保存。
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
    </Box>
  );
};

export default GomokuScreen; 