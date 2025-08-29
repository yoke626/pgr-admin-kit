<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import loginBg from '@/assets/login-bg.png'

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
    <div class="auth-container" :style="{ backgroundImage: `url(${loginBg})` }">
        <div class="auth-panel">
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

        <div class="brand-slogan">
            <p>"愿每一位重返地球的构造体，</p>
            <p>都能被这个世界温柔以待。"</p>
        </div>
    </div>
</template>

<style scoped>
.auth-container {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    height: 100vh;
    padding: 60px 10%;

    /* 核心：确保图片等比缩放并覆盖全屏 */
    background-size: cover;
    background-position: center center;
}

/* ▼▼▼ 新增：Slogan 样式 ▼▼▼ */
.brand-slogan {
    position: absolute;
    bottom: 60px;
    left: 66px;
    color: #fff;
    font-style: italic;
    font-size: 24px;
    text-shadow: 0 0 15px rgba(0, 0, 0, 0.7);
}

.brand-slogan p {
    margin: 0;
    line-height: 1.5;
    /* 文字渐变效果 */
    background: linear-gradient(to right, #ffffff, #a7a7a7);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
}

.auth-panel {
    width: 420px;
    padding: 30px;
    border-radius: 12px;
    /* 核心：毛玻璃效果 */
    background-color: rgba(36, 41, 51, 0.6);
    /* 半透明背景 */
    backdrop-filter: blur(10px);
    /* 背景模糊 */
    border: 1px solid rgba(255, 255, 255, 0.1);
    /* 模拟高光边框 */
}

/* 移除卡片的背景和边框，使其融入面板 */
.auth-card {
    background-color: transparent;
    border: none;
    box-shadow: none;
}

/* 调整 Element Plus 组件在暗色背景下的样式 */
:deep(.el-card__header),
:deep(.el-form-item__label) {
    color: var(--el-text-color-primary);
    /* 使用亮色文字 */
}

:deep(.el-card__header) {
    font-size: 20px;
    font-weight: bold;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--el-text-color-primary);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.986);
}

.auth-footer {
    margin-top: 20px;
    text-align: center;
}
</style>