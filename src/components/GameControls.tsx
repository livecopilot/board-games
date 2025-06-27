import React from 'react';
import {
  Box,
  Text,
  HStack,
  VStack,
  Pressable,
  Button,
} from 'native-base';
import { useState } from 'react';
import Modal from 'react-native-modal';
import { CellValue } from '../types';

interface GameControlsProps {
  currentPlayer: 'X' | 'O';
  winner: CellValue | 'draw';
  isGameOver: boolean;
  isAIMode: boolean;
  isAIThinking?: boolean;
  canUndo: boolean;
  onReset: () => void;
  onUndo: () => void;
  onToggleAI: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  currentPlayer,
  winner,
  isGameOver,
  isAIMode,
  isAIThinking = false,
  canUndo,
  onReset,
  onUndo,
  onToggleAI,
}) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);

  const getStatusText = () => {
    if (isGameOver) {
      if (winner === 'draw') {
        return '平局！';
      }
      if (isAIMode && winner === 'O') {
        return 'AI 获胜！';
      }
      return `玩家 ${winner} 获胜！`;
    }
    
    if (isAIThinking) {
      return 'AI 思考中...';
    }
    
    return `轮到玩家 ${currentPlayer}`;
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

  const handleReset = () => {
    setShowResetDialog(false);
    onReset();
  };

  const handleToggleAI = () => {
    setShowToggleDialog(false);
    onToggleAI();
  };

  return (
    <VStack alignItems="center" px={5} space={5}>
      {/* 游戏状态显示 */}
      <Box
        bg="rgba(255, 255, 255, 0.05)"
        borderWidth={1}
        borderColor="rgba(0, 255, 136, 0.3)"
        borderRadius="lg"
        p={4}
        minW="200px"
        alignItems="center"
        shadow={3}
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
      </Box>

      {/* 控制按钮 */}
      <HStack space={3} justifyContent="center" w="100%">
        {/* 重新开始按钮 */}
        <Pressable
          onPress={() => setShowResetDialog(true)}
          bg="rgba(255, 0, 128, 0.1)"
          borderWidth={1}
          borderColor="rgba(255, 0, 128, 0.4)"
          borderRadius="lg"
          px={4}
          py={3}
          flex={1}
          alignItems="center"
          _pressed={{ bg: "rgba(255, 0, 128, 0.2)" }}
          shadow={2}
        >
          <Text
            color="#ff0080"
            fontWeight="bold"
            fontSize="sm"
            fontFamily="mono"
          >
            重新开始
          </Text>
        </Pressable>

        {/* 撤销按钮 */}
        <Pressable
          onPress={onUndo}
          isDisabled={!canUndo}
          bg={canUndo ? "rgba(255, 128, 0, 0.1)" : "rgba(128, 128, 128, 0.1)"}
          borderWidth={1}
          borderColor={canUndo ? "rgba(255, 128, 0, 0.4)" : "rgba(128, 128, 128, 0.3)"}
          borderRadius="lg"
          px={4}
          py={3}
          flex={1}
          alignItems="center"
          _pressed={canUndo ? { bg: "rgba(255, 128, 0, 0.2)" } : {}}
          shadow={canUndo ? 2 : 0}
        >
          <Text
            color={canUndo ? "#ff8000" : "gray.500"}
            fontWeight="bold"
            fontSize="sm"
            fontFamily="mono"
          >
            撤销
          </Text>
        </Pressable>
      </HStack>

      {/* 游戏模式切换器 */}
      <VStack alignItems="center" space={3} w="100%">
        <Text
          fontSize="sm"
          color="rgba(255, 255, 255, 0.8)"
          fontFamily="mono"
          fontWeight="bold"
        >
          游戏模式
        </Text>
        
        {/* Toggle开关样式的模式切换 */}
        <Pressable
          onPress={() => setShowToggleDialog(true)}
          bg="rgba(255, 255, 255, 0.05)"
          borderWidth={2}
          borderColor="rgba(0, 255, 136, 0.4)"
          borderRadius="full"
          w="280px"
          h="50px"
          position="relative"
          shadow={4}
          _pressed={{ bg: "rgba(255, 255, 255, 0.1)" }}
        >
          {/* 滑动指示器 */}
          <Box
            position="absolute"
            left={isAIMode ? "6px" : "142px"}
            top="6px"
            w="130px"
            h="38px"
            bg={isAIMode ? "rgba(0, 128, 255, 0.8)" : "rgba(0, 255, 136, 0.8)"}
            borderRadius="full"
            shadow={6}
          />
          
          {/* 模式选项 */}
          <HStack h="100%" alignItems="center">
            {/* AI模式选项 */}
            <Box flex={1} alignItems="center" justifyContent="center">
              <HStack alignItems="center" space={2}>
                <Text fontSize="lg">🤖</Text>
                <Text
                  color={isAIMode ? "white" : "rgba(255, 255, 255, 0.6)"}
                  fontWeight="bold"
                  fontSize="sm"
                  fontFamily="mono"
                >
                  AI对战
                </Text>
              </HStack>
            </Box>
            
            {/* 双人模式选项 */}
            <Box flex={1} alignItems="center" justifyContent="center">
              <HStack alignItems="center" space={2}>
                <Text fontSize="lg">👥</Text>
                <Text
                  color={!isAIMode ? "black" : "rgba(255, 255, 255, 0.6)"}
                  fontWeight="bold"
                  fontSize="sm"
                  fontFamily="mono"
                >
                  双人对战
                </Text>
              </HStack>
            </Box>
          </HStack>
        </Pressable>

        {/* 当前模式说明 */}
        <Box
          bg={isAIMode ? "rgba(0, 128, 255, 0.1)" : "rgba(0, 255, 136, 0.1)"}
          borderWidth={1}
          borderColor={isAIMode ? "rgba(0, 128, 255, 0.3)" : "rgba(0, 255, 136, 0.3)"}
          borderRadius="lg"
          px={4}
          py={2}
        >
          <Text
            fontSize="xs"
            color={isAIMode ? "#0080ff" : "#00ff88"}
            textAlign="center"
            fontFamily="mono"
            letterSpacing={0.5}
          >
            {isAIMode ? '🤖 你是X，AI是O' : '👥 本地双人对战'}
          </Text>
        </Box>
      </VStack>

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
              <Button
                variant="ghost"
                flex={1}
                onPress={() => setShowResetDialog(false)}
                _text={{ color: "gray.400" }}
              >
                取消
              </Button>
              <Button
                bg="#ff0080"
                flex={1}
                onPress={handleReset}
                _text={{ color: "white", fontWeight: "bold" }}
                _pressed={{ bg: "#cc0066" }}
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
          borderColor="rgba(0, 255, 136, 0.3)"
          borderWidth={1}
          borderRadius="lg"
          w="85%"
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
              {isAIMode ? '关闭AI模式' : '开启AI模式'}
            </Text>
            <Pressable
              onPress={() => setShowToggleDialog(false)}
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
          <Box p={4}>
            <Text color="white" fontSize="md" textAlign="center">
              {isAIMode 
                ? '切换到双人对战模式？游戏将重新开始。' 
                : '切换到人机对战模式？游戏将重新开始。'}
            </Text>
          </Box>

          {/* 底部按钮 */}
          <Box
            bg="rgba(0, 255, 136, 0.05)"
            borderBottomRadius="lg"
            borderTopWidth={1}
            borderTopColor="rgba(0, 255, 136, 0.2)"
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
                bg="#00ff88"
                flex={1}
                onPress={handleToggleAI}
                _text={{ color: "black", fontWeight: "bold" }}
                _pressed={{ bg: "#00cc6a" }}
              >
                确认切换
              </Button>
            </HStack>
          </Box>
        </Box>
      </Modal>
    </VStack>
  );
};

export default GameControls; 