<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Mail, Lock, Eye, EyeOff, LoaderCircle } from "lucide-vue-next";
import { OAuthButtons } from "../OAuthButtons";

const emit = defineEmits<{
  success: [];
  "go-register": [];
  "go-forgot": [];
}>();


const { signIn } = useAuthStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);

const isLoading = computed(() => signIn.isPending);
const isValid = computed(
  () => email.value.trim() !== "" && password.value !== "",
);

const handleSubmit = async () => {
  try {
    await signIn.mutateAsync({
      email: email.value.trim(),
      password: password.value,
    });
    emit("success");
  } catch {
    // 错误已由 http 拦截器统一处理（401 → toast）
  }
};
</script>

<template>
  <div>
    <div class="text-center mb-8">
      <h1 class="font-sans text-xl font-600 text-p m-0 mb-2">
        登录 Funds Assistant
      </h1>
      <p class="font-sans text-[13px] text-t m-0">
        登录以开启云端同步
      </p>
    </div>

    <form
      class="flex flex-col gap-5"
      @submit.prevent="handleSubmit"
    >
      <div class="flex flex-col gap-1.5">
        <label
          for="auth-form-email"
          class="font-sans text-[13px] font-500 text-s"
        >邮箱</label>
        <div class="relative flex items-center">
          <Mail
            :size="16"
            class="absolute left-3 text-t pointer-events-none"
          />
          <input
            id="auth-form-email"
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
          for="auth-form-password"
          class="font-sans text-[13px] font-500 text-s"
        >密码</label>
        <div class="relative flex items-center">
          <Lock
            :size="16"
            class="absolute left-3 text-t pointer-events-none"
          />
          <input
            id="auth-form-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="输入密码"
            autocomplete="current-password"
            class="w-full h-10 py-0 pr-3 pl-9 border border-white/6 rounded-1.5 bg-white/2 text-p font-mono text-[13px] outline-none transition-[border-color,background] duration-200 placeholder:text-d focus:border-accent focus:bg-black/40"
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
      </div>

      <div class="flex justify-end -mt-2">
        <button
          type="button"
          class="font-sans text-[13px] text-accent no-underline transition-colors duration-200 hover:text-accent-hover bg-none border-none p-0 cursor-pointer"
          @click="emit('go-forgot')"
        >
          忘记密码？
        </button>
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
        <span v-else>登录</span>
      </button>
    </form>

    <OAuthButtons />

    <div class="text-center mt-6">
      <span class="font-sans text-[13px] text-t mr-1">还没有账号？</span>
      <button
        type="button"
        class="font-sans text-[13px] text-accent no-underline transition-colors duration-200 hover:text-accent-hover bg-none border-none p-0 cursor-pointer"
        @click="emit('go-register')"
      >
        注册
      </button>
    </div>
  </div>
</template>
