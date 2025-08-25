import { createRouter, createWebHistory } from 'vue-router'
import CharacterEditorVue from '@/views/CharacterEditor.vue'
import NotFoundVue from '@/views/NotFound.vue'
import LoginVue from '@/views/Login.vue'
import RegisterVue from '@/views/Register.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // 默认路由，当用户访问根路径时，自动重定向到编辑器页面
      path: '/',
      redirect: '/editor',
    },
    {
      path: '/editor',
      name: 'editor',
      // 当用户访问 /editor 路径时，加载 CharacterEditor.vue 组件
      component: CharacterEditorVue,
      meta: { requiresAuth: true }, // 需要认证才能访问
    },
    {
      path: '/login',
      name: 'login',
      component: LoginVue,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterVue,
    },
    {
      // 通配符路由，匹配所有未定义的路径，显示 404 页面
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundVue,
    },
  ],
})

// 全局前置守卫
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // 确保在检查登录状态前，已经从 Supabase 获取了会话信息
  if (authStore.user === null) {
    await authStore.getCurrentSession()
  }

  const isLoggedIn = authStore.isLoggedIn

  if (to.meta.requiresAuth && !isLoggedIn) {
    // 如果目标路由需要认证但用户未登录，则重定向到登录页
    next({ name: 'login' })
  } else if ((to.name === 'login' || to.name === 'register') && isLoggedIn) {
    // 如果用户已登录，但访问的是登录或注册页，则重定向到编辑器
    next({ name: 'editor' })
  } else {
    // 其他情况正常放行
    next()
  }
})

export default router
