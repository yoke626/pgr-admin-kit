<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const registerFormRef = ref<FormInstance>()
const registerForm = ref({
    email: '',
    password: '',
    confirmPassword: '',
})
const isLoading = ref(false)

const validatePass = (_rule: unknown, value: unknown, callback: (error?: Error) => void) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== registerForm.value.password) {
        callback(new Error("两次输入的密码不一致!"))
    } else {
        callback()
    }
}

const rules = ref<FormRules>({
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' },
    ],
    confirmPassword: [
        { required: true, validator: validatePass, trigger: 'blur' }
    ],
})

const handleRegister = async () => {
    if (!registerFormRef.value) return
    await registerFormRef.value.validate(async (valid) => {
        if (valid) {
            isLoading.value = true
            try {
                await authStore.signUp(registerForm.value.email, registerForm.value.password)
                ElMessageBox.alert('注册成功！一封确认邮件已发送至您的邮箱，请点击邮件中的链接以完成验证。', '提示', {
                    confirmButtonText: '好的',
                    callback: () => {
                        router.push({ name: 'login' })
                    },
                })
            } catch (error: unknown) {
                if (error instanceof Error) {
                    ElMessage.error(`注册失败: ${error.message}`)
                } else {
                    ElMessage.error('注册失败: 未知错误')
                }
            } finally {
                isLoading.value = false
            }
        }
    })
}

const goToLogin = () => {
    router.push({ name: 'login' })
}
</script>

<template>
    <div class="auth-container">
        <el-card class="auth-card" header="注册新账户">
            <el-form ref="registerFormRef" :model="registerForm" :rules="rules" label-position="top"
                @submit.prevent="handleRegister">
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="registerForm.email" placeholder="请输入您的邮箱" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="registerForm.password" type="password" placeholder="请输入密码（至少6位）" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码"
                        show-password />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :loading="isLoading" native-type="submit" style="width: 100%;">
                        注册
                    </el-button>
                </el-form-item>
            </el-form>
            <div class="auth-footer">
                <el-text size="small">
                    已有账户？
                    <el-link type="primary" @click="goToLogin">立即登录</el-link>
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