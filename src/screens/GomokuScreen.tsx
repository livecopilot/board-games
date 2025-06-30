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
    aiDifficulty,
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
    placePiece(position);
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
            <Pressable
              onPress={() => setShowTips(true)}
              _pressed={{ bg: "rgba(255, 128, 0, 0.3)" }}
              borderRadius="lg"
              bg="rgba(255, 128, 0, 0.2)"
              borderWidth={2}
              borderColor="rgba(255, 128, 0, 0.7)"
              px={3}
              py={2}
              shadow={3}
            >
              <HStack alignItems="center" space={1}>
                <IconFont name="bulb" size={14} color="rgba(255, 255, 255, 0.9)" />
                <Text
                  color="rgba(255, 255, 255, 0.9)"
                  fontWeight="bold"
                  fontSize="sm"
                  fontFamily="mono"
                >
                  技巧
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
                    bg="rgba(139, 69, 19, 0.1)"
                    borderWidth={2}
                    borderColor="rgba(139, 69, 19, 0.3)"
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
                          color={gameState.winner === 'white' ? '#00ff88' : gameState.winner === 'black' ? '#ffffff' : '#ffd700'}
                          fontFamily="mono"
                          letterSpacing={1}
                        >
                          {gameState.winner === 'white' ? '🎉 白方获胜！' : 
                           gameState.winner === 'black' ? '对方获胜' : 
                           '🤝 平局'}
                        </Text>
                        <Text
                          fontSize="sm"
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
                      <VStack alignItems="center" space={2}>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color={gameState.currentPlayer === 'white' ? '#00ff88' : '#ffffff'}
                          fontFamily="mono"
                          letterSpacing={1}
                        >
                          {gameState.currentPlayer === 'white' ? '🎯 轮到你了！' : '⏳ 等待对方...'}
                        </Text>
                        
                        {/* 对方玩家指示器 */}
                        <VStack alignItems="center" space={1}>
                          <HStack alignItems="center" space={2}>
                            <Box
                              w="16px"
                              h="16px"
                              borderRadius="full"
                              bg="#ffffff"
                              borderWidth={2}
                              borderColor={gameState.currentPlayer === 'white' ? '#00ff88' : '#e0e0e0'}
                              shadow={3}
                            />
                            <Text
                              fontSize="sm"
                              color="white"
                              fontFamily="mono"
                            >
                              白棋（对方）
                            </Text>
                          </HStack>
                          <Text
                            fontSize="xs"
                            color="rgba(255, 255, 255, 0.7)"
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
                      bg="rgba(139, 69, 19, 0.2)"
                      borderWidth={2}
                      borderColor="rgba(139, 69, 19, 0.6)"
                      borderRadius="lg"
                      px={3}
                      py={3}
                      minW="30%"
                      maxW="48%"
                      flex={1}
                      mb={2}
                      alignItems="center"
                      _pressed={{ bg: "rgba(139, 69, 19, 0.3)" }}
                      shadow={3}
                    >
                      <HStack alignItems="center" space={1}>
                        <IconFont name="refresh" size={14} color="rgba(255, 255, 255, 0.9)" />
                        <Text
                          color="rgba(255, 255, 255, 0.9)"
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
                      bg={canUndo ? "rgba(255, 128, 0, 0.2)" : "rgba(80, 80, 80, 0.15)"}
                      borderWidth={2}
                      borderColor={canUndo ? "rgba(255, 128, 0, 0.7)" : "rgba(80, 80, 80, 0.4)"}
                      borderRadius="lg"
                      px={3}
                      py={3}
                      minW="30%"
                      maxW="48%"
                      flex={1}
                      mb={2}
                      alignItems="center"
                      _pressed={canUndo ? { bg: "rgba(255, 128, 0, 0.3)" } : {}}
                      shadow={canUndo ? 3 : 0}
                      opacity={canUndo ? 1 : 0.5}
                    >
                      <HStack alignItems="center" space={1}>
                        <IconFont name="arrow-undo" size={14} color={canUndo ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 120, 120, 0.7)"} />
                        <Text
                          color={canUndo ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 120, 120, 0.7)"}
                          fontWeight="bold"
                          fontSize="sm"
                          fontFamily="mono"
                        >
                          悔棋
                        </Text>
                      </HStack>
                    </Pressable>
                  </HStack>
                </Box>
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

      {/* 游戏技巧弹框 */}
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
              游戏技巧
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={3} p={4}>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="#ff8000" />
                <Text fontSize="sm" color="white" flex={1}>
                  开局一般在天元（中心）或其附近落子
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="#ff8000" />
                <Text fontSize="sm" color="white" flex={1}>
                  攻守并重：既要形成自己的连线，也要阻止对手
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="#ff8000" />
                <Text fontSize="sm" color="white" flex={1}>
                  活三优于死四：活三可形成双四必胜
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="#ff8000" />
                <Text fontSize="sm" color="white" flex={1}>
                  控制关键点位，限制对手发展空间
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="#ff8000" />
                <Text fontSize="sm" color="white" flex={1}>
                  多线作战：同时在多个方向威胁对手
                </Text>
              </HStack>
              <HStack alignItems="center" space={3}>
                <Box w={2} h={2} borderRadius="full" bg="#ff8000" />
                <Text fontSize="sm" color="white" flex={1}>
                  学会牺牲：有时放弃局部可获得更大优势
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