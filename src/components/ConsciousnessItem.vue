// src/components/ConsciousnessItem.vue

<script setup lang="ts">
import type { IConsciousness } from '@/types/character';

defineProps<{
    consciousness: IConsciousness;
    isSelected: boolean;
}>();

defineEmits<{
    (e: 'toggle-selection', id: number): void;
}>();
</script>

<template>
    <div class="consciousness-card" :class="{ 'is-selected': isSelected }"
        @click="$emit('toggle-selection', consciousness.id)">
        <div class="card-content">
            <div class="consciousness-icon">
                <img :src="consciousness.icon || '/placeholder.png'" :alt="consciousness.name" />
            </div>
            <div class="consciousness-details">
                <h5 class="name">{{ consciousness.name }}</h5>
                <p class="description">{{ consciousness.description }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.consciousness-card {
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: var(--el-bg-color);
}

.consciousness-card:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 10px rgba(var(--el-color-primary-rgb), 0.2);
}

.consciousness-card.is-selected {
    border-color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
}

html.dark .consciousness-card.is-selected {
    background-color: rgba(64, 211, 227, 0.1);
}

.card-content {
    display: flex;
    align-items: flex-start;
    gap: 15px;
}

.consciousness-icon img {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    background-color: var(--el-fill-color);
}

.consciousness-details {
    flex-grow: 1;
}

.name {
    font-weight: bold;
    font-size: 16px;
    margin: 0 0 8px 0;
    color: var(--el-text-color-primary);
}

.description {
    font-size: 14px;
    color: var(--el-text-color-regular);
    white-space: pre-wrap;
    /* 保留换行符 */
    margin: 0;
}
</style>