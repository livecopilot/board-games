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

interface ChessControlsProps {
  currentPlayer: 'red' | 'black';
  winner: 'red' | 'black' | 'draw' | null;
  isGameOver: boolean;
  isAIMode: boolean;
  isAIThinking: boolean;
  isInCheck?: boolean;
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
  canUndo,
  onReset,
  onUndo,
  onToggleAI,
}) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);

  const getPlayerText = (player: 'red' | 'black') => {
    return player === 'red' ? '红方' : '黑方';
  };

  const getStatusText = () => {
    if (isGameOver) {
      if (winner === 'draw') {
        return '平局！';
      }
      if (isAIMode && winner === 'black') {
        return 'AI 获胜！';
      }
      return `${getPlayerText(winner!)} 获胜！`;
    }
    
    if (isAIThinking) {
      return 'AI 思考中...';
    }

    if (isInCheck) {
      return `${getPlayerText(currentPlayer)} 被将军！`;
    }
    
    return `轮到 ${getPlayerText(currentPlayer)}`;
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
    
    if (isInCheck) {
      return '#ff3030'; // 红色警告
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
    <VStack alignItems="center" px={5} space={5}>
      {/* 游戏状态显示 */}
      <Box
        bg="rgba(255, 215, 0, 0.1)"
        borderWidth={2}
        borderColor="rgba(255, 215, 0, 0.3)"
        borderRadius="lg"
        p={4}
        minW="200px"
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
          <HStack alignItems="center" mt={2} space={2}>
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
              color="rgba(255, 255, 255, 0.8)"
              fontFamily="mono"
            >
              {getPlayerText(currentPlayer)}回合
            </Text>
          </HStack>
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

      {/* 控制按钮 */}
      <HStack space={2} justifyContent="center" w="100%">
        {/* 重新开始按钮 */}
        <Pressable
          onPress={() => setShowResetDialog(true)}
          bg="rgba(255, 215, 0, 0.1)"
          borderWidth={1}
          borderColor="rgba(255, 215, 0, 0.4)"
          borderRadius="lg"
          px={3}
          py={3}
          flex={1}
          alignItems="center"
          _pressed={{ bg: "rgba(255, 215, 0, 0.2)" }}
          shadow={2}
        >
          <Text
            color="rgba(255, 215, 0, 0.9)"
            fontWeight="bold"
            fontSize="xs"
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
          px={3}
          py={3}
          flex={1}
          alignItems="center"
          _pressed={canUndo ? { bg: "rgba(255, 128, 0, 0.2)" } : {}}
          shadow={canUndo ? 2 : 0}
        >
          <Text
            color={canUndo ? "#ff8000" : "gray.500"}
            fontWeight="bold"
            fontSize="xs"
            fontFamily="mono"
          >
            悔棋
          </Text>
        </Pressable>

        {/* 游戏模式切换按钮 */}
        <Pressable
          onPress={() => setShowToggleDialog(true)}
          bg="rgba(255, 215, 0, 0.1)"
          borderWidth={1}
          borderColor="rgba(255, 215, 0, 0.4)"
          borderRadius="lg"
          px={3}
          py={3}
          flex={1.2}
          alignItems="center"
          _pressed={{ bg: "rgba(255, 215, 0, 0.2)" }}
          shadow={2}
        >
          <Text
            color="rgba(255, 215, 0, 0.9)"
            fontWeight="bold"
            fontSize="xs"
            fontFamily="mono"
            textAlign="center"
          >
            {isAIMode ? 'AI对战' : '双人对战'}
          </Text>
        </Pressable>
      </HStack>

      {/* 当前模式说明 */}
      <Box
        bg="rgba(255, 215, 0, 0.1)"
        borderWidth={1}
        borderColor="rgba(255, 215, 0, 0.3)"
        borderRadius="lg"
        px={4}
        py={2}
        w="100%"
      >
        <Text
          fontSize="xs"
          color="rgba(255, 215, 0, 0.9)"
          textAlign="center"
          fontFamily="mono"
          letterSpacing={0.5}
        >
          {isAIMode ? '你是红方，AI是黑方' : '本地双人对战'}
        </Text>
      </Box>

      {/* 将军提示 */}
      {isInCheck && !isGameOver && (
        <Box
          bg="rgba(255, 0, 0, 0.1)"
          borderWidth={1}
          borderColor="rgba(255, 0, 0, 0.4)"
          borderRadius="lg"
          p={3}
          w="100%"
          alignItems="center"
        >
          <Text
            fontSize="sm"
            color="#ff3030"
            fontFamily="mono"
            textAlign="center"
          >
            ⚠️ 将军！必须解除将军状态
          </Text>
        </Box>
      )}

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
          borderColor="rgba(255, 215, 0, 0.3)"
          borderWidth={1}
          borderRadius="lg"
          w="85%"
          shadow={5}
        >
          {/* 头部 */}
          <HStack
            justifyContent="space-between"
            alignItems="center"
            bg="rgba(255, 215, 0, 0.1)"
            borderTopRadius="lg"
            borderBottomWidth={1}
            borderBottomColor="rgba(255, 215, 0, 0.3)"
            px={4}
            py={3}
          >
            <Text fontSize="lg" fontWeight="bold" color="rgba(255, 215, 0, 0.9)" fontFamily="mono">
              重新开始
            </Text>
            <Pressable
              onPress={() => setShowResetDialog(false)}
              _pressed={{ bg: "rgba(255, 215, 0, 0.1)" }}
              borderRadius="md"
              px={2}
              py={1}
            >
              <Text
                color="rgba(255, 215, 0, 0.9)"
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
            bg="rgba(255, 215, 0, 0.05)"
            borderBottomRadius="lg"
            borderTopWidth={1}
            borderTopColor="rgba(255, 215, 0, 0.2)"
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
                bg="rgba(255, 215, 0, 0.8)"
                flex={1}
                onPress={handleReset}
                _text={{ color: "black", fontWeight: "bold" }}
                _pressed={{ bg: "rgba(255, 215, 0, 0.6)" }}
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
          borderColor="rgba(255, 215, 0, 0.3)"
          borderWidth={1}
          borderRadius="lg"
          w="85%"
          shadow={5}
        >
          {/* 头部 */}
          <HStack
            justifyContent="space-between"
            alignItems="center"
            bg="rgba(255, 215, 0, 0.1)"
            borderTopRadius="lg"
            borderBottomWidth={1}
            borderBottomColor="rgba(255, 215, 0, 0.3)"
            px={4}
            py={3}
          >
            <Text fontSize="lg" fontWeight="bold" color="rgba(255, 215, 0, 0.9)" fontFamily="mono">
              {isAIMode ? '关闭AI模式' : '开启AI模式'}
            </Text>
            <Pressable
              onPress={() => setShowToggleDialog(false)}
              _pressed={{ bg: "rgba(255, 215, 0, 0.1)" }}
              borderRadius="md"
              px={2}
              py={1}
            >
              <Text
                color="rgba(255, 215, 0, 0.9)"
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
            bg="rgba(255, 215, 0, 0.05)"
            borderBottomRadius="lg"
            borderTopWidth={1}
            borderTopColor="rgba(255, 215, 0, 0.2)"
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
                bg="rgba(255, 215, 0, 0.8)"
                flex={1}
                onPress={handleToggleAI}
                _text={{ color: "black", fontWeight: "bold" }}
                _pressed={{ bg: "rgba(255, 215, 0, 0.6)" }}
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

export default ChessControls; 