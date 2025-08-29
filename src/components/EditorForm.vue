<script setup lang="ts">
import DamageCalculator from './DamageCalculator.vue'
import { computed, ref, watch, nextTick } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { QUALITY_OPTIONS, CLASS_OPTIONS, FRAME_TYPE_OPTIONS, DAMAGE_TYPE_OPTIONS } from '@/constants/characterOptions'
import SkillFormItem from './SkillFormItem.vue';
import ConsciousnessItem from './ConsciousnessItem.vue';
import type { ISkill, ICharacter } from '@/types/character';
import { storeToRefs } from 'pinia';
import { ALL_CONSCIOUSNESS } from '@/database/consciousnessData';
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Upload, Download, Delete, Search } from '@element-plus/icons-vue';
import { readJson } from '@/utils/fileReader';
import draggable from 'vuedraggable'

const characterStore = useCharacterStore()

// 使用 activeCharacter getter
const { activeCharacter } = storeToRefs(characterStore);
const editorFormRef = ref<FormInstance>();
const skillFormItemsRef = ref<HTMLElement[]>([]); // 用于存储技能表单DOM元素的引用

// 处理滚动和高亮的函数
const scrollToSkill = (index: number) => {
    const skillElement = skillFormItemsRef.value[index];
    if (skillElement) {
        // 滚动到元素位置
        skillElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 添加高亮效果
        skillElement.classList.add('is-highlighted');

        // 2秒后移除高亮
        setTimeout(() => {
            skillElement.classList.remove('is-highlighted');
        }, 2000);
    }
};

const handleDragEnd = (event: { oldIndex: number, newIndex: number }) => {
    // 只有当索引确实发生变化时，才执行操作
    if (event.oldIndex !== event.newIndex) {
        characterStore.reorderSkills();
    }
};


// 为意识筛选器创建响应式变量
const consciousnessFilter = ref('');

// 创建计算属性以根据筛选文本过滤意识列表
const filteredConsciousness = computed(() => {
    if (!consciousnessFilter.value) {
        return ALL_CONSCIOUSNESS;
    }
    return ALL_CONSCIOUSNESS.filter(c =>
        c.name.toLowerCase().includes(consciousnessFilter.value.toLowerCase()) ||
        c.description.toLowerCase().includes(consciousnessFilter.value.toLowerCase())
    );
});

// 用于格式化时间戳的计算属性
const createdAtFormatted = computed(() => {
    if (activeCharacter.value?.createdAt) {
        return new Date(activeCharacter.value.createdAt).toLocaleString();
    }
    return '暂无记录';
});

const updatedAtFormatted = computed(() => {
    if (activeCharacter.value?.updatedAt) {
        return new Date(activeCharacter.value.updatedAt).toLocaleString();
    }
    return '暂无记录';
});

const name = computed({
    get: () => activeCharacter.value?.name ?? '',
    set: (val) => characterStore.updateCharacterInfo('name', val),
})

const codename = computed({
    get: () => activeCharacter.value?.codename ?? '',
    set: (val) => characterStore.updateCharacterInfo('codename', val),
})

const quality = computed({
    get: () => activeCharacter.value?.quality ?? 'A',
    set: (val) => characterStore.updateCharacterInfo('quality', val),
})

const charClass = computed({
    get: () => activeCharacter.value?.class ?? '进攻型',
    set: (val) => characterStore.updateCharacterInfo('class', val),
})

const frameType = computed({
    get: () => activeCharacter.value?.frameType ?? '泛用',
    set: (val) => characterStore.updateCharacterInfo('frameType', val),
})

const damageType = computed({
    get: () => activeCharacter.value?.damageType ?? '物理',
    set: (val) => characterStore.updateCharacterInfo('damageType', val),
})

const baseAttack = computed({
    get: () => activeCharacter.value?.baseAttack ?? 0,
    set: (val) => characterStore.updateCharacterInfo('baseAttack', val),
})

const critRate = computed({
    get: () => (activeCharacter.value?.critRate ?? 0) * 100,
    set: (val) => characterStore.updateCharacterInfo('critRate', val / 100),
})

