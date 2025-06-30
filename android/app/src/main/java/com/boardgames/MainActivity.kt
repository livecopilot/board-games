package com.boardgames

import android.os.Bundle
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "BoardGames"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // 设置窗口标志和颜色
    window.apply {
      // 启用绘制系统栏背景
      addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
      
      // 设置状态栏和导航栏颜色为深色主题
      statusBarColor = android.graphics.Color.parseColor("#000015")
      navigationBarColor = android.graphics.Color.parseColor("#000015")
      
      // 确保系统栏使用浅色内容（白色图标/文字）
      WindowCompat.setDecorFitsSystemWindows(window, false)
      WindowInsetsControllerCompat(window, decorView).apply {
        isAppearanceLightStatusBars = false  // 深色状态栏使用浅色内容
        isAppearanceLightNavigationBars = false  // 深色导航栏使用浅色内容
      }
    }
  }
}
