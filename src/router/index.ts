import { createRouter, createWebHistory } from 'vue-router'
import CharacterEditorVue from '@/views/CharacterEditor.vue'

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
    },
  ],
})

export default router
