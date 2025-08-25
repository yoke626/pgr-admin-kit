<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const loginFormRef = ref<FormInstance>()
const loginForm = ref({
    email: '',
    password: '',
})
const isLoading = ref(false)

const rules = ref<FormRules>({
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})

const handleLogin = async () => {
    if (!loginFormRef.value) return
    await loginFormRef.value.validate(async (valid) => {
        if (valid) {
            isLoading.value = true
            try {
                await authStore.signIn(loginForm.value.email, loginForm.value.password)
                ElMessage.success('登录成功！')
                router.push({ name: 'editor' })
            } catch (error: unknown) {
                if (error instanceof Error) {
                    ElMessage.error(`登录失败: ${error.message}`)
                } else {
                    ElMessage.error('登录失败: 未知错误')
                }
            } finally {
                isLoading.value = false
            }
        }
    })
}

const goToRegister = () => {
    router.push({ name: 'register' })
}
</script>

<template>
    <div class="auth-container">
        <el-card class="auth-card" header="登录 PGR-Admin-Kit">
            <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-position="top"
                @submit.prevent="handleLogin">
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="loginForm.email" placeholder="请输入您的邮箱" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="loginForm.password" type="password" placeholder="请输入您的密码" show-password />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading="isLoading" native-type="submit" style="width: 100%;">
                        登录
                    </el-button>
                </el-form-item>
            </el-form>
            <div class="auth-footer">
                <el-text size="small">
                    还没有账户？
                    <el-link type="primary" @click="goToRegister">立即注册</el-link>
                </el-text>
            </div>
        </el-card>
    </div>
</template>

<style scoped>
.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: var(--el-bg-color-page);
}

.auth-card {
    width: 400px;
}

.auth-footer {
    margin-top: 20px;
    text-align: center;
}
</style>