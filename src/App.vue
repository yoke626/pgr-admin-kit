<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useCharacterStore } from '@/stores/characterStore';
import CharacterList from './components/CharacterList.vue';
import { QuestionFilled, Link, Moon, Sunny, ArrowDown, Right } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const characterStore = useCharacterStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();
const router = useRouter();

const { isLoggedIn, user } = storeToRefs(authStore);

onMounted(() => {
  // 在应用根组件挂载时，开始监听认证状态
  authStore.initializeAuthListener();
});

// 监听登录状态的变化
watch(isLoggedIn, (newVal) => {
  if (newVal) {
    // 如果用户登录，则获取他们的角色数据
    characterStore.fetchCharacters();
  } else {
    // 如果用户登出，则清空本地角色数据
    characterStore.characters = [];
    characterStore.activeCharacterId = null;
  }
});

const helpDialogVisible = ref(false);

const handleLogout = async () => {
  try {
    await authStore.signOut();
    ElMessage.success('已成功登出');
    router.push({ name: 'login' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      ElMessage.error(`登出失败: ${error.message}`);
    } else {
      ElMessage.error('登出失败: 未知错误');
    }
  }
};
</script>

<template>
  <template v-if="!isLoggedIn">
    <router-view />
  </template>
  <template v-else>
    <div class="common-layout">
      <el-container>
        <el-aside width="250px">
          <CharacterList />
        </el-aside>

        <el-container>
          <el-header>
            <div class="header-left">
              <span class="main-title">PGR-Admin-Kit</span>
              <span class="sub-title">| 角色配置中台</span>
            </div>
            <div class="header-right">

              <el-button :icon="QuestionFilled" circle @click="helpDialogVisible = true" />
              <el-button :icon="themeStore.isDark ? Moon : Sunny" circle @click="themeStore.toggleTheme()" />
              <a href="https://github.com/yoke626/pgr-admin-kit" target="_blank"><el-button :icon="Link" circle /></a>

              <el-divider direction="vertical" />

              <el-dropdown>
                <span class="el-dropdown-link">
                  {{ user?.email }}
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :icon="Right" @click="handleLogout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>

            </div>
          </el-header>

          <el-main>
            <router-view />
          </el-main>
        </el-container>
      </el-container>

      <el-dialog v-model="helpDialogVisible" title="帮助说明" width="50%">
      </el-dialog>
    </div>
  </template>
</template>

<style scoped>
.common-layout,
.el-container {
  height: 100vh;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.main-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.sub-title {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
</style>