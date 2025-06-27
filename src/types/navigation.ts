import type { StackScreenProps } from "@react-navigation/stack";

// 定义路由参数类型
export type RootStackParamList = {
  Home: undefined;
  TicTacToe: undefined;
  // 为将来的游戏屏幕预留
  Checkers: undefined;
  Chess: undefined;
  Gomoku: undefined;
};

// 定义屏幕组件的props类型
export type HomeScreenProps = StackScreenProps<RootStackParamList, "Home">;
export type TicTacToeScreenProps = StackScreenProps<RootStackParamList, "TicTacToe">;
export type CheckersScreenProps = StackScreenProps<RootStackParamList, "Checkers">;
export type ChessScreenProps = StackScreenProps<RootStackParamList, "Chess">;

// 声明全局导航类型
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
