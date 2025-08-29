<script setup lang="ts">
import { useCharacterStore } from '@/stores/characterStore'
import { storeToRefs } from 'pinia'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import draggable from 'vuedraggable'

const characterStore = useCharacterStore()
const { activeCharacter } = storeToRefs(characterStore)

// 在 <script setup> 顶部添加
const emit = defineEmits<{
    (e: 'scroll-to-skill', skillIndex: number): void
}>()


// 1. 创建模板引用来获取卡片DOM元素
const cardWrapper = ref<HTMLElement | null>(null);
const card = ref<HTMLElement | null>(null);

// 2. 定义响应式变量来存储卡片的旋转角度和光标位置
const rotateX = ref(0);
const rotateY = ref(0);
const glareX = ref(50);
const glareY = ref(50);

// 3. 处理鼠标移动事件
const handleMouseMove = (e: MouseEvent) => {
    if (!cardWrapper.value) return;

    // 获取 card 元素（而不是 wrapper）的边界
    const rect = cardWrapper.value.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    const centerX = width / 2;
    const centerY = height / 2;

    const deltaX = x - centerX;
    const deltaY = y - centerY;

    // 根据鼠标位置计算旋转角度，这里的 10 是灵敏度系数，可以调整
    rotateY.value = (deltaX / centerX) * 0.02;
    rotateX.value = -(deltaY / centerY) * 0.01;

    // 更新光标位置百分比
    glareX.value = (x / width) * 100;
    glareY.value = (y / height) * 100;
};

// 4. 处理鼠标移出事件，重置卡片状态
const handleMouseLeave = (e: MouseEvent) => {
    if (!cardWrapper.value) return;
    // 判断鼠标是否真的移出了整个容器
    if (!cardWrapper.value.contains(e.relatedTarget as Node)) {
        rotateX.value = 0;
        rotateY.value = 0;
    }
};

const handleDragEnd = (event: { oldIndex: number, newIndex: number }) => {
    // 只有当索引确实发生变化时，才执行操作
    if (event.oldIndex !== event.newIndex) {
        characterStore.reorderSkills();
    }
};

// 5. 在组件挂载和卸载时，添加/移除事件监听器
onMounted(() => {
    if (cardWrapper.value) {
        cardWrapper.value.addEventListener('mousemove', handleMouseMove);
        cardWrapper.value.addEventListener('mouseleave', handleMouseLeave);
    }
});

onUnmounted(() => {
    if (cardWrapper.value) {
        cardWrapper.value.removeEventListener('mousemove', handleMouseMove);
        cardWrapper.value.removeEventListener('mouseleave', handleMouseLeave);
    }
});

// 6. 将响应式变量转换为计算属性，用于绑定到 style
const cardStyle = computed(() => ({
    '--rotate-x': `${rotateX.value}deg`,
    '--rotate-y': `${rotateY.value}deg`,
    '--glare-x': `${glareX.value}%`,
    '--glare-y': `${glareY.value}%`,
}));

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
    <div ref="cardWrapper" class="preview-card-contatiner">
        <div class="card-3d-wrapper">
            <div ref="card" class="preview-card" :style="cardStyle">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>实时预览</span>
                        </div>
                    </template>
                    <div v-if="activeCharacter" class="card-body">
                        <el-image :src="activeCharacter.avatar || '/placeholder.png'" fit="cover"
                            class="character-avatar" />
                        <el-descriptions :title="activeCharacter.name || '待命名'" :column="1" border>
                            <el-descriptions-item label="型号">{{ activeCharacter.codename }}</el-descriptions-item>
                            <el-descriptions-item label="品质">{{ activeCharacter.quality }}</el-descriptions-item>
                            <el-descriptions-item label="职业">{{ activeCharacter.class }}</el-descriptions-item>
                            <el-descriptions-item label="机体框架">{{ activeCharacter.frameType }}</el-descriptions-item>
                            <el-descriptions-item label="伤害类型">{{ activeCharacter.damageType }}</el-descriptions-item>
                        </el-descriptions>

                        <el-divider>技能</el-divider>
                        <div v-if="activeCharacter.skills.length === 0" class="empty-skills">暂未配置技能</div>
                        <draggable v-else :list="activeCharacter.skills" item-key="name" animation="300"
                            @update:list="activeCharacter.skills = $event" @end="handleDragEnd">
                            <template #item="{ element: skill, index }">
                                <div class="skill-display-item" @click="emit('scroll-to-skill', index)">
                                    <div class="skill-header">
                                        <strong>{{ skill.name }}</strong>
                                        <el-tag size="small" :type="skillTagType(skill.type)">{{ skill.type }}</el-tag>
                                    </div>
                                    <p class="skill-description">{{ skill.description }}</p>
                                </div>
                            </template>
                        </draggable>


                        <el-divider>推荐意识</el-divider>
                        <div v-if="activeCharacter.recommendedConsciousness.length === 0" class="empty-skills">
                            暂未配置意识
                        </div>
                        <div v-else class="consciousness-tags">
                            <el-tag v-for="consciousness in activeCharacter.recommendedConsciousness"
                                :key="consciousness.id" class="consciousness-tag" effect="plain">
                                {{ consciousness.name }}
                            </el-tag>
                        </div>
                    </div>
                    <div v-else class="empty-preview">
                        <p>请在左侧新建或选择一个角色以开始编辑</p>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.preview-card-container {
    padding: 20px;
    /* 新增样式 */
    height: 100%;
    overflow-y: auto;
    /* 将滚动条控制权交给根容器 */
}

