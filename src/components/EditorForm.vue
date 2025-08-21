<script setup lang="ts">
import DamageCalculator from './DamageCalculator.vue'
import { computed, ref, watch, nextTick } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { QUALITY_OPTIONS, CLASS_OPTIONS, FRAME_TYPE_OPTIONS, DAMAGE_TYPE_OPTIONS } from '@/constants/characterOptions'
import SkillFormItem from './SkillFormItem.vue';  // 1. 导入子组件
import type { ISkill } from '@/types/character';
import { storeToRefs } from 'pinia';
import { ALL_CONSCIOUSNESS } from '@/database/consciousnessData';
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus';

const characterStore = useCharacterStore()

// 使用 activeCharacter getter
const { activeCharacter } = storeToRefs(characterStore);
const editorFormRef = ref<FormInstance>();

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

// function handleExportJson() {
//     if (!activeCharacter.value) {
//         ElMessage({ type: 'warning', message: '当前没有可导出的角色' });
//         return;
//     }
//     const characterData = activeCharacter.value;
//     const filename = `${characterData.name || '未命名角色'}.json`;
//     downloadJson(characterData, filename);
//     ElMessage({ type: 'success', message: `角色'${filename}'已成功导出!` })
// }

// 新增：处理导入JSON
// async function handleImportJson() {
//     try {
//         const characterData = await readJson<ICharacter>();
//         // 你可以在这里添加更复杂的数据结构校验
//         if (characterData && characterData.name && characterData.id) {
//             characterStore.importCharacter(characterData);
//             ElMessage({ type: 'success', message: `角色'${characterData.name}'已成功导入!` });
//         } else {
//             ElMessage({ type: 'error', message: 'JSON文件格式不正确' });
//         }
//     } catch (error) {
//         ElMessage({ type: 'error', message: `导入失败: ${error}` });
//     }
// }

// ▼▼▼ 新增：重置表单的方法 ▼▼▼
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
        // 如果用户确认，则调用 store 中的 action
        characterStore.resetCharacterState()
        ElMessage({ type: 'success', message: '表单已重置' })
    } catch (error) {
        ElMessage({ type: 'info', message: '已取消重置' })
    }
}

// 5. 新增一个手动触发全表单校验的方法
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

// ▼▼▼ 核心修改：用 computed 属性替换 local ref ▼▼▼
const activeTab = computed({
    get: () => characterStore.activeEditorTab,
    set: (val) => (characterStore.activeEditorTab = val),
});

// 1. 创建一个 ref 来引用 DamageCalculator 组件实例
const damageCalculatorRef = ref<InstanceType<typeof DamageCalculator> | null>(null);

// 2. 创建一个 ref 来绑定 el-tabs 的 v-model，追踪当前激活的标签页
//const activeTab = ref('基础信息');

// 3. 监听 activeTab 的变化
watch(activeTab, (newTab) => {
    // 当新激活的标签页是'数据看板'，并且子组件已经加载时
    if (newTab === '数据看板' && damageCalculatorRef.value) {
        // 使用 nextTick 确保 DOM 已经完全可见
        nextTick(() => {
            // 调用子组件暴露出的 handleResize 方法
            damageCalculatorRef.value?.resizeChart();
        });
    }
});

</script>

<template>
    <div class="editor-form-container">
        <template v-if="activeCharacter">
            <el-tabs v-model="activeTab" type="border-card" class="editor-tabs">
                <el-tab-pane label="基础信息">
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
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="技能配置">
                    <SkillFormItem v-for="(skill, index) in activeCharacter.skills" :key="index" :skill="skill"
                        :index="index" @update:skill="handleUpdateSkill" @remove="handleRemoveSkill" />

                    <el-button type="primary" style="width: 100%;" plain @click="characterStore.addSkill">
                        添加新技能
                    </el-button>
                </el-tab-pane>
                <el-tab-pane label="意识搭配">
                    <el-checkbox-group v-model="selectedConsciousnessIds">
                        <el-checkbox v-for="consciousness in ALL_CONSCIOUSNESS" :key="consciousness.id"
                            :label="consciousness.id" border>
                            {{ consciousness.name }}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-tab-pane>
                <el-tab-pane label="数据看板" name="数据看板" lazy>
                    <DamageCalculator ref="damageCalculatorRef" :character="activeCharacter" />
                </el-tab-pane>
                <el-tab-pane label="操作">
                    <div class="action-buttons">
                        <el-button @click="handleValidate">
                            校验表单
                        </el-button>
                        <el-button type="danger" plain @click="handleReset">
                            重置表单
                        </el-button>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </template>
        <!-- 角色基础信息 -->
        <!-- <el-card shadow="never">
                <template #header>
                    <div class="card-header">
                        <span>角色基础信息</span>
                    </div>
                </template>

