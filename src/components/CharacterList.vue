<script setup lang="ts">
import { useCharacterStore } from '@/stores/characterStore';
import { storeToRefs } from 'pinia';
import { ElMessageBox, ElMessage } from 'element-plus';
import type { ICharacter } from '@/types/character';

const characterStore = useCharacterStore();
const { characterList, activeCharacterId } = storeToRefs(characterStore);

const handleSetCharacter = (id: string) => {
    characterStore.setActiveCharacter(id);
};

const handleAddCharacter = () => {
    characterStore.addCharacter();
    ElMessage({ type: 'success', message: '新角色已创建' });
};

const handleDeleteCharacter = async (character: ICharacter) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除角色 "${character.name}" 吗？此操作不可撤销。`,
            '删除确认',
            {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        characterStore.deleteCharacter(character.id);
        ElMessage({ type: 'success', message: `角色 "${character.name}" 已删除` });
    } catch (error) {
        ElMessage({ type: 'info', message: '已取消删除' });
    }
};
</script>

<template>
    <div class="character-list-panel">
        <div class="header">
            <h4>角色列表</h4>
        </div>
        <div class="character-list">
            <div v-for="char in characterList" :key="char.id" class="character-item"
                :class="{ active: char.id === activeCharacterId }">
                <span class="char-name" @click="handleSetCharacter(char.id)">
                    {{ char.name || '未命名角色' }}
                </span>
                <el-button type="danger" size="small" circle plain @click="handleDeleteCharacter(char)">
                    X
                </el-button>
            </div>
            <div v-if="characterList.length === 0" class="empty-list">
                <p>列表为空</p>
            </div>
        </div>
        <div class="footer">
            <el-button type="primary" style="width: 100%;" @click="handleAddCharacter">
                新建角色
            </el-button>
        </div>
    </div>
</template>

<style scoped>
.character-list-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.header {
    padding: 15px;
    border-bottom: 1px solid var(--el-border-color);
    text-align: center;
    color: var(--el-text-color-primary);
}

.character-list {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
}

.character-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    margin-bottom: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    color: var(--el-text-color-primary);
}

.character-item:hover {
    background-color: var(--el-bg-color-overlay);
}

.character-item.active {
    background-color: var(--el-color-info);
    color: var(--el-text-color-primary);
    font-weight: bold;
}

.char-name {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 10px;
}

.empty-list {
    text-align: center;
    color: var(--el-text-color-secondary);
    padding-top: 40px;
}

.footer {
    padding: 15px;
    border-top: 1px solid var(--el-border-color);
}
</style>