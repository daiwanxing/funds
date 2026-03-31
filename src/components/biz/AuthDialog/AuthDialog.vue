<script setup lang="ts">
import { Dialog } from "@/components/ui/Dialog";
import { AuthForm } from "@/components/biz/AuthForm";

const open = defineModel<boolean>("open", { default: false });

const handleSuccess = () => {
  open.value = false;
};
</script>

<template>
  <Dialog
    v-model:open="open"
    size="sm"
    title="登录 Funds Assistant"
  >
    <AuthForm @success="handleSuccess" />
  </Dialog>
</template>
