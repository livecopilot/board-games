import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Pressable,
} from 'native-base';
import Modal from 'react-native-modal';
import IconFont from 'react-native-vector-icons/Ionicons';

interface GomokuControlsProps {
  currentPlayer: 'black' | 'white';
  winner: 'black' | 'white' | 'draw' | null;
  isGameOver: boolean;
  isAIMode: boolean;
  isAIThinking: boolean;
  canUndo: boolean;
  onReset: () => void;
  onUndo: () => void;
  onToggleAI: () => void;
  // 设置相关props
  showSettings?: boolean;
  onShowSettings?: () => void;
  onHideSettings?: () => void;
  aiDifficulty?: any;
  onSetDifficulty?: (difficulty: any) => void;
}

const GomokuControls: React.FC<GomokuControlsProps> = ({
  currentPlayer,
  winner,
  isGameOver,
  isAIMode,
  isAIThinking,
  canUndo,
  onReset,
  onUndo,
  onToggleAI,
  showSettings,
  onShowSettings,
  onHideSettings,
  aiDifficulty,
  onSetDifficulty,
}) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);

  const getPlayerText = (player: 'black' | 'white') => {
    return player === 'black' ? '黑方' : '白方';
  };

  const getStatusText = () => {
    if (isGameOver) {
      if (winner === 'draw') {
        return '🤝 平局！';
      }
      if (isAIMode) {
        return winner === 'black' ? '🎉 你获胜了！' : '😔 AI获胜';
      } else {
        return winner === 'black' ? '🎉 黑方获胜！' : '🎉 白方获胜！';
      }
    }
    
    if (isAIThinking) {
      return '🤖 AI思考中...';
    }
    
    if (isAIMode) {
      return currentPlayer === 'black' ? '🎯 轮到你了！' : '⏳ 等待AI...';
    } else {
      return currentPlayer === 'black' ? '🎯 轮到黑方！' : '🎯 轮到白方！';
    }
  };

  const getStatusColor = () => {
    if (isGameOver) {
      if (winner === 'draw') {
        return '#ff8000'; // 橙色
      }
      if (isAIMode && winner === 'white') {
        return 'rgba(255, 215, 0, 0.9)'; // 金色
      }
      return winner === 'black' ? '#ffffff' : '#ffffff';
    }
    
    if (isAIThinking) {
      return 'rgba(255, 215, 0, 0.9)'; // 金色
    }
    
    return currentPlayer === 'black' ? '#ffffff' : '#ffffff';
  };

  const handleReset = () => {
    setShowResetDialog(false);
    onReset();
  };

  const handleToggleAI = () => {
    setShowToggleDialog(false);
    onToggleAI();
  };

  return (
    <Box>
      <HStack alignItems="flex-start" px={5} space={4} w="100%">
        {/* 左侧：游戏状态显示 */}
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
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={getStatusColor()}
              fontFamily="mono"
              letterSpacing={1}
            >
              {getStatusText()}
            </Text>

            {/* 当前玩家指示器 */}
            {!isGameOver && !isAIThinking && (
              <VStack alignItems="center" mt={2} space={1}>
                <HStack alignItems="center" space={2}>
                  <Box
                    w="16px"
                    h="16px"
                    borderRadius="full"
                    bg={currentPlayer === 'black' ? '#2d2d2d' : '#ffffff'}
                    borderWidth={2}
                    borderColor={currentPlayer === 'black' ? '#404040' : '#e0e0e0'}
                    shadow={3}
                  />
                  <Text
                    fontSize="sm"
                    color="white"
                    fontFamily="mono"
                  >
                    {isAIMode 
                      ? '黑棋（你）' 
                      : '黑棋（我方）'}
                  </Text>
                </HStack>
                <Text
                  fontSize="xs"
                  color="rgba(255, 255, 255, 0.7)"
                  fontFamily="mono"
                  textAlign="center"
                >
                  {isAIMode ? '人机对战模式' : '本地双人对战'}
                </Text>
              </VStack>
            )}

            {/* AI思考指示器 */}
            {isAIThinking && (
              <HStack alignItems="center" mt={2} space={2}>
                <Box
                  w="16px"
                  h="16px"
                  borderRadius="full"
                  bg="rgba(255, 215, 0, 0.9)"
                  borderWidth={2}
                  borderColor="rgba(255, 215, 0, 0.7)"
                  shadow={3}
                />
                <Text
                  fontSize="sm"
                  color="rgba(255, 215, 0, 0.9)"
                  fontFamily="mono"
                >
                  🤖 AI正在思考...
                </Text>
              </HStack>
            )}
          </Box>
        </VStack>

        {/* 右侧：控制按钮 */}
        <Box flex={1} mt={3} minH="120px">
          <HStack space={2} flexWrap="wrap" alignItems="flex-start">
          {/* 重新开始按钮 */}
          <Pressable
            onPress={() => setShowResetDialog(true)}
            bg="rgba(139, 69, 19, 0.1)"
            borderWidth={1}
            borderColor="rgba(139, 69, 19, 0.4)"
            borderRadius="lg"
            px={3}
            py={3}
            minW="30%"
            maxW="48%"
            flex={1}
            mb={2}
            alignItems="center"
            _pressed={{ bg: "rgba(139, 69, 19, 0.2)" }}
            shadow={2}
          >
            <HStack alignItems="center" space={1}>
              <IconFont name="refresh" size={14} color="rgba(139, 69, 19, 0.9)" />
              <Text
                color="rgba(139, 69, 19, 0.9)"
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
            onPress={onUndo}
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
                悔棋
              </Text>
            </HStack>
          </Pressable>

          {/* 游戏模式切换按钮 */}
          <Pressable
            onPress={() => setShowToggleDialog(true)}
            bg="rgba(139, 69, 19, 0.1)"
            borderWidth={1}
            borderColor="rgba(139, 69, 19, 0.4)"
            borderRadius="lg"
            px={3}
            py={3}
            minW="30%"
            maxW="48%"
            flex={1}
            mb={2}
            alignItems="center"
            _pressed={{ bg: "rgba(139, 69, 19, 0.2)" }}
            shadow={2}
          >
            <HStack alignItems="center" space={1}>
              <IconFont name={isAIMode ? "hardware-chip" : "people"} size={14} color="rgba(139, 69, 19, 0.9)" />
              <Text
                color="rgba(139, 69, 19, 0.9)"
                fontWeight="bold"
                fontSize="sm"
                fontFamily="mono"
                textAlign="center"
              >
                {isAIMode ? 'AI对战' : '双人对战'}
              </Text>
            </HStack>
          </Pressable>

          {/* 设置按钮 */}
          <Pressable
            onPress={onShowSettings}
            bg="rgba(128, 128, 255, 0.1)"
            borderWidth={1}
            borderColor="rgba(128, 128, 255, 0.4)"
            borderRadius="lg"
            px={3}
            py={3}
            minW="30%"
            maxW="48%"
            flex={1}
            mb={2}
            alignItems="center"
            _pressed={{ bg: "rgba(128, 128, 255, 0.2)" }}
            shadow={2}
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
        </Box>
      </HStack>

      {/* 重新开始确认弹框 */}
      <Modal
        isVisible={showResetDialog}
        onBackdropPress={() => setShowResetDialog(false)}
        onBackButtonPress={() => setShowResetDialog(false)}
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
              重新开始
            </Text>
            <Pressable
              onPress={() => setShowResetDialog(false)}
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
          <Box p={4}>
            <Text color="white" fontSize="md" textAlign="center">
              确定要重新开始游戏吗？当前进度将会丢失。
            </Text>
          </Box>

          {/* 底部按钮 */}
          <Box
            bg="rgba(139, 69, 19, 0.05)"
            borderBottomRadius="lg"
            borderTopWidth={1}
            borderTopColor="rgba(139, 69, 19, 0.2)"
            p={4}
          >
            <HStack space={2}>
              <Button
                variant="ghost"
                flex={1}
                onPress={() => setShowResetDialog(false)}
                _text={{ color: "gray.400" }}
              >
                取消
              </Button>
              <Button
                bg="rgba(139, 69, 19, 0.8)"
                flex={1}
                onPress={handleReset}
                _text={{ color: "white", fontWeight: "bold" }}
                _pressed={{ bg: "rgba(139, 69, 19, 0.6)" }}
              >
                确认重新开始
              </Button>
            </HStack>
          </Box>
        </Box>
      </Modal>

      {/* AI模式切换确认弹框 */}
      <Modal
        isVisible={showToggleDialog}
        onBackdropPress={() => setShowToggleDialog(false)}
        onBackButtonPress={() => setShowToggleDialog(false)}
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
              {isAIMode ? '关闭AI模式' : '开启AI模式'}
            </Text>
            <Pressable
              onPress={() => setShowToggleDialog(false)}
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
          <Box p={4}>
            <Text color="white" fontSize="md" textAlign="center">
              {isAIMode 
                ? '切换到双人对战模式？游戏将重新开始。' 
                : '切换到人机对战模式？游戏将重新开始。'}
            </Text>
          </Box>

          {/* 底部按钮 */}
          <Box
            bg="rgba(139, 69, 19, 0.05)"
            borderBottomRadius="lg"
            borderTopWidth={1}
            borderTopColor="rgba(139, 69, 19, 0.2)"
            p={4}
          >
            <HStack space={2}>
              <Button
                variant="ghost"
                flex={1}
                onPress={() => setShowToggleDialog(false)}
                _text={{ color: "gray.400" }}
              >
                取消
              </Button>
              <Button
                bg="rgba(139, 69, 19, 0.8)"
                flex={1}
                onPress={handleToggleAI}
                _text={{ color: "white", fontWeight: "bold" }}
                _pressed={{ bg: "rgba(139, 69, 19, 0.6)" }}
              >
                确认切换
              </Button>
            </HStack>
          </Box>
        </Box>
      </Modal>

      {/* AI难度设置弹框 */}
      <Modal
        isVisible={showSettings}
        onBackdropPress={onHideSettings}
        onBackButtonPress={onHideSettings}
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
          w="85%"
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
              AI难度设置
            </Text>
            <Pressable
              onPress={onHideSettings}
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
          <VStack space={3} p={4}>
            {['easy', 'medium', 'hard'].map((difficulty) => (
              <Pressable
                key={difficulty}
                onPress={() => onSetDifficulty && onSetDifficulty(difficulty)}
                bg={aiDifficulty === difficulty ? "rgba(139, 69, 19, 0.2)" : "rgba(139, 69, 19, 0.05)"}
                borderWidth={1}
                borderColor={aiDifficulty === difficulty ? "rgba(139, 69, 19, 0.6)" : "rgba(139, 69, 19, 0.3)"}
                borderRadius="lg"
                p={4}
                _pressed={{ bg: "rgba(139, 69, 19, 0.15)" }}
              >
                <HStack alignItems="center" justifyContent="space-between">
                  <VStack>
                    <Text
                      color="white"
                      fontSize="md"
                      fontWeight="bold"
                      fontFamily="mono"
                    >
                      {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}
                    </Text>
                    <Text
                      color="gray.400"
                      fontSize="sm"
                      fontFamily="mono"
                    >
                      {difficulty === 'easy' ? '适合新手，随机落子' : 
                       difficulty === 'medium' ? '一般水平，基础策略' : 
                       '高手水平，深度思考'}
                    </Text>
                  </VStack>
                  {aiDifficulty === difficulty && (
                    <Box
                      w={4}
                      h={4}
                      borderRadius="full"
                      bg="rgba(139, 69, 19, 0.9)"
                    />
                  )}
                </HStack>
              </Pressable>
            ))}
          </VStack>
        </Box>
      </Modal>
    </Box>
  );
};

export default GomokuControls; 