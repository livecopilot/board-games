/*
 * @Author: changwj yoursfengzhilian@gmail.com
 * @Date: 2025-06-27 12:51:39
 * @LastEditors: changwj yoursfengzhilian@gmail.com
 * @LastEditTime: 2025-06-30 15:06:12
 * @FilePath: /board-games/App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 棋类游戏 React Native App
 * 专为亲子对弈设计
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { enableScreens } from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';

// 启用原生屏幕优化
enableScreens();

// iOS BackHandler polyfill - 修复NativeBase在iOS上的兼容性问题
if (Platform.OS === 'ios') {
  const { BackHandler } = require('react-native');
  if (!BackHandler.removeEventListener) {
    BackHandler.removeEventListener = () => {};
  }
  if (!BackHandler.addEventListener) {
    BackHandler.addEventListener = () => ({ remove: () => {} });
  }
}

// 科技风格主题
const theme = extendTheme({
  colors: {
    primary: {
      50: '#e0fff4',
      100: '#b3ffdf',
      200: '#80ffca',
      300: '#4dffb4',
      400: '#1aff9e',
      500: '#00ff88',
      600: '#00cc6a',
      700: '#00994d',
      800: '#006630',
      900: '#003319',
    },
    tech: {
      50: '#f0f8ff',
      100: '#e0f1ff',
      200: '#b3daff',
      300: '#80c3ff',
      400: '#4dacff',
      500: '#1a95ff',
      600: '#0080ff',
      700: '#0066cc',
      800: '#004d99',
      900: '#003366',
    },
    dark: {
      50: '#1a1a2e',
      100: '#16213e',
      200: '#0f3460',
      300: '#0e4b99',
      400: '#2e8b57',
      500: '#000015',
      600: '#000011',
      700: '#00000d',
      800: '#000009',
      900: '#000005',
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fontConfig: {
    mono: {
      400: {
        normal: 'Courier',
      },
      500: {
        normal: 'Courier-Bold',
      },
    },
  },
  fonts: {
    mono: 'mono',
  },
});

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider style={{ backgroundColor: '#000015' }}>
      <NativeBaseProvider theme={theme}>
        <NavigationContainer>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="#000015"
            translucent={false}
          />
          <AppNavigator />
        </NavigationContainer>
      </NativeBaseProvider>
    </SafeAreaProvider>
  );
}

export default App;
