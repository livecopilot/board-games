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
} from 'native-base';
import type { HomeScreenProps } from '../types/navigation';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
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
      available: false,
      color: '#ff0080',
    },
    {
      id: 'chess',
      title: '象棋',
      icon: '♟️',
      available: false,
      color: '#0080ff',
    },
    {
      id: 'gomoku',
      title: '五子棋',
      icon: '⚫',
      available: false,
      color: '#ff8000',
    },
  ];

  const renderGameCard = (game: typeof games[0]) => (
    <Pressable
      key={game.id}
      onPress={() => game.available && handleGameSelect(game.id)}
      isDisabled={!game.available}
      _pressed={{ opacity: 0.8 }}
    >
              <Box
          bg="rgba(255, 255, 255, 0.05)"
          borderWidth={1}
          borderColor={game.available ? game.color : "rgba(255, 255, 255, 0.1)"}
          borderRadius="xl"
          p={6}
          mb={4}
          mx={6}
          opacity={game.available ? 1 : 0.4}
          shadow={game.available ? "8" : "0"}
        >
        <HStack alignItems="center" justifyContent="space-between">
          <HStack alignItems="center" space={4}>
            <Box
              w={12}
              h={12}
              borderRadius="full"
              bg={game.available ? `${game.color}20` : "rgba(255, 255, 255, 0.1)"}
              borderWidth={1}
              borderColor={game.available ? game.color : "rgba(255, 255, 255, 0.2)"}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="xl">{game.icon}</Text>
            </Box>
            
            <Text
              fontSize="xl"
              fontWeight="600"
              color={game.available ? "white" : "gray.500"}
              fontFamily="mono"
            >
              {game.title}
            </Text>
          </HStack>

          {game.available ? (
            <Box
              w={3}
              h={3}
              borderRadius="full"
              bg={game.color}
              shadow="4"
            />
          ) : (
            <Badge
              bg="rgba(255, 255, 255, 0.1)"
              borderColor="rgba(255, 255, 255, 0.2)"
              borderWidth={1}
              variant="outline"
              _text={{ color: "gray.400", fontSize: "xs" }}
            >
              SOON
            </Badge>
          )}
        </HStack>
      </Box>
    </Pressable>
  );

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
          paddingBottom: 40,
          paddingTop: 20
        }}
      >
        {/* 标题区域 */}
        <VStack alignItems="center" pb={12}>
          <Box
            borderWidth={1}
            borderColor="rgba(0, 255, 136, 0.3)"
            borderRadius="full"
            px={6}
            py={2}
            mb={6}
            bg="rgba(0, 255, 136, 0.05)"
          >
            <Text
              fontSize="sm"
              color="#00ff88"
              fontFamily="mono"
              fontWeight="400"
              letterSpacing={1}
            >
              BOARD GAMES
            </Text>
          </Box>
          
          <Heading
            size="2xl"
            color="white"
            fontFamily="mono"
            fontWeight="300"
            letterSpacing={2}
            textAlign="center"
          >
            棋类游戏
          </Heading>
          
          <Text
            fontSize="md"
            color="gray.400"
            fontFamily="mono"
            mt={2}
            letterSpacing={1}
          >
            SELECT GAME
          </Text>
        </VStack>

        {/* 游戏列表 */}
        <VStack space={0} mt={8}>
          {games.map(renderGameCard)}
        </VStack>

        {/* 底部装饰 */}
        <Box mt={12} alignItems="center">
          <HStack space={2} alignItems="center">
            <Box w={2} h={2} borderRadius="full" bg="#00ff88" />
            <Box w={1} h={1} borderRadius="full" bg="gray.600" />
            <Box w={1} h={1} borderRadius="full" bg="gray.600" />
          </HStack>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default HomeScreen; 