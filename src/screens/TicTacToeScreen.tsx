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
        justifyContent="space-between"
        alignItems="center"
        px={5}
        py={3}
        borderBottomWidth={1}
        borderBottomColor="rgba(0, 255, 136, 0.2)"
      >
        {/* 返回按钮 */}
        <Pressable
          onPress={handleBackPress}
          _pressed={{ bg: "rgba(0, 255, 136, 0.1)" }}
          borderRadius="lg"
          bg="rgba(0, 255, 136, 0.05)"
          borderWidth={1}
          borderColor="rgba(0, 255, 136, 0.3)"
          px={3}
          py={2}
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

        {/* 标题 */}
        <Heading
          size="lg"
          color="white"
          fontFamily="mono"
          fontWeight="300"
          letterSpacing={1}
        >
          井字棋
        </Heading>

        {/* 功能按钮 */}
        <HStack space={2}>
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
          <Pressable
            onPress={() => setShowSettings(true)}
            _pressed={{ bg: "rgba(128, 128, 255, 0.1)" }}
            borderRadius="lg"
            bg="rgba(128, 128, 255, 0.05)"
            borderWidth={1}
            borderColor="rgba(128, 128, 255, 0.3)"
            px={3}
            py={2}
          >
            <HStack alignItems="center" space={1}>
              <IconFont name="settings" size={14} color="#8080ff" />
              <Text
                color="#8080ff"
                fontWeight="bold"
                fontSize="sm"
                fontFamily="mono"
              >
                设置
              </Text>
            </HStack>
          </Pressable>
        </HStack>
      </HStack>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {/* 游戏棋盘 */}
        <Box alignItems="center" mb={5}>
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

      {/* 设置弹框 */}
      <Modal
        isVisible={showSettings}
        onBackdropPress={() => setShowSettings(false)}
        onBackButtonPress={() => setShowSettings(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.7}
        style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
      >
        <Box
          bg="#000015"
          borderColor="rgba(128, 128, 255, 0.3)"
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
            bg="rgba(128, 128, 255, 0.1)"
            borderTopRadius="lg"
            borderBottomWidth={1}
            borderBottomColor="rgba(128, 128, 255, 0.3)"
            px={4}
            py={3}
          >
            <Text fontSize="lg" fontWeight="bold" color="#8080ff" fontFamily="mono">
              ⚙️ 游戏设置
            </Text>
            <Pressable
              onPress={() => setShowSettings(false)}
              _pressed={{ bg: "rgba(128, 128, 255, 0.1)" }}
              borderRadius="md"
              px={2}
              py={1}
            >
              <Text
                color="#8080ff"
                fontWeight="bold"
                fontSize="sm"
                fontFamily="mono"
              >
                关闭
              </Text>
            </Pressable>
          </HStack>

          {/* 内容 */}
          <VStack space={4} p={4}>
            <Text color="white" fontSize="md" fontWeight="bold" textAlign="center">
              AI难度设置
            </Text>
            <Text color="rgba(255, 255, 255, 0.7)" fontSize="sm" textAlign="center">
              当前难度：{getDifficultyText(aiDifficulty)}
            </Text>
            
            <VStack space={3} alignItems="center">
              <Pressable
                onPress={() => handleSetDifficulty(AIDifficulty.EASY)}
                bg={aiDifficulty === AIDifficulty.EASY ? "rgba(0, 255, 136, 0.2)" : "rgba(255, 255, 255, 0.05)"}
                borderWidth={2}
                borderColor={aiDifficulty === AIDifficulty.EASY ? "#00ff88" : "rgba(0, 255, 136, 0.3)"}
                borderRadius="lg"
                px={6}
                py={4}
                w="100%"
                alignItems="center"
                shadow={3}
                _pressed={{ bg: "rgba(0, 255, 136, 0.1)" }}
              >
                <HStack alignItems="center" space={3}>
                  <Text fontSize="lg">🟢</Text>
                  <VStack alignItems="center">
                    <Text
                      color="#00ff88"
                      fontWeight="bold"
                      fontSize="lg"
                      fontFamily="mono"
                    >
                      简单
                    </Text>
                    <Text
                      color="rgba(255, 255, 255, 0.7)"
                      fontSize="xs"
                      fontFamily="mono"
                    >
                      随机移动，适合初学者
                    </Text>
                  </VStack>
                </HStack>
              </Pressable>
              
              <Pressable
                onPress={() => handleSetDifficulty(AIDifficulty.MEDIUM)}
                bg={aiDifficulty === AIDifficulty.MEDIUM ? "rgba(255, 128, 0, 0.2)" : "rgba(255, 255, 255, 0.05)"}
                borderWidth={2}
                borderColor={aiDifficulty === AIDifficulty.MEDIUM ? "#ff8000" : "rgba(255, 128, 0, 0.3)"}
                borderRadius="lg"
                px={6}
                py={4}
                w="100%"
                alignItems="center"
                shadow={3}
                _pressed={{ bg: "rgba(255, 128, 0, 0.1)" }}
              >
                <HStack alignItems="center" space={3}>
                  <Text fontSize="lg">🟡</Text>
                  <VStack alignItems="center">
                    <Text
                      color="#ff8000"
                      fontWeight="bold"
                      fontSize="lg"
                      fontFamily="mono"
                    >
                      中等
                    </Text>
                    <Text
                      color="rgba(255, 255, 255, 0.7)"
                      fontSize="xs"
                      fontFamily="mono"
                    >
                      基本策略，平衡挑战
                    </Text>
                  </VStack>
                </HStack>
              </Pressable>
              
              <Pressable
                onPress={() => handleSetDifficulty(AIDifficulty.HARD)}
                bg={aiDifficulty === AIDifficulty.HARD ? "rgba(255, 0, 128, 0.2)" : "rgba(255, 255, 255, 0.05)"}
                borderWidth={2}
                borderColor={aiDifficulty === AIDifficulty.HARD ? "#ff0080" : "rgba(255, 0, 128, 0.3)"}
                borderRadius="lg"
                px={6}
                py={4}
                w="100%"
                alignItems="center"
                shadow={3}
                _pressed={{ bg: "rgba(255, 0, 128, 0.1)" }}
              >
                <HStack alignItems="center" space={3}>
                  <Text fontSize="lg">🔴</Text>
                  <VStack alignItems="center">
                    <Text
                      color="#ff0080"
                      fontWeight="bold"
                      fontSize="lg"
                      fontFamily="mono"
                    >
                      困难
                    </Text>
                    <Text
                      color="rgba(255, 255, 255, 0.7)"
                      fontSize="xs"
                      fontFamily="mono"
                    >
                      智能算法，高级挑战
                    </Text>
                  </VStack>
                </HStack>
              </Pressable>
            </VStack>
          </VStack>

          {/* 底部按钮 */}
          <Box
            bg="rgba(128, 128, 255, 0.05)"
            borderBottomRadius="lg"
            borderTopWidth={1}
            borderTopColor="rgba(128, 128, 255, 0.2)"
            p={4}
          >
            <Button
              bg="#8080ff"
              onPress={() => setShowSettings(false)}
              _text={{ color: "white", fontWeight: "bold" }}
              _pressed={{ bg: "#6060cc" }}
              w="100%"
            >
              确定
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default TicTacToeScreen; 