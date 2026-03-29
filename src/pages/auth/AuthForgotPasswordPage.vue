<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuth } from "@/composables/auth/useAuth";
import { KeyRound, Mail } from "lucide-vue-next";

const { forgotPassword } = useAuth();

const email = ref("");
const errorMessage = ref("");
const successMessage = ref("");

const isLoading = computed(() => forgotPassword.isPending.value);
const isFormValid = computed(() => email.value.trim() !== "");

const handleSubmit = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const result = await forgotPassword.mutateAsync({ email: email.value.trim() });
    successMessage.value = result.message ?? "如果该邮箱已注册，您将收到重置密码邮件";
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
    errorMessage.value =
      axiosError.response?.data?.error?.message ?? "发送失败，请稍后重试";
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-icon">
          <KeyRound :size="24" />
        </div>
        <h1 class="auth-title">找回密码</h1>
        <p class="auth-subtitle">输入注册邮箱，我们将发送重置链接</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="errorMessage" class="auth-error">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="auth-success">
          {{ successMessage }}
        </div>

        <div class="form-group">
          <label for="forgot-email" class="form-label">邮箱</label>
          <div class="input-wrapper">
            <Mail :size="16" class="input-icon" />
            <input
              id="forgot-email"
              v-model="email"
              type="email"
              placeholder="name@example.com"
              autocomplete="email"
              class="form-input"
            />
          </div>
        </div>

        <button
          type="submit"
          class="auth-submit"
          :disabled="!isFormValid || isLoading"
        >
          {{ isLoading ? "发送中…" : "发送重置链接" }}
        </button>
      </form>

      <div class="auth-footer">
        <router-link to="/auth/sign-in" class="auth-link">
          返回登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-0);
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-2);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 32px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--warning-soft-bg);
  color: var(--warning-primary);
  margin-bottom: 16px;
}

.auth-title {
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.auth-subtitle {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-error {
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--danger-soft-bg);
  color: var(--danger-primary);
  font-size: 13px;
  font-family: var(--font-sans);
  border: 1px solid rgba(255, 68, 58, 0.2);
}

.auth-success {
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--success-soft-bg);
  color: var(--success-primary);
  font-size: 13px;
  font-family: var(--font-sans);
  border: 1px solid rgba(48, 209, 88, 0.2);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--text-tertiary);
  pointer-events: none;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px 0 36px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--bg-3);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input::placeholder {
  color: var(--text-disabled);
}

.form-input:focus {
  border-color: var(--border-focus);
}

.auth-link {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--accent-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.auth-link:hover {
  color: var(--accent-hover);
}

.auth-submit {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: var(--accent-primary);
  color: #fff;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}

.auth-submit:hover:not(:disabled) {
  background: var(--accent-hover);
}

.auth-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-subtle);
}
</style>
