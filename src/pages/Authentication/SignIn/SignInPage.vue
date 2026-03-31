<script setup lang="ts">
import { watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AuthLayout from "@/layouts/AuthLayout.vue";
import { AuthForm } from "@/components/biz/AuthForm";

const router = useRouter();
const auth = useAuthStore();

// 兜底：bootstrap 缓存已是登录态时（守卫异步期间）立即跳回首页
watch(
  () => auth.isAuthenticated,
  (authenticated) => {
    if (authenticated) router.replace("/");
  },
  { immediate: true },
);

const handleSuccess = () => {
  router.push("/");
};
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-[400px] bg-transparent py-10">
      <AuthForm @success="handleSuccess" />
    </div>
  </AuthLayout>
</template>
