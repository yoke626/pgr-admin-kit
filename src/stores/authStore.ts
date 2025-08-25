import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    session: null as Session | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
  },
  actions: {
    /**
     * 初始化认证状态监听器
     * 在应用启动时调用，以保持用户登录状态同步
     */
    initializeAuthListener() {
      supabase.auth.onAuthStateChange((_event, session) => {
        this.session = session
        this.user = session?.user ?? null
      })
    },

    /**
     * 用户注册
     * @param email - 用户的邮箱
     * @param password - 用户的密码
     */
    async signUp(email: string, password: string) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return data
    },

    /**
     * 用户登录
     * @param email - 用户的邮箱
     * @param password - 用户的密码
     */
    async signIn(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    },

    /**
     * 用户登出
     */
    async signOut() {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // 状态将在 onAuthStateChange 中自动清除
    },

    /**
     * 获取当前会话，用于路由守卫等场景
     */
    async getCurrentSession() {
      const { data } = await supabase.auth.getSession()
      this.session = data.session
      this.user = data.session?.user ?? null
    },
  },
})
