/*
 * @Author: changwj yoursfengzhilian@gmail.com
 * @Date: 2025-06-27 13:54:37
 * @LastEditors: changwj yoursfengzhilian@gmail.com
 * @LastEditTime: 2025-06-30 13:59:49
 * @FilePath: /board-games/src/types/navigation.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
export type GomokuScreenProps = StackScreenProps<RootStackParamList, "Gomoku">;

// 声明全局导航类型
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
