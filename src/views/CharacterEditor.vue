<script setup lang="ts">
import EditorForm from '@/components/EditorForm.vue'
import PreviewCard from '@/components/PreviewCard.vue'
</script>

<template>
    <div class="character-editor-page">
        <el-row :gutter="20">
            <el-col :span="14">
                <EditorForm />
            </el-col>
            <el-col :span="10">
                <PreviewCard />
            </el-col>
        </el-row>
    </div>
</template>

<style scoped>
/* 可以为页面添加一些内边距 */
.character-editor-page {
    padding: 0 20px;
}
</style>