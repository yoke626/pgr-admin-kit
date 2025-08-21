<script setup lang="ts">
import { onMounted } from 'vue';
import { useCharacterStore } from '@/stores/characterStore';

// 获取 store 实例
const characterStore = useCharacterStore();

// 当组件挂载后，执行 store 的初始化逻辑
onMounted(() => {
  characterStore.initializeStore();
});
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <div class="aside-placeholder">左侧菜单区域</div>
      </el-aside>

      <el-container>
        <el-header>
          <div class="header-placeholder">顶部导航区域</div>
        </el-header>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
/* 为布局添加一些基本样式和背景色，方便我们看清结构 */
.common-layout,
.el-container {
  height: 100vh;
}

.el-header {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #D3DCE6;
  color: #333;
  text-align: center;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
}

/* 用于垂直居中显示占位文字 */
.aside-placeholder,
.header-placeholder,
.main-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>