import React from 'react';
import {
  Box,
  Text,
  Pressable,
} from 'native-base';
import { Board, Position, CellValue } from '../types';
import { getAdaptiveSize, getDeviceInfo } from '../utils/deviceUtils';

interface TicTacToeBoardProps {
  board: Board;
  onCellPress: (position: Position) => void;
  disabled?: boolean;
}

const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({
  board,
  onCellPress,
  disabled = false,
}) => {
  const deviceInfo = getDeviceInfo();
  const adaptiveSize = getAdaptiveSize();
  
  const BOARD_SIZE = adaptiveSize.boardSize;
  const CELL_SIZE = (BOARD_SIZE - (deviceInfo.isTablet ? 40 : 32)) / 3;
  const getCellColor = (value: CellValue) => {
    if (value === 'X') return 'rgba(0, 255, 136, 0.8)';
    if (value === 'O') return 'rgba(255, 0, 128, 0.8)';
    return 'rgba(255, 255, 255, 0.05)';
  };

  const getCellPressedColor = () => {
    return 'rgba(0, 255, 136, 0.2)';
  };

  const renderCell = (value: CellValue, row: number, col: number) => {
    // 计算网格线的位置
    const needsRightBorder = col < 2;
    const needsBottomBorder = row < 2;

    return (
      <Box
        key={`${row}-${col}`}
        position="relative"
        w={`${CELL_SIZE}px`}
        h={`${CELL_SIZE}px`}
        alignItems="center"
        justifyContent="center"
      >
        {/* 格子内容 - 留出边距 */}
        <Pressable
          onPress={() => !disabled && onCellPress({ row, col })}
          isDisabled={disabled || value !== null}
          w={`${CELL_SIZE - 8}px`}
          h={`${CELL_SIZE - 8}px`}
          bg={getCellColor(value)}
          borderRadius="md"
          alignItems="center"
          justifyContent="center"
          _pressed={!value ? { 
            bg: getCellPressedColor()
          } : {}}
        >
          <Text
            fontSize={`${(CELL_SIZE - 8) * (deviceInfo.isTablet ? 0.4 : 0.5)}px`}
            fontWeight="bold"
            color={value === 'X' ? 'black' : value === 'O' ? 'white' : 'transparent'}
            fontFamily="mono"
            letterSpacing={deviceInfo.isTablet ? 3 : 2}
          >
            {value || ''}
          </Text>
        </Pressable>

        {/* 右边界线 - 调整位置避免重叠 */}
        {needsRightBorder && (
          <Box
            position="absolute"
            right={-1}
            top="10%"
            bottom="10%"
            w={deviceInfo.isTablet ? "3px" : "2px"}
            bg="rgba(0, 255, 136, 0.6)"
            borderRadius="full"
          />
        )}

        {/* 底边界线 - 调整位置避免重叠 */}
        {needsBottomBorder && (
          <Box
            position="absolute"
            bottom={-1}
            left="10%"
            right="10%"
            h={deviceInfo.isTablet ? "3px" : "2px"}
            bg="rgba(0, 255, 136, 0.6)"
            borderRadius="full"
          />
        )}
      </Box>
    );
  };

  return (
    <Box alignItems="center" justifyContent="center">
      {/* 外边框容器 */}
      <Box
        w={`${BOARD_SIZE}px`}
        h={`${BOARD_SIZE}px`}
        bg="rgba(0, 0, 0, 0.4)"
        borderWidth={deviceInfo.isTablet ? 4 : 3}
        borderColor="rgba(0, 255, 136, 0.8)"
        borderRadius="xl"
        p={deviceInfo.isTablet ? 6 : 5}
        shadow={8}
        position="relative"
      >
        {/* 外边框发光效果 */}
        <Box
          position="absolute"
          top={-2}
          left={-2}
          right={-2}
          bottom={-2}
          borderWidth={1}
          borderColor="rgba(0, 255, 136, 0.3)"
          borderRadius="xl"
          zIndex={-1}
        />

        {/* 内部网格容器 */}
        <Box
          w="100%"
          h="100%"
          bg="rgba(0, 0, 0, 0.2)"
          borderRadius="md"
          overflow="hidden"
        >
          {/* 3x3 网格 */}
          <Box flexDirection="row" flex={1}>
            <Box flex={1}>
              <Box flex={1}>
                {renderCell(board[0][0], 0, 0)}
              </Box>
              <Box flex={1}>
                {renderCell(board[1][0], 1, 0)}
              </Box>
              <Box flex={1}>
                {renderCell(board[2][0], 2, 0)}
              </Box>
            </Box>
            <Box flex={1}>
              <Box flex={1}>
                {renderCell(board[0][1], 0, 1)}
              </Box>
              <Box flex={1}>
                {renderCell(board[1][1], 1, 1)}
              </Box>
              <Box flex={1}>
                {renderCell(board[2][1], 2, 1)}
              </Box>
            </Box>
            <Box flex={1}>
              <Box flex={1}>
                {renderCell(board[0][2], 0, 2)}
              </Box>
              <Box flex={1}>
                {renderCell(board[1][2], 1, 2)}
              </Box>
              <Box flex={1}>
                {renderCell(board[2][2], 2, 2)}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 角落装饰 */}
        <Box
          position="absolute"
          top={2}
          left={2}
          w={deviceInfo.isTablet ? "20px" : "15px"}
          h={deviceInfo.isTablet ? "20px" : "15px"}
          borderTopWidth={deviceInfo.isTablet ? 3 : 2}
          borderLeftWidth={deviceInfo.isTablet ? 3 : 2}
          borderColor="rgba(0, 255, 136, 0.6)"
        />
        <Box
          position="absolute"
          top={2}
          right={2}
          w={deviceInfo.isTablet ? "20px" : "15px"}
          h={deviceInfo.isTablet ? "20px" : "15px"}
          borderTopWidth={deviceInfo.isTablet ? 3 : 2}
          borderRightWidth={deviceInfo.isTablet ? 3 : 2}
          borderColor="rgba(0, 255, 136, 0.6)"
        />
        <Box
          position="absolute"
          bottom={2}
          left={2}
          w={deviceInfo.isTablet ? "20px" : "15px"}
          h={deviceInfo.isTablet ? "20px" : "15px"}
          borderBottomWidth={deviceInfo.isTablet ? 3 : 2}
          borderLeftWidth={deviceInfo.isTablet ? 3 : 2}
          borderColor="rgba(0, 255, 136, 0.6)"
        />
        <Box
          position="absolute"
          bottom={2}
          right={2}
          w={deviceInfo.isTablet ? "20px" : "15px"}
          h={deviceInfo.isTablet ? "20px" : "15px"}
          borderBottomWidth={deviceInfo.isTablet ? 3 : 2}
          borderRightWidth={deviceInfo.isTablet ? 3 : 2}
          borderColor="rgba(0, 255, 136, 0.6)"
        />
      </Box>
    </Box>
  );
};

export default TicTacToeBoard; 