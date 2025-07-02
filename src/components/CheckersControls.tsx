import React, { useState } from 'react';
import {
  Box,
  Text,
  HStack,
  VStack,
  Pressable,
  Switch,
} from 'native-base';
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
}) => {
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

  return (
    <Box>
      <HStack alignItems="flex-start" px={4} space={3} w="100%">
        {/* 左侧：游戏状态显示 */}
        <VStack flex={1} space={2} minH="90px" justifyContent="flex-start">
          <Box
            bg={!isGameOver && currentPlayer === 'red' && !isAIThinking ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.02)"}
            borderWidth={!isGameOver && currentPlayer === 'red' && !isAIThinking ? 2 : 1}
            borderColor={!isGameOver && currentPlayer === 'red' && !isAIThinking ? "rgba(255, 0, 128, 0.8)" : "rgba(255, 0, 128, 0.2)"}
            borderRadius="lg"
            p={3}
            w="100%"
            alignItems="center"
            shadow={!isGameOver && currentPlayer === 'red' && !isAIThinking ? 4 : 1}
            mt={2}
          >
            <Text
              fontSize="md"
              fontWeight="bold"
              color={getStatusColor()}
              fontFamily="mono"
              letterSpacing={0.5}
              textAlign="center"
              numberOfLines={2}
            >
              {getStatusText()}
            </Text>

            {/* 玩家标识 */}
            {!isGameOver && !isAIThinking && (
              <VStack alignItems="center" mt={1} space={0.5}>
                <Text
                  fontSize="xs"
                  color={currentPlayer === 'red' ? 'white' : 'rgba(255, 255, 255, 0.6)'}
                  fontFamily="mono"
                >
                  {isAIMode 
                    ? '红方（你）' 
                    : '红方（我方）'}
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
              <HStack alignItems="center" mt={1} space={1}>
                <Box
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bg="#0080ff"
                  borderWidth={1}
                  borderColor="#4da6ff"
                  shadow={2}
                />
                <Text
                  fontSize="xs"
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
              p={2}
              w="100%"
              alignItems="center"
            >
              <Text
                fontSize="xs"
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
        <VStack flex={1} mt={2} minH="90px" space={2}>
          {/* AI模式切换开关 */}
          <Box
            bg="rgba(255, 0, 128, 0.1)"
            borderWidth={1}
            borderColor="rgba(255, 0, 128, 0.4)"
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
                  true: "rgba(255, 0, 128, 0.6)"
                }}
                thumbColor={isAIMode ? "#ff0080" : "rgba(255, 255, 255, 0.8)"}
              />
            </HStack>
          </Box>

          {/* 操作按钮行 */}
          <HStack space={2} w="100%">
            {/* 重新开始按钮 */}
            <Pressable
              onPress={onReset}
              bg="rgba(255, 0, 128, 0.2)"
              borderWidth={1}
              borderColor="rgba(255, 0, 128, 0.6)"
              borderRadius="lg"
              px={2}
              py={2}
              flex={1}
              alignItems="center"
              _pressed={{ bg: "rgba(255, 0, 128, 0.3)" }}
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
              isDisabled={!canUndo || mustCapture}
              bg={canUndo && !mustCapture ? "rgba(255, 128, 0, 0.2)" : "rgba(80, 80, 80, 0.15)"}
              borderWidth={1}
              borderColor={canUndo && !mustCapture ? "rgba(255, 128, 0, 0.7)" : "rgba(80, 80, 80, 0.4)"}
              borderRadius="lg"
              px={2}
              py={2}
              flex={1}
              alignItems="center"
              _pressed={canUndo && !mustCapture ? { bg: "rgba(255, 128, 0, 0.3)" } : {}}
              shadow={canUndo && !mustCapture ? 2 : 0}
              opacity={canUndo && !mustCapture ? 1 : 0.5}
            >
              <HStack alignItems="center" space={1}>
                <IconFont name="arrow-undo" size={12} color={canUndo && !mustCapture ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 120, 120, 0.7)"} />
                <Text
                  color={canUndo && !mustCapture ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 120, 120, 0.7)"}
                  fontWeight="bold"
                  fontSize="xs"
                  fontFamily="mono"
                >
                  撤销
                </Text>
              </HStack>
            </Pressable>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};

export default CheckersControls; 