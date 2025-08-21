<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'; // 引入 nextTick
import * as echarts from 'echarts';
import type { ICharacter } from '@/types/character';

const props = defineProps<{
    character: ICharacter | null
}>();

const chartContainer = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// **核心修复**：
// 我们现在只使用一个 watch 来驱动所有逻辑。
// 它侦听 character 数据的变化。
watch(() => props.character, async (newCharacter) => {
    // 1. 使用 nextTick 确保 DOM 更新完毕
    // 这会等待 Vue 将所有 v-if/v-show 的变更应用到真实 DOM 上
    await nextTick();

    if (chartContainer.value) {
        // 2. "懒汉式"初始化
        // 只有当图表实例不存在时，才进行创建。
        // 这确保了 echarts.init() 只在容器真实可见时执行一次。
        if (!chartInstance) {
            chartInstance = echarts.init(chartContainer.value);
        }

        // 3. 根据数据更新图表内容
        if (newCharacter && newCharacter.skills.length > 0) {
            const damageData = newCharacter.skills.map(skill => ({
                name: skill.name || '未命名技能',
                value: skill.description.length * 50 + Math.floor(Math.random() * 500) + 200,
            }));

            const option = {
                // ... ECharts 配置 ...
                title: {
                    text: `${newCharacter.name} - 技能伤害构成`,
                    left: 'center',
                    top: '20'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    top: 'middle'
                },
                series: [
                    {
                        name: '伤害来源',
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
            chartInstance.setOption(option, true); // 使用 true 清除旧画布
        } else {
            // 4. 如果没有数据，同样使用 API 清空并显示提示
            chartInstance.clear();
            chartInstance.setOption({
                title: {
                    text: '请先为角色配置技能以生成数据看板',
                    left: 'center',
                    top: 'center',
                    textStyle: {
                        color: '#909399',
                        fontSize: 14,
                        fontWeight: 'normal'
                    }
                }
            });
        }
    }
}, { deep: true, immediate: true }); // immediate: true 确保组件加载后立刻执行一次 watch

const resizeChart = () => {
    chartInstance?.resize();
};

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