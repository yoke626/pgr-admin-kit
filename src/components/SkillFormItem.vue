<script setup lang="ts">
import { computed } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus'
import type { ISkill } from '@/types/character';
import { DAMAGE_TAG_OPTIONS } from '@/constants/characterOptions';

// 接收来自父组件的 props
const props = defineProps<{
    skill: ISkill; // 当前技能的数据
    index: number; // 当前技能的索引
}>();

// 定义组件可以触发的事件
const emit = defineEmits<{
    (e: 'update:skill', index: number, field: keyof ISkill, value: ISkill[keyof ISkill]): void;
    (e: 'remove', index: number): void;
}>();

// 为每个字段创建 computed 属性，实现与父组件的双向数据同步
const name = computed({
    get: () => props.skill.name,
    set: (val) => emit('update:skill', props.index, 'name', val),
});

const type = computed({
    get: () => props.skill.type,
    set: (val) => emit('update:skill', props.index, 'type', val),
});

const description = computed({
    get: () => props.skill.description,
    set: (val) => emit('update:skill', props.index, 'description', val),
});

// 2. 为新字段创建 computed
const multiplier = computed({
    get: () => props.skill.multiplier,
    set: (val) => emit('update:skill', props.index, 'multiplier', val),
})
const damageTag = computed({
    get: () => props.skill.damageTag,
    set: (val) => emit('update:skill', props.index, 'damageTag', val),
})

// 删除按钮的点击事件处理器
async function handleRemove() {
    try {
        // 弹出确认框，并等待用户操作
        await ElMessageBox.confirm(
            '确定要删除这个技能吗？此操作不可撤销。', // 提示内容
            '删除确认', // 标题
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
        // 如果用户点击了“确定”，代码会继续执行到这里
        emit('remove', props.index)
        ElMessage({ type: 'success', message: '删除成功' })
    } catch (error) {
        // 如果用户点击了“取消”或关闭了弹窗，代码会进入 catch 块
        console.log(error) // 打印 'cancel'
        ElMessage({ type: 'info', message: '已取消删除' })
    }
}
</script>

<template>
    <div class="skill-form-item">
        <div class="drag-handle">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                <path fill="currentColor"
                    d="M160 256H96a32 32 0 0 1 0-64h64a32 32 0 0 1 0 64zm0 256H96a32 32 0 0 1 0-64h64a32 32 0 0 1 0 64zm0 256H96a32 32 0 0 1 0-64h64a32 32 0 0 1 0 64zm192-512h-64a32 32 0 0 1 0-64h64a32 32 0 0 1 0 64zm0 256h-64a32 32 0 0 1 0-64h64a32 32 0 0 1 0 64zm0 256h-64a32 32 0 0 1 0-64h64a32 32 0 0 1 0 64zm192-512h-64a32 32 0 0 1 0-64h64a32 32 0 0 1 0 64zm0 256h-64a32 32 0 0 1 0-64h64a32 32 0 0 1 0 64zm0 256h-64a32 32 0 0 1 0-64h64a32 32 0 0 1 0 64z">
                </path>
            </svg>
        </div>
        <el-form label-width="80px" label-position="top">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="技能名称">
                        <el-input v-model="name" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="技能类型">
                        <el-select v-model="type" style="width: 100%;">
                            <el-option label="普攻" value="normal" />
                            <el-option label="核心被动" value="passive" />
                            <el-option label="红球" value="red" />
                            <el-option label="黄球" value="yellow" />
                            <el-option label="蓝球" value="blue" />
                            <el-option label="终解" value="ultimate" />
                            <el-option label="QTE" value="qte" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="技能倍率 (%)">
                        <el-input-number v-model="multiplier" :min="0" :step="0.1" controls-position="right"
                            style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="伤害标签">
                        <el-select v-model="damageTag" style="width: 100%">
                            <el-option v-for="item in DAMAGE_TAG_OPTIONS" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="技能描述">
                <el-input v-model="description" type="textarea" :rows="3" />
            </el-form-item>
        </el-form>
        <el-button type="danger" plain @click="handleRemove">删除该技能</el-button>
        <el-divider />
    </div>
</template>

<style scoped>
.skill-form-item {
    margin-bottom: 20px;
    position: relative;
    padding-left: 30px;
}

.drag-handle {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    cursor: grab;
    color: var(--el-text-color-placeholder);
}

.drag-handle:active {
    cursor: grabbing;
}
</style>