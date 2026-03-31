<script setup lang="ts">
import { watch } from "vue";
import { Dialog } from "@/components/ui/Dialog";
import { AuthForm } from "@/components/biz/AuthForm";
import { useAuthStore } from "@/stores/auth";

const open = defineModel<boolean>("open", { default: false });

const auth = useAuthStore();

const handleSuccess = () => {
  open.value = false;
};

// OAuth 登录在新 tab 完成后，BroadcastChannel 通知本 tab 刷新 bootstrap，
// isAuthenticated 变为 true，自动关闭弹窗。
watch(() => auth.isAuthenticated, (authenticated) => {
  if (authenticated && open.value) {
    open.value = false;
  }
});
</script>

<template>
  <Dialog
    v-model:open="open"
    size="sm"
  >
    <AuthForm @success="handleSuccess" />
  </Dialog>
</template>
