<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { QUALITY_OPTIONS, CLASS_OPTIONS, FRAME_TYPE_OPTIONS, DAMAGE_TYPE_OPTIONS } from '@/constants/characterOptions'
import SkillFormItem from './SkillFormItem.vue';  // 1. 导入子组件
import type { ISkill } from '@/types/character';
import { storeToRefs } from 'pinia';
import { ALL_CONSCIOUSNESS } from '@/database/consciousnessData';
import { downloadJson } from '@/utils/fileDownloader';
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus';

const characterStore = useCharacterStore()

const { character } = storeToRefs(characterStore); //解构出 character state
// 3. 创建一个模板引用，用于获取 el-form 组件的实例
const editorFormRef = ref<FormInstance>();

// 关键：为每一个需要双向绑定的字段创建 computed 属性
// get() 从 store 中读取数据
// set() 调用 store 的 action 来更新数据
// 这确保了所有的状态变更都遵循我们设计的单向数据流，可追溯、可预测。

const name = computed({
    get: () => characterStore.character.name,
    set: (val) => characterStore.updateCharacterInfo('name', val),
})

const codename = computed({
    get: () => characterStore.character.codename,
    set: (val) => characterStore.updateCharacterInfo('codename', val),
})

const quality = computed({
    get: () => characterStore.character.quality,
    set: (val) => characterStore.updateCharacterInfo('quality', val),
})

const charClass = computed({
    get: () => characterStore.character.class,
    set: (val) => characterStore.updateCharacterInfo('class', val),
})

const frameType = computed({
    get: () => characterStore.character.frameType,
    set: (val) => characterStore.updateCharacterInfo('frameType', val),
})

const damageType = computed({
    get: () => characterStore.character.damageType,
    set: (val) => characterStore.updateCharacterInfo('damageType', val),
})

// 2. 为意识选择创建一个特殊的 computed 属性
// ElCheckboxGroup 的 v-model 通常绑定一个包含选中项 value 的数组（这里是意识的 id）
const selectedConsciousnessIds = computed({
    // getter：从 store state 的对象数组中，提取出 id 数组
    get: () => character.value.recommendedConsciousness.map((c) => c.id),
    // setter：当用户勾选时，会接收到一个新的 id 数组
    set: (newIds) => {
        // 根据新的 id 数组，从我们的“数据库”中筛选出完整的意识对象数组
        const newSelection = ALL_CONSCIOUSNESS.filter((c) => newIds.includes(c.id));
        // 调用 action 更新 state
        characterStore.updateRecommendedConsciousness(newSelection);
    },
});

// 4. 定义表单的校验规则
const formRules = ref<FormRules>({
    name: [
        { required: true, message: '角色名称不能为空', trigger: 'blur' },
        { max: 20, message: '名称长度不能超过20个字符', trigger: 'blur' },
    ],
    codename: [{ required: true, message: '角色型号不能为空', trigger: 'blur' }],
})
// 2. 定义处理子组件事件的方法，它们会调用 store 的 actions
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

// 2. 创建一个处理导出的方法
function handleExportJson() {
    // 从 store 中获取当前最新的、非响应式的角色数据
    const characterData = characterStore.character;
    // 创建一个动态的文件名
    const filename = `${characterData.name || '未命名角色'}.json`;
    // 调用工具函数进行下载
    downloadJson(characterData, filename);
    //新增：操作成功反馈
    ElMessage({ type: 'success', message: `角色'${filename}'已成功导出!` })
}

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
</script>

<template>
    <div class="editor-form">
        <!-- 角色基础信息 -->
        <el-card shadow="never">
            <template #header>
                <div class="card-header">
                    <span>角色基础信息</span>
                </div>
            </template>

            <el-form ref="editorFormRef" :model="character" :rules="formRules" label-width="100px">
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


        </el-card>
        <!-- 技能列表 -->
        <el-card shadow="never" style="margin-top: 20px;">
            <template #header>
                <div class="card-header">
                    <span>技能配置</span>
                </div>
            </template>

            <SkillFormItem v-for="(skill, index) in character.skills" :key="index" :skill="skill" :index="index"
                @update:skill="handleUpdateSkill" @remove="handleRemoveSkill" />

            <el-button type="primary" style="width: 100%;" plain @click="characterStore.addSkill">
                添加新技能
            </el-button>
        </el-card>
        <!-- 意识搭配 -->
        <el-card shadow="never" style="margin-top: 20px;">
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
        </el-card>

        <el-card shadow="never" style="margin-top: 20px;">
            <template #header>
                <div class="card-header">
                    <span>操作</span>
                </div>
            </template>
            <el-button type="success" @click="handleExportJson">
                生成 JSON 文件
            </el-button>
            <el-button @click="handleValidate">
                校验表单
            </el-button>
            <el-button type="danger" plain @click="handleReset">
                重置表单
            </el-button>
        </el-card>
    </div>
</template>

<style scoped>
.editor-form {
    padding: 20px;
}

/* 为多选框添加一些间距，让布局更好看 */
.el-checkbox.is-bordered {
    margin-bottom: 10px;
    margin-right: 10px;
}
</style>