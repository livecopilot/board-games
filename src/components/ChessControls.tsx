import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Switch,
} from 'native-base';
import IconFont from 'react-native-vector-icons/Ionicons';

interface ChessControlsProps {
  currentPlayer: 'red' | 'black';
  winner: 'red' | 'black' | 'draw' | null;
  isGameOver: boolean;
  isAIMode: boolean;
  isAIThinking: boolean;
  isInCheck?: boolean; // 向后兼容，已弃用
  redInCheck?: boolean; // 红方是否被将军
  blackInCheck?: boolean; // 黑方是否被将军
  canUndo: boolean;
  onReset: () => void;
  onUndo: () => void;
  onToggleAI: () => void;
}

const ChessControls: React.FC<ChessControlsProps> = ({
  currentPlayer,
  winner,
  isGameOver,
  isAIMode,
  isAIThinking,
  isInCheck,
  redInCheck,
  blackInCheck,
  canUndo,
  onReset,
  onUndo,
  onToggleAI,
}) => {
  const getPlayerText = (player: 'red' | 'black') => {
    return player === 'red' ? '红方' : '黑方';
  };

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

    // 优先显示将军状态，无论轮到谁
    if (redInCheck) {
      if (isAIMode) {
        return '⚠️ 你被将军了！'; // 在AI模式下，红方就是玩家
      } else {
        return '⚠️ 红方被将军！';
      }
    }
    
    if (blackInCheck) {
      if (isAIMode) {
        return '⚠️ AI被将军了！';
      } else {
        return '⚠️ 黑方被将军！';
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
        return 'rgba(255, 215, 0, 0.9)'; // 金色
      }
      return winner === 'red' ? '#ff3030' : '#ffffff';
    }
    
    if (isAIThinking) {
      return 'rgba(255, 215, 0, 0.9)'; // 金色
    }
    
    // 优先显示将军状态的颜色
    if (redInCheck || blackInCheck) {
      return '#ff3030'; // 红色警告
    }
    
    return currentPlayer === 'red' ? '#ff3030' : '#ffffff';
  };

  return (
    <Box>
      <HStack alignItems="flex-start" px={4} space={3} w="100%">
        {/* 左侧：游戏状态显示 */}
        <VStack flex={1} space={2} minH="90px" justifyContent="flex-start">
          <Box
            bg={!isGameOver && currentPlayer === 'red' && !isAIThinking ? "rgba(255, 215, 0, 0.3)" : "rgba(255, 215, 0, 0.05)"}
            borderWidth={2}
            borderColor={!isGameOver && currentPlayer === 'red' && !isAIThinking ? "rgba(255, 215, 0, 0.8)" : "rgba(255, 215, 0, 0.2)"}
            borderRadius="lg"
            p={3}
            w="100%"
            alignItems="center"
            shadow={!isGameOver && currentPlayer === 'red' && !isAIThinking ? 5 : 2}
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
                  color={
                    // 如果有将军状态，根据被将军的一方显示颜色
                    redInCheck ? 'white' : 
                    blackInCheck ? 'rgba(255, 255, 255, 0.6)' :
                    // 否则根据当前玩家显示颜色
                    (currentPlayer === 'red' ? 'white' : 'rgba(255, 255, 255, 0.6)')
                  }
                  fontFamily="mono"
                >
                  {
                    // 如果有将军状态，显示被将军一方的信息
                    redInCheck ? (
                      isAIMode ? '红方（你）' : '红方（我方）'
                    ) : blackInCheck ? (
                      isAIMode ? '黑方（AI）' : '黑方（我方）'
                    ) : (
                      // 否则显示当前轮到的玩家信息
                      isAIMode 
                        ? (currentPlayer === 'red' ? '红方（你）' : '黑方（AI）')
                        : (currentPlayer === 'red' ? '红方（我方）' : '黑方（我方）')
                    )
                  }
                </Text>
              </VStack>
            )}

            {/* AI思考指示器 */}
            {isAIThinking && (
              <HStack alignItems="center" mt={1} space={1}>
                <Box
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bg="rgba(255, 215, 0, 0.9)"
                  borderWidth={1}
                  borderColor="rgba(255, 215, 0, 0.7)"
                  shadow={2}
                />
                <Text
                  fontSize="xs"
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
        <VStack flex={1} mt={2} minH="90px" space={2}>
          {/* AI模式切换开关 */}
          <Box
            bg="rgba(255, 215, 0, 0.1)"
            borderWidth={1}
            borderColor="rgba(255, 215, 0, 0.4)"
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
                  true: "rgba(255, 215, 0, 0.6)"
                }}
                thumbColor={isAIMode ? "rgba(255, 215, 0, 0.9)" : "rgba(255, 255, 255, 0.8)"}
              />
            </HStack>
          </Box>

          {/* 操作按钮行 */}
          <HStack space={2} w="100%">
            {/* 重新开始按钮 */}
            <Pressable
              onPress={onReset}
              bg="rgba(255, 215, 0, 0.2)"
              borderWidth={1}
              borderColor="rgba(255, 215, 0, 0.6)"
              borderRadius="lg"
              px={2}
              py={2}
              flex={1}
              alignItems="center"
              _pressed={{ bg: "rgba(255, 215, 0, 0.3)" }}
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
    </Box>
  );
};

export default ChessControls; 