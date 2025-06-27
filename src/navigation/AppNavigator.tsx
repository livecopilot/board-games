import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Box, IconButton, Icon } from 'native-base';
import IconFont from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import TicTacToeScreen from '../screens/TicTacToeScreen';
import type { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

// 自定义返回按钮组件
const BackButton = ({ onPress }: { onPress: () => void }) => (
  <Box mr={2}>
    <IconButton
      icon={<Icon as={IconFont} name="arrow-back" size="md" color="white" />}
      onPress={onPress}
      _pressed={{ bg: "rgba(255,255,255,0.1)" }}
      borderRadius="full"
    />
  </Box>
);

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196f3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '棋类游戏',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="TicTacToe"
        component={TicTacToeScreen}
        options={({ navigation }) => ({
          title: '井字棋',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <BackButton onPress={() => navigation.goBack()} />
          ),
        })}
      />
      {/* 为将来的游戏屏幕预留路由 */}
      {/*
      <Stack.Screen
        name="Checkers"
        component={CheckersScreen}
        options={{
          title: '跳棋',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="Chess"
        component={ChessScreen}
        options={{
          title: '象棋',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="Gomoku"
        component={GomokuScreen}
        options={{
          title: '五子棋',
          headerTitleAlign: 'center',
        }}
      />
      */}
    </Stack.Navigator>
  );
};

export default AppNavigator; 