const critDamage = computed({
    get: () => (activeCharacter.value?.critDamage ?? 0) * 100,
    set: (val) => characterStore.updateCharacterInfo('critDamage', val / 100),
})
const selectedConsciousnessIds = computed({
    get: () => activeCharacter.value?.recommendedConsciousness.map((c) => c.id) ?? [],
    set: (newIds) => {
        const newSelection = ALL_CONSCIOUSNESS.filter((c) => newIds.includes(c.id));
        characterStore.updateRecommendedConsciousness(newSelection);
    },
});
const formRules = ref<FormRules>({
    name: [
        { required: true, message: '角色名称不能为空', trigger: 'blur' },
        { max: 20, message: '名称长度不能超过20个字符', trigger: 'blur' },
    ],
    codename: [{ required: true, message: '角色型号不能为空', trigger: 'blur' }],
})

function handleUpdateSkill(
    index: number,
    field: keyof ISkill,
    value: ISkill[keyof ISkill]
) {
    characterStore.updateSkillField(index, field, value);
}

function handleRemoveSkill(index: number) {
    characterStore.removeSkill(index);
}

// 处理意识卡片点击事件的函数
function handleToggleConsciousness(id: number) {
    const currentIds = [...selectedConsciousnessIds.value];
    const index = currentIds.indexOf(id);
    if (index > -1) {
        currentIds.splice(index, 1);
    } else {
        currentIds.push(id);
    }
    selectedConsciousnessIds.value = currentIds;
}


