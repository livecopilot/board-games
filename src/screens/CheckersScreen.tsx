import React, { useState } from 'react';
import {
  Box,
  Text,
  ScrollView,
  VStack,
  HStack,
  Heading,
  Button,
  Pressable,
} from 'native-base';
import { View } from 'react-native';
import Modal from 'react-native-modal';
import CheckersBoard from '../components/CheckersBoard';
import CheckersControls from '../components/CheckersControls';
import { useCheckers } from '../hooks/useCheckers';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../types/navigation';
import { AIDifficulty } from '../types';
import type { CheckersScreenProps } from '../types/navigation';
import IconFont from 'react-native-vector-icons/Ionicons';

const CheckersScreen: React.FC<CheckersScreenProps> = ({ navigation }) => {
  const {
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
    canUndo,
    getValidMoves,
  } = useCheckers();

  // 弹框状态
  const [showRules, setShowRules] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const handleBackPress = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    setShowExitDialog(false);
    navigation.goBack();
  };

  const handleCellPress = (position: { row: number; col: number }) => {
    const piece = gameState.board[position.row][position.col];
    
    if (piece && piece.player === gameState.currentPlayer) {
      // 选择棋子
      selectPiece(position);
    } else if (selectedPiece) {
      // 尝试移动到该位置
      moveTo(position);
    }
  };

  const getDifficultyText = (difficulty: any): string => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return '中等';
    }
  };

  const handleSetDifficulty = (difficulty: any) => {
    setShowSettings(false);
    setAIDifficultyLevel(difficulty);
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
          bg="rgba(255, 0, 128, 0.03)"
        />
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="30%"
          bg="rgba(0, 128, 255, 0.02)"
        />
      </Box>

      {/* 顶部栏 */}
      <HStack
        alignItems="center"
        px={5}
        py={3}
        borderBottomWidth={1}
        borderBottomColor="rgba(255, 0, 128, 0.2)"
      >
        {/* 左侧：返回按钮 */}
        <Box flex={1}>
          <Pressable
            onPress={handleBackPress}
            _pressed={{ bg: "rgba(255, 0, 128, 0.1)" }}
            borderRadius="lg"
            bg="rgba(255, 0, 128, 0.05)"
            borderWidth={1}
            borderColor="rgba(255, 0, 128, 0.3)"
            px={3}
            py={2}
            alignSelf="flex-start"
          >
            <HStack alignItems="center" space={1}>
              <IconFont name="arrow-back" size={16} color="#ff0080" />
              <Text
                color="#ff0080"
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
            跳棋
          </Heading>
        </Box>

        {/* 右侧：功能按钮 */}
        <Box flex={1}>
          <HStack space={2} justifyContent="flex-end">
            <Pressable
              onPress={() => setShowRules(true)}
              _pressed={{ bg: "rgba(255, 0, 128, 0.1)" }}
              borderRadius="lg"
              bg="rgba(255, 0, 128, 0.05)"
              borderWidth={1}
              borderColor="rgba(255, 0, 128, 0.3)"
              px={3}
              py={2}
            >
              <HStack alignItems="center" space={1}>
                <IconFont name="book" size={14} color="#ff0080" />
                <Text
                  color="#ff0080"
                  fontWeight="bold"
                  fontSize="sm"
                  fontFamily="mono"
                >
                  规则
                </Text>
              </HStack>
            </Pressable>
            <Pressable
              onPress={() => setShowTips(true)}
              _pressed={{ bg: "rgba(255, 128, 0, 0.1)" }}
              borderRadius="lg"
              bg="rgba(255, 128, 0, 0.05)"
              borderWidth={1}
              borderColor="rgba(255, 128, 0, 0.3)"
              px={3}
              py={2}
            >
              <HStack alignItems="center" space={1}>
                <IconFont name="bulb" size={14} color="#ff8000" />
                <Text
                  color="#ff8000"
                  fontWeight="bold"
                  fontSize="sm"
                  fontFamily="mono"
                >
                  建议
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
            <View style={{ marginBottom: 20, transform: [{ rotate: '180deg' }] }}>
              <HStack alignItems="flex-start" px={5} space={4} w="100%">
                {/* 对方左侧：游戏状态显示 */}
                <VStack flex={1} space={3} minH="120px" justifyContent="flex-start">
                  <Box
                    bg="rgba(255, 255, 255, 0.05)"
                    borderWidth={1}
                    borderColor="rgba(255, 0, 128, 0.3)"
                    borderRadius="lg"
                    p={4}
                    w="100%"
                    alignItems="center"
                    shadow={3}
                    mt={3}
                  >
                    {/* 游戏状态显示 */}
                    {gameState.isGameOver ? (
                      <VStack alignItems="center" space={2}>
                        <Text
                          fontSize="xl"
                          fontWeight="bold"
                          color={gameState.winner === 'black' ? '#00ff88' : gameState.winner === 'red' ? '#ff3030' : '#ffd700'}
                          fontFamily="mono"
                          letterSpacing={1}
                        >
                          {gameState.winner === 'black' ? '🎉 黑方获胜！' : 
                           gameState.winner === 'red' ? '对方获胜' : 
                           '平局'}
                        </Text>
                        <Text
                          fontSize="sm"
                          color="rgba(255, 255, 255, 0.7)"
                          fontFamily="mono"
                          textAlign="center"
                        >
                          {gameState.winner === 'black' ? '恭喜你赢得了比赛！' : 
                           gameState.winner === 'red' ? '很遗憾，你输了' : 
                           '势均力敌，不分胜负'}
                        </Text>
                      </VStack>
                    ) : (
                      <VStack alignItems="center" space={2}>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color={gameState.currentPlayer === 'black' ? '#00ff88' : 'rgba(255, 255, 255, 0.5)'}
                          fontFamily="mono"
                          letterSpacing={1}
                        >
                          {gameState.currentPlayer === 'black' ? '🎯 轮到你了！' : '⏳ 等待对方...'}
                        </Text>
                        
                        {/* 对方玩家指示器 */}
                        <VStack alignItems="center" space={1}>
                          <HStack alignItems="center" space={2}>
                            <Box
                              w="16px"
                              h="16px"
                              borderRadius="full"
                              bg="#303030"
                              borderWidth={2}
                              borderColor={gameState.currentPlayer === 'black' ? '#00ff88' : '#606060'}
                              shadow={3}
                            />
                            <Text
                              fontSize="sm"
                              color={gameState.currentPlayer === 'black' ? 'white' : 'rgba(255, 255, 255, 0.6)'}
                              fontFamily="mono"
                            >
                              黑方（对方）
                            </Text>
                          </HStack>
                          
                          {gameState.mustCapture && gameState.currentPlayer === 'black' && (
                            <Text
                              fontSize="xs"
                              color="#ff8000"
                              fontFamily="mono"
                              textAlign="center"
                            >
                              ⚡ 必须继续跳跃吃子
                            </Text>
                          )}
                        </VStack>
                      </VStack>
                    )}
                  </Box>
                </VStack>

                {/* 对方右侧：简化控制按钮 */}
                <Box flex={1} mt={3} minH="120px">
                  <HStack space={2} flexWrap="wrap" alignItems="flex-start">
                    {/* 重新开始按钮 */}
                    <Pressable
                      onPress={resetGame}
                      bg="rgba(255, 0, 128, 0.1)"
                      borderWidth={1}
                      borderColor="rgba(255, 0, 128, 0.4)"
                      borderRadius="lg"
                      px={3}
                      py={3}
                      minW="30%"
                      maxW="48%"
                      flex={1}
                      mb={2}
                      alignItems="center"
                      _pressed={{ bg: "rgba(255, 0, 128, 0.2)" }}
                      shadow={2}
                    >
                      <HStack alignItems="center" space={1}>
                        <IconFont name="refresh" size={14} color="#ff0080" />
                        <Text
                          color="#ff0080"
                          fontWeight="bold"
                          fontSize="sm"
                          fontFamily="mono"
                        >
                          重新开始
                        </Text>
                      </HStack>
                    </Pressable>

                    {/* 撤销按钮 */}
                    <Pressable
                      onPress={undoMove}
                      isDisabled={!canUndo || !!gameState.mustCapture}
                      bg={canUndo && !gameState.mustCapture ? "rgba(255, 128, 0, 0.1)" : "rgba(128, 128, 128, 0.1)"}
                      borderWidth={1}
                      borderColor={canUndo && !gameState.mustCapture ? "rgba(255, 128, 0, 0.4)" : "rgba(128, 128, 128, 0.3)"}
                      borderRadius="lg"
                      px={3}
                      py={3}
                      minW="30%"
                      maxW="48%"
                      flex={1}
                      mb={2}
                      alignItems="center"
                      _pressed={canUndo && !gameState.mustCapture ? { bg: "rgba(255, 128, 0, 0.2)" } : {}}
                      shadow={canUndo && !gameState.mustCapture ? 2 : 0}
                    >
                      <HStack alignItems="center" space={1}>
                        <IconFont name="arrow-undo" size={14} color={canUndo && !gameState.mustCapture ? "#ff8000" : "gray.500"} />
                        <Text
                          color={canUndo && !gameState.mustCapture ? "#ff8000" : "gray.500"}
                          fontWeight="bold"
                          fontSize="sm"
                          fontFamily="mono"
                        >
                          撤销
                        </Text>
                      </HStack>
                    </Pressable>
                  </HStack>
                </Box>
              </HStack>
            </View>
          )}

          <CheckersBoard
            board={gameState.board}
            onCellPress={handleCellPress}
            selectedPiece={selectedPiece}
            validMoves={getValidMoves()}
            disabled={gameState.isGameOver || isAIThinking || (isAIMode && gameState.currentPlayer === 'black')}
            lastMove={gameState.lastMove}
          />
        </Box>

        {/* 游戏控制 */}
        <CheckersControls
          currentPlayer={gameState.currentPlayer}
          winner={gameState.winner}
          isGameOver={gameState.isGameOver}
          isAIMode={isAIMode}
          isAIThinking={isAIThinking}
          canUndo={canUndo}
          onReset={resetGame}
          onUndo={undoMove}
          onToggleAI={toggleAIMode}
          mustCapture={!!gameState.mustCapture}
          showSettings={showSettings}
          onShowSettings={() => setShowSettings(true)}
          onHideSettings={() => setShowSettings(false)}
          aiDifficulty={aiDifficulty}
          onSetDifficulty={handleSetDifficulty}
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
          borderColor="rgba(255, 0, 128, 0.3)"
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
            bg="rgba(255, 0, 128, 0.1)"
            borderTopRadius="lg"
            borderBottomWidth={1}
            borderBottomColor="rgba(255, 0, 128, 0.3)"
            px={4}
            py={3}
          >
            <Text fontSize="lg" fontWeight="bold" color="#ff0080" fontFamily="mono">
              游戏规则
            </Text>
            <Pressable
              onPress={() => setShowRules(false)}
              _pressed={{ bg: "rgba(255, 0, 128, 0.1)" }}
              borderRadius="md"
              px={2}
              py={1}
            >
              <Text
                color="#ff0080"
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
                <Box w={2} h={2} borderRadius="full" bg="#ff0080" />
                <Text fontSize="sm" color="white" flex={1}>
                  8×8棋盘，红方和黑方各有12个棋子
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="#ff0080" />
                <Text fontSize="sm" color="white" flex={1}>
                  棋子只能在深色方格上斜向移动
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="#ff0080" />
                <Text fontSize="sm" color="white" flex={1}>
                  可以跳过对方棋子吃掉它们，必须连续跳跃
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="#ff0080" />
                <Text fontSize="sm" color="white" flex={1}>
                  到达对方底线的棋子升级为王，可向四个方向移动
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="#ff0080" />
                <Text fontSize="sm" color="white" flex={1}>
                  消灭对方所有棋子或使对方无法移动即获胜
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="#ff0080" />
                <Text fontSize="sm" color="white" flex={1}>
                  支持人机对战和双人对战模式
                </Text>
              </HStack>
            </VStack>
          </ScrollView>

          {/* 底部按钮 */}
          <Box
            bg="rgba(255, 0, 128, 0.05)"
            borderBottomRadius="lg"
            borderTopWidth={1}
            borderTopColor="rgba(255, 0, 128, 0.2)"
            p={4}
          >
            <Button
              onPress={() => setShowRules(false)}
              bg="#ff0080"
              _text={{ color: "white", fontWeight: "bold" }}
              _pressed={{ bg: "#cc0066" }}
              w="100%"
            >
              知道了
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* 亲子建议弹框 */}
      <Modal
        isVisible={showTips}
        onBackdropPress={() => setShowTips(false)}
        onBackButtonPress={() => setShowTips(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.7}
        style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
      >
        <Box
          bg="#000015"
          borderColor="rgba(255, 128, 0, 0.3)"
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
            bg="rgba(255, 128, 0, 0.1)"
            borderTopRadius="lg"
            borderBottomWidth={1}
            borderBottomColor="rgba(255, 128, 0, 0.3)"
            px={4}
            py={3}
          >
            <Text fontSize="lg" fontWeight="bold" color="#ff8000" fontFamily="mono">
              亲子游戏建议
            </Text>
            <Pressable
              onPress={() => setShowTips(false)}
              _pressed={{ bg: "rgba(255, 128, 0, 0.1)" }}
              borderRadius="md"
              px={2}
              py={1}
            >
              <Text
                color="#ff8000"
                fontWeight="bold"
                fontSize="sm"
                fontFamily="mono"
              >
                关闭
              </Text>
            </Pressable>
          </HStack>

          {/* 内容 */}
          <VStack space={3} p={4}>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">🎯</Text>
              <Text fontSize="sm" color="white" flex={1}>
                跳棋能培养孩子的战略思维和前瞻性
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">🤖</Text>
              <Text fontSize="sm" color="white" flex={1}>
                AI模式适合孩子练习和学习基本策略
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">👥</Text>
              <Text fontSize="sm" color="white" flex={1}>
                双人模式增进亲子互动，培养竞技精神
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">🔄</Text>
              <Text fontSize="sm" color="white" flex={1}>
                使用撤销功能帮助孩子理解错误和改正
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">⚡</Text>
              <Text fontSize="sm" color="white" flex={1}>
                连续跳跃是关键技巧，教导孩子寻找最佳路线
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">👑</Text>
              <Text fontSize="sm" color="white" flex={1}>
                让孩子了解棋子升王的重要性和战略价值
              </Text>
            </HStack>
          </VStack>

          {/* 底部按钮 */}
          <Box
            bg="rgba(255, 128, 0, 0.05)"
            borderBottomRadius="lg"
            borderTopWidth={1}
            borderTopColor="rgba(255, 128, 0, 0.2)"
            p={4}
          >
            <Button
              onPress={() => setShowTips(false)}
              bg="#ff8000"
              _text={{ color: "black", fontWeight: "bold" }}
              _pressed={{ bg: "#cc6600" }}
              w="100%"
            >
              知道了
            </Button>
          </Box>
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
          borderColor="rgba(255, 0, 128, 0.3)"
          borderWidth={1}
          borderRadius="lg"
          w="85%"
          shadow={5}
        >
          {/* 头部 */}
          <HStack
            justifyContent="space-between"
            alignItems="center"
            bg="rgba(255, 0, 128, 0.1)"
            borderTopRadius="lg"
            borderBottomWidth={1}
            borderBottomColor="rgba(255, 0, 128, 0.3)"
            px={4}
            py={3}
          >
            <Text fontSize="lg" fontWeight="bold" color="#ff0080" fontFamily="mono">
              确认退出
            </Text>
            <Pressable
              onPress={() => setShowExitDialog(false)}
              _pressed={{ bg: "rgba(255, 0, 128, 0.1)" }}
              borderRadius="md"
              px={2}
              py={1}
            >
              <Text
                color="#ff0080"
                fontWeight="bold"
                fontSize="sm"
                fontFamily="mono"
              >
                关闭
              </Text>
            </Pressable>
          </HStack>

          {/* 内容 */}
          <Box p={4}>
            <Text color="white" fontSize="md" textAlign="center">
              确定要退出游戏返回主菜单吗？当前游戏进度将会丢失。
            </Text>
          </Box>

          {/* 底部按钮 */}
          <Box
            bg="rgba(255, 0, 128, 0.05)"
            borderBottomRadius="lg"
            borderTopWidth={1}
            borderTopColor="rgba(255, 0, 128, 0.2)"
            p={4}
          >
            <HStack space={2}>
              <Button
                variant="ghost"
                flex={1}
                onPress={() => setShowExitDialog(false)}
                _text={{ color: "gray.400" }}
              >
                取消
              </Button>
              <Button
                bg="#ff0080"
                flex={1}
                onPress={confirmExit}
                _text={{ color: "white", fontWeight: "bold" }}
                _pressed={{ bg: "#cc0066" }}
              >
                确认退出
              </Button>
            </HStack>
          </Box>
        </Box>
      </Modal>

    </Box>
  );
};

export default CheckersScreen; 