import React, { useEffect, useRef } from 'react';
import { Box, Pressable } from 'native-base';
import { Dimensions, Animated } from 'react-native';
import Svg, { Line, Circle, G } from 'react-native-svg';
import { GomokuBoard as GomokuBoardType, Position, GomokuPiece, GomokuMove } from '../types';

interface GomokuBoardProps {
  board: GomokuBoardType;
  onCellPress: (position: Position) => void;
  disabled?: boolean;
  lastMove?: GomokuMove | null;
  isAIMode?: boolean;
}

// 动态计算棋盘尺寸
const { width } = Dimensions.get('window');
const BOARD_WIDTH = width * 0.9;
const CELL_SIZE = (BOARD_WIDTH - 60) / 14; // 15条线需要14个间隔
const BOARD_HEIGHT = CELL_SIZE * 14;

// SVG棋盘线条组件
const GomokuBoardLines = () => {
  const strokeColor = "rgba(139, 69, 19, 0.8)"; // 木色棋盘
  const strokeWidth = 1;

  return (
    <Svg 
      width={CELL_SIZE * 14} 
      height={CELL_SIZE * 14} 
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <G>
        {/* 绘制纵线 */}
        {Array.from({ length: 15 }, (_, col) => {
          const x = col * CELL_SIZE;
          return (
            <Line
              key={`vertical-${col}`}
              x1={x}
              y1={0}
              x2={x}
              y2={CELL_SIZE * 14}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          );
        })}

        {/* 绘制横线 */}
        {Array.from({ length: 15 }, (_, row) => {
          const y = row * CELL_SIZE;
          return (
            <Line
              key={`horizontal-${row}`}
              x1={0}
              y1={y}
              x2={CELL_SIZE * 14}
              y2={y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          );
        })}

        {/* 绘制星位点 */}
        {/* 中心天元 */}
        <Circle
          cx={CELL_SIZE * 7}
          cy={CELL_SIZE * 7}
          r="4"
          fill={strokeColor}
        />
        
        {/* 四个角的星位 */}
        <Circle cx={CELL_SIZE * 3} cy={CELL_SIZE * 3} r="3" fill={strokeColor} />
        <Circle cx={CELL_SIZE * 11} cy={CELL_SIZE * 3} r="3" fill={strokeColor} />
        <Circle cx={CELL_SIZE * 3} cy={CELL_SIZE * 11} r="3" fill={strokeColor} />
        <Circle cx={CELL_SIZE * 11} cy={CELL_SIZE * 11} r="3" fill={strokeColor} />
        
        {/* 边上的星位 */}
        <Circle cx={CELL_SIZE * 7} cy={CELL_SIZE * 3} r="3" fill={strokeColor} />
        <Circle cx={CELL_SIZE * 7} cy={CELL_SIZE * 11} r="3" fill={strokeColor} />
        <Circle cx={CELL_SIZE * 3} cy={CELL_SIZE * 7} r="3" fill={strokeColor} />
        <Circle cx={CELL_SIZE * 11} cy={CELL_SIZE * 7} r="3" fill={strokeColor} />
      </G>
    </Svg>
  );
};

const GomokuBoard: React.FC<GomokuBoardProps> = ({
  board,
  onCellPress,
  disabled = false,
  lastMove = null,
  isAIMode = false
}) => {
  // 最后一手的闪烁动画
  const lastMoveBlinkAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (lastMove) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(lastMoveBlinkAnimation, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(lastMoveBlinkAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.start();

      return () => {
        blinkAnimation.stop();
      };
    }
  }, [lastMove, lastMoveBlinkAnimation]);

  const isLastMove = (row: number, col: number): boolean => {
    return lastMove?.position.row === row && lastMove?.position.col === col;
  };

  const renderIntersection = (row: number, col: number) => {
    const piece = board[row][col];
    const isLast = isLastMove(row, col);

    return (
      <Pressable
        key={`${row}-${col}`}
        onPress={() => !disabled && onCellPress({ row, col })}
        disabled={disabled || piece !== null}
        _pressed={{ bg: "rgba(255, 215, 0, 0.1)" }}
        position="absolute"
        left={col * CELL_SIZE - CELL_SIZE * 0.4}
        top={row * CELL_SIZE - CELL_SIZE * 0.4}
        w={`${CELL_SIZE * 0.8}px`}
        h={`${CELL_SIZE * 0.8}px`}
        alignItems="center"
        justifyContent="center"
        borderRadius="full"
      >
        {/* 可落子位置的提示点 */}
        {!piece && !disabled && (
          <Box
            position="absolute"
            w={`${CELL_SIZE * 0.15}px`}
            h={`${CELL_SIZE * 0.15}px`}
            borderRadius="full"
            bg="rgba(255, 215, 0, 0.4)"
            opacity={0}
          />
        )}

        {/* 棋子 */}
        {piece && (
          <Box position="relative">
            {/* 最后一手的闪烁效果 */}
            {isLast && (
              <Animated.View
                style={{
                  position: 'absolute',
                  left: -CELL_SIZE * 0.05,
                  top: -CELL_SIZE * 0.05,
                  width: CELL_SIZE * 0.8,
                  height: CELL_SIZE * 0.8,
                  borderRadius: CELL_SIZE * 0.4,
                  borderWidth: 3,
                  borderColor: '#ffd700',
                  backgroundColor: 'transparent',
                  opacity: lastMoveBlinkAnimation,
                }}
              />
            )}

            {/* 棋子主体 */}
            <Box
              w={`${CELL_SIZE * 0.7}px`}
              h={`${CELL_SIZE * 0.7}px`}
              borderRadius="full"
              bg={piece === 'black' ? '#2d2d2d' : '#ffffff'}
              borderWidth={2}
              borderColor={piece === 'black' ? '#404040' : '#e0e0e0'}
              alignItems="center"
              justifyContent="center"
              shadow={piece === 'black' ? 3 : 2}
              position="relative"
            >
              {/* 棋子光泽效果 */}
              <Box
                position="absolute"
                top={`${CELL_SIZE * 0.12}px`}
                left={`${CELL_SIZE * 0.12}px`}
                w={`${CELL_SIZE * 0.2}px`}
                h={`${CELL_SIZE * 0.2}px`}
                borderRadius="full"
                bg={piece === 'black' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)'}
              />

              {/* 最后一手标记 */}
              {isLast && (
                <Box
                  position="absolute"
                  w={`${CELL_SIZE * 0.22}px`}
                  h={`${CELL_SIZE * 0.22}px`}
                  borderRadius="full"
                  bg={piece === 'black' ? '#ffd700' : '#ff6b35'}
                  shadow={3}
                />
              )}
            </Box>
          </Box>
        )}
      </Pressable>
    );
  };

  return (
    <Box
      w={`${CELL_SIZE * 14 + 30}px`}
      h={`${CELL_SIZE * 14 + 30}px`}
      bg="rgba(210, 180, 140, 0.9)" // 木色背景
      borderRadius="lg"
      shadow={8}
      position="relative"
      alignItems="center"
      justifyContent="center"
      borderWidth={2}
      borderColor="rgba(139, 69, 19, 0.6)"
    >
      {/* 棋盘背景纹理效果 */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(160, 130, 98, 0.1)"
        borderRadius="lg"
      />

      {/* 棋盘线条 */}
      <Box
        position="absolute"
        left="15px"
        top="15px"
        w={`${CELL_SIZE * 14}px`}
        h={`${CELL_SIZE * 14}px`}
      >
        <GomokuBoardLines />
      </Box>

      {/* 棋盘交叉点（可点击区域） */}
      <Box
        position="absolute"
        left="15px"
        top="15px"
        w={`${CELL_SIZE * 14}px`}
        h={`${CELL_SIZE * 14}px`}
      >
        {Array.from({ length: 15 }, (_, row) =>
          Array.from({ length: 15 }, (_, col) => renderIntersection(row, col))
        )}
      </Box>

      {/* 棋盘边缘装饰 */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="15px"
        bg="rgba(139, 69, 19, 0.3)"
        borderTopRadius="lg"
      />
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="15px"
        bg="rgba(139, 69, 19, 0.3)"
        borderBottomRadius="lg"
      />
      <Box
        position="absolute"
        top="15px"
        bottom="15px"
        left={0}
        w="15px"
        bg="rgba(139, 69, 19, 0.3)"
      />
      <Box
        position="absolute"
        top="15px"
        bottom="15px"
        right={0}
        w="15px"
        bg="rgba(139, 69, 19, 0.3)"
      />
    </Box>
  );
};

export default GomokuBoard; 