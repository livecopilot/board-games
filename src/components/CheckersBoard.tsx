import React, { useEffect, useRef } from 'react';
import {
  Box,
  Text,
  Pressable,
} from 'native-base';
import { Dimensions, Animated } from 'react-native';
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
  
  // 选中效果闪烁动画
  const blinkAnimation = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  // 移动后效果闪烁动画
  const moveToBlinkAnimation = useRef(new Animated.Value(1)).current;
  const moveToPulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createBlinkAnimation = (animValue: Animated.Value) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 0.4,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const createPulseAnimation = (animValue: Animated.Value) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1.1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations: Animated.CompositeAnimation[] = [];

    if (selectedPiece) {
      const blinkAnim = createBlinkAnimation(blinkAnimation);
      const pulseAnim = createPulseAnimation(pulseAnimation);
      animations.push(blinkAnim, pulseAnim);
      blinkAnim.start();
      pulseAnim.start();
    }

    if (lastMove) {
      const moveToBlinkAnim = createBlinkAnimation(moveToBlinkAnimation);
      const moveToPulseAnim = createPulseAnimation(moveToPulseAnimation);
      animations.push(moveToBlinkAnim, moveToPulseAnim);
      moveToBlinkAnim.start();
      moveToPulseAnim.start();
    }

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [selectedPiece, lastMove, blinkAnimation, pulseAnimation, moveToBlinkAnimation, moveToPulseAnimation]);

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
          <Animated.View
            style={{
              position: 'absolute',
              left: CELL_SIZE * (0.5 - 0.15),
              top: CELL_SIZE * (0.5 - 0.15),
              width: CELL_SIZE * 0.3,
              height: CELL_SIZE * 0.3,
              borderRadius: CELL_SIZE * 0.15,
              borderWidth: 3,
              borderColor: 'rgba(255, 215, 0, 0.8)',
              backgroundColor: 'transparent',
              shadowColor: '#ffd700',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 6,
              elevation: 6,
              opacity: moveToBlinkAnimation,
            }}
          />
        )}

        {/* 移动后的闪烁效果 */}
        {isMoveTo && (
          <>
            {/* 外层脉冲效果 */}
            <Animated.View
              style={{
                position: 'absolute',
                left: CELL_SIZE * (0.5 - 0.48),
                top: CELL_SIZE * (0.5 - 0.48),
                width: CELL_SIZE * 0.96,
                height: CELL_SIZE * 0.96,
                borderRadius: CELL_SIZE * 0.48,
                borderWidth: 3,
                borderColor: '#ffd700',
                backgroundColor: 'transparent',
                transform: [{ scale: moveToPulseAnimation }],
                opacity: moveToBlinkAnimation,
              }}
            />
            {/* 内层闪烁效果 */}
            <Animated.View
              style={{
                position: 'absolute',
                left: CELL_SIZE * (0.5 - 0.45),
                top: CELL_SIZE * (0.5 - 0.45),
                width: CELL_SIZE * 0.9,
                height: CELL_SIZE * 0.9,
                borderRadius: CELL_SIZE * 0.45,
                borderWidth: 2,
                borderColor: '#ffd700',
                backgroundColor: 'rgba(255, 215, 0, 0.15)',
                shadowColor: '#ffd700',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 10,
                opacity: moveToBlinkAnimation,
              }}
            />
          </>
        )}

        {/* 棋子 */}
        {piece && (
          <Box position="relative">
            {/* 移动后的发光效果 */}
            {isMoveTo && (
              <Animated.View
                style={{
                  position: 'absolute',
                  left: -CELL_SIZE * 0.05,
                  top: -CELL_SIZE * 0.05,
                  width: CELL_SIZE * 0.8,
                  height: CELL_SIZE * 0.8,
                  borderRadius: CELL_SIZE * 0.4,
                  borderWidth: 2,
                  borderColor: 'rgba(255, 215, 0, 0.6)',
                  backgroundColor: 'transparent',
                  shadowColor: '#ffd700',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 8,
                  elevation: 8,
                  opacity: moveToBlinkAnimation,
                }}
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
          <>
            {/* 外层脉冲效果 */}
            <Animated.View
              style={{
                position: 'absolute',
                left: CELL_SIZE * (0.5 - 0.48),
                top: CELL_SIZE * (0.5 - 0.48),
                width: CELL_SIZE * 0.96,
                height: CELL_SIZE * 0.96,
                borderRadius: CELL_SIZE * 0.48,
                borderWidth: 3,
                borderColor: '#00ff88',
                backgroundColor: 'transparent',
                transform: [{ scale: pulseAnimation }],
                opacity: blinkAnimation,
              }}
            />
            {/* 内层闪烁效果 */}
            <Animated.View
              style={{
                position: 'absolute',
                left: CELL_SIZE * (0.5 - 0.45),
                top: CELL_SIZE * (0.5 - 0.45),
                width: CELL_SIZE * 0.9,
                height: CELL_SIZE * 0.9,
                borderRadius: CELL_SIZE * 0.45,
                borderWidth: 2,
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.15)',
                shadowColor: '#00ff88',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 10,
                opacity: blinkAnimation,
              }}
            />
          </>
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