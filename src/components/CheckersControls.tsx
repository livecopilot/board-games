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
        return '平局！';
      }
      if (isAIMode && winner === 'black') {
        return 'AI 获胜！';
      }
      return `${winner === 'red' ? '红方' : '黑方'} 获胜！`;
    }
    
    if (isAIThinking) {
      return 'AI 思考中...';
    }

    if (mustCapture) {
      return `${currentPlayer === 'red' ? '红方' : '黑方'} 必须继续跳跃！`;
    }
    
    return `轮到 ${currentPlayer === 'red' ? '红方' : '黑方'}`;
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
        <VStack flex={1} space={3}>
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
                    color="rgba(255, 255, 255, 0.8)"
                    fontFamily="mono"
                  >
                    {currentPlayer === 'red' ? '红方回合' : '黑方回合'}
                  </Text>
                </HStack>
                <Text
                  fontSize="xs"
                  color={isAIMode ? "#0080ff" : "#ff0080"}
                  fontFamily="mono"
                  textAlign="center"
                >
                  {isAIMode ? '你是红方，AI是黑方' : '本地双人对战'}
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
        <VStack space={2} flex={1} mt={3}>
          {/* 重新开始按钮 */}
          <Pressable
            onPress={() => setShowResetDialog(true)}
            bg="rgba(255, 0, 128, 0.1)"
            borderWidth={1}
            borderColor="rgba(255, 0, 128, 0.4)"
            borderRadius="lg"
            px={4}
            py={3}
            w="50%"
            alignItems="center"
            _pressed={{ bg: "rgba(255, 0, 128, 0.2)" }}
            shadow={2}
          >
            <HStack alignItems="center" space={1}>
              <IconFont name="refresh" size={14} color="#ff0080" />
              <Text
                color="#ff0080"
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
            bg={canUndo && !mustCapture ? "rgba(255, 128, 0, 0.1)" : "rgba(128, 128, 128, 0.1)"}
            borderWidth={1}
            borderColor={canUndo && !mustCapture ? "rgba(255, 128, 0, 0.4)" : "rgba(128, 128, 128, 0.3)"}
            borderRadius="lg"
            px={4}
            py={3}
            w="50%"
            alignItems="center"
            _pressed={canUndo && !mustCapture ? { bg: "rgba(255, 128, 0, 0.2)" } : {}}
            shadow={canUndo && !mustCapture ? 2 : 0}
          >
            <HStack alignItems="center" space={1}>
              <IconFont name="arrow-undo" size={14} color={canUndo && !mustCapture ? "#ff8000" : "gray.500"} />
              <Text
                color={canUndo && !mustCapture ? "#ff8000" : "gray.500"}
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
            bg="rgba(255, 0, 128, 0.1)"
            borderWidth={1}
            borderColor="rgba(255, 0, 128, 0.4)"
            borderRadius="lg"
            px={4}
            py={3}
            w="50%"
            alignItems="center"
            _pressed={{ bg: "rgba(255, 0, 128, 0.2)" }}
            shadow={2}
          >
            <HStack alignItems="center" space={1}>
              <IconFont name={isAIMode ? "hardware-chip" : "people"} size={14} color="#ff0080" />
              <Text
                color="#ff0080"
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
            px={4}
            py={3}
            w="50%"
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
              <Button
                variant="ghost"
                flex={1}
                onPress={() => setShowToggleDialog(false)}
                _text={{ color: "gray.400" }}
              >
                取消
              </Button>
              <Button
                bg="#ff0080"
                flex={1}
                onPress={handleToggleAI}
                _text={{ color: "white", fontWeight: "bold" }}
                _pressed={{ bg: "#cc0066" }}
              >
                确认切换
              </Button>
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