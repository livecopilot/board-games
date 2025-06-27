import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';

interface HomeScreenProps {
  onGameSelect: (gameType: string) => void;
}

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ onGameSelect }) => {
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
    <TouchableOpacity
      key={game.id}
      style={[
        styles.gameCard,
        !game.available && styles.disabledCard,
      ]}
      onPress={() => game.available && onGameSelect(game.id)}
      disabled={!game.available}
    >
      <View style={styles.gameIcon}>
        <Text style={styles.iconText}>{game.icon}</Text>
      </View>
      
      <View style={styles.gameInfo}>
        <Text style={[
          styles.gameTitle,
          !game.available && styles.disabledText,
        ]}>
          {game.title}
        </Text>
        <Text style={[
          styles.gameDescription,
          !game.available && styles.disabledText,
        ]}>
          {game.description}
        </Text>
        
        <View style={styles.gameDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>难度:</Text>
            <Text style={[
              styles.detailValue,
              !game.available && styles.disabledText,
            ]}>
              {game.difficulty}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>年龄:</Text>
            <Text style={[
              styles.detailValue,
              !game.available && styles.disabledText,
            ]}>
              {game.ageRange}
            </Text>
          </View>
        </View>
      </View>
      
      {!game.available && (
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>即将推出</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 标题部分 */}
        <View style={styles.header}>
          <Text style={styles.title}>棋类游戏</Text>
          <Text style={styles.subtitle}>亲子对弈，快乐成长</Text>
          <View style={styles.divider} />
        </View>

        {/* 介绍部分 */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>为什么选择棋类游戏？</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🧠</Text>
            <Text style={styles.benefitText}>提升逻辑思维能力</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.benefitText}>增进亲子关系</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🎯</Text>
            <Text style={styles.benefitText}>培养专注力和耐心</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🏆</Text>
            <Text style={styles.benefitText}>学会面对胜负</Text>
          </View>
        </View>

        {/* 游戏列表 */}
        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>选择一个游戏开始吧！</Text>
          {games.map(renderGameCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#3498db',
    borderRadius: 2,
  },
  introSection: {
    backgroundColor: '#e8f4f8',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#34495e',
    flex: 1,
  },
  gamesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  disabledCard: {
    backgroundColor: '#f8f9fa',
    opacity: 0.6,
  },
  gameIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  gameDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginRight: 5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34495e',
  },
  disabledText: {
    color: '#bdc3c7',
  },
  comingSoon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f39c12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  comingSoonText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen; 