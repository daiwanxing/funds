<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/auth/useAuth";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-vue-next";

const router = useRouter();
const { resetPassword } = useAuth();

const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Recovery tokens from URL hash (Supabase puts them there)
const accessToken = ref("");
const refreshToken = ref("");

onMounted(() => {
  // Parse tokens from hash fragment
  // Format: #access_token=...&refresh_token=...&type=recovery
  const hash = window.location.hash;

  // Also try from the raw hash if it starts with #access_token
  if (hash.includes("access_token=")) {
    const cleanHash = hash.replace(/^#\/?/, "").replace(/^.*?\?/, "");
    const hashParams = new URLSearchParams(cleanHash.includes("access_token") ? cleanHash : hash.slice(1));
    accessToken.value = hashParams.get("access_token") ?? "";
    refreshToken.value = hashParams.get("refresh_token") ?? "";
  }
});

const isLoading = computed(() => resetPassword.isPending.value);
const isFormValid = computed(
  () => password.value.length >= 6 && password.value === confirmPassword.value,
);
const passwordMismatch = computed(
  () => confirmPassword.value !== "" && password.value !== confirmPassword.value,
);

const handleSubmit = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await resetPassword.mutateAsync({
      password: password.value,
      accessToken: accessToken.value || undefined,
      refreshToken: refreshToken.value || undefined,
    });
    successMessage.value = "密码已重置，即将跳转登录页面…";
    setTimeout(() => {
      router.push("/auth/sign-in");
    }, 2000);
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
    errorMessage.value =
      axiosError.response?.data?.error?.message ?? "重置失败，请稍后重试";
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-icon">
          <ShieldCheck :size="24" />
        </div>
        <h1 class="auth-title">
          重置密码
        </h1>
        <p class="auth-subtitle">
          设置一个新密码
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

        <div
          v-if="successMessage"
          class="auth-success"
        >
          {{ successMessage }}
        </div>

        <div class="form-group">
          <label
            for="reset-password"
            class="form-label"
          >新密码</label>
          <div class="input-wrapper">
            <Lock
              :size="16"
              class="input-icon"
            />
            <input
              id="reset-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="至少 6 位"
              autocomplete="new-password"
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

        <div class="form-group">
          <label
            for="reset-confirm"
            class="form-label"
          >确认新密码</label>
          <div class="input-wrapper">
            <Lock
              :size="16"
              class="input-icon"
            />
            <input
              id="reset-confirm"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="再次输入新密码"
              autocomplete="new-password"
              class="form-input"
              :class="{ 'input-error': passwordMismatch }"
            >
          </div>
          <span
            v-if="passwordMismatch"
            class="field-error"
          >
            两次输入的密码不一致
          </span>
        </div>

        <button
          type="submit"
          class="auth-submit"
          :disabled="!isFormValid || isLoading"
        >
          {{ isLoading ? "重置中…" : "确认重置" }}
        </button>
      </form>

      <div class="auth-footer">
        <router-link
          to="/auth/sign-in"
          class="auth-link"
        >
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
  background: var(--success-soft-bg);
  color: var(--success-primary);
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

.form-input.input-error {
  border-color: var(--danger-primary);
}

.field-error {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--danger-primary);
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
