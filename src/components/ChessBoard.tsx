import React, { useEffect, useRef } from 'react';
import { Box, Pressable, Text } from 'native-base';
import { Dimensions, Animated } from 'react-native';
import Svg, { Line, G, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { ChessBoard as ChessBoardType, Position, ChessPiece, ChessMove } from '../types';

interface ChessBoardProps {
  board: ChessBoardType;
  onCellPress: (position: Position) => void;
  selectedPiece?: Position | null;
  validMoves?: Position[];
  disabled?: boolean;
  lastMove?: ChessMove | null;
  isAIMode?: boolean;
}

// 动态计算棋盘尺寸
const { width } = Dimensions.get('window');
const BOARD_WIDTH = width * 0.92;
const CELL_SIZE = (BOARD_WIDTH - 40) / 9; // 9列，减少边距以适应无标尺设计
const BOARD_HEIGHT = CELL_SIZE * 10; // 10行

// 棋子的中文字符映射
const getPieceText = (piece: ChessPiece): string => {
  if (!piece) return '';
  
  const pieceMap = {
    red: {
      king: '帅',
      advisor: '仕',
      elephant: '相',
      horse: '马',
      rook: '车',
      cannon: '炮',
      pawn: '兵'
    },
    black: {
      king: '将',
      advisor: '士',
      elephant: '象',
      horse: '马',
      rook: '车',
      cannon: '炮',
      pawn: '卒'
    }
  };
  
  return pieceMap[piece.player][piece.type];
};

// SVG棋盘线条组件 - 大理石风格
const ChessBoardLines = () => {
  const strokeColor = "#2C2C2C"; // 深灰色线条，配合大理石
  const strokeWidth = 1.5;

  // 兵、卒和炮位置的标记点
  const renderPositionMarkers = () => {
    const markers: React.ReactElement[] = [];
    const markerSize = 8;
    const markerOffset = CELL_SIZE * 0.08;
    
    // 兵位置 (红方，行6)
    const pawnPositions = [0, 2, 4, 6, 8];
    pawnPositions.forEach(col => {
      const x = col * CELL_SIZE + CELL_SIZE / 2;
      const y = 6 * CELL_SIZE + CELL_SIZE / 2;
      
      // 四个角的标记点（朝向外侧）
      markers.push(
        // 左上角（向左上方向）
        <Line key={`pawn-${col}-tl-1`} x1={x - markerOffset} y1={y - markerOffset} x2={x - markerOffset - markerSize} y2={y - markerOffset} stroke={strokeColor} strokeWidth={1} />,
        <Line key={`pawn-${col}-tl-2`} x1={x - markerOffset} y1={y - markerOffset} x2={x - markerOffset} y2={y - markerOffset - markerSize} stroke={strokeColor} strokeWidth={1} />,
        // 右上角（向右上方向）
        <Line key={`pawn-${col}-tr-1`} x1={x + markerOffset} y1={y - markerOffset} x2={x + markerOffset + markerSize} y2={y - markerOffset} stroke={strokeColor} strokeWidth={1} />,
        <Line key={`pawn-${col}-tr-2`} x1={x + markerOffset} y1={y - markerOffset} x2={x + markerOffset} y2={y - markerOffset - markerSize} stroke={strokeColor} strokeWidth={1} />,
        // 左下角（向左下方向）
        <Line key={`pawn-${col}-bl-1`} x1={x - markerOffset} y1={y + markerOffset} x2={x - markerOffset - markerSize} y2={y + markerOffset} stroke={strokeColor} strokeWidth={1} />,
        <Line key={`pawn-${col}-bl-2`} x1={x - markerOffset} y1={y + markerOffset} x2={x - markerOffset} y2={y + markerOffset + markerSize} stroke={strokeColor} strokeWidth={1} />,
        // 右下角（向右下方向）
        <Line key={`pawn-${col}-br-1`} x1={x + markerOffset} y1={y + markerOffset} x2={x + markerOffset + markerSize} y2={y + markerOffset} stroke={strokeColor} strokeWidth={1} />,
        <Line key={`pawn-${col}-br-2`} x1={x + markerOffset} y1={y + markerOffset} x2={x + markerOffset} y2={y + markerOffset + markerSize} stroke={strokeColor} strokeWidth={1} />
      );
    });
    
    // 卒位置 (黑方，行3)
    pawnPositions.forEach(col => {
      const x = col * CELL_SIZE + CELL_SIZE / 2;
      const y = 3 * CELL_SIZE + CELL_SIZE / 2;
      
      // 四个角的标记点（朝向外侧）
      markers.push(
        // 左上角（向左上方向）
        <Line key={`zu-${col}-tl-1`} x1={x - markerOffset} y1={y - markerOffset} x2={x - markerOffset - markerSize} y2={y - markerOffset} stroke={strokeColor} strokeWidth={1} />,
        <Line key={`zu-${col}-tl-2`} x1={x - markerOffset} y1={y - markerOffset} x2={x - markerOffset} y2={y - markerOffset - markerSize} stroke={strokeColor} strokeWidth={1} />,
        // 右上角（向右上方向）
        <Line key={`zu-${col}-tr-1`} x1={x + markerOffset} y1={y - markerOffset} x2={x + markerOffset + markerSize} y2={y - markerOffset} stroke={strokeColor} strokeWidth={1} />,
        <Line key={`zu-${col}-tr-2`} x1={x + markerOffset} y1={y - markerOffset} x2={x + markerOffset} y2={y - markerOffset - markerSize} stroke={strokeColor} strokeWidth={1} />,
        // 左下角（向左下方向）
        <Line key={`zu-${col}-bl-1`} x1={x - markerOffset} y1={y + markerOffset} x2={x - markerOffset - markerSize} y2={y + markerOffset} stroke={strokeColor} strokeWidth={1} />,
        <Line key={`zu-${col}-bl-2`} x1={x - markerOffset} y1={y + markerOffset} x2={x - markerOffset} y2={y + markerOffset + markerSize} stroke={strokeColor} strokeWidth={1} />,
        // 右下角（向右下方向）
        <Line key={`zu-${col}-br-1`} x1={x + markerOffset} y1={y + markerOffset} x2={x + markerOffset + markerSize} y2={y + markerOffset} stroke={strokeColor} strokeWidth={1} />,
        <Line key={`zu-${col}-br-2`} x1={x + markerOffset} y1={y + markerOffset} x2={x + markerOffset} y2={y + markerOffset + markerSize} stroke={strokeColor} strokeWidth={1} />
      );
    });
    
    // 炮位置
    const cannonPositions = [
      { row: 2, col: 1 }, { row: 2, col: 7 }, // 黑方炮
      { row: 7, col: 1 }, { row: 7, col: 7 }  // 红方炮
    ];
    
    cannonPositions.forEach(({row, col}) => {
      const x = col * CELL_SIZE + CELL_SIZE / 2;
      const y = row * CELL_SIZE + CELL_SIZE / 2;
      
      // 四个角的标记点（朝向外侧）
      markers.push(
        // 左上角（向左上方向）
        <Line key={`cannon-${row}-${col}-1`} x1={x - markerOffset} y1={y - markerOffset} x2={x - markerOffset - markerSize} y2={y - markerOffset} stroke={strokeColor} strokeWidth={1} />,
        <Line key={`cannon-${row}-${col}-2`} x1={x - markerOffset} y1={y - markerOffset} x2={x - markerOffset} y2={y - markerOffset - markerSize} stroke={strokeColor} strokeWidth={1} />,
        // 右上角（向右上方向）
        <Line key={`cannon-${row}-${col}-3`} x1={x + markerOffset} y1={y - markerOffset} x2={x + markerOffset + markerSize} y2={y - markerOffset} stroke={strokeColor} strokeWidth={1} />,
        <Line key={`cannon-${row}-${col}-4`} x1={x + markerOffset} y1={y - markerOffset} x2={x + markerOffset} y2={y - markerOffset - markerSize} stroke={strokeColor} strokeWidth={1} />,
        // 左下角（向左下方向）
        <Line key={`cannon-${row}-${col}-5`} x1={x - markerOffset} y1={y + markerOffset} x2={x - markerOffset - markerSize} y2={y + markerOffset} stroke={strokeColor} strokeWidth={1} />,
        <Line key={`cannon-${row}-${col}-6`} x1={x - markerOffset} y1={y + markerOffset} x2={x - markerOffset} y2={y + markerOffset + markerSize} stroke={strokeColor} strokeWidth={1} />,
        // 右下角（向右下方向）
        <Line key={`cannon-${row}-${col}-7`} x1={x + markerOffset} y1={y + markerOffset} x2={x + markerOffset + markerSize} y2={y + markerOffset} stroke={strokeColor} strokeWidth={1} />,
        <Line key={`cannon-${row}-${col}-8`} x1={x + markerOffset} y1={y + markerOffset} x2={x + markerOffset} y2={y + markerOffset + markerSize} stroke={strokeColor} strokeWidth={1} />
      );
    });
    
    return markers;
  };

  return (
    <Svg 
      width={CELL_SIZE * 9} 
      height={CELL_SIZE * 10} 
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <G>
        {/* 绘制纵线 */}
        {Array.from({ length: 9 }, (_, col) => {
          const x = col * CELL_SIZE + CELL_SIZE / 2;
          
          // 最左边和最右边的纵线是完整的
          if (col === 0 || col === 8) {
            return (
              <Line
                key={`vertical-${col}`}
                x1={x}
                y1={CELL_SIZE / 2}
                x2={x}
                y2={CELL_SIZE * 9.5}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
            );
          } else {
            // 中间的纵线在楚河汉界处断开
            return (
              <G key={`vertical-split-${col}`}>
                {/* 上半部分 */}
                <Line
                  x1={x}
                  y1={CELL_SIZE / 2}
                  x2={x}
                  y2={CELL_SIZE * 4.5}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
                {/* 下半部分 */}
                <Line
                  x1={x}
                  y1={CELL_SIZE * 5.5}
                  x2={x}
                  y2={CELL_SIZE * 9.5}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
              </G>
            );
          }
        })}

        {/* 绘制横线 - 上半部分 (行0-4) */}
        {Array.from({ length: 5 }, (_, row) => (
          <Line
            key={`horizontal-top-${row}`}
            x1={CELL_SIZE / 2}
            y1={row * CELL_SIZE + CELL_SIZE / 2}
            x2={CELL_SIZE * 8.5}
            y2={row * CELL_SIZE + CELL_SIZE / 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        ))}

        {/* 绘制横线 - 下半部分 (行5-9) */}
        {Array.from({ length: 5 }, (_, row) => {
          const actualRow = row + 5;
          return (
            <Line
              key={`horizontal-bottom-${actualRow}`}
              x1={CELL_SIZE / 2}
              y1={actualRow * CELL_SIZE + CELL_SIZE / 2}
              x2={CELL_SIZE * 8.5}
              y2={actualRow * CELL_SIZE + CELL_SIZE / 2}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          );
        })}

        {/* 九宫格斜线 - 上方九宫格 (黑方) */}
        {/* 左上到右下 */}
        <Line
          x1={CELL_SIZE * 3 + CELL_SIZE / 2}
          y1={CELL_SIZE / 2}
          x2={CELL_SIZE * 5 + CELL_SIZE / 2}
          y2={CELL_SIZE * 2 + CELL_SIZE / 2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        
        {/* 右上到左下 */}
        <Line
          x1={CELL_SIZE * 5 + CELL_SIZE / 2}
          y1={CELL_SIZE / 2}
          x2={CELL_SIZE * 3 + CELL_SIZE / 2}
          y2={CELL_SIZE * 2 + CELL_SIZE / 2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* 九宫格斜线 - 下方九宫格 (红方) */}
        {/* 左上到右下 */}
        <Line
          x1={CELL_SIZE * 3 + CELL_SIZE / 2}
          y1={CELL_SIZE * 7 + CELL_SIZE / 2}
          x2={CELL_SIZE * 5 + CELL_SIZE / 2}
          y2={CELL_SIZE * 9 + CELL_SIZE / 2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        
        {/* 右上到左下 */}
        <Line
          x1={CELL_SIZE * 5 + CELL_SIZE / 2}
          y1={CELL_SIZE * 7 + CELL_SIZE / 2}
          x2={CELL_SIZE * 3 + CELL_SIZE / 2}
          y2={CELL_SIZE * 9 + CELL_SIZE / 2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* 兵、卒、炮位置标记点 */}
        {renderPositionMarkers()}
      </G>
    </Svg>
  );
};

const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  onCellPress,
  selectedPiece,
  validMoves = [],
  disabled = false,
  lastMove = null,
  isAIMode = false
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

  const isSelected = (row: number, col: number) => {
    return selectedPiece?.row === row && selectedPiece?.col === col;
  };

  const isValidMove = (row: number, col: number) => {
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
    const selected = isSelected(row, col);
    const canMove = isValidMove(row, col);
    const isMoveFrom = isLastMoveFrom(row, col);
    const isMoveTo = isLastMoveTo(row, col);

    return (
      <Pressable
        key={`${row}-${col}`}
        onPress={() => !disabled && onCellPress({ row, col })}
        disabled={disabled}
        _pressed={{ bg: "rgba(169, 169, 169, 0.2)" }}
        position="absolute"
        left={col * CELL_SIZE}
        top={row * CELL_SIZE}
        w={`${CELL_SIZE}px`}
        h={`${CELL_SIZE}px`}
        alignItems="center"
        justifyContent="center"
        borderRadius="md"
      >
        {/* 可移动位置提示 */}
        {canMove && !piece && (
          <Box
            position="absolute"
            left={`${CELL_SIZE * 0.3}px`}
            top={`${CELL_SIZE * 0.3}px`}
            w={`${CELL_SIZE * 0.4}px`}
            h={`${CELL_SIZE * 0.4}px`}
            borderRadius="full"
            bg="rgba(128, 128, 128, 0.8)"
            borderWidth={3}
            borderColor="rgba(169, 169, 169, 1)"
            shadow={6}
            opacity={0.9}
          />
        )}
        
        {/* 可吃掉棋子的提示 */}
        {canMove && piece && (
          <Box
            position="absolute"
            left={`${CELL_SIZE * 0.1}px`}
            top={`${CELL_SIZE * 0.1}px`}
            w={`${CELL_SIZE * 0.8}px`}
            h={`${CELL_SIZE * 0.8}px`}
            borderRadius="full"
            borderWidth={4}
            borderColor="rgba(255, 50, 50, 0.9)"
            bg="transparent"
            shadow={8}
            opacity={0.8}
          />
        )}

        {/* 移动前位置的空心圆圈 */}
        {isMoveFrom && (
          <Box
            position="absolute"
            left={`${CELL_SIZE * 0.35}px`}
            top={`${CELL_SIZE * 0.35}px`}
            w={`${CELL_SIZE * 0.3}px`}
            h={`${CELL_SIZE * 0.3}px`}
            borderRadius="full"
            borderWidth={4}
            borderColor="rgba(128, 128, 128, 1)"
            bg="transparent"
            shadow={6}
            opacity={0.8}
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
                borderWidth: 2,
                borderColor: '#808080',
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
                borderWidth: 3,
                borderColor: '#A9A9A9',
                backgroundColor: 'rgba(169, 169, 169, 0.3)',
                shadowColor: '#808080',
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
            {/* 棋子外环装饰 - 木质风格 */}
            <Box
              w={`${CELL_SIZE * 0.85}px`}
              h={`${CELL_SIZE * 0.85}px`}
              borderRadius="full"
              bg={piece.player === 'red' ? '#8B0000' : '#2F4F4F'}
              borderWidth={selected ? 3 : isMoveTo ? 3 : 2}
              borderColor={selected ? '#228B22' : isMoveTo ? '#A9A9A9' : piece.player === 'red' ? '#4A0000' : '#000000'}
              alignItems="center"
              justifyContent="center"
              shadow={isMoveTo ? 8 : 6}
              position="relative"
            >
              {/* 棋子主体 - 木质色调 */}
              <Box
                w={`${CELL_SIZE * 0.72}px`}
                h={`${CELL_SIZE * 0.72}px`}
                borderRadius="full"
                bg={piece.player === 'red' ? '#FFF8DC' : '#F5F5DC'}
                borderWidth={2}
                borderColor={piece.player === 'red' ? '#B22222' : '#696969'}
                alignItems="center"
                justifyContent="center"
                shadow={4}
                position="relative"
              >
                {/* 棋子文字 */}
                <Text
                  fontSize={`${Math.max(14, CELL_SIZE * 0.32)}px`}
                  fontWeight="900"
                  color={piece.player === 'red' ? '#8B0000' : '#2F4F4F'}
                  fontFamily="serif"
                  style={!isAIMode && piece.player === 'black' ? { transform: [{ rotate: '180deg' }] } : {}}
                  textAlign="center"
                >
                  {getPieceText(piece)}
                </Text>

                {/* 棋子内边框装饰 */}
                <Box
                  position="absolute"
                  w={`${CELL_SIZE * 0.6}px`}
                  h={`${CELL_SIZE * 0.6}px`}
                  borderRadius="full"
                  borderWidth={1}
                  borderColor={piece.player === 'red' ? 'rgba(139, 0, 0, 0.2)' : 'rgba(47, 79, 79, 0.2)'}
                />
                
                {/* 棋子纹理效果 */}
                <Box
                  position="absolute"
                  w={`${CELL_SIZE * 0.5}px`}
                  h={`${CELL_SIZE * 0.5}px`}
                  borderRadius="full"
                  borderWidth={0.5}
                  borderColor={piece.player === 'red' ? 'rgba(139, 0, 0, 0.15)' : 'rgba(47, 79, 79, 0.15)'}
                />

                {/* 上部光影效果 */}
                <Box
                  position="absolute"
                  top={`${CELL_SIZE * 0.08}px`}
                  w={`${CELL_SIZE * 0.5}px`}
                  h={`${CELL_SIZE * 0.2}px`}
                  borderRadius="full"
                  bg={piece.player === 'red' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.5)'}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* 选中效果 - 木质风格 */}
        {selected && (
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
                borderWidth: 2,
                borderColor: '#228B22',
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
                borderWidth: 4,
                borderColor: '#32CD32',
                backgroundColor: 'rgba(34, 139, 34, 0.2)',
                shadowColor: '#228B22',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.9,
                shadowRadius: 12,
                elevation: 12,
                opacity: blinkAnimation,
              }}
            />
          </>
        )}
      </Pressable>
    );
  };

  // 大理石纹理背景组件
const MarbleBackground = ({ width, height }: { width: number; height: number }) => {
  return (
    <Svg 
      width={width} 
      height={height} 
      style={{ position: 'absolute', top: 0, left: 0, borderRadius: 16 }}
    >
      <Defs>
        {/* 大理石纹理渐变 */}
        <LinearGradient id="marbleGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F8F8FF" stopOpacity="0.9" />
          <Stop offset="25%" stopColor="#E6E6FA" stopOpacity="0.8" />
          <Stop offset="50%" stopColor="#D3D3D3" stopOpacity="0.7" />
          <Stop offset="75%" stopColor="#C0C0C0" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#F5F5F5" stopOpacity="0.9" />
        </LinearGradient>
        
        {/* 大理石纹理纹路1 */}
        <LinearGradient id="marbleVeins1" x1="0%" y1="0%" x2="100%" y2="50%">
          <Stop offset="0%" stopColor="#B0B0B0" stopOpacity="0.3" />
          <Stop offset="30%" stopColor="#A9A9A9" stopOpacity="0.5" />
          <Stop offset="70%" stopColor="#808080" stopOpacity="0.3" />
          <Stop offset="100%" stopColor="#D3D3D3" stopOpacity="0.2" />
        </LinearGradient>
        
        {/* 大理石纹理纹路2 */}
        <LinearGradient id="marbleVeins2" x1="30%" y1="0%" x2="70%" y2="100%">
          <Stop offset="0%" stopColor="#A9A9A9" stopOpacity="0.2" />
          <Stop offset="50%" stopColor="#696969" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#C0C0C0" stopOpacity="0.2" />
        </LinearGradient>
      </Defs>
      
      {/* 主要大理石背景 */}
      <Rect 
        x="0" 
        y="0" 
        width={width} 
        height={height} 
        fill="url(#marbleGradient1)" 
        rx="16"
        ry="16"
      />
      
      {/* 大理石纹路层1 */}
      <Rect 
        x="0" 
        y="0" 
        width={width} 
        height={height} 
        fill="url(#marbleVeins1)" 
        rx="16"
        ry="16"
        opacity="0.6"
      />
      
      {/* 大理石纹路层2 */}
      <Rect 
        x="0" 
        y="0" 
        width={width} 
        height={height} 
        fill="url(#marbleVeins2)" 
        rx="16"
        ry="16"
        opacity="0.4"
      />
    </Svg>
  );
};

  return (
    <Box alignItems="center" justifyContent="center">
      {/* 大理石纹理棋盘外框 */}
      <Box
        w={`${BOARD_WIDTH}px`}
        h={`${BOARD_HEIGHT + 24}px`}
        bg="#F5F5F5"
        borderWidth={3}
        borderColor="#A9A9A9"
        borderRadius="xl"
        p={3}
        shadow={8}
        position="relative"
        style={{
          
        }}
      >
        {/* 大理石纹理背景 */}
        <MarbleBackground width={BOARD_WIDTH} height={BOARD_HEIGHT + 24} />
        {/* 内部棋盘容器 */}
        <Box
          w={`${CELL_SIZE * 9}px`}
          h={`${CELL_SIZE * 10}px`}
          bg="rgba(255, 255, 255, 0.1)"
          borderRadius="lg"
          position="relative"
          alignSelf="center"
          mt={1}
        >
          {/* SVG绘制的棋盘线条 */}
          <ChessBoardLines />

          {/* 渲染所有棋子和交互区域 */}
          {board.map((row, rowIndex) =>
            row.map((_, colIndex) => renderCell(rowIndex, colIndex))
          )}

          {/* 楚河汉界标记 - 大理石风格 */}
          <Box
            position="absolute"
            top={`${CELL_SIZE * 4.75}px`}
            left={`${CELL_SIZE * 1}px`}
            width={`${CELL_SIZE * 2}px`}
            alignItems="center"
          >
            <Text 
              fontSize={`${Math.max(12, CELL_SIZE * 0.28)}px`}
              color="#2C2C2C"
              fontFamily="serif"
              fontWeight="bold"
              style={!isAIMode ? { transform: [{ rotate: '180deg' }] } : {}}
            >
              楚河
            </Text>
          </Box>
          <Box
            position="absolute"
            top={`${CELL_SIZE * 4.75}px`}
            right={`${CELL_SIZE * 1}px`}
            width={`${CELL_SIZE * 2}px`}
            alignItems="center"
          >
            <Text 
              fontSize={`${Math.max(12, CELL_SIZE * 0.28)}px`}
              color="#2C2C2C"
              fontFamily="serif"
              fontWeight="bold"
            >
              汉界
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChessBoard; 