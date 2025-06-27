import React from 'react';
import {
  Box,
  Text,
  ScrollView,
  VStack,
  Heading,
} from 'native-base';
import TicTacToeBoard from '../components/TicTacToeBoard';
import GameControls from '../components/GameControls';
import { useTicTacToe } from '../hooks/useTicTacToe';
import type { TicTacToeScreenProps } from '../types/navigation';

const TicTacToeScreen: React.FC<TicTacToeScreenProps> = ({ navigation }) => {
  const {
    gameState,
    isAIMode,
    playerMove,
    resetGame,
    toggleAIMode,
    undoMove,
    canUndo,
  } = useTicTacToe();

  return (
    <Box flex={1} bg="gray.50" safeArea>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {/* 游戏标题 */}
        <VStack alignItems="center" mb={8} px={5}>
          <Heading size="xl" color="gray.800" mb={2}>
            井字棋
          </Heading>
          <Text fontSize="md" color="gray.600" italic>
            亲子对弈游戏
          </Text>
        </VStack>

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
          canUndo={canUndo}
          onReset={resetGame}
          onUndo={undoMove}
          onToggleAI={toggleAIMode}
        />

        {/* 游戏说明 */}
        <Box bg="gray.100" mx={5} p={4} borderRadius="lg" mb={4}>
          <Text fontSize="md" fontWeight="bold" color="gray.800" mb={3}>
            游戏规则：
          </Text>
          <VStack space={1}>
            <Text fontSize="sm" color="gray.700">
              • 玩家轮流在3×3的棋盘上放置X或O
            </Text>
            <Text fontSize="sm" color="gray.700">
              • 率先在横、竖或斜线上连成三个相同标记的玩家获胜
            </Text>
            <Text fontSize="sm" color="gray.700">
              • 棋盘填满且无人获胜则为平局
            </Text>
            <Text fontSize="sm" color="gray.700">
              • 支持人机对战和双人对战模式
            </Text>
          </VStack>
        </Box>

        {/* 亲子建议 */}
        <Box 
          bg="green.50" 
          mx={5} 
          p={4} 
          borderRadius="lg" 
          borderLeftWidth={4} 
          borderLeftColor="green.500"
        >
          <Text fontSize="md" fontWeight="bold" color="green.700" mb={3}>
            亲子游戏建议：
          </Text>
          <VStack space={1}>
            <Text fontSize="sm" color="green.800">
              🎯 可以让孩子先手，培养策略思维
            </Text>
            <Text fontSize="sm" color="green.800">
              🤖 AI模式适合练习和学习
            </Text>
            <Text fontSize="sm" color="green.800">
              👥 双人模式适合亲子互动
            </Text>
            <Text fontSize="sm" color="green.800">
              🔄 使用撤销功能教导孩子思考
            </Text>
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default TicTacToeScreen; 