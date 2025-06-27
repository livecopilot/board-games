import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { CellValue } from '../types';

interface GameControlsProps {
  currentPlayer: 'X' | 'O';
  winner: CellValue | 'draw';
  isGameOver: boolean;
  isAIMode: boolean;
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
  canUndo,
  onReset,
  onUndo,
  onToggleAI,
}) => {
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
    
    if (isAIMode && currentPlayer === 'O') {
      return 'AI 思考中...';
    }
    
    return `轮到玩家 ${currentPlayer}`;
  };

  const handleReset = () => {
    Alert.alert(
      '重新开始',
      '确定要重新开始游戏吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: onReset },
      ]
    );
  };

  const handleToggleAI = () => {
    Alert.alert(
      isAIMode ? '关闭AI模式' : '开启AI模式',
      isAIMode 
        ? '切换到双人对战模式？' 
        : '切换到人机对战模式？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: onToggleAI },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 游戏状态显示 */}
      <View style={styles.statusContainer}>
        <Text style={[
          styles.statusText,
          isGameOver && styles.gameOverText,
        ]}>
          {getStatusText()}
        </Text>
      </View>

      {/* 控制按钮 */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>重新开始</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.undoButton,
            !canUndo && styles.disabledButton,
          ]}
          onPress={onUndo}
          disabled={!canUndo}
        >
          <Text style={[
            styles.buttonText,
            !canUndo && styles.disabledButtonText,
          ]}>
            撤销
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            isAIMode ? styles.aiOnButton : styles.aiOffButton,
          ]}
          onPress={handleToggleAI}
        >
          <Text style={styles.buttonText}>
            {isAIMode ? 'AI模式' : '双人模式'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 模式说明 */}
      <Text style={styles.modeText}>
        当前模式: {isAIMode ? '人机对战 (你是X，AI是O)' : '双人对战'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  gameOverText: {
    color: '#e74c3c',
    fontSize: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resetButton: {
    backgroundColor: '#e74c3c',
  },
  undoButton: {
    backgroundColor: '#f39c12',
  },
  aiOnButton: {
    backgroundColor: '#27ae60',
  },
  aiOffButton: {
    backgroundColor: '#3498db',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButtonText: {
    color: '#7f8c8d',
  },
  modeText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default GameControls; 