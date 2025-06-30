import React from 'react';
import {
  Box,
  Text,
  Pressable,
} from 'native-base';
import { Dimensions } from 'react-native';
import { CheckersBoard as CheckersBoardType, Position, CheckersPiece, CheckersMove } from '../types';

interface CheckersBoardProps {
  board: CheckersBoardType;
  onCellPress: (position: Position) => void;
  selectedPiece?: Position | null;
  validMoves?: Position[];
  disabled?: boolean;
  lastMove?: CheckersMove | null;
}

const { width } = Dimensions.get('window');
const BOARD_SIZE = width * 0.9;
const CELL_SIZE = (BOARD_SIZE - 40) / 8; // 8x8 棋盘

const CheckersBoard: React.FC<CheckersBoardProps> = ({
  board,
  onCellPress,
  selectedPiece,
  validMoves = [],
  disabled = false,
  lastMove = null,
}) => {
  
  const getCellColor = (row: number, col: number) => {
    // 棋盘颜色（黑白相间）
    return (row + col) % 2 === 0 ? 'rgba(139, 69, 19, 0.8)' : 'rgba(222, 184, 135, 0.9)';
  };

  const getPieceColor = (piece: CheckersPiece) => {
    if (!piece) return 'transparent';
    return piece.player === 'red' ? '#ff3030' : '#303030';
  };

  const isPieceSelected = (row: number, col: number): boolean => {
    return selectedPiece?.row === row && selectedPiece?.col === col;
  };

  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isLastMoveFrom = (row: number, col: number): boolean => {
    return lastMove?.from.row === row && lastMove?.from.col === col;
  };

  const isLastMoveTo = (row: number, col: number): boolean => {
    return lastMove?.to.row === row && lastMove?.to.col === col;
  };

  const renderCell = (row: number, col: number) => {
    const piece = board[row][col];
    const isSelected = isPieceSelected(row, col);
    const canMoveTo = isValidMove(row, col);
    const isDarkSquare = (row + col) % 2 === 1;
    const isMoveFrom = isLastMoveFrom(row, col);
    const isMoveTo = isLastMoveTo(row, col);

    return (
      <Pressable
        key={`${row}-${col}`}
        onPress={() => !disabled && onCellPress({ row, col })}
        isDisabled={disabled}
        w={`${CELL_SIZE}px`}
        h={`${CELL_SIZE}px`}
        bg={getCellColor(row, col)}
        alignItems="center"
        justifyContent="center"
        borderWidth={isSelected ? 3 : 0}
        borderColor={isSelected ? "#00ff88" : "transparent"}
        position="relative"
        _pressed={isDarkSquare ? { 
          bg: "rgba(0, 255, 136, 0.2)"
        } : {}}
      >
        {/* 可移动位置的提示 */}
        {canMoveTo && (
          <Box
            position="absolute"
            w="20px"
            h="20px"
            borderRadius="full"
            bg="rgba(0, 255, 136, 0.7)"
            borderWidth={2}
            borderColor="rgba(0, 255, 136, 0.9)"
            shadow={4}
          />
        )}

        {/* 移动前位置的空心圆圈 */}
        {isMoveFrom && (
          <Box
            position="absolute"
            w="16px"
            h="16px"
            borderRadius="full"
            borderWidth={2}
            borderColor="rgba(255, 215, 0, 0.8)"
            bg="transparent"
            shadow={3}
          />
        )}

        {/* 棋子 */}
        {piece && (
          <Box position="relative">
            {/* 移动后的发光效果 */}
            {isMoveTo && (
              <Box
                position="absolute"
                w={`${CELL_SIZE * 0.8}px`}
                h={`${CELL_SIZE * 0.8}px`}
                borderRadius="full"
                borderWidth={2}
                borderColor="rgba(255, 215, 0, 0.6)"
                bg="transparent"
                left={`${-CELL_SIZE * 0.05}px`}
                top={`${-CELL_SIZE * 0.05}px`}
                shadow={6}
              />
            )}
            
            <Box
              w={`${CELL_SIZE * 0.7}px`}
              h={`${CELL_SIZE * 0.7}px`}
              borderRadius="full"
              bg={getPieceColor(piece)}
              borderWidth={isMoveTo ? 4 : 3}
              borderColor={isMoveTo ? '#ffd700' : piece.player === 'red' ? '#ff6060' : '#606060'}
              alignItems="center"
              justifyContent="center"
              shadow={isMoveTo ? 8 : 6}
              position="relative"
            >
              {/* 王的标记 */}
              {piece.isKing && (
                <Box
                  position="absolute"
                  w="100%"
                  h="100%"
                  borderRadius="full"
                  borderWidth={2}
                  borderColor="#ffd700"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    fontSize={`${CELL_SIZE * 0.3}px`}
                    color="#ffd700"
                    fontWeight="bold"
                  >
                    ♔
                  </Text>
                </Box>
              )}

              {/* 棋子内部高光 */}
              <Box
                position="absolute"
                top={1}
                left={1}
                w={`${CELL_SIZE * 0.3}px`}
                h={`${CELL_SIZE * 0.3}px`}
                borderRadius="full"
                bg={piece.player === 'red' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)'}
              />
            </Box>
          </Box>
        )}

        {/* 选中效果 */}
        {isSelected && (
          <Box
            position="absolute"
            w="100%"
            h="100%"
            borderRadius="md"
            bg="rgba(0, 255, 136, 0.15)"
            borderWidth={2}
            borderColor="#00ff88"
          />
        )}
      </Pressable>
    );
  };

  return (
    <Box alignItems="center" justifyContent="center">
      {/* 外边框容器 */}
      <Box
        w={`${BOARD_SIZE}px`}
        h={`${BOARD_SIZE}px`}
        bg="rgba(0, 0, 0, 0.4)"
        borderWidth={4}
        borderColor="rgba(255, 0, 128, 0.8)"
        borderRadius="xl"
        p={5}
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
          borderColor="rgba(255, 0, 128, 0.3)"
          borderRadius="xl"
          zIndex={-1}
        />

        {/* 内部棋盘容器 */}
        <Box
          w="100%"
          h="100%"
          bg="rgba(0, 0, 0, 0.2)"
          borderRadius="md"
          overflow="hidden"
        >
          {/* 8x8 网格 */}
          <Box flexDirection="column" flex={1}>
            {Array.from({ length: 8 }, (_, row) => (
              <Box key={row} flexDirection="row" flex={1}>
                {Array.from({ length: 8 }, (_, col) => (
                  <Box key={col} flex={1}>
                    {renderCell(row, col)}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>

        {/* 角落装饰 */}
        <Box
          position="absolute"
          top={2}
          left={2}
          w="20px"
          h="20px"
          borderTopWidth={3}
          borderLeftWidth={3}
          borderColor="rgba(255, 0, 128, 0.6)"
        />
        <Box
          position="absolute"
          top={2}
          right={2}
          w="20px"
          h="20px"
          borderTopWidth={3}
          borderRightWidth={3}
          borderColor="rgba(255, 0, 128, 0.6)"
        />
        <Box
          position="absolute"
          bottom={2}
          left={2}
          w="20px"
          h="20px"
          borderBottomWidth={3}
          borderLeftWidth={3}
          borderColor="rgba(255, 0, 128, 0.6)"
        />
        <Box
          position="absolute"
          bottom={2}
          right={2}
          w="20px"
          h="20px"
          borderBottomWidth={3}
          borderRightWidth={3}
          borderColor="rgba(255, 0, 128, 0.6)"
        />

        {/* 侧边标记 */}
        {/* 行号 */}
        {Array.from({ length: 8 }, (_, i) => (
          <Box
            key={`row-${i}`}
            position="absolute"
            left={-25}
            top={5 + i * CELL_SIZE + CELL_SIZE/2 - 8}
            w="20px"
            h="16px"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              color="rgba(255, 0, 128, 0.8)"
              fontSize="xs"
              fontFamily="mono"
              fontWeight="bold"
            >
              {8 - i}
            </Text>
          </Box>
        ))}

        {/* 列号 */}
        {Array.from({ length: 8 }, (_, i) => (
          <Box
            key={`col-${i}`}
            position="absolute"
            bottom={-25}
            left={5 + i * CELL_SIZE + CELL_SIZE/2 - 8}
            w="16px"
            h="20px"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              color="rgba(255, 0, 128, 0.8)"
              fontSize="xs"
              fontFamily="mono"
              fontWeight="bold"
            >
              {String.fromCharCode(65 + i)}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CheckersBoard; 