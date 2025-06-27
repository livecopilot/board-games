import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import TicTacToeBoard from '../components/TicTacToeBoard';
import GameControls from '../components/GameControls';
import { useTicTacToe } from '../hooks/useTicTacToe';

const TicTacToeScreen: React.FC = () => {
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
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 游戏标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>井字棋</Text>
          <Text style={styles.subtitle}>亲子对弈游戏</Text>
        </View>

        {/* 游戏棋盘 */}
        <View style={styles.boardContainer}>
          <TicTacToeBoard
            board={gameState.board}
            onCellPress={playerMove}
            disabled={gameState.isGameOver || (isAIMode && gameState.currentPlayer === 'O')}
          />
        </View>

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
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>游戏规则：</Text>
          <Text style={styles.instructionText}>
            • 玩家轮流在3×3的棋盘上放置X或O
          </Text>
          <Text style={styles.instructionText}>
            • 率先在横、竖或斜线上连成三个相同标记的玩家获胜
          </Text>
          <Text style={styles.instructionText}>
            • 棋盘填满且无人获胜则为平局
          </Text>
          <Text style={styles.instructionText}>
            • 支持人机对战和双人对战模式
          </Text>
        </View>

        {/* 亲子建议 */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>亲子游戏建议：</Text>
          <Text style={styles.tipText}>
            🎯 可以让孩子先手，培养策略思维
          </Text>
          <Text style={styles.tipText}>
            🤖 AI模式适合练习和学习
          </Text>
          <Text style={styles.tipText}>
            👥 双人模式适合亲子互动
          </Text>
          <Text style={styles.tipText}>
            🔄 使用撤销功能教导孩子思考
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  boardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionsContainer: {
    backgroundColor: '#ecf0f1',
    margin: 20,
    padding: 15,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: '#e8f5e8',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#2d5a3d',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default TicTacToeScreen; 