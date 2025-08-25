import { createApp } from 'vue'
import { createPinia } from 'pinia'
//import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import 'element-plus/dist/index.css'
import './style.css'
import './styles/theme.scss'

import App from './App.vue'
import router from './router'

const pinia = createPinia()
//pinia.use(piniaPluginPersistedstate)

createApp(App).use(router).use(pinia).mount('#app')
