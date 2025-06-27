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
  useColorModeValue,
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
      description: '经典三连棋游戏',
      icon: '⭕',
      difficulty: '简单',
      ageRange: '3-99岁',
      available: true,
    },
    {
      id: 'checkers',
      title: '跳棋',
      description: '策略对战游戏',
      icon: '🔴',
      difficulty: '中等',
      ageRange: '6-99岁',
      available: false,
    },
    {
      id: 'chess',
      title: '象棋',
      description: '中国传统棋类',
      icon: '♟️',
      difficulty: '困难',
      ageRange: '8-99岁',
      available: false,
    },
    {
      id: 'gomoku',
      title: '五子棋',
      description: '五连珠获胜',
      icon: '⚫',
      difficulty: '中等',
      ageRange: '5-99岁',
      available: false,
    },
  ];

  const renderGameCard = (game: typeof games[0]) => (
    <Pressable
      key={game.id}
      bg={game.available ? "white" : "gray.50"}
      opacity={game.available ? 1 : 0.6}
      borderRadius="lg"
      mb={4}
      p={5}
      shadow={3}
      borderWidth={1}
      borderColor="gray.200"
      _pressed={{ bg: game.available ? "gray.50" : "gray.100" }}
      onPress={() => game.available && handleGameSelect(game.id)}
      isDisabled={!game.available}
    >
      <HStack alignItems="center" space={4}>
        <Box
          w={60}
          h={60}
          borderRadius="full"
          bg="gray.100"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="2xl">{game.icon}</Text>
        </Box>
        
        <VStack flex={1} space={2}>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={game.available ? "gray.800" : "gray.400"}
          >
            {game.title}
          </Text>
          <Text
            fontSize="sm"
            color={game.available ? "gray.600" : "gray.400"}
          >
            {game.description}
          </Text>
          
          <HStack justifyContent="space-between">
            <HStack alignItems="center" space={1}>
              <Text fontSize="xs" color="gray.500">难度:</Text>
              <Text
                fontSize="xs"
                fontWeight="600"
                color={game.available ? "gray.700" : "gray.400"}
              >
                {game.difficulty}
              </Text>
            </HStack>
            <HStack alignItems="center" space={1}>
              <Text fontSize="xs" color="gray.500">年龄:</Text>
              <Text
                fontSize="xs"
                fontWeight="600"
                color={game.available ? "gray.700" : "gray.400"}
              >
                {game.ageRange}
              </Text>
            </HStack>
          </HStack>
        </VStack>
        
        {!game.available && (
          <Badge
            colorScheme="warning"
            variant="solid"
            position="absolute"
            top={2}
            right={2}
          >
            即将推出
          </Badge>
        )}
      </HStack>
    </Pressable>
  );

  return (
    <Box flex={1} bg="gray.50" safeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {/* 标题部分 */}
        <VStack alignItems="center" px={5} mb={8}>
          <Heading size="2xl" color="gray.800" mb={2}>
            棋类游戏
          </Heading>
          <Text fontSize="lg" color="gray.600" italic mb={5}>
            亲子对弈，快乐成长
          </Text>
          <Box w={60} h={1} bg="primary.500" borderRadius="full" />
        </VStack>

        {/* 介绍部分 */}
        <Box
          bg="primary.50"
          mx={5}
          p={5}
          borderRadius="xl"
          borderLeftWidth={4}
          borderLeftColor="primary.500"
          mb={6}
        >
          <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={4}>
            为什么选择棋类游戏？
          </Text>
          <VStack space={3}>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">🧠</Text>
              <Text fontSize="md" color="gray.700" flex={1}>
                提升逻辑思维能力
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">👨‍👩‍👧‍👦</Text>
              <Text fontSize="md" color="gray.700" flex={1}>
                增进亲子关系
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">🎯</Text>
              <Text fontSize="md" color="gray.700" flex={1}>
                培养专注力和耐心
              </Text>
            </HStack>
            <HStack alignItems="center" space={3}>
              <Text fontSize="lg">🏆</Text>
              <Text fontSize="md" color="gray.700" flex={1}>
                学会面对胜负
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* 游戏列表 */}
        <Box px={5}>
          <Text fontSize="xl" fontWeight="bold" color="gray.800" mb={5} textAlign="center">
            选择一个游戏开始吧！
          </Text>
          <VStack space={4}>
            {games.map(renderGameCard)}
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default HomeScreen; 