import { Dimensions, Platform } from "react-native";

export interface DeviceInfo {
  isTablet: boolean;
  isPhone: boolean;
  width: number;
  height: number;
  isLandscape: boolean;
  scale: number;
}

/**
 * 获取设备信息
 */
export const getDeviceInfo = (): DeviceInfo => {
  const { width, height, scale } = Dimensions.get("window");
  const isLandscape = width > height;

  // iPad检测：基于屏幕尺寸和平台
  const isTablet =
    Platform.OS === "ios"
      ? Math.min(width, height) >= 768 // iPad最小尺寸
      : Math.min(width, height) >= 600; // Android平板最小尺寸

  return {
    isTablet,
    isPhone: !isTablet,
    width,
    height,
    isLandscape,
    scale,
  };
};

/**
 * 获取适应屏幕的尺寸
 */
export const getAdaptiveSize = () => {
  const { width, height, isTablet, isLandscape } = getDeviceInfo();

  // 棋盘尺寸计算
  const maxBoardSize = Math.min(width, height) - (isTablet ? 120 : 80);
  const boardSize = Math.min(maxBoardSize, isTablet ? 600 : 350);

  // 游戏卡片布局
  const cardColumns = isTablet ? (isLandscape ? 3 : 2) : 1;
  const cardWidth = isTablet ? (width - 80) / cardColumns - 20 : width - 48;

  // 字体尺寸
  const fontSize = {
    small: isTablet ? 16 : 14,
    medium: isTablet ? 20 : 18,
    large: isTablet ? 28 : 24,
    xlarge: isTablet ? 36 : 32,
  };

  // 间距
  const spacing = {
    xs: isTablet ? 6 : 4,
    sm: isTablet ? 12 : 8,
    md: isTablet ? 20 : 16,
    lg: isTablet ? 32 : 24,
    xl: isTablet ? 48 : 32,
  };

  return {
    boardSize,
    cardColumns,
    cardWidth,
    fontSize,
    spacing,
    containerPadding: isTablet ? 40 : 24,
  };
};

/**
 * 获取安全的容器宽度（防止内容过宽）
 */
export const getSafeContainerWidth = (): number => {
  const { width, isTablet } = getDeviceInfo();

  if (!isTablet) return width;

  // iPad上限制最大宽度，保持良好的阅读体验
  const maxWidth = Math.min(width * 0.8, 800);
  return maxWidth;
};

/**
 * 检查是否为横屏模式
 */
export const isLandscapeMode = (): boolean => {
  const { width, height } = Dimensions.get("window");
  return width > height;
};

/**
 * 获取响应式栅格布局
 */
export const getResponsiveGrid = () => {
  const { isTablet, isLandscape } = getDeviceInfo();

  if (!isTablet) {
    return { columns: 1, itemWidth: "100%" };
  }

  const columns = isLandscape ? 3 : 2;
  const itemWidth = `${100 / columns - 2}%`;

  return { columns, itemWidth };
};
