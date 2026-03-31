<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Mail, Lock, Eye, EyeOff, LoaderCircle } from "lucide-vue-next";
import { PASSWORD_RE } from "@/constants";
import { OAuthButtons } from "../OAuthButtons";

const emit = defineEmits<{
  "go-login": [];
}>();

const { signUp, resendVerification } = useAuthStore();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const error = ref("");
const success = ref("");
const isRegistered = ref(false);

const isLoading = computed(() => signUp.isPending);
const isPasswordStrong = computed(() => PASSWORD_RE.test(password.value));
const passwordWeak = computed(
  () => password.value !== "" && !isPasswordStrong.value,
);
const isValid = computed(
  () =>
    email.value.trim() !== "" &&
    isPasswordStrong.value &&
    password.value === confirmPassword.value,
);
const passwordMismatch = computed(
  () =>
    confirmPassword.value !== "" &&
    password.value !== confirmPassword.value,
);

const handleSubmit = async () => {
  error.value = "";
  success.value = "";
  try {
    await signUp.mutateAsync({
      email: email.value.trim(),
      password: password.value,
    });
    success.value = "注册成功！请前往邮箱完成验证后再登录。";
    isRegistered.value = true;
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
    error.value =
      axiosError.response?.data?.error?.message ?? "注册失败，请稍后重试";
  }
};

const handleResend = async () => {
  try {
    await resendVerification.mutateAsync({ email: email.value.trim() });
    success.value = "验证邮件已重新发送，请检查您的邮箱。";
  } catch {
    error.value = "重发失败，请稍后重试";
  }
};

/** 父组件切走时调用，重置内部状态 */
const reset = () => {
  email.value = "";
  password.value = "";
  confirmPassword.value = "";
  showPassword.value = false;
  error.value = "";
  success.value = "";
  isRegistered.value = false;
};

defineExpose({ reset });
</script>

<template>
  <div>
    <div class="text-center mb-8">
      <h1 class="font-sans text-xl font-600 text-p m-0 mb-2">
        注册 Funds Assistant
      </h1>
      <p class="font-sans text-[13px] text-t m-0">
        创建账号以开启云端同步
      </p>
    </div>

    <template v-if="!isRegistered">
      <form
        class="flex flex-col gap-5"
        @submit.prevent="handleSubmit"
      >
        <div class="flex flex-col gap-1.5">
          <label
            for="auth-form-reg-email"
            class="font-sans text-[13px] font-500 text-s"
          >邮箱</label>
          <div class="relative flex items-center">
            <Mail
              :size="16"
              class="absolute left-3 text-t pointer-events-none"
            />
            <input
              id="auth-form-reg-email"
              v-model="email"
              type="email"
              placeholder="name@example.com"
              autocomplete="email"
              class="w-full h-10 py-0 pr-3 pl-9 border border-white/6 rounded-1.5 bg-white/2 text-p font-mono text-[13px] outline-none transition-[border-color,background] duration-200 placeholder:text-d focus:border-accent focus:bg-black/40"
            >
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label
            for="auth-form-reg-password"
            class="font-sans text-[13px] font-500 text-s"
          >密码</label>
          <div class="relative flex items-center">
            <Lock
              :size="16"
              class="absolute left-3 text-t pointer-events-none"
            />
            <input
              id="auth-form-reg-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="至少 9 位，含字母和数字"
              autocomplete="new-password"
              class="w-full h-10 py-0 pr-3 pl-9 border rounded-1.5 bg-white/2 text-p font-mono text-[13px] outline-none transition-[border-color,background] duration-200 placeholder:text-d focus:border-accent focus:bg-black/40"
              :class="[passwordWeak ? '!border-danger' : 'border-white/6']"
            >
            <button
              type="button"
              class="absolute right-2 flex items-center justify-center w-7 h-7 border-none bg-transparent text-t cursor-pointer rounded transition-colors duration-200 hover:text-s"
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
          <span
            v-if="passwordWeak"
            class="font-sans text-xs text-warning"
          >
            密码需至少 9 位，且同时包含字母和数字
          </span>
        </div>

        <div class="flex flex-col gap-1.5">
          <label
            for="auth-form-reg-confirm"
            class="font-sans text-[13px] font-500 text-s"
          >确认密码</label>
          <div class="relative flex items-center">
            <Lock
              :size="16"
              class="absolute left-3 text-t pointer-events-none"
            />
            <input
              id="auth-form-reg-confirm"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="再次输入密码"
              autocomplete="new-password"
              class="w-full h-10 py-0 pr-3 pl-9 border rounded-1.5 bg-white/2 text-p font-mono text-[13px] outline-none transition-[border-color,background] duration-200 placeholder:text-d focus:border-accent focus:bg-black/40"
              :class="[passwordMismatch ? '!border-danger' : 'border-white/6']"
            >
          </div>
          <span
            v-if="passwordMismatch"
            class="font-sans text-xs text-danger"
          >
            两次输入的密码不一致
          </span>
        </div>

        <button
          type="submit"
          class="w-full h-10 border-none rounded-lg bg-white text-[#0a0b0d] font-sans text-sm font-600 cursor-pointer tracking-[0.01em] transition-[background,opacity] duration-[180ms] enabled:hover:bg-white/88 enabled:active:bg-white/76 disabled:op-50 disabled:cursor-not-allowed flex items-center justify-center"
          :disabled="!isValid || isLoading"
        >
          <LoaderCircle
            v-if="isLoading"
            :size="18"
            class="animate-spin"
          />
          <span v-else>注册</span>
        </button>
      </form>
    </template>

    <template v-else>
      <div class="flex flex-col gap-4">
        <div class="py-2.5 px-3.5 rounded-lg bg-fall/14 text-fall text-[13px] font-sans border border-fall/20">
          注册成功！请前往邮箱完成验证后再登录。
        </div>
        <button
          type="button"
          class="w-full h-10 border border-white/6 rounded-lg bg-bg-2 text-s font-sans text-sm font-500 cursor-pointer transition-[background,border-color] duration-200 enabled:hover:bg-bg-3 enabled:hover:border-white/10 disabled:op-50 disabled:cursor-not-allowed"
          :disabled="resendVerification.isPending"
          @click="handleResend"
        >
          {{ resendVerification.isPending ? "发送中…" : "重新发送验证邮件" }}
        </button>
        <button
          type="button"
          class="block text-center font-sans text-[13px] text-accent no-underline transition-colors duration-200 hover:text-accent-hover bg-none border-none p-0 cursor-pointer"
          @click="emit('go-login')"
        >
          前往登录
        </button>
      </div>
    </template>

    <OAuthButtons />

    <div class="text-center mt-6">
      <span class="font-sans text-[13px] text-t mr-1">已有账号？</span>
      <button
        type="button"
        class="font-sans text-[13px] text-accent no-underline transition-colors duration-200 hover:text-accent-hover bg-none border-none p-0 cursor-pointer"
        @click="emit('go-login')"
      >
        登录
      </button>
    </div>
  </div>
</template>
