import React, { useState } from 'react';
import {
  Box,
  Text,
  HStack,
  VStack,
  Pressable,
  Button,
} from 'native-base';
import Modal from 'react-native-modal';
import IconFont from 'react-native-vector-icons/Ionicons';

interface CheckersControlsProps {
  currentPlayer: 'red' | 'black';
  winner: 'red' | 'black' | 'draw' | null;
  isGameOver: boolean;
  isAIMode: boolean;
  isAIThinking: boolean;
  canUndo: boolean;
  onReset: () => void;
  onUndo: () => void;
  onToggleAI: () => void;
  mustCapture?: boolean;
  showSettings?: boolean;
  onShowSettings?: () => void;
  onHideSettings?: () => void;
  aiDifficulty?: any;
  onSetDifficulty?: (difficulty: any) => void;
}

const CheckersControls: React.FC<CheckersControlsProps> = ({
  currentPlayer,
  winner,
  isGameOver,
  isAIMode,
  isAIThinking,
  canUndo,
  onReset,
  onUndo,
  onToggleAI,
  mustCapture,
  showSettings,
  onShowSettings,
  onHideSettings,
  aiDifficulty,
  onSetDifficulty,
}) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);

  const getStatusText = () => {
    if (isGameOver) {
      if (winner === 'draw') {
        return '🤝 平局！';
      }
      if (isAIMode) {
        return winner === 'red' ? '🎉 你获胜了！' : '😔 AI获胜';
      } else {
        return winner === 'red' ? '🎉 红方获胜！' : '🎉 黑方获胜！';
      }
    }
    
    if (isAIThinking) {
      return '🤖 AI思考中...';
    }

    if (mustCapture) {
      if (isAIMode) {
        return currentPlayer === 'red' ? '⚡ 你必须继续跳跃！' : '⚡ AI必须继续跳跃';
      } else {
        return currentPlayer === 'red' ? '⚡ 红方必须继续跳跃！' : '⚡ 黑方必须继续跳跃！';
      }
    }
    
    if (isAIMode) {
      return currentPlayer === 'red' ? '🎯 轮到你了！' : '⏳ 等待AI...';
    } else {
      return currentPlayer === 'red' ? '🎯 轮到红方！' : '🎯 轮到黑方！';
    }
  };

  const getStatusColor = () => {
    if (isGameOver) {
      if (winner === 'draw') {
        return '#ff8000'; // 橙色
      }
      if (isAIMode && winner === 'black') {
        return '#ff0080'; // 粉色
      }
      return winner === 'red' ? '#ff3030' : '#303030';
    }
    
    if (isAIThinking) {
      return '#0080ff'; // 蓝色
    }
    
    if (mustCapture) {
      return '#ffff00'; // 黄色提醒
    }
    
    return currentPlayer === 'red' ? '#ff3030' : '#ffffff';
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
                    bg={currentPlayer === 'red' ? '#ff3030' : '#303030'}
                    borderWidth={2}
                    borderColor={currentPlayer === 'red' ? '#ff6060' : '#606060'}
                    shadow={3}
                  />
                  <Text
                    fontSize="sm"
                    color={currentPlayer === 'red' ? 'white' : 'rgba(255, 255, 255, 0.6)'}
                    fontFamily="mono"
                  >
                    {isAIMode 
                      ? '红方（你）' 
                      : '红方（我方）'}
                  </Text>
                </HStack>
                <Text
                  fontSize="xs"
                  color={isAIMode ? "#0080ff" : "#ff0080"}
                  fontFamily="mono"
                  textAlign="center"
                >
                  {isAIMode ? '人机对战模式' : '本地双人对战'}
                </Text>
                
                {mustCapture && currentPlayer === 'red' && (
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
            )}

            {/* AI思考指示器 */}
            {isAIThinking && (
              <HStack alignItems="center" mt={2} space={2}>
                <Box
                  w="16px"
                  h="16px"
                  borderRadius="full"
                  bg="#0080ff"
                  borderWidth={2}
                  borderColor="#4da6ff"
                  shadow={3}
                />
                <Text
                  fontSize="sm"
                  color="#0080ff"
                  fontFamily="mono"
                >
                  🤖 AI正在思考...
                </Text>
              </HStack>
            )}
          </Box>

          {/* 游戏提示 */}
          {mustCapture && (
            <Box
              bg="rgba(255, 255, 0, 0.1)"
              borderWidth={1}
              borderColor="rgba(255, 255, 0, 0.4)"
              borderRadius="lg"
              p={3}
              w="100%"
              alignItems="center"
            >
              <Text
                fontSize="sm"
                color="#ffff00"
                fontFamily="mono"
                textAlign="center"
              >
                ⚡ 连续跳跃机会！必须继续吃子
              </Text>
            </Box>
          )}
        </VStack>

        {/* 右侧：控制按钮 */}
        <Box flex={1} mt={3} minH="120px">
          <HStack space={2} flexWrap="wrap" alignItems="flex-start">
          {/* 重新开始按钮 */}
          <Pressable
            onPress={() => setShowResetDialog(true)}
            bg="rgba(255, 0, 128, 0.2)"
            borderWidth={2}
            borderColor="rgba(255, 0, 128, 0.6)"
            borderRadius="lg"
            px={3}
            py={3}
            minW="30%"
            maxW="48%"
            flex={1}
            mb={2}
            alignItems="center"
            _pressed={{ bg: "rgba(255, 0, 128, 0.3)" }}
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
            onPress={onUndo}
            isDisabled={!canUndo || mustCapture}
            bg={canUndo && !mustCapture ? "rgba(255, 128, 0, 0.2)" : "rgba(80, 80, 80, 0.15)"}
            borderWidth={2}
            borderColor={canUndo && !mustCapture ? "rgba(255, 128, 0, 0.7)" : "rgba(80, 80, 80, 0.4)"}
            borderRadius="lg"
            px={3}
            py={3}
            minW="30%"
            maxW="48%"
            flex={1}
            mb={2}
            alignItems="center"
            _pressed={canUndo && !mustCapture ? { bg: "rgba(255, 128, 0, 0.3)" } : {}}
            shadow={canUndo && !mustCapture ? 3 : 0}
            opacity={canUndo && !mustCapture ? 1 : 0.5}
          >
            <HStack alignItems="center" space={1}>
              <IconFont name="arrow-undo" size={14} color={canUndo && !mustCapture ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 120, 120, 0.7)"} />
              <Text
                color={canUndo && !mustCapture ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 120, 120, 0.7)"}
                fontWeight="bold"
                fontSize="sm"
                fontFamily="mono"
              >
                撤销
              </Text>
            </HStack>
          </Pressable>

          {/* 游戏模式切换按钮 */}
          <Pressable
            onPress={() => setShowToggleDialog(true)}
            bg="rgba(255, 0, 128, 0.2)"
            borderWidth={2}
            borderColor="rgba(255, 0, 128, 0.6)"
            borderRadius="lg"
            px={3}
            py={3}
            minW="30%"
            maxW="48%"
            flex={1}
            mb={2}
            alignItems="center"
            _pressed={{ bg: "rgba(255, 0, 128, 0.3)" }}
            shadow={3}
          >
            <HStack alignItems="center" space={1}>
              <IconFont name={isAIMode ? "hardware-chip" : "people"} size={14} color="rgba(255, 255, 255, 0.9)" />
              <Text
                color="rgba(255, 255, 255, 0.9)"
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
            bg="rgba(128, 128, 255, 0.2)"
            borderWidth={2}
            borderColor="rgba(128, 128, 255, 0.6)"
            borderRadius="lg"
            px={3}
            py={3}
            minW="30%"
            maxW="48%"
            flex={1}
            mb={2}
            alignItems="center"
            _pressed={{ bg: "rgba(128, 128, 255, 0.3)" }}
            shadow={3}
          >
            <HStack alignItems="center" space={1}>
              <IconFont name="settings" size={14} color="rgba(255, 255, 255, 0.9)" />
              <Text
                color="rgba(255, 255, 255, 0.9)"
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
              重新开始
            </Text>
            <Pressable
              onPress={() => setShowResetDialog(false)}
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
              确定要重新开始游戏吗？当前进度将会丢失。
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
              <Pressable
                flex={1}
                onPress={() => setShowResetDialog(false)}
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
                onPress={handleReset}
                bg="rgba(255, 0, 128, 0.3)"
                borderWidth={2}
                borderColor="rgba(255, 0, 128, 0.7)"
                borderRadius="lg"
                py={3}
                alignItems="center"
                _pressed={{ bg: "rgba(255, 0, 128, 0.4)" }}
                shadow={3}
              >
                <Text color="rgba(255, 255, 255, 0.9)" fontWeight="bold" fontFamily="mono">
                  确认重新开始
                </Text>
              </Pressable>
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
              {isAIMode ? '关闭AI模式' : '开启AI模式'}
            </Text>
            <Pressable
              onPress={() => setShowToggleDialog(false)}
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
              {isAIMode 
                ? '切换到双人对战模式？游戏将重新开始。' 
                : '切换到人机对战模式？游戏将重新开始。'}
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
              <Pressable
                flex={1}
                onPress={() => setShowToggleDialog(false)}
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
                onPress={handleToggleAI}
                bg="rgba(255, 0, 128, 0.3)"
                borderWidth={2}
                borderColor="rgba(255, 0, 128, 0.7)"
                borderRadius="lg"
                py={3}
                alignItems="center"
                _pressed={{ bg: "rgba(255, 0, 128, 0.4)" }}
                shadow={3}
              >
                <Text color="rgba(255, 255, 255, 0.9)" fontWeight="bold" fontFamily="mono">
                  确认切换
                </Text>
              </Pressable>
            </HStack>
          </Box>
        </Box>
      </Modal>

      {/* 设置弹框 */}
      <Modal
        isVisible={showSettings || false}
        onBackdropPress={onHideSettings}
        onBackButtonPress={onHideSettings}
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
              游戏设置
            </Text>
            <Pressable
              onPress={onHideSettings}
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
            <Text fontSize="md" fontWeight="bold" color="white" fontFamily="mono">
              AI难度设置
            </Text>
            
            <VStack space={3}>
              <Pressable
                onPress={() => onSetDifficulty && onSetDifficulty('easy')}
                bg={aiDifficulty === 'easy' ? "rgba(128, 128, 255, 0.2)" : "rgba(128, 128, 255, 0.05)"}
                borderWidth={1}
                borderColor={aiDifficulty === 'easy' ? "rgba(128, 128, 255, 0.6)" : "rgba(128, 128, 255, 0.3)"}
                borderRadius="lg"
                px={4}
                py={3}
                _pressed={{ bg: "rgba(128, 128, 255, 0.15)" }}
              >
                <HStack justifyContent="space-between" alignItems="center">
                  <Text color="white" fontSize="sm" fontFamily="mono">简单</Text>
                  <Text color="gray.400" fontSize="xs" fontFamily="mono">适合新手</Text>
                </HStack>
              </Pressable>
              
              <Pressable
                onPress={() => onSetDifficulty && onSetDifficulty('medium')}
                bg={aiDifficulty === 'medium' ? "rgba(128, 128, 255, 0.2)" : "rgba(128, 128, 255, 0.05)"}
                borderWidth={1}
                borderColor={aiDifficulty === 'medium' ? "rgba(128, 128, 255, 0.6)" : "rgba(128, 128, 255, 0.3)"}
                borderRadius="lg"
                px={4}
                py={3}
                _pressed={{ bg: "rgba(128, 128, 255, 0.15)" }}
              >
                <HStack justifyContent="space-between" alignItems="center">
                  <Text color="white" fontSize="sm" fontFamily="mono">中等</Text>
                  <Text color="gray.400" fontSize="xs" fontFamily="mono">平衡挑战</Text>
                </HStack>
              </Pressable>
              
              <Pressable
                onPress={() => onSetDifficulty && onSetDifficulty('hard')}
                bg={aiDifficulty === 'hard' ? "rgba(128, 128, 255, 0.2)" : "rgba(128, 128, 255, 0.05)"}
                borderWidth={1}
                borderColor={aiDifficulty === 'hard' ? "rgba(128, 128, 255, 0.6)" : "rgba(128, 128, 255, 0.3)"}
                borderRadius="lg"
                px={4}
                py={3}
                _pressed={{ bg: "rgba(128, 128, 255, 0.15)" }}
              >
                <HStack justifyContent="space-between" alignItems="center">
                  <Text color="white" fontSize="sm" fontFamily="mono">困难</Text>
                  <Text color="gray.400" fontSize="xs" fontFamily="mono">高级挑战</Text>
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
              onPress={onHideSettings}
              bg="#8080ff"
              _text={{ color: "white", fontWeight: "bold" }}
              _pressed={{ bg: "#6060cc" }}
              w="100%"
            >
              保存设置
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default CheckersControls; 