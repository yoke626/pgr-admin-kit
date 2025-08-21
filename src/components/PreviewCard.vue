<script setup lang="ts">
import { useCharacterStore } from '@/stores/characterStore'
import { storeToRefs } from 'pinia'

const characterStore = useCharacterStore()
const { activeCharacter } = storeToRefs(characterStore)

// 动态计算技能标签的类型
const skillTagType = (type: string) => {
    switch (type) {
        case 'red': return 'danger';
        case 'yellow': return 'warning';
        case 'blue': return 'primary';
        default: return 'info';
    }
}
</script>

<template>
    <div class="preview-card">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>实时预览</span>
                </div>
            </template>
            <div v-if="activeCharacter" class="card-body">
                <el-image :src="activeCharacter.avatar || '/placeholder.png'" fit="cover" class="character-avatar" />
                <el-descriptions :title="activeCharacter.name || '待命名'" :column="1" border>
                    <el-descriptions-item label="型号">{{ activeCharacter.codename }}</el-descriptions-item>
                    <el-descriptions-item label="品质">{{ activeCharacter.quality }}</el-descriptions-item>
                    <el-descriptions-item label="职业">{{ activeCharacter.class }}</el-descriptions-item>
                    <el-descriptions-item label="机体框架">{{ activeCharacter.frameType }}</el-descriptions-item>
                    <el-descriptions-item label="伤害类型">{{ activeCharacter.damageType }}</el-descriptions-item>
                </el-descriptions>

                <el-divider>技能</el-divider>
                <div v-if="activeCharacter.skills.length === 0" class="empty-skills">暂未配置技能</div>
                <div v-for="(skill, index) in activeCharacter.skills" v-else :key="index" class="skill-display-item">
                    <div class="skill-header">
                        <strong>{{ skill.name }}</strong>
                        <el-tag size="small" :type="skillTagType(skill.type)">{{ skill.type }}</el-tag>
                    </div>
                    <p class="skill-description">{{ skill.description }}</p>
                </div>

                <el-divider>推荐意识</el-divider>
                <div v-if="activeCharacter.recommendedConsciousness.length === 0" class="empty-skills">
                    暂未配置意识
                </div>
                <div v-else class="consciousness-tags">
                    <el-tag v-for="consciousness in activeCharacter.recommendedConsciousness" :key="consciousness.id"
                        class="consciousness-tag" effect="plain">
                        {{ consciousness.name }}
                    </el-tag>
                </div>
            </div>
            <div v-else class="empty-preview">
                <p>请在左侧新建或选择一个角色以开始编辑</p>
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
    min-height: 150px;
}

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
}

.empty-skills,
.empty-preview {
    text-align: center;
    color: #909399;
    padding: 20px 0;
}

.empty-preview {
    min-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.consciousness-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
</style>