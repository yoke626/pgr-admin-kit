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

                <el-divider>技能</el-divider>
                <div v-if="character.skills.length === 0" class="empty-skills">暂未配置技能</div>
                <div v-for="(skill, index) in character.skills" v-else :key="index" class="skill-display-item">
                    <div class="skill-header">
                        <strong>{{ skill.name }}</strong>
                        <el-tag size="small">{{ skill.type }}</el-tag>
                    </div>
                    <p class="skill-description">{{ skill.description }}</p>
                </div>

                <el-divider>推荐意识</el-divider>
                <div v-if="character.recommendedConsciousness.length === 0" class="empty-skills">
                    暂未配置意识
                </div>
                <div v-else class="consciousness-tags">
                    <el-tag v-for="consciousness in character.recommendedConsciousness" :key="consciousness.id"
                        class="consciousness-tag" effect="plain">
                        {{ consciousness.name }}
                    </el-tag>
                </div>
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

/* ▼▼▼ 新增技能展示样式 ▼▼▼ */
.skill-display-item {
    margin-bottom: 15px;
}

.skill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
}

.skill-description {
    font-size: 14px;
    color: #606266;
    white-space: pre-wrap;
    /* 保持描述中的换行 */
}

.empty-skills {
    text-align: center;
    color: #909399;
    padding: 20px 0;
}

/* ▼▼▼ 新增意识展示样式 ▼▼▼ */
.consciousness-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    /* 使用 gap 来创建间距 */
}
</style>