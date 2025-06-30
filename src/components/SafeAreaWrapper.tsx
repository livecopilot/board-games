import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ 
  children, 
  backgroundColor = '#000015' 
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* 顶部安全区域 */}
      <View 
        style={[
          styles.topSafeArea, 
          { 
            height: insets.top,
            backgroundColor 
          }
        ]} 
      />
      
      {/* 主要内容区域 */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* 底部安全区域 - 手势提示线区域 */}
      <View 
        style={[
          styles.bottomSafeArea, 
          { 
            height: insets.bottom,
            backgroundColor 
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSafeArea: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
  bottomSafeArea: {
    width: '100%',
  },
});

export default SafeAreaWrapper; 