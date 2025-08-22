<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import type { ICharacter } from '@/types/character';
import { useThemeStore } from '@/stores/themeStore';
import { storeToRefs } from 'pinia';

const props = defineProps<{
    character: ICharacter | null
}>();

// 获取主题 store 实例和响应式的 isDark 状态
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

const chartContainer = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

/**
 * 创建一个独立的渲染函数，使其可以被重复调用。
 * 这个函数现在会根据全局的 isDark 状态来决定使用哪种 ECharts 主题。
 */
const renderChart = () => {
    if (chartContainer.value) {
        // 销毁旧的图表实例，这是切换主题所必需的
        if (chartInstance) {
            chartInstance.dispose();
        }

        // 根据 isDark (true/false) 的值，动态决定 ECharts 的主题 ('dark'/'light')
        const theme = isDark.value ? 'dark' : 'light';
        chartInstance = echarts.init(chartContainer.value, theme);

        // 根据数据更新图表内容
        // ▼▼▼ 核心逻辑修改 ▼▼▼
        if (props.character && props.character.skills.length > 0) {

            // 从 character prop 中获取基础战斗属性
            const { baseAttack, critRate, critDamage, skills } = props.character;

            // 根据新公式计算每个技能的期望伤害
            const damageData = skills.map(skill => {
                // 期望伤害 = 基础攻击力 * 技能倍率 * (1 + 暴击率 * 暴击伤害)
                const expectedDamage = baseAttack * skill.multiplier * (1 + critRate * critDamage);

                return {
                    name: skill.name || '未命名技能',
                    value: Math.round(expectedDamage), // 对结果取整
                };
            });

            const option = {
                // 设置透明背景，使其能融入应用主题
                backgroundColor: 'transparent',
                title: {
                    text: `${props.character.name} - 技能期望伤害`,
                    left: 'center',
                    top: '20',
                    // 动态设置标题颜色以适应不同主题
                    textStyle: {
                        color: isDark.value ? '#d8dee9' : '#303133'
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    top: 'middle',
                    // 动态设置图例颜色以适应不同主题
                    textStyle: {
                        color: isDark.value ? '#b8c1d2' : '#606266'
                    }
                },
                series: [
                    {
                        name: '期望伤害',
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '60%'],
                        data: damageData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
            chartInstance.setOption(option, true);
        } else {
            // 空状态下也应用透明背景和动态文字颜色
            chartInstance.setOption({
                backgroundColor: 'transparent',
                title: {
                    text: '请先为角色配置技能以生成数据看板',
                    left: 'center',
                    top: 'center',
                    textStyle: {
                        color: isDark.value ? '#818c9f' : '#909399',
                        fontSize: 14,
                        fontWeight: 'normal'
                    }
                }
            }, true);
        }
    }
};

/**
 * 核心修改：
 * 使用 watch 同时监听角色数据和主题状态的变化。
 * 任何一个发生改变，都会重新渲染图表。
 */
watch(
    [() => props.character, isDark],
    async () => {
        await nextTick(); // 等待DOM更新
        renderChart();     // 调用我们封装的渲染函数
    },
    {
        deep: true,      // 深度监听角色对象内部的变化
        immediate: true  // 组件加载后立即执行一次
    }
);

const resizeChart = () => {
    chartInstance?.resize();
};

defineExpose({
    resizeChart
})

onMounted(() => {
    window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
    window.removeEventListener('resize', resizeChart);
    if (chartInstance) {
        chartInstance.dispose();
    }
});
</script>

<template>
    <div class="damage-calculator">
        <div ref="chartContainer" class="chart-container"></div>
    </div>
</template>

<style scoped>
.damage-calculator {
    padding: 20px;
}

.chart-container {
    width: 100%;
    height: 450px;
}
</style>