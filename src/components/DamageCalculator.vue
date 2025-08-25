<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import * as echarts from 'echarts';
import type { ICharacter, ICharacterSnapshot } from '@/types/character';
import { useThemeStore } from '@/stores/themeStore';
import { useCharacterStore } from '@/stores/characterStore';
import { storeToRefs } from 'pinia';
import { calculateDamage } from '@/utils/damageCalculator';
import { ElMessage, ElMessageBox } from 'element-plus';
import { CameraFilled, Delete } from '@element-plus/icons-vue'

const props = defineProps<{
    character: ICharacter | null
}>();

const characterStore = useCharacterStore();
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

const chartContainer = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// --- 快照对比相关 ---
const selectedSnapshots = ref<string[]>([]);
const comparedSnapshots = computed<ICharacterSnapshot[]>(() => {
    if (!props.character) return [];
    const sortedSnapshots = [...props.character.snapshots].sort((a, b) => b.createdAt - a.createdAt);
    return sortedSnapshots.filter(s => selectedSnapshots.value.includes(s.id));
});

interface ComparisonRow {
    item: string;
    [key: string]: string | number;
}
interface TableColumn {
    property: string;
}

const comparisonTableData = computed(() => {
    if (comparedSnapshots.value.length < 2) return [];
    const data: ComparisonRow[] = [];
    const snapshots = comparedSnapshots.value;
    data.push({ item: '基础攻击力', ...Object.fromEntries(snapshots.map(s => [s.id, s.coreStats.baseAttack])) });
    data.push({ item: '暴击率', ...Object.fromEntries(snapshots.map(s => [`${s.id}`, `${(s.coreStats.critRate * 100).toFixed(1)}%`])) });
    data.push({ item: '暴击伤害', ...Object.fromEntries(snapshots.map(s => [`${s.id}`, `${(s.coreStats.critDamage * 100).toFixed(1)}%`])) });
    data.push({ item: '总期望伤害', ...Object.fromEntries(snapshots.map(s => [s.id, s.damageResult.totalDamage])) });
    const allSkillNames = new Set<string>();
    snapshots.forEach(s => s.damageResult.skills.forEach(skill => allSkillNames.add(skill.name)));
    allSkillNames.forEach(skillName => {
        const row: ComparisonRow = { item: `技能 - ${skillName}` };
        snapshots.forEach(s => {
            const skill = s.damageResult.skills.find(sk => sk.name === skillName);
            row[s.id] = skill ? skill.damage : 'N/A';
        });
        data.push(row);
    });
    return data;
});

const handleTakeSnapshot = () => {
    characterStore.takeSnapshot();
    ElMessage.success('快照已生成！');
};

// FIX 2: 允许在输入时删空内容
const handleUpdateSnapshotName = (snapshotId: string, newName: string) => {
    characterStore.updateSnapshotName(snapshotId, newName);
};

const handleInputBlur = (snapshotId: string, currentName: string) => {
    if (!currentName || !currentName.trim()) {
        ElMessage.warning('快照名称不能为空，已重置为默认名称');
        const defaultName = `快照 @ ${new Date().toLocaleString()}`;
        characterStore.updateSnapshotName(snapshotId, defaultName);
    }
};

