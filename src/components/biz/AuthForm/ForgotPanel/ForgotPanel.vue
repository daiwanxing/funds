<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Mail, LoaderCircle } from "lucide-vue-next";

const emit = defineEmits<{
  "go-login": [];
}>();

const { forgotPassword } = useAuthStore();

const email = ref("");
const error = ref("");
const success = ref("");

const isLoading = computed(() => forgotPassword.isPending);
const isValid = computed(() => email.value.trim() !== "");

const handleSubmit = async () => {
  error.value = "";
  success.value = "";
  try {
    const result = await forgotPassword.mutateAsync({ email: email.value.trim() });
    success.value = result.message ?? "如果该邮箱已注册，您将收到重置密码邮件";
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
    error.value =
      axiosError.response?.data?.error?.message ?? "发送失败，请稍后重试";
  }
};

/** 父组件切走时调用，重置内部状态 */
const reset = () => {
  email.value = "";
  error.value = "";
  success.value = "";
};

defineExpose({ reset });
</script>

<template>
  <div>
    <div class="text-center mb-8">
      <h1 class="font-sans text-xl font-600 text-p m-0 mb-2">
        找回密码
      </h1>
      <p class="font-sans text-[13px] text-t m-0">
        输入注册邮箱，我们将发送重置链接
      </p>
    </div>

    <form
      class="flex flex-col gap-5"
      @submit.prevent="handleSubmit"
    >
      <div
        v-if="error"
        class="py-2.5 px-3.5 rounded-lg bg-danger/14 text-danger text-[13px] font-sans border border-danger/20"
      >
        {{ error }}
      </div>

      <div
        v-if="success"
        class="py-2.5 px-3.5 rounded-lg bg-fall/14 text-fall text-[13px] font-sans border border-fall/20"
      >
        {{ success }}
      </div>

      <div class="flex flex-col gap-1.5">
        <label
          for="auth-form-forgot-email"
          class="font-sans text-[13px] font-500 text-s"
        >邮箱</label>
        <div class="relative flex items-center">
          <Mail
            :size="16"
            class="absolute left-3 text-t pointer-events-none"
          />
          <input
            id="auth-form-forgot-email"
            v-model="email"
            type="email"
            placeholder="name@example.com"
            autocomplete="email"
            class="w-full h-10 py-0 pr-3 pl-9 border border-white/6 rounded-1.5 bg-white/2 text-p font-mono text-[13px] outline-none transition-[border-color,background] duration-200 placeholder:text-d focus:border-accent focus:bg-black/40"
          >
        </div>
      </div>

      <button
        type="submit"
        class="w-full h-10 border-none rounded-lg bg-white text-[#0a0b0d] font-sans text-sm font-600 cursor-pointer tracking-[0.01em] transition-[background,opacity] duration-[180ms] enabled:hover:bg-white/88 enabled:active:bg-white/76 disabled:op-35 disabled:cursor-not-allowed flex items-center justify-center"
        :disabled="!isValid || isLoading"
      >
        <LoaderCircle
          v-if="isLoading"
          :size="18"
          class="animate-spin"
        />
        <span v-else>发送重置链接</span>
      </button>
    </form>

    <div class="text-center mt-6 pt-5 border-t border-white/6 border-x-0 border-b-0">
      <button
        type="button"
        class="font-sans text-[13px] text-accent no-underline transition-colors duration-200 hover:text-accent-hover bg-none border-none p-0 cursor-pointer"
        @click="emit('go-login')"
      >
        返回登录
      </button>
    </div>
  </div>
</template>
