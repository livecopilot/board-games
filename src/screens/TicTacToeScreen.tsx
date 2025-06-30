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
import Modal from 'react-native-modal';
import TicTacToeBoard from '../components/TicTacToeBoard';
import GameControls from '../components/GameControls';
import { useTicTacToe } from '../hooks/useTicTacToe';
import { AIDifficulty } from '../types';
import type { TicTacToeScreenProps } from '../types/navigation';
import IconFont from 'react-native-vector-icons/Ionicons';
import { View } from 'react-native';

const TicTacToeScreen: React.FC<TicTacToeScreenProps> = ({ navigation }) => {
  const {
    gameState,
    isAIMode,
    aiDifficulty,
    isAIThinking,
    playerMove,
    resetGame,
    toggleAIMode,
    setAIDifficultyLevel,
    undoMove,
    canUndo,
  } = useTicTacToe();

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

  const getDifficultyText = (difficulty: AIDifficulty): string => {
    switch (difficulty) {
      case AIDifficulty.EASY:
        return '简单';
      case AIDifficulty.MEDIUM:
        return '中等';
      case AIDifficulty.HARD:
        return '困难';
      default:
        return '中等';
    }
  };

  const handleSetDifficulty = (difficulty: AIDifficulty) => {
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
          bg="rgba(0, 255, 136, 0.03)"
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
        borderBottomColor="rgba(0, 255, 136, 0.2)"
      >
        {/* 左侧：返回按钮 */}
        <Box flex={1}>
          <Pressable
            onPress={handleBackPress}
            _pressed={{ bg: "rgba(0, 255, 136, 0.1)" }}
            borderRadius="lg"
            bg="rgba(0, 255, 136, 0.05)"
            borderWidth={1}
            borderColor="rgba(0, 255, 136, 0.3)"
            px={3}
            py={2}
            alignSelf="flex-start"
          >
            <HStack alignItems="center" space={1}>
              <IconFont name="arrow-back" size={16} color="#00ff88" />
              <Text
                color="#00ff88"
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
            井字棋
          </Heading>
        </Box>

        {/* 右侧：功能按钮 */}
        <Box flex={1}>
          <HStack space={2} justifyContent="flex-end">
            <Pressable
              onPress={() => setShowRules(true)}
              _pressed={{ bg: "rgba(0, 255, 136, 0.1)" }}
              borderRadius="lg"
              bg="rgba(0, 255, 136, 0.05)"
              borderWidth={1}
              borderColor="rgba(0, 255, 136, 0.3)"
              px={3}
              py={2}
            >
              <HStack alignItems="center" space={1}>
                <IconFont name="book" size={14} color="#00ff88" />
                <Text
                  color="#00ff88"
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
                    borderColor="rgba(0, 255, 136, 0.3)"
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
                          color={gameState.winner === 'O' ? '#00ff88' : gameState.winner === 'X' ? '#ff3030' : '#ffd700'}
                          fontFamily="mono"
                          letterSpacing={1}
                        >
                          {gameState.winner === 'O' ? '🎉 玩家O获胜！' : 
                           gameState.winner === 'X' ? '对方获胜' : 
                           '🤝 平局'}
                        </Text>
                        <Text
                          fontSize="sm"
                          color="rgba(255, 255, 255, 0.7)"
                          fontFamily="mono"
                          textAlign="center"
                        >
                          {gameState.winner === 'O' ? '恭喜你赢得了比赛！' : 
                           gameState.winner === 'X' ? '很遗憾，你输了' : 
                           '势均力敌，不分胜负'}
                        </Text>
                      </VStack>
                    ) : (
                      <VStack alignItems="center" space={2}>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color={gameState.currentPlayer === 'O' ? '#00ff88' : 'rgba(255, 255, 255, 0.5)'}
                          fontFamily="mono"
                          letterSpacing={1}
                        >
                          {gameState.currentPlayer === 'O' ? '🎯 轮到你了！' : '⏳ 等待对方...'}
                        </Text>
                        
                        <VStack alignItems="center" space={1}>
                          <HStack alignItems="center" space={2}>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color={gameState.currentPlayer === 'O' ? '#ff0080' : 'rgba(255, 0, 128, 0.6)'}
                            >
                              O
                            </Text>
                            <Text
                              fontSize="sm"
                              color={gameState.currentPlayer === 'O' ? 'white' : 'rgba(255, 255, 255, 0.6)'}
                              fontFamily="mono"
                            >
                              玩家 O（对方）
                            </Text>
                          </HStack>
                          <Text
                            fontSize="xs"
                            color="#00ff88"
                            fontFamily="mono"
                            textAlign="center"
                          >
                            本地双人对战
                          </Text>
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
                      isDisabled={!canUndo}
                      bg={canUndo ? "rgba(255, 128, 0, 0.1)" : "rgba(128, 128, 128, 0.1)"}
                      borderWidth={1}
                      borderColor={canUndo ? "rgba(255, 128, 0, 0.4)" : "rgba(128, 128, 128, 0.3)"}
                      borderRadius="lg"
                      px={3}
                      py={3}
                      minW="30%"
                      maxW="48%"
                      flex={1}
                      mb={2}
                      alignItems="center"
                      _pressed={canUndo ? { bg: "rgba(255, 128, 0, 0.2)" } : {}}
                      shadow={canUndo ? 2 : 0}
                    >
                      <HStack alignItems="center" space={1}>
                        <IconFont name="arrow-undo" size={14} color={canUndo ? "#ff8000" : "gray.500"} />
                        <Text
                          color={canUndo ? "#ff8000" : "gray.500"}
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

          <TicTacToeBoard
            board={gameState.board}
            onCellPress={playerMove}
            disabled={gameState.isGameOver || (isAIMode && gameState.currentPlayer === 'O')}
          />
        </Box>

        {/* 游戏控制 */}
        <GameControls
          currentPlayer={gameState.currentPlayer}
          winner={gameState.winner}
          isGameOver={gameState.isGameOver}
          isAIMode={isAIMode}
          isAIThinking={isAIThinking}
          canUndo={canUndo}
          onReset={resetGame}
          onUndo={undoMove}
          onToggleAI={toggleAIMode}
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
          borderColor="rgba(0, 255, 136, 0.3)"
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
            bg="rgba(0, 255, 136, 0.1)"
            borderTopRadius="lg"
            borderBottomWidth={1}
            borderBottomColor="rgba(0, 255, 136, 0.3)"
            px={4}
            py={3}
          >
            <Text fontSize="lg" fontWeight="bold" color="#00ff88" fontFamily="mono">
              游戏规则
            </Text>
            <Pressable
              onPress={() => setShowRules(false)}
              _pressed={{ bg: "rgba(0, 255, 136, 0.1)" }}
              borderRadius="md"
              px={2}
              py={1}
            >
              <Text
                color="#00ff88"
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
              <Box w={2} h={2} borderRadius="full" bg="#00ff88" />
              <Text fontSize="sm" color="white" flex={1}>
                玩家轮流在3×3的棋盘上放置X或O
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Box w={2} h={2} borderRadius="full" bg="#00ff88" />
              <Text fontSize="sm" color="white" flex={1}>
                率先在横、竖或斜线上连成三个相同标记的玩家获胜
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Box w={2} h={2} borderRadius="full" bg="#00ff88" />
              <Text fontSize="sm" color="white" flex={1}>
                棋盘填满且无人获胜则为平局
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Box w={2} h={2} borderRadius="full" bg="#00ff88" />
              <Text fontSize="sm" color="white" flex={1}>
                支持人机对战和双人对战模式
              </Text>
            </HStack>
          </VStack>

          {/* 底部按钮 */}
          <Box
            bg="rgba(0, 255, 136, 0.05)"
            borderBottomRadius="lg"
            borderTopWidth={1}
            borderTopColor="rgba(0, 255, 136, 0.2)"
            p={4}
          >
            <Button
              onPress={() => setShowRules(false)}
              bg="#00ff88"
              _text={{ color: "black", fontWeight: "bold" }}
              _pressed={{ bg: "#00cc6a" }}
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
                可以让孩子先手，培养策略思维
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">🤖</Text>
              <Text fontSize="sm" color="white" flex={1}>
                AI模式适合练习和学习
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">👥</Text>
              <Text fontSize="sm" color="white" flex={1}>
                双人模式适合亲子互动
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">🔄</Text>
              <Text fontSize="sm" color="white" flex={1}>
                使用撤销功能教导孩子思考
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

export default TicTacToeScreen; 