<el-form ref="editorFormRef" :model="activeCharacter" :rules="formRules" label-width="100px">
    <el-form-item label="角色名称" prop="name">
        <el-input v-model="name" placeholder="请输入角色中文名" />
    </el-form-item>
    <el-form-item label="角色型号" prop="codename">
        <el-input v-model="codename" placeholder="请输入角色型号/代号" />
    </el-form-item>
    <el-form-item label="初始品质">
        <el-select v-model="quality" placeholder="请选择">
            <el-option v-for="item in QUALITY_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
    </el-form-item>
    <el-form-item label="职业定位">
        <el-select v-model="charClass" placeholder="请选择">
            <el-option v-for="item in CLASS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
    </el-form-item>
    <el-form-item label="机体框架">
        <el-select v-model="frameType" placeholder="请选择">
            <el-option v-for="item in FRAME_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
    </el-form-item>
    <el-form-item label="伤害类型">
        <el-select v-model="damageType" placeholder="请选择">
            <el-option v-for="item in DAMAGE_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
    </el-form-item>
</el-form>
</el-card> -->
        <!-- 技能列表 -->
        <!-- <el-card shadow="never" style="margin-top: 20px;">
                <template #header>
                    <div class="card-header">
                        <span>技能配置</span>
                    </div>
                </template>

                <SkillFormItem v-for="(skill, index) in activeCharacter.skills" :key="index" :skill="skill"
                    :index="index" @update:skill="handleUpdateSkill" @remove="handleRemoveSkill" />

                <el-button type="primary" style="width: 100%;" plain @click="characterStore.addSkill">
                    添加新技能
                </el-button>
            </el-card> -->
        <!-- 意识搭配 -->
        <!-- <el-card shadow="never" style="margin-top: 20px;">
                <template #header>
                    <div class="card-header">
                        <span>推荐意识搭配</span>
                    </div>
                </template>
                <el-checkbox-group v-model="selectedConsciousnessIds">
                    <el-checkbox v-for="consciousness in ALL_CONSCIOUSNESS" :key="consciousness.id"
                        :label="consciousness.id" border>
                        {{ consciousness.name }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-card> -->
        <!--操作-->
        <!-- <el-card shadow="never" style="margin-top: 20px;">
                <template #header>
                    <div class="card-header">
                        <span>操作</span>
                    </div>
                </template>
                <el-button type="success" @click="handleExportJson">
                    导出 JSON 文件
                </el-button>
                <el-button type="primary" plain @click="handleImportJson">
                    导入 JSON 文件
                </el-button>
                <el-button @click="handleValidate">
                    校验表单
                </el-button>
                <el-button type="danger" plain @click="handleReset">
                    重置表单
                </el-button>
            </el-card> -->
        <!-- </template> -->
        <!-- <el-card v-else shadow="never" class="empty-state-card">
            <p>当前没有正在编辑的角色。</p>
            <el-button type="primary" @click="characterStore.addCharacter">新建一个角色</el-button>
        </el-card> -->
        <el-card v-else shadow="never" class="empty-state-card">
            <p>从左侧列表选择或新建一个角色，开始你的配置吧！</p>
        </el-card>
    </div>
</template>

<style scoped>
.editor-form-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

/* :deep(.el-tabs--border-card) {
    background-color: var(--pgr-bg);
    border: 1px solid var(--pgr-border-color);
} */

.editor-tabs {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

/* :deep(.el-tabs__content) {
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: var(--pgr-bg-light);
}

:deep(.el-tabs__header) {
    background-color: var(--pgr-bg-lighter);
    border-bottom: 1px solid var(--pgr-border-color);
}

:deep(.eltabs__items.is-active) {
    color: var(--pgr-primary-color);
}

:deep(.el-tabs__item) {
    color: var(--pgr-text-regular);
} */

.empty-state-card {
    margin: 20px;
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    /* color: var(--pgr-text-regular);
    background-color: var(--pgr-bg);
    border: 1px solid var(--pgr-border-color); */
}

.action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    padding: 20px;
}

/* 为多选框添加一些间距，让布局更好看 */
.el-checkbox.is-bordered {
    margin-bottom: 10px;
    margin-right: 10px;
}
</style>