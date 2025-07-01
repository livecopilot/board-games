import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Switch,
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
}) => {
  const [showResetDialog, setShowResetDialog] = useState(false);

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
        return 'rgba(128, 0, 255, 0.9)'; // 紫色
      }
      return winner === 'black' ? '#ffffff' : '#ffffff';
    }
    
    if (isAIThinking) {
      return 'rgba(128, 0, 255, 0.9)'; // 紫色
    }
    
    return currentPlayer === 'black' ? '#ffffff' : '#ffffff';
  };

  const handleReset = () => {
    setShowResetDialog(false);
    onReset();
  };

  return (
    <Box>
      <HStack alignItems="flex-start" px={4} space={3} w="100%">
        {/* 左侧：游戏状态显示 */}
        <VStack flex={1} space={2} minH="90px" justifyContent="flex-start">
          <Box
            bg={!isGameOver && currentPlayer === 'black' && !isAIThinking ? "rgba(139, 69, 19, 0.2)" : "rgba(139, 69, 19, 0.1)"}
            borderWidth={2}
            borderColor={!isGameOver && currentPlayer === 'black' && !isAIThinking ? "rgba(139, 69, 19, 0.6)" : "rgba(139, 69, 19, 0.3)"}
            borderRadius="lg"
            p={3}
            w="100%"
            alignItems="center"
            shadow={!isGameOver && currentPlayer === 'black' && !isAIThinking ? 4 : 3}
            mt={2}
          >
            <Text
              fontSize="md"
              fontWeight="bold"
              color={getStatusColor()}
              fontFamily="mono"
              letterSpacing={1}
            >
              {getStatusText()}
            </Text>

            {/* 玩家标识 */}
            {!isGameOver && !isAIThinking && (
              <VStack alignItems="center" mt={1} space={1}>
                <Text
                  fontSize="xs"
                  color="white"
                  fontFamily="mono"
                >
                  {isAIMode 
                    ? '黑棋（你）' 
                    : '黑棋（我方）'}
                </Text>
                <Text
                  fontSize="xs"
                  color="rgba(255, 255, 255, 0.6)"
                  fontFamily="mono"
                  textAlign="center"
                >
                  {isAIMode ? '人机对战模式' : '本地双人对战'}
                </Text>
              </VStack>
            )}

            {/* AI思考指示器 */}
            {isAIThinking && (
              <HStack alignItems="center" mt={1} space={2}>
                <Box
                  w="14px"
                  h="14px"
                  borderRadius="full"
                  bg="rgba(128, 0, 255, 0.9)"
                  borderWidth={2}
                  borderColor="rgba(128, 0, 255, 0.7)"
                  shadow={2}
                />
                <Text
                  fontSize="xs"
                  color="rgba(128, 0, 255, 0.9)"
                  fontFamily="mono"
                >
                  🤖 AI正在思考...
                </Text>
              </HStack>
            )}
          </Box>
        </VStack>

        {/* 右侧：控制按钮 */}
        <VStack flex={1} mt={2} minH="90px" space={2}>
          {/* AI模式切换开关 */}
          <Box
            bg="rgba(128, 0, 255, 0.1)"
            borderWidth={1}
            borderColor="rgba(128, 0, 255, 0.4)"
            borderRadius="lg"
            p={2}
            alignItems="center"
          >
            <HStack alignItems="center" space={2} w="100%">
              <Text
                fontSize="xs"
                color="rgba(255, 255, 255, 0.9)"
                fontFamily="mono"
                flex={1}
              >
                {isAIMode ? 'AI对战' : '双人对战'}
              </Text>
              <Switch
                size="sm"
                isChecked={isAIMode}
                onToggle={onToggleAI}
                trackColor={{
                  false: "rgba(255, 255, 255, 0.2)",
                  true: "rgba(128, 0, 255, 0.6)"
                }}
                thumbColor={isAIMode ? "rgba(128, 0, 255, 0.9)" : "rgba(255, 255, 255, 0.8)"}
              />
            </HStack>
          </Box>

          {/* 操作按钮行 */}
          <HStack space={2} w="100%">
            {/* 重新开始按钮 */}
            <Pressable
              onPress={() => setShowResetDialog(true)}
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
              onPress={onUndo}
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
                  确认重新开始
                </Text>
              </Pressable>
            </HStack>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default GomokuControls; 