<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCharacterStore } from '@/stores/characterStore';
import CharacterList from './components/CharacterList.vue';
import { QuestionFilled, Download, Upload, Link, Moon, Sunny } from '@element-plus/icons-vue'
import { readJson } from './utils/fileReader'
import { ElMessage } from 'element-plus'
import type { ICharacter } from './types/character'
import { useThemeStore } from './stores/themeStore';

// 获取 store 实例
const characterStore = useCharacterStore();
const themeStore = useThemeStore();

// 当组件挂载后，执行 store 的初始化逻辑
onMounted(() => {
  characterStore.initializeStore();
});

const helpDialogVisible = ref(false);

// 处理从全局导入的逻辑
async function handleImportJson() {
  try {
    const characterData = await readJson<ICharacter>()
    if (characterData && characterData.name && characterData.id) {
      characterStore.importCharacter(characterData)
      ElMessage({ type: 'success', message: `角色'${characterData.name}'已成功导入!` })
    } else {
      ElMessage({ type: 'error', message: 'JSON文件格式不正确' })
    }
  } catch (error) {
    ElMessage({ type: 'error', message: `导入失败: ${error}` })
  }
}
</script>

<template>
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
            <el-dropdown>
              <el-button type="primary">
                导入/导出<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :icon="Upload" @click="handleImportJson">导入角色文件</el-dropdown-item>
                  <el-dropdown-item :icon="Download"
                    @click="characterStore.exportActiveCharacter">导出当前角色</el-dropdown-item>
                  <el-dropdown-item :icon="Download"
                    @click="characterStore.exportAllCharacters">导出全部角色</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button :icon="QuestionFilled" circle @click="helpDialogVisible = true" />
            <el-button :icon="themeStore.isDark ? Moon : Sunny" circle @click="themeStore.toggleTheme()" />
            <a href="https://github.com/yoke626/pgr-admin-kit" target="_blank"><el-button :icon="Link" circle /></a>
          </div>
        </el-header>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    <el-dialog v-model="helpDialogVisible" title="帮助说明" width="50%">
      <h3>项目核心概念</h3>
      <p>
        一个Web应用，模拟内容编辑人员使用的后台管理工具。用户通过一个可视化的表单来配置《战双帕弥什》中的角色数据，在页面右侧可以实时预览生成的角色资料卡，并最终导出一个标准化的JSON数据文件。
      </p>
      <br />
      <h3>如何使用?</h3>
      <ul>
        <li><b>左侧列表:</b> 点击“新建角色”或选择已有角色。</li>
        <li><b>中间编辑区:</b> 通过不同标签页，配置角色的基础信息、技能和意识。</li>
        <li><b>右侧预览区:</b> 实时查看你的配置效果。</li>
        <li><b>顶部导航栏:</b> 进行全局的导入/导出操作。</li>
      </ul>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="helpDialogVisible = false"> 明白了 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
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
</style>