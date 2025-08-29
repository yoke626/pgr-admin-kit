<script setup lang="ts">
import EditorForm from '@/components/EditorForm.vue'
import PreviewCard from '@/components/PreviewCard.vue'
import { useCharacterStore } from '@/stores/characterStore'
import { storeToRefs } from 'pinia'
import { ref, nextTick, onMounted } from 'vue'

const characterStore = useCharacterStore()
const { isLoading } = storeToRefs(characterStore)
const editorFormCompRef = ref<InstanceType<typeof EditorForm> | null>(null)

const isMounted = ref(false)

onMounted(() => {
    // 在 onMounted 内部使用 nextTick
    nextTick(() => {
        // 只有在 DOM 完全更新后，才将 isMounted 设为 true
        isMounted.value = true
    })
})

// 新增：处理跳转事件的函数
const handleScrollToSkill = (skillIndex: number) => {
    if (!editorFormCompRef.value) return;

    // 调用子组件的方法来切换 Tab
    editorFormCompRef.value.setActiveTab('技能配置');

    // 使用 nextTick 确保Tab切换完成后再执行滚动
    nextTick(() => {
        editorFormCompRef.value?.scrollToSkill(skillIndex);
    });
}



const svg = `
  <path d="M24 2C12.95 2 4 10.95 4 22s8.95 20 20 20 20-8.95 20-20S35.05 2 24 2zm0 36c-8.84 0-16-7.16-16-16S15.16 6 24 6s16 7.16 16 16-7.16 16-16 16z"/>
  <path d="M24 6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 8c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" transform="rotate(45 24 24)"/>
`
</script>

<template>
    <div v-loading="isLoading" class="character-editor-page" element-loading-text="正在加载中..."
        :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50"
        element-loading-background="var(--el-bg-color-overlay)">
        <el-row :gutter="20">
            <el-col :span="14" class="editor-scroll-container">
                <EditorForm ref="editorFormCompRef" />
                <el-backtop v-if="isMounted" target=".editor-scroll-container" />
            </el-col>
            <el-col :span="10" class="preview-scroll-container">
                <PreviewCard @scroll-to-skill="handleScrollToSkill" />
                <el-backtop v-if="isMounted" target=".preview-scroll-container" />
            </el-col>
        </el-row>
    </div>
</template>

<style scoped>
.character-editor-page {
    padding: 0 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.el-row {
    height: 100%;
    /* 处理滚动关键样式 */
    flex-grow: 1;
    overflow: hidden;
    /* 防止父容器出现滚动条 */
}

.editor-scroll-container,
.preview-scroll-container {
    height: 100%;
    overflow-y: auto;
}

:deep(.el-loading-mask) {
    position: fixed;
    /* 偏移量需要根据 App.vue 的布局来确定 */
    top: 79px;
    /* 对应 <el-header> 的高度 */
    left: 289px;
    /* 对应 <el-aside> 的宽度 */
    right: 14px;
    bottom: 0;
    /* 重置宽高，让 top/right/bottom/left 完全控制其尺寸 */
    width: auto;
    height: auto;
}
</style>