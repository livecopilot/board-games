import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Board, Position, CellValue } from '../types';

interface TicTacToeBoardProps {
  board: Board;
  onCellPress: (position: Position) => void;
  disabled?: boolean;
}

const { width } = Dimensions.get('window');
const BOARD_SIZE = width * 0.8;
const CELL_SIZE = BOARD_SIZE / 3;

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({
  board,
  onCellPress,
  disabled = false,
}) => {
  const renderCell = (value: CellValue, row: number, col: number) => {
    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          row < 2 && styles.borderBottom,
          col < 2 && styles.borderRight,
        ]}
        onPress={() => !disabled && onCellPress({ row, col })}
        disabled={disabled || value !== null}
      >
        <Text style={[
          styles.cellText,
          value === 'X' && styles.playerX,
          value === 'O' && styles.playerO,
        ]}>
          {value || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) =>
            renderCell(cell, rowIndex, colIndex)
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 4,
  },
  cell: {
    width: CELL_SIZE - 4,
    height: CELL_SIZE - 4,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 4,
  },
  borderRight: {
    borderRightWidth: 2,
    borderRightColor: '#34495e',
  },
  borderBottom: {
    borderBottomWidth: 2,
    borderBottomColor: '#34495e',
  },
  cellText: {
    fontSize: CELL_SIZE * 0.4,
    fontWeight: 'bold',
  },
  playerX: {
    color: '#e74c3c',
  },
  playerO: {
    color: '#3498db',
  },
});

export default TicTacToeBoard; 