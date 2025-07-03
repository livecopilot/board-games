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
import { CellValue } from '../types';

interface GameControlsProps {
  currentPlayer: 'X' | 'O';
  winner: 'X' | 'O' | 'draw' | null;
  isGameOver: boolean;
  isAIMode: boolean;
  isAIThinking?: boolean;
  canUndo: boolean;
  canUndoForPlayer: (player: 'X' | 'O') => boolean;
  onReset: () => void;
  onUndo: () => void;
  onUndoForPlayer: (player: 'X' | 'O') => void;
  onToggleAI: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  currentPlayer,
  winner,
  isGameOver,
  isAIMode,
  isAIThinking = false,
  canUndo,
  canUndoForPlayer,
  onReset,
  onUndo,
  onUndoForPlayer,
  onToggleAI,
}) => {
  const getStatusText = () => {
    if (isGameOver) {
      if (winner === 'draw') {
        return '🤝 平局！';
      }
      if (isAIMode) {
        return winner === 'X' ? '🎉 你获胜了！' : '😔 AI获胜';
      } else {
        return winner === 'X' ? '🎉 我方获胜！' : '😔 对方获胜';
      }
    }
    
    if (isAIThinking) {
      return '🤖 AI思考中...';
    }
    
    if (isAIMode) {
      return currentPlayer === 'X' ? '🎯 轮到你了！' : '⏳ 等待AI...';
    } else {
      return currentPlayer === 'X' ? '🎯 轮到我方了！' : '⏳ 等待对方...';
    }
  };

  const getStatusColor = () => {
    if (isGameOver) {
      if (winner === 'draw') {
        return '#ff8000'; // 橙色
      }
      if (isAIMode && winner === 'O') {
        return '#ff0080'; // 粉色
      }
      return '#00ff88'; // 绿色
    }
    
    if (isAIThinking) {
      return '#0080ff'; // 蓝色
    }
    
    return 'white';
  };

  return (
    <Box>
      <HStack alignItems="flex-start" px={4} space={3} w="100%">
        {/* 左侧：游戏状态显示 */}
        <VStack flex={1} space={2} minH="90px" justifyContent="flex-start">
          <Box
            bg={!isGameOver && currentPlayer === 'X' && !isAIThinking ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.02)"}
            borderWidth={!isGameOver && currentPlayer === 'X' && !isAIThinking ? 2 : 1}
            borderColor={!isGameOver && currentPlayer === 'X' && !isAIThinking ? "rgba(0, 255, 136, 0.8)" : "rgba(0, 255, 136, 0.2)"}
            borderRadius="lg"
            p={3}
            w="100%"
            alignItems="center"
            shadow={!isGameOver && currentPlayer === 'X' && !isAIThinking ? 4 : 1}
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
                  color={currentPlayer === 'X' ? 'white' : 'rgba(255, 255, 255, 0.6)'}
                  fontFamily="mono"
                >
                  {isAIMode 
                    ? '玩家X（你）' 
                    : '玩家X（我方）'}
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
        </VStack>

        {/* 右侧：控制按钮 */}
        <VStack flex={1} mt={2} minH="90px" space={2}>
          {/* AI模式切换开关 */}
          <Box
            bg="rgba(0, 255, 136, 0.1)"
            borderWidth={1}
            borderColor="rgba(0, 255, 136, 0.4)"
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
                  true: "rgba(0, 255, 136, 0.6)"
                }}
                thumbColor={isAIMode ? "#00ff88" : "rgba(255, 255, 255, 0.8)"}
              />
            </HStack>
          </Box>

          {/* 操作按钮行 */}
          <HStack space={2} w="100%">
            {/* 重新开始按钮 */}
            <Pressable
              onPress={onReset}
              bg="rgba(0, 255, 136, 0.2)"
              borderWidth={1}
              borderColor="rgba(0, 255, 136, 0.6)"
              borderRadius="lg"
              px={2}
              py={2}
              flex={1}
              alignItems="center"
              _pressed={{ bg: "rgba(0, 255, 136, 0.3)" }}
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
              onPress={isAIMode ? onUndo : () => onUndoForPlayer('X')}
              isDisabled={isAIMode ? !canUndo : !canUndoForPlayer('X')}
              bg={(isAIMode ? canUndo : canUndoForPlayer('X')) ? "rgba(255, 128, 0, 0.2)" : "rgba(80, 80, 80, 0.15)"}
              borderWidth={1}
              borderColor={(isAIMode ? canUndo : canUndoForPlayer('X')) ? "rgba(255, 128, 0, 0.7)" : "rgba(80, 80, 80, 0.4)"}
              borderRadius="lg"
              px={2}
              py={2}
              flex={1}
              alignItems="center"
              _pressed={(isAIMode ? canUndo : canUndoForPlayer('X')) ? { bg: "rgba(255, 128, 0, 0.3)" } : {}}
              shadow={(isAIMode ? canUndo : canUndoForPlayer('X')) ? 2 : 0}
              opacity={(isAIMode ? canUndo : canUndoForPlayer('X')) ? 1 : 0.5}
            >
              <HStack alignItems="center" space={1}>
                <IconFont name="arrow-undo" size={12} color={(isAIMode ? canUndo : canUndoForPlayer('X')) ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 120, 120, 0.7)"} />
                <Text
                  color={(isAIMode ? canUndo : canUndoForPlayer('X')) ? "rgba(255, 255, 255, 0.9)" : "rgba(120, 120, 120, 0.7)"}
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

export default GameControls; 