async function handleReset() {
    try {
        await ElMessageBox.confirm(
            '确定要重置所有表单项吗？所有未保存的修改都将丢失。',
            '重置确认',
            {
                confirmButtonText: '确定重置',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
        characterStore.resetCharacterState()
        ElMessage({ type: 'success', message: '表单已重置' })
    } catch (error) {
        ElMessage({ type: 'info', message: '已取消重置' })
    }
}

async function handleValidate() {
    if (!editorFormRef.value) return
    await editorFormRef.value.validate((valid, fields) => {
        if (valid) {
            ElMessage({ type: 'success', message: '表单校验通过！' })
        } else {
            console.log('校验失败:', fields)
            ElMessage({ type: 'error', message: '表单存在错误项，请检查。' })
        }
    })
}

// 处理清空日志的函数
async function handleClearLog() {
    try {
        await ElMessageBox.confirm(
            '确定要清空所有操作日志吗？此操作不可撤销。',
            '清空确认',
            {
                confirmButtonText: '确定清空',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        characterStore.clearLog();
        ElMessage.success('操作日志已清空');
    } catch (error) {
        ElMessage.info('已取消操作');
    }
}

const activeTab = computed({
    get: () => characterStore.activeEditorTab,
    set: (val) => (characterStore.activeEditorTab = val),
});

// 一个专门用来设置 activeTab 的函数
const setActiveTab = (tabName: string) => {
    activeTab.value = tabName;
};

const damageCalculatorRef = ref<InstanceType<typeof DamageCalculator> | null>(null);

watch(activeTab, (newTab) => {
    if (newTab === '数据看板' && damageCalculatorRef.value) {
        nextTick(() => {
            damageCalculatorRef.value?.resizeChart();
        });
    }
});

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
    const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(rawFile.type);
    if (!isImage) {
        ElMessage.error('请上传图片格式文件 (JPG, PNG, GIF)!');
        return false;
    }
    const isLt5M = rawFile.size / 1024 / 1024 < 5;
    if (!isLt5M) {
        ElMessage.error('上传图片大小不能超过 5MB!');
        return false;
    }
    const reader = new FileReader();
    reader.readAsDataURL(rawFile);
    reader.onload = () => {
        const base64String = reader.result as string;
        characterStore.updateCharacterInfo('avatar', base64String);
        ElMessage.success('立绘更新成功!');
    };
    return false;
};

async function handleImportJson() {
    try {
        const characterData = await readJson<ICharacter>()
        if (characterData && characterData.name && characterData.id) {
            characterStore.importCharacter(characterData)
            ElMessage({ type: 'success', message: `角色'${characterData.name}'已成功导入为一个新角色!` })
        } else {
            ElMessage({ type: 'error', message: 'JSON文件格式不正确' })
        }
    } catch (error) {
        ElMessage({ type: 'error', message: `导入失败: ${error}` })
    }
}

async function handleDeleteCharacter() {
    if (!activeCharacter.value) return;
    const characterNameToDelete = activeCharacter.value.name;
    const characterIdToDelete = activeCharacter.value.id;
    try {
        await ElMessageBox.confirm(
            `此操作将永久删除角色 "${characterNameToDelete}"，请谨慎操作。`,
            '删除确认',
            {
                confirmButtonText: '确定删除',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );
        characterStore.deleteCharacter(characterIdToDelete);
        ElMessage({ type: 'success', message: `角色 "${characterNameToDelete}" 已删除` });
    } catch (error) {
        ElMessage({ type: 'info', message: '已取消删除' });
    }
}
// 将方法暴露给父组件
defineExpose({ scrollToSkill, setActiveTab });
</script>

<template>
    <div class="editor-form-container">
        <template v-if="activeCharacter">
            <el-tabs v-model="activeTab" type="border-card" class="editor-tabs">
                <el-tab-pane label="基础信息" name="基础信息">
                    <el-form ref="editorFormRef" :model="activeCharacter" :rules="formRules" label-width="100px">
                        <el-form-item label="角色名称" prop="name">
                            <el-input v-model="name" placeholder="请输入角色中文名" />
                        </el-form-item>
                        <el-form-item label="角色型号" prop="codename">
                            <el-input v-model="codename" placeholder="请输入角色型号/代号" />
                        </el-form-item>
                        <el-form-item label="初始品质">
                            <el-select v-model="quality" placeholder="请选择">
                                <el-option v-for="item in QUALITY_OPTIONS" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="职业定位">
                            <el-select v-model="charClass" placeholder="请选择">
                                <el-option v-for="item in CLASS_OPTIONS" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="机体框架">
                            <el-select v-model="frameType" placeholder="请选择">
                                <el-option v-for="item in FRAME_TYPE_OPTIONS" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="伤害类型">
                            <el-select v-model="damageType" placeholder="请选择">
                                <el-option v-for="item in DAMAGE_TYPE_OPTIONS" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>

                        <el-divider>战斗属性</el-divider>
                        <el-form-item label="基础攻击力">
                            <el-input-number v-model="baseAttack" :min="0" :step="100" controls-position="right"
                                style="width: 100%" />
                        </el-form-item>

                        <el-form-item label="暴击率 (%)">
                            <el-input-number v-model="critRate" :min="0" :max="100" :step="0.1"
                                controls-position="right" style="width: 100%" />
                        </el-form-item>

                        <el-form-item label="暴击伤害 (%)">
                            <el-input-number v-model="critDamage" :min="0" :step="10" controls-position="right"
                                style="width: 100%" />
                        </el-form-item>

                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="技能配置" name="技能配置">
                    <draggable :list="activeCharacter.skills" item-key="name" handle=".drag-handle" animation="300"
                        @update:list="activeCharacter.skills = $event" @end="handleDragEnd">
                        <template #item="{ element: skill, index }">
                            <div :ref="el => { if (el) skillFormItemsRef[index] = el as HTMLElement }">
                                <SkillFormItem :skill="skill" :index="index" @update:skill="handleUpdateSkill"
                                    @remove="handleRemoveSkill" />
                            </div>
                        </template>
                    </draggable>

                    <el-button type="primary" style="width: 100%;" plain @click="characterStore.addSkill">
                        添加新技能
                    </el-button>
                </el-tab-pane>
                <el-tab-pane label="意识搭配" name="意识搭配">
                    <div class="consciousness-selector">
                        <el-input v-model="consciousnessFilter" placeholder="输入关键词筛选意识..." class="filter-input"
                            :prefix-icon="Search" clearable />

                        <div class="consciousness-grid">
                            <ConsciousnessItem v-for="consciousness in filteredConsciousness" :key="consciousness.id"
                                :consciousness="consciousness"
                                :is-selected="selectedConsciousnessIds.includes(consciousness.id)"
                                @toggle-selection="handleToggleConsciousness" />
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="数据看板" name="数据看板" lazy>
                    <DamageCalculator ref="damageCalculatorRef" :character="activeCharacter" />
                </el-tab-pane>
                <el-tab-pane label="操作" name="操作">
                    <div class="action-panel">
                        <el-card header="文件操作">
                            <div class="action-buttons">
                                <div class="action-item">
                                    <el-button :icon="Upload" @click="handleImportJson">导入角色文件</el-button>
                                </div>
                                <div class="action-item">
                                    <el-button :icon="Download"
                                        @click="characterStore.exportActiveCharacter">导出当前角色</el-button>
                                </div>
                                <div class="action-item">
                                    <el-button :icon="Download"
                                        @click="characterStore.exportAllCharacters">导出全部角色</el-button>
                                </div>
                            </div>
                        </el-card>

                        <el-card header="常规操作" style="margin-top: 20px;">
                            <div class="action-buttons">
                                <div class="action-item">
                                    <el-button @click="handleValidate">校验表单</el-button>
                                </div>
                                <div class="action-item upload-item">
                                    <span class="action-label">角色立绘</span>
                                    <el-upload class="avatar-uploader" action="#" :show-file-list="false"
                                        :before-upload="beforeAvatarUpload">
                                        <el-image v-if="activeCharacter.avatar" :src="activeCharacter.avatar"
                                            class="avatar" fit="cover" />
                                        <el-icon v-else class="avatar-uploader-icon">
                                            <Plus />
                                        </el-icon>
                                    </el-upload>
                                </div>
                            </div>
                        </el-card>

                        <el-card header="元数据" style="margin-top: 20px;">
                            <el-descriptions :column="1" border>
                                <el-descriptions-item label="创建时间">
                                    {{ createdAtFormatted }}
                                </el-descriptions-item>
                                <el-descriptions-item label="最后更新">
                                    {{ updatedAtFormatted }}
                                </el-descriptions-item>
                            </el-descriptions>
                        </el-card>
                        <el-card style="margin-top: 20px;">
                            <template #header>
                                <div class="card-header-with-button">
                                    <span>操作日志</span>
                                    <el-button type="danger" :icon="Delete" text circle
                                        :disabled="!activeCharacter.log || activeCharacter.log.length <= 1"
                                        @click="handleClearLog">
                                    </el-button>
                                </div>
                            </template>
                            <div class="log-container">
                                <el-empty v-if="!activeCharacter.log || activeCharacter.log.length === 0"
                                    description="暂无日志记录" />
                                <ul v-else class="log-list">
                                    <li v-for="(entry, index) in activeCharacter.log" :key="index" class="log-item">
                                        {{ entry }}
                                    </li>
                                </ul>
                            </div>
                        </el-card>
                        <el-card class="danger-zone" style="margin-top: 20px;">
                            <template #header>
                                <div class="card-header">
                                    <span>危险区域</span>
                                </div>
                            </template>
                            <div class="action-buttons">
                                <div class="action-item">
                                    <el-button type="danger" plain @click="handleReset">重置表单</el-button>
                                </div>
                                <div class="action-item">
                                    <el-button type="danger" :icon="Delete"
                                        @click="handleDeleteCharacter">删除当前角色</el-button>
                                </div>
                            </div>
                        </el-card>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </template>
        <el-card v-else shadow="never" class="empty-state-card">
            <p>从左侧列表选择或新建一个角色，开始你的配置吧！</p>
        </el-card>
    </div>
</template>

<style scoped>
.consciousness-selector {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.filter-input {
    max-width: 400px;
}

.consciousness-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
}

.avatar-uploader .avatar {
    width: 128px;
    height: 128px;
    display: block;
}

.avatar-uploader :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader :deep(.el-upload:hover) {
    border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 128px;
    height: 128px;
    text-align: center;
}

.editor-form-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.editor-tabs {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    margin: -1px;
}


:deep(.el-tabs__header) {
    position: sticky;
    top: 0px;
    z-index: 1;
    background-color: var(--el-bg-color);
}

.empty-state-card {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.action-label {
    color: var(--el-text-color-regular);
    font-size: 14px;
    margin-bottom: 8px;
}

.action-panel {
    padding: 10px;
}

.action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

.action-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.upload-item {
    align-items: center;
}

.danger-zone {
    border-color: var(--el-color-danger);
}

.danger-zone :deep(.el-card__header) {
    color: var(--el-color-danger);
    font-weight: bold;
}

:deep(.is-highlighted) {
    border: 2px solid var(--el-color-primary);
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(var(--el-color-primary-rgb), 0.3);
    transition: all 0.3s ease-in-out;
}

.card-header-with-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>