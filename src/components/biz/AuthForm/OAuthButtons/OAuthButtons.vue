<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const emit = defineEmits<{
  oauth: [provider: "google" | "github"];
}>();

const auth = useAuthStore();

const handleOAuth = (provider: "google" | "github") => {
  auth.startOAuthSignIn(provider);
  emit("oauth", provider);
};
</script>

<template>
  <div>
    <div class="flex items-center gap-3 my-6">
      <div class="flex-1 h-px bg-white/8" />
      <span class="font-sans text-[11px] text-d tracking-widest select-none">或</span>
      <div class="flex-1 h-px bg-white/8" />
    </div>
    <div
      class="flex justify-center"
      :style="{ gap: '40px' }"
    >
      <button
        data-test="oauth-google"
        type="button"
        title="使用 Google 登录"
        class="oauth-icon-btn"
        @click="handleOAuth('google')"
      >
        <img
          src="/google-svgrepo-com.svg"
          alt="Google"
          class="w-5 h-5"
        >
      </button>
      <button
        data-test="oauth-github"
        type="button"
        title="使用 GitHub 登录"
        class="oauth-icon-btn"
        @click="handleOAuth('github')"
      >
        <img
          src="/github-svgrepo-com.svg"
          alt="GitHub"
          class="w-5 h-5"
        >
      </button>
    </div>
  </div>
</template>

<style scoped>
.oauth-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
}
</style>
