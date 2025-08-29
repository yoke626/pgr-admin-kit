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
        <div class="help-content">
          <h4>欢迎使用 PGR-Admin-Kit！</h4>
          <p>这是一款为《战双帕弥什》玩家设计的角色配置中台工具，旨在提供一个方便、强大且云端同步的角色数据管理方案。</p>
          <el-divider />
          <h5>核心功能：</h5>
          <ul>
            <li><b>角色管理:</b> 在左侧列表可以新建、切换或删除角色。所有数据都将自动保存到您的云端账户。</li>
            <li><b>数据编辑:</b> 在左侧编辑区，您可以通过不同的标签页详细配置角色的基础信息、技能、意识搭配等。</li>
            <li><b>实时预览:</b> 右侧的卡片会实时根据您的修改进行更新，提供最直观的视觉反馈。</li>
            <li><b>拖拽排序:</b> 在“技能配置”标签页和预览卡片的技能区域，您可以直接拖动技能卡片来调整它们的显示顺序。</li>
            <li><b>数据看板:</b> 在“数据看板”标签页中，系统会根据您配置的属性和技能倍率，自动计算总伤害期望和各技能的伤害分布。</li>
            <li><b>配置快照:</b> 您可以在“数据看板”中为当前角色的配置“拍摄快照”。这会保存当前的所有核心数据，方便您后续进行不同配置方案的优劣对比。</li>
            <li><b>导入/导出:</b> 在“操作”标签页，您可以将当前角色的配置导出为<code>.json</code>文件进行备份或分享，也可以从<code>.json</code>文件导入角色数据。</li>
            <li><b>主题切换:</b> 点击顶栏的太阳/月亮图标，可以轻松切换亮色/暗色主题。</li>
          </ul>
        </div>
      </el-dialog>
    </div>
  </template>
</template>

<style scoped>
.common-layout {
  height: 100vh;
}

.common-layout>.el-container {
  height: 100%;
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

.help-content {
  line-height: 1.8;
  /* 增加全局行高 */
}

.help-content h4 {
  font-size: 20px;
  margin-bottom: 16px;
}

.help-content h5 {
  font-size: 18px;
  margin-top: 24px;
  margin-bottom: 12px;
}

.help-content p {
  font-size: 15px;
  margin-bottom: 16px;
  /* 增加段落间距 */
  color: var(--el-text-color-regular);
}

.help-content ul {
  padding-left: 25px;
  /* 列表增加内边距 */
}

.help-content li {
  margin-bottom: 10px;
  /* 增加列表项间距 */
  font-size: 15px;
  color: var(--el-text-color-regular);
}

.help-content code {
  background-color: var(--el-fill-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}
</style>