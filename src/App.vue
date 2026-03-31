<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useQueryClient } from "@tanstack/vue-query";
import { ToastContainer } from "@/components/ui/Toast";
import { BOOTSTRAP_QUERY_KEY } from "@/stores/auth";

const router = useRouter();
const queryClient = useQueryClient();

let authChannel: BroadcastChannel | null = null;

onMounted(() => {
  try {
    authChannel = new BroadcastChannel("auth-sync");
    authChannel.onmessage = (e) => {
      if (e.data?.type === "login_success") {
        // 使 bootstrap 缓存失效，触发重新拉取最新登录态
        queryClient.invalidateQueries({ queryKey: [...BOOTSTRAP_QUERY_KEY] });

        // 跳回原页面
        const redirectUrl = e.data.redirectUrl ?? "/";
        if (redirectUrl !== router.currentRoute.value.fullPath) {
          router.push(redirectUrl);
        }
      }
    };
  } catch {
    // BroadcastChannel 不可用（如 Safari 隐私模式）时静默降级
  }
});

onUnmounted(() => {
  authChannel?.close();
  authChannel = null;
});
</script>

<template>
  <ToastContainer />
  <router-view />
</template>
