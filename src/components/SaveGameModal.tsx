import React, { useState } from 'react';
import {
  Box,
  Text,
  ScrollView,
  VStack,
  HStack,
  Pressable,
  Button,
  Spinner,
} from 'native-base';
import { Platform } from 'react-native';
import Modal from 'react-native-modal';
import IconFont from 'react-native-vector-icons/Ionicons';
import { SavedGame, GameType } from '../utils/saveUtils';

interface SaveGameModalProps {
  isVisible: boolean;
  onClose: () => void;
  savedGames: SavedGame[];
  onLoadGame: (saveId: string) => Promise<void>;
  isLoading: boolean;
  gameType: GameType;
  themeColor: string; // 主题色
}

const SaveGameModal: React.FC<SaveGameModalProps> = ({
  isVisible,
  onClose,
  savedGames,
  onLoadGame,
  isLoading,
  gameType,
  themeColor,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 从主题色提取纯色值（去掉透明度）
  const getMainColor = () => {
    if (themeColor.includes('rgba(255, 0, 128')) return '#ff0080';
    if (themeColor.includes('rgba(255, 215, 0')) return 'rgba(255, 215, 0, 0.9)';
    if (themeColor.includes('rgba(139, 69, 19')) return 'rgba(139, 69, 19, 0.9)';
    if (themeColor.includes('rgba(0, 255, 136')) return '#00ff88';
    return '#ff0080'; // 默认颜色
  };

  // 获取对应的半透明色
  const getBorderColor = () => {
    if (themeColor.includes('rgba(255, 0, 128')) return 'rgba(255, 0, 128, 0.3)';
    if (themeColor.includes('rgba(255, 215, 0')) return 'rgba(255, 215, 0, 0.3)';
    if (themeColor.includes('rgba(139, 69, 19')) return 'rgba(139, 69, 19, 0.3)';
    if (themeColor.includes('rgba(0, 255, 136')) return 'rgba(0, 255, 136, 0.3)';
    return 'rgba(255, 0, 128, 0.3)'; // 默认颜色
  };

  const getBackgroundColor = () => {
    if (themeColor.includes('rgba(255, 0, 128')) return 'rgba(255, 0, 128, 0.1)';
    if (themeColor.includes('rgba(255, 215, 0')) return 'rgba(255, 215, 0, 0.1)';
    if (themeColor.includes('rgba(139, 69, 19')) return 'rgba(139, 69, 19, 0.1)';
    if (themeColor.includes('rgba(0, 255, 136')) return 'rgba(0, 255, 136, 0.1)';
    return 'rgba(255, 0, 128, 0.1)'; // 默认颜色
  };

  const getBottomBackgroundColor = () => {
    if (themeColor.includes('rgba(255, 0, 128')) return 'rgba(255, 0, 128, 0.05)';
    if (themeColor.includes('rgba(255, 215, 0')) return 'rgba(255, 215, 0, 0.05)';
    if (themeColor.includes('rgba(139, 69, 19')) return 'rgba(139, 69, 19, 0.05)';
    if (themeColor.includes('rgba(0, 255, 136')) return 'rgba(0, 255, 136, 0.05)';
    return 'rgba(255, 0, 128, 0.05)'; // 默认颜色
  };

  const getBottomBorderColor = () => {
    if (themeColor.includes('rgba(255, 0, 128')) return 'rgba(255, 0, 128, 0.2)';
    if (themeColor.includes('rgba(255, 215, 0')) return 'rgba(255, 215, 0, 0.2)';
    if (themeColor.includes('rgba(139, 69, 19')) return 'rgba(139, 69, 19, 0.2)';
    if (themeColor.includes('rgba(0, 255, 136')) return 'rgba(0, 255, 136, 0.2)';
    return 'rgba(255, 0, 128, 0.2)'; // 默认颜色
  };

  const mainColor = getMainColor();
  const borderColor = getBorderColor();
  const backgroundColor = getBackgroundColor();
  const bottomBackgroundColor = getBottomBackgroundColor();
  const bottomBorderColor = getBottomBorderColor();

  // 游戏类型映射
  const gameTypeNames = {
    checkers: '跳棋',
    chess: '中国象棋',
    gomoku: '五子棋',
    tictactoe: '井字棋',
  };

  // 处理加载存档
  const handleLoadGame = async (saveId: string) => {
    setLoadingId(saveId);
    try {
      await onLoadGame(saveId);
      onClose();
    } catch (error) {
      console.error('加载存档失败:', error);
    } finally {
      setLoadingId(null);
    }
  };

  // 格式化时间显示
  const formatTimeDisplay = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      {...(Platform.OS === 'android' && { onBackButtonPress: onClose })}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.7}
      style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
    >
      <Box
        bg="#000015"
        borderColor={borderColor}
        borderWidth={1}
        borderRadius="lg"
        w="90%"
        maxH="80%"
        shadow={5}
      >
        {/* 头部 */}
        <HStack
          justifyContent="space-between"
          alignItems="center"
          bg={backgroundColor}
          borderTopRadius="lg"
          borderBottomWidth={1}
          borderBottomColor={borderColor}
          px={4}
          py={3}
        >
          <Text fontSize="lg" fontWeight="bold" color={mainColor} fontFamily="mono">
            游戏存档
          </Text>
          <Pressable
            onPress={onClose}
            _pressed={{ bg: backgroundColor }}
            borderRadius="md"
            px={2}
            py={1}
          >
            <Text
              color={mainColor}
              fontWeight="bold"
              fontSize="sm"
              fontFamily="mono"
            >
              关闭
            </Text>
          </Pressable>
        </HStack>

        {/* 内容 */}
        {savedGames.length === 0 ? (
          // 空状态 - 模仿规则弹框的内容结构
          <Box p={4} minH="200px" justifyContent="center" alignItems="center">
            <VStack space={3} alignItems="center">
              <IconFont name="folder-open-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
              <Text
                fontSize="md"
                color="rgba(255, 255, 255, 0.5)"
                textAlign="center"
                fontFamily="mono"
              >
                暂无存档
              </Text>
              <Text
                fontSize="sm"
                color="rgba(255, 255, 255, 0.3)"
                textAlign="center"
                fontFamily="mono"
              >
                开始游戏后可以保存进度
              </Text>
            </VStack>
          </Box>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={3} p={4}>
              {savedGames.map((save, index) => (
                <HStack key={save.id} alignItems="center" space={3}>
                  <Box w={2} h={2} borderRadius="full" bg={mainColor} />
                  <Pressable
                    flex={1}
                    onPress={() => handleLoadGame(save.id)}
                    isDisabled={loadingId === save.id || isLoading}
                    opacity={loadingId === save.id ? 0.6 : 1}
                  >
                    <HStack alignItems="center" space={2} flex={1}>
                      <VStack flex={1}>
                        <HStack alignItems="center" space={2}>
                          <Text
                            fontSize="sm"
                            color="white"
                            fontFamily="mono"
                            flex={1}
                          >
                            {save.displayName}
                          </Text>
                          {save.isAIMode && (
                            <Box
                              bg="rgba(255, 165, 0, 0.2)"
                              borderWidth={1}
                              borderColor="rgba(255, 165, 0, 0.5)"
                              borderRadius="sm"
                              px={1}
                              py={0.5}
                            >
                              <Text
                                fontSize="xs"
                                color="#ffa500"
                                fontFamily="mono"
                              >
                                AI
                              </Text>
                            </Box>
                          )}
                        </HStack>
                        
                        <Text
                          fontSize="xs"
                          color="rgba(255, 255, 255, 0.6)"
                          fontFamily="mono"
                        >
                          {formatTimeDisplay(save.timestamp)}
                        </Text>
                      </VStack>

                      {/* 状态指示 */}
                      {loadingId === save.id ? (
                        <Spinner size="sm" color={mainColor} />
                      ) : (
                        <IconFont name="chevron-forward" size={16} color={mainColor} />
                      )}
                    </HStack>
                  </Pressable>
                </HStack>
              ))}
            </VStack>
          </ScrollView>
        )}

        {/* 底部按钮 */}
        <Box
          bg={bottomBackgroundColor}
          borderBottomRadius="lg"
          borderTopWidth={1}
          borderTopColor={bottomBorderColor}
          p={4}
        >
          <Button
            onPress={onClose}
            bg={mainColor}
            _text={{ 
              color: mainColor === '#00ff88' ? "black" : "white", 
              fontWeight: "bold" 
            }}
            _pressed={{ 
              bg: mainColor === '#ff0080' ? "#cc0066" : 
                  mainColor === '#00ff88' ? "#00cc6a" :
                  mainColor.replace('0.9', '0.6')
            }}
            w="100%"
          >
            {savedGames.length === 0 ? "知道了" : "关闭"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SaveGameModal; 