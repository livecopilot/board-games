/**
 * 棋类游戏 React Native App
 * 专为亲子对弈设计
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, useColorScheme, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import TicTacToeScreen from './src/screens/TicTacToeScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState<'home' | 'tic-tac-toe'>('home');

  const handleGameSelect = (gameType: string) => {
    if (gameType === 'tic-tac-toe') {
      setCurrentScreen('tic-tac-toe');
    }
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onGameSelect={handleGameSelect} />;
      case 'tic-tac-toe':
        return (
          <View style={styles.gameContainer}>
            {/* 返回按钮 */}
            <View style={styles.backButtonContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackToHome}
              >
                <Text style={styles.backButtonText}>← 返回主菜单</Text>
              </TouchableOpacity>
            </View>
            <TicTacToeScreen />
          </View>
        );
      default:
        return <HomeScreen onGameSelect={handleGameSelect} />;
    }
  };

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="#f8f9fa"
      />
      {renderScreen()}
    </>
  );
}

const styles = StyleSheet.create({
  gameContainer: {
    flex: 1,
  },
  backButtonContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
});

export default App;
