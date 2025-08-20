<script setup lang="ts">
import { useCharacterStore } from '@/stores/characterStore'
import { storeToRefs } from 'pinia'

// 1. 获取 store 实例
const characterStore = useCharacterStore()

// 2. 使用 storeToRefs 将 store 中的 state 解构为响应式 ref
// 这样做可以让我们在模板中直接使用 character，而不用写 characterStore.character
// 并且保证了数据的响应式
const { character } = storeToRefs(characterStore)
</script>

<template>
    <div class="preview-card">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>实时预览</span>
                </div>
            </template>
            <div class="card-body">
                <el-image :src="character.avatar || '/placeholder.png'" fit="cover" class="character-avatar" />
                <el-descriptions :title="character.name" :column="1" border>
                    <el-descriptions-item label="型号">{{ character.codename }}</el-descriptions-item>
                    <el-descriptions-item label="品质">{{ character.quality }}</el-descriptions-item>
                    <el-descriptions-item label="职业">{{ character.class }}</el-descriptions-item>
                    <el-descriptions-item label="机体框架">{{ character.frameType }}</el-descriptions-item>
                    <el-descriptions-item label="伤害类型">{{ character.damageType }}</el-descriptions-item>
                </el-descriptions>
            </div>
        </el-card>
    </div>
</template>

<style scoped>
.preview-card {
    padding: 20px;
    position: sticky;
    top: 20px;
}

.character-avatar {
    width: 100%;
    margin-bottom: 20px;
    background-color: #f5f7fa;
    /* 添加一个背景色，防止图片路径为空时区域塌陷 */
    min-height: 150px;
    /* 设置最小高度 */
}
</style>