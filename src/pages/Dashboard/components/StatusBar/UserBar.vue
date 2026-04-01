<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Ellipsis, User, LogOut, LoaderCircle } from "lucide-vue-next";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Dialog } from "@/components/ui/Dialog";
import BrandLogo from "@/components/ui/BrandLogo/BrandLogo.vue";

const emit = defineEmits<{
  (e: "login"): void;
}>();

const auth = useAuthStore();

const showLogoutDialog = ref(false);

const isLoggingOut = computed(() => auth.signOut.isPending);

const handleProfileClick = () => {
  console.error("Navigate to profile...");
};

const handleLogoutClick = () => {
  showLogoutDialog.value = true;
};

const confirmLogout = async () => {
  await auth.signOut.mutateAsync();
  showLogoutDialog.value = false;
};
</script>

<template>
  <div class="h-full w-full flex text-xs font-mono select-none text-white/60">
    <div class="w-[380px] h-full shrink-0 flex items-center px-4 border-r border-white/5 border-t">
      <div
        v-if="auth.isAuthenticated"
        class="w-full h-full flex items-center justify-between"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/5">
            <img
              v-if="auth.avatarUrl"
              :src="auth.avatarUrl"
              class="w-full h-full object-cover"
              alt="avatar"
            >
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-white/50 text-xs font-sans"
            >
              {{ (auth.nickname || auth.email || 'U').charAt(0).toUpperCase() }}
            </div>
          </div>

          <div class="flex flex-col justify-center min-w-[80px]">
            <span class="text-[13px] font-medium text-white/90 truncate leading-tight font-sans tracking-wide">
              {{ auth.nickname || 'wanxing dai' }}
            </span>
            <span class="text-[11px] text-white/40 leading-tight font-sans mt-0.5 flex items-center gap-1">
              <span class="font-mono text-white/30 tracking-wider">¥0</span>
            </span>
          </div>
        </div>

        <Dropdown
          placement="top-end"
          trigger="click"
        >
          <template #trigger>
            <button class="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white/90 hover:bg-white/10 rounded transition-colors cursor-pointer">
              <Ellipsis class="w-4 h-4" />
            </button>
          </template>

          <DropdownItem
            :icon="User"
            label="个人中心"
            @click="handleProfileClick"
          />
          <DropdownItem
            :icon="LogOut"
            label="退出登录"
            danger
            @click="handleLogoutClick"
          />
        </Dropdown>
      </div>

      <button
        v-else
        class="guest-badge hover:bg-white/5 px-2 py-1 w-full text-left rounded-md"
        @click="emit('login')"
      >
        游客模式入口
      </button>
    </div>

    <div class="flex-1 h-full px-4 flex items-center justify-end" />
  </div>

  <Dialog
    v-model:open="showLogoutDialog"
    hide-header
    size="auto"
    panel-class="!bg-black !border !border-white/10 overflow-hidden"
  >
    <div class="w-[320px] bg-black flex flex-col items-center px-8 py-8">
      <div class="mb-6 flex items-center justify-center">
        <BrandLogo
          :size="40"
          class="text-white"
        />
      </div>

      <h2 class="text-[17px] font-bold text-white mb-2 text-center tracking-wide font-sans">
        登出当前账号？
      </h2>

      <p class="text-[14px] text-white/50 text-center mb-6 leading-relaxed font-sans mt-0">
        退出后将丢失数据云端同步
      </p>

      <div class="w-full flex flex-col gap-5">
        <button
          class="w-full h-10 border-none rounded-lg bg-white text-[#0a0b0d] font-sans text-sm font-600 cursor-pointer tracking-wide transition-[background,opacity] duration-[180ms] hover:bg-white/90 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="isLoggingOut"
          @click="confirmLogout"
        >
          <LoaderCircle
            v-if="isLoggingOut"
            :size="18"
            class="animate-spin"
          />
          <span v-else>登出</span>
        </button>
        <button
          class="w-full h-10 border-none rounded-lg bg-white/10 text-white font-sans text-sm font-600 tracking-wide transition-[background,opacity] duration-[180ms] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
          :class="isLoggingOut ? '' : 'cursor-pointer hover:bg-white/20'"
          :disabled="isLoggingOut"
          @click="showLogoutDialog = false"
        >
          取消
        </button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.guest-badge {
  padding: 0;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
}

.guest-badge:hover {
  color: rgba(255, 255, 255, 0.8);
}
</style>
