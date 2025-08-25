import { defineStore } from 'pinia'
import { useDark, useToggle } from '@vueuse/core'

export const useThemeStore = defineStore(
  'theme',
  () => {
    // 使用 VueUse 库中的 useDark 组合式函数，它会自动处理 class 的切换和系统主题偏好
    const isDark = useDark()

    // useToggle 提供一个方便的切换函数
    const toggleTheme = useToggle(isDark)

    return {
      isDark,
      toggleTheme,
    }
  },
  {
    // 开启持久化
    //persist: true,
  }
)