.card-3d-wrapper {
    perspective: 1000px; //创建3D视口
}

.preview-card {
    position: relative;
    // ▼▼▼ 新增：设置背景为透明，让伪元素背景可见 ▼▼▼
    background: transparent;
    // ▼▼▼ 新增：设置圆角，让描边效果更好看 ▼▼▼
    border-radius: 8px;
    // ▼▼▼ 新增：添加 transform-style ▼▼▼
    transform-style: preserve-3d;
    // ▼▼▼ 新增：应用3D旋转的CSS变量 ▼▼▼
    transform: rotateX(var(--rotate-x)) rotateY(var(--rotate-y));
    transition: transform 0.1s ease-out;

    // ▼▼▼ 新增：描边高光伪元素 ::before ▼▼▼
    &::before {
        content: '';
        position: absolute;
        inset: -2px; // 比卡片大一圈，形成边框
        z-index: 0; // 位于卡片之下
        border-radius: inherit; // 继承父元素的圆角
        // 使用锥形渐变创建彩色光环，并使用var()接收鼠标位置
        background: conic-gradient(from 180deg at var(--glare-x) var(--glare-y),
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.6) 10%,
                rgba(255, 255, 255, 0) 25%);
        filter: blur(5px); // 添加模糊效果，让光晕更柔和
        opacity: 0;
        transition: opacity 0.3s;
    }

    // 将3D变换和阴影应用到 el-card 组件上
    :deep(.el-card) {
        position: relative;
        z-index: 1;
        background-color: var(--el-card-bg-color, #ffffff); // 从CSS变量获取背景色
        border-radius: 6px; // 比父元素稍小的圆角
        transition: box-shadow 0.3s;
        height: 100%;

        .card-3d-wrapper:hover & {
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
        }
    }

    // 光影扫过效果的伪元素
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at var(--glare-x) var(--glare-y),
                rgba(255, 255, 255, 0.25),
                rgba(255, 255, 255, 0) 25%);
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
        border-radius: 4px;
        z-index: 2; // 确保光影在卡片内容之上
    }

    .card-3d-wrapper:hover &::before {
        opacity: 1;
    }

    .card-3d-wrapper:hover &::after {
        opacity: 0.3;
    }
}

.character-avatar {
    width: 100%;
    margin-bottom: 20px;
    background-color: var(--el-fill-color);
    min-height: 150px;
}

.skill-display-item {
    margin-bottom: 15px;
    cursor: pointer;
    /* 新增：鼠标指针变为手形 */
    border-radius: 4px;
    /* 新增：为高亮做准备 */
    padding: 10px;
    /* 新增：增加内边距 */
    transition: background-color 0.3s;
    /* 新增：平滑过渡 */
}

.skill-display-item:hover {
    background-color: var(--el-fill-color-light);
    /* 新增：悬浮效果 */
}

.skill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
}

.skill-description {
    font-size: 14px;
    color: var(--el-text-color-regular);
    white-space: pre-wrap;
}

.empty-skills,
.empty-preview {
    text-align: center;
    color: var(--el-text-color-secondary);
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