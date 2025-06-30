/*
 * @Author: changwj yoursfengzhilian@gmail.com
 * @Date: 2025-06-30 16:34:10
 * @LastEditors: changwj yoursfengzhilian@gmail.com
 * @LastEditTime: 2025-06-30 16:44:24
 * @FilePath: /board-games/src/utils/common.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 共用的工具函数和类型
import { AIDifficulty, Position } from "../types";

// 通用的随机选择函数
export const getRandomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// 通用的范围检查函数
export const isInBounds = (row: number, col: number, maxRow: number, maxCol: number): boolean => {
  return row >= 0 && row < maxRow && col >= 0 && col < maxCol;
};

// 通用的数组深拷贝函数
export const deepCopyBoard = <T>(board: T[][]): T[][] => {
  return board.map((row) => [...row]);
};

// 计算两点之间的曼哈顿距离
export const manhattanDistance = (pos1: Position, pos2: Position): number => {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
};

// 计算两点之间的欧几里得距离
export const euclideanDistance = (pos1: Position, pos2: Position): number => {
  return Math.sqrt((pos1.row - pos2.row) ** 2 + (pos1.col - pos2.col) ** 2);
};

// 通用的AI难度时间限制（毫秒）- 专家级优化
export const AI_TIME_LIMITS = {
  [AIDifficulty.EASY]: 300, // 简单模式：快速响应
  [AIDifficulty.MEDIUM]: 800, // 中等模式：适中思考时间
  [AIDifficulty.HARD]: 3000, // 困难/专家模式：允许深度思考
};

// 通用的minimax搜索深度 - 优化版本
export const AI_SEARCH_DEPTHS = {
  [AIDifficulty.EASY]: 2, // 简单模式：2层搜索
  [AIDifficulty.MEDIUM]: 4, // 中等模式：4层搜索
  [AIDifficulty.HARD]: 8, // 困难/专家模式：8层搜索
};

// 位置权重计算（中心位置权重更高）
export const getCenterWeight = (row: number, col: number, maxRow: number, maxCol: number): number => {
  const centerRow = (maxRow - 1) / 2;
  const centerCol = (maxCol - 1) / 2;
  const maxDistance = Math.max(centerRow, centerCol);
  const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
  return (maxDistance - distance) / maxDistance;
};
