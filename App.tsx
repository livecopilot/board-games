/**
 * 棋类游戏 React Native App
 * 专为亲子对弈设计
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { enableScreens } from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';

// 启用原生屏幕优化
enableScreens();

// 自定义主题
const theme = extendTheme({
  colors: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
  config: {
    initialColorMode: 'light',
  },
});

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NativeBaseProvider theme={theme}>
      <NavigationContainer>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor="#2196f3"
        />
        <AppNavigator />
      </NavigationContainer>
    </NativeBaseProvider>
  );
}

export default App;
