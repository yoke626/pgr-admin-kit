<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'
import { QUALITY_OPTIONS, CLASS_OPTIONS, FRAME_TYPE_OPTIONS, DAMAGE_TYPE_OPTIONS } from '@/constants/characterOptions'

const characterStore = useCharacterStore()

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
</script>

<template>
    <div class="editor-form">
        <el-card shadow="never">
            <template #header>
                <div class="card-header">
                    <span>角色基础信息</span>
                </div>
            </template>

            <el-form :model="characterStore.character" label-width="100px">
                <el-form-item label="角色名称">
                    <el-input v-model="name" placeholder="请输入角色中文名" />
                </el-form-item>
                <el-form-item label="角色型号">
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
    </div>
</template>

<style scoped>
.editor-form {
    padding: 20px;
}
</style>