const handleDeleteSnapshot = async (snapshot: ICharacterSnapshot) => {
    try {
        await ElMessageBox.confirm(`确定要删除快照 "${snapshot.name}" 吗？`, '删除确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        });
        characterStore.deleteSnapshot(snapshot.id);
        ElMessage.success('快照已删除');
    } catch {
        ElMessage.info('已取消删除');
    }
};

const getCellClass = ({ row, column }: { row: ComparisonRow, column: TableColumn }) => {
    if (column.property === 'item' || comparedSnapshots.value.length < 2) return '';
    const values = comparedSnapshots.value.map(s => row[s.id]).filter(v => typeof v === 'number') as number[];
    if (values.length < 2) return '';
    const maxVal = Math.max(...values);
    if (row[column.property] === maxVal) {
        return 'is-best';
    }
    return '';
};

const renderChart = () => {
    if (chartContainer.value) {
        if (chartInstance) {
            chartInstance.dispose();
        }
        const theme = isDark.value ? 'dark' : 'light';
        chartInstance = echarts.init(chartContainer.value, theme);
        const damageResult = calculateDamage(props.character);
        if (damageResult.skills.length > 0) {
            const damageData = damageResult.skills.map(skill => ({
                name: skill.name,
                value: skill.damage,
            }));
            const option = {
                backgroundColor: 'transparent',
                title: { text: `${props.character!.name} - 技能期望伤害`, left: 'center', top: '20', textStyle: { color: isDark.value ? '#d8dee9' : '#303133' } },
                tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
                series: [{ name: '期望伤害', type: 'pie', radius: '55%', center: ['50%', '60%'], data: damageData }]
            };
            chartInstance.setOption(option, true);
        } else {
            chartInstance.setOption({
                backgroundColor: 'transparent',
                title: { text: '请先为角色配置技能以生成数据看板', left: 'center', top: 'center', textStyle: { color: isDark.value ? '#818c9f' : '#909399' } }
            }, true);
        }
    }
};

// FIX 3: 优化 watch，仅监听与图表相关的属性
watch(
    () => {
        if (!props.character) return [isDark.value];
        // 返回一个包含所有图表依赖项的数组
        return [
            props.character.baseAttack,
            props.character.critRate,
            props.character.critDamage,
            props.character.skills,
            isDark.value
        ];
    },
    async () => {
        await nextTick();
        renderChart();
    },
    {
        deep: true, // deep 仍然需要，用于监听 skills 数组内部的变化
        immediate: true
    }
);

const resizeChart = () => chartInstance?.resize();
defineExpose({ resizeChart });
onMounted(() => window.addEventListener('resize', resizeChart));
onUnmounted(() => window.removeEventListener('resize', resizeChart));
</script>

<template>
    <div class="damage-calculator-container">
        <div ref="chartContainer" class="chart-container"></div>

        <el-divider>
            <span class="divider-text">配置快照管理</span>
        </el-divider>

        <div class="snapshot-controls">
            <el-button type="primary" @click="handleTakeSnapshot">
                <el-icon>
                    <CameraFilled />
                </el-icon>
                <span>拍摄当前配置快照</span>
            </el-button>
        </div>

        <div class="snapshot-list">
            <el-empty v-if="!character || character.snapshots.length === 0" description="暂无快照，点击上方按钮创建第一个吧" />
            <el-checkbox-group v-else v-model="selectedSnapshots">
                <div v-for="snapshot in [...character.snapshots].sort((a, b) => b.createdAt - a.createdAt)"
                    :key="snapshot.id" class="snapshot-item">
                    <el-checkbox :label="snapshot.id" size="large"></el-checkbox>
                    <el-input :model-value="snapshot.name" class="snapshot-name-input" placeholder="请输入快照名称"
                        @input="handleUpdateSnapshotName(snapshot.id, $event as string)"
                        @blur="handleInputBlur(snapshot.id, snapshot.name)" />
                    <span class="snapshot-timestamp">{{ new Date(snapshot.createdAt).toLocaleString() }}</span>
                    <el-button type="danger" circle plain @click="handleDeleteSnapshot(snapshot)">
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </el-button>
                </div>
            </el-checkbox-group>
        </div>

        <div v-if="selectedSnapshots.length === 1" class="comparison-hint">
            <el-text type="info">请再选择至少一个快照以进行对比</el-text>
        </div>

        <template v-if="comparedSnapshots.length >= 2">
            <el-divider>
                <span class="divider-text">快照对比</span>
            </el-divider>
            <el-table :data="comparisonTableData" border style="width: 100%" :cell-class-name="getCellClass">
                <el-table-column prop="item" label="对比项" width="180" fixed />
                <el-table-column v-for="snapshot in comparedSnapshots" :key="snapshot.id" :prop="snapshot.id"
                    :label="snapshot.name" />
            </el-table>
        </template>
    </div>
</template>

<style scoped>
/* FIX 1: 添加 :deep() 样式来隐藏 checkbox 的 label 文本 */
.snapshot-item :deep(.el-checkbox__label) {
    display: none;
}

.damage-calculator-container {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
}

.chart-container {
    width: 100%;
    height: 400px;
    margin-bottom: 20px;
}

.divider-text {
    font-size: 16px;
    color: var(--el-text-color-secondary);
}

.snapshot-controls {
    text-align: center;
    margin: 20px 0;
}

.snapshot-list {
    margin-top: 20px;
}

.snapshot-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    gap: 15px;
}

.snapshot-name-input {
    flex-grow: 1;
}

.snapshot-timestamp {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
}

.comparison-hint {
    text-align: center;
    margin: 20px 0;
}

:deep(.el-table .is-best) {
    background-color: var(--el-color-success-light-8) !important;
    color: var(--el-color-success-dark-2);
    font-weight: bold;
}
</style>