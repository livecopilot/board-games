import React from 'react';
import {
  Box,
  Text,
  Pressable,
  ScrollView,
  VStack,
  HStack,
  Heading,
  Badge,
  Center,
} from 'native-base';
import { Dimensions, FlatList } from 'react-native';
import type { HomeScreenProps } from '../types/navigation';
import { getDeviceInfo, getAdaptiveSize, getResponsiveGrid } from '../utils/deviceUtils';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const deviceInfo = getDeviceInfo();
  const adaptiveSize = getAdaptiveSize();
  const { columns, itemWidth } = getResponsiveGrid();

  // 处理游戏选择
  const handleGameSelect = (gameType: string) => {
    switch (gameType) {
      case 'tic-tac-toe':
        navigation.navigate('TicTacToe');
        break;
      case 'checkers':
        navigation.navigate('Checkers');
        break;
      case 'chess':
        navigation.navigate('Chess');
        break;
      case 'gomoku':
        navigation.navigate('Gomoku');
        break;
      default:
        console.warn('Unknown game type:', gameType);
    }
  };

  const games = [
    {
      id: 'tic-tac-toe',
      title: '井字棋',
      icon: '⭕',
      available: true,
      color: '#00ff88',
    },
    {
      id: 'checkers',
      title: '跳棋',
      icon: '🔴',
      available: true,
      color: '#ff0080',
    },
    {
      id: 'chess',
      title: '象棋',
      icon: '♟️',
      available: true,
      color: '#ffd700',
    },
    {
      id: 'gomoku',
      title: '五子棋',
      icon: '⚫',
      available: true,
      color: '#ff8000',
    },
  ];

  const renderGameCard = ({ item: game, index }: { item: typeof games[0], index: number }) => {
    const isTabletGrid = deviceInfo.isTablet && columns > 1;
    const compactSpacing = deviceInfo.isTablet ? adaptiveSize.spacing.xs : adaptiveSize.spacing.sm;
    
    return (
      <Box
        width={isTabletGrid ? itemWidth : "100%"}
        px={isTabletGrid ? 1 : 0}
        mb={compactSpacing}
      >
        <Pressable
          onPress={() => game.available && handleGameSelect(game.id)}
          isDisabled={!game.available}
          _pressed={{ opacity: 0.8 }}
        >
          <Box
            bg="rgba(255, 255, 255, 0.05)"
            borderWidth={1}
            borderColor={game.available ? `${game.color}80` : "rgba(255, 255, 255, 0.1)"}
            borderRadius="lg"
            p={compactSpacing}
            opacity={game.available ? 1 : 0.4}
            shadow={game.available ? "4" : "0"}
            minH={deviceInfo.isTablet ? "90px" : "64px"}
          >
            {isTabletGrid ? (
              // iPad网格布局 - 紧凑垂直堆叠
              <VStack alignItems="center" space={1}>
                <Box
                  w={deviceInfo.isTablet ? 12 : 10}
                  h={deviceInfo.isTablet ? 12 : 10}
                  borderRadius="full"
                  bg={game.available ? `${game.color}30` : "rgba(255, 255, 255, 0.1)"}
                  borderWidth={1}
                  borderColor={game.available ? game.color : "rgba(255, 255, 255, 0.2)"}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={deviceInfo.isTablet ? "xl" : "lg"}>{game.icon}</Text>
                </Box>
                
                <Text
                  fontSize={deviceInfo.isTablet ? "md" : "sm"}
                  fontWeight="600"
                  color={game.available ? "white" : "gray.500"}
                  fontFamily="mono"
                  textAlign="center"
                  mt={1}
                >
                  {game.title}
                </Text>

                {game.available && (
                  <Box
                    w={2}
                    h={2}
                    borderRadius="full"
                    bg={game.color}
                    mt={1}
                  />
                )}
              </VStack>
            ) : (
              // 手机列表布局 - 紧凑水平排列
              <HStack alignItems="center" justifyContent="space-between">
                <HStack alignItems="center" space={3}>
                  <Box
                    w={10}
                    h={10}
                    borderRadius="full"
                    bg={game.available ? `${game.color}30` : "rgba(255, 255, 255, 0.1)"}
                    borderWidth={1}
                    borderColor={game.available ? game.color : "rgba(255, 255, 255, 0.2)"}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="lg">{game.icon}</Text>
                  </Box>
                  
                  <VStack space={0}>
                    <Text
                      fontSize="lg"
                      fontWeight="600"
                      color={game.available ? "white" : "gray.500"}
                      fontFamily="mono"
                    >
                      {game.title}
                    </Text>
                    {!game.available && (
                      <Text
                        fontSize="xs"
                        color="gray.400"
                        fontFamily="mono"
                        letterSpacing={1}
                      >
                        COMING SOON
                      </Text>
                    )}
                  </VStack>
                </HStack>

                {game.available && (
                  <Box
                    w={2}
                    h={2}
                    borderRadius="full"
                    bg={game.color}
                  />
                )}
              </HStack>
            )}
          </Box>
        </Pressable>
      </Box>
    );
  };

  return (
    <Box flex={1} bg="#000015" safeArea>
      {/* 科技风格背景层 */}
      <Box 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        bottom={0}
        bg="#000015"
        zIndex={-1}
      >
        {/* 顶部渐变效果 */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="50%"
          bg="rgba(0, 255, 136, 0.03)"
        />
        
        {/* 底部微光效果 */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="30%"
          bg="rgba(0, 128, 255, 0.02)"
        />
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: adaptiveSize.spacing.lg,
          paddingTop: adaptiveSize.spacing.sm,
          paddingHorizontal: deviceInfo.isTablet ? adaptiveSize.spacing.lg : adaptiveSize.spacing.md
        }}
      >
        {/* 紧凑标题区域 */}
        <VStack alignItems="center" mb={adaptiveSize.spacing.md} space={1}>
          <HStack alignItems="center" space={2} mb={2}>
            <Box w={2} h={2} bg="#00ff88" borderRadius="full" />
            <Text
              fontSize={deviceInfo.isTablet ? "lg" : "md"}
              color="#00ff88"
              fontFamily="mono"
              fontWeight="500"
              letterSpacing={2}
            >
              棋类游戏
            </Text>
            <Box w={2} h={2} bg="#00ff88" borderRadius="full" />
          </HStack>
          
          <Text
            fontSize="sm"
            color="gray.400"
            fontFamily="mono"
            letterSpacing={1}
            opacity={0.8}
          >
            选择游戏开始对弈
          </Text>
        </VStack>

        {/* 紧凑游戏列表 */}
        {deviceInfo.isTablet && columns > 1 ? (
          // iPad紧凑网格布局
          <Box>
            <FlatList
              data={games}
              renderItem={renderGameCard}
              numColumns={columns}
              key={`${columns}-${deviceInfo.isLandscape}`}
              columnWrapperStyle={columns > 1 ? { 
                justifyContent: 'space-between',
                paddingHorizontal: 4
              } : undefined}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
            />
          </Box>
        ) : (
          // 手机紧凑列表布局
          <VStack space={0} px={2}>
            {games.map((game, index) => renderGameCard({ item: game, index }))}
          </VStack>
        )}

      </ScrollView>
    </Box>
  );
};

export default HomeScreen; 