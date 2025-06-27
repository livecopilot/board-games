import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import TicTacToeScreen from '../screens/TicTacToeScreen';
import CheckersScreen from '../screens/CheckersScreen';
import ChessScreen from '../screens/ChessScreen';
import type { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000015',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 255, 136, 0.2)',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#00ff88',
        headerTitleStyle: {
          fontWeight: '300',
          fontFamily: 'Courier',
          letterSpacing: 1,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          headerShown: false, // 首页隐藏导航栏
        }}
      />
      <Stack.Screen 
        name="TicTacToe" 
        component={TicTacToeScreen}
        options={{
          headerShown: false, // 井字棋页面也隐藏导航栏，使用自定义顶部栏
          gestureEnabled: false, // 禁用手势返回，强制使用确认弹框
        }}
      />
      <Stack.Screen 
        name="Checkers" 
        component={CheckersScreen}
        options={{
          headerShown: false, // 跳棋页面也隐藏导航栏，使用自定义顶部栏
          gestureEnabled: false, // 禁用手势返回，强制使用确认弹框
        }}
      />
      <Stack.Screen 
        name="Chess" 
        component={ChessScreen}
        options={{
          headerShown: false, // 象棋页面也隐藏导航栏，使用自定义顶部栏
          gestureEnabled: false, // 禁用手势返回，强制使用确认弹框
        }}
      />
      {/* 为将来的游戏屏幕预留路由 */}
      {/*
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