<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/auth/useAuth";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-vue-next";

const router = useRouter();
const { signIn } = useAuth();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");

const isLoading = computed(() => signIn.isPending.value);
const isFormValid = computed(() => email.value.trim() !== "" && password.value !== "");

const handleSubmit = async () => {
  errorMessage.value = "";
  try {
    await signIn.mutateAsync({ email: email.value.trim(), password: password.value });
    router.push("/");
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
    errorMessage.value =
      axiosError.response?.data?.error?.message ?? "登录失败，请稍后重试";
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-icon">
          <LogIn :size="24" />
        </div>
        <h1 class="auth-title">
          登录 FundStation
        </h1>
        <p class="auth-subtitle">
          使用邮箱和密码登录您的账号
        </p>
      </div>

      <form
        class="auth-form"
        @submit.prevent="handleSubmit"
      >
        <div
          v-if="errorMessage"
          class="auth-error"
        >
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label
            for="sign-in-email"
            class="form-label"
          >邮箱</label>
          <div class="input-wrapper">
            <Mail
              :size="16"
              class="input-icon"
            />
            <input
              id="sign-in-email"
              v-model="email"
              type="email"
              placeholder="name@example.com"
              autocomplete="email"
              class="form-input"
            >
          </div>
        </div>

        <div class="form-group">
          <label
            for="sign-in-password"
            class="form-label"
          >密码</label>
          <div class="input-wrapper">
            <Lock
              :size="16"
              class="input-icon"
            />
            <input
              id="sign-in-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="输入密码"
              autocomplete="current-password"
              class="form-input"
            >
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              <Eye
                v-if="!showPassword"
                :size="16"
              />
              <EyeOff
                v-else
                :size="16"
              />
            </button>
          </div>
        </div>

        <div class="form-actions-secondary">
          <router-link
            to="/auth/forgot-password"
            class="auth-link"
          >
            忘记密码？
          </router-link>
        </div>

        <button
          type="submit"
          class="auth-submit"
          :disabled="!isFormValid || isLoading"
        >
          {{ isLoading ? "登录中…" : "登录" }}
        </button>
      </form>

      <div class="auth-footer">
        <span class="auth-footer-text">还没有账号？</span>
        <router-link
          to="/auth/sign-up"
          class="auth-link"
        >
          注册
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
  background: var(--accent-soft-bg);
  color: var(--accent-primary);
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

.password-toggle {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: var(--text-secondary);
}

.form-actions-secondary {
  display: flex;
  justify-content: flex-end;
  margin-top: -8px;
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

.auth-submit:active:not(:disabled) {
  background: var(--accent-active);
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

.auth-footer-text {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-tertiary);
  margin-right: 4px;
}
</style>
