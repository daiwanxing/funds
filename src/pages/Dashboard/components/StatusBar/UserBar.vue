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
        class="-mx-4 w-[380px] h-full flex items-center justify-between px-4 relative cursor-pointer border-none overflow-hidden"
        @click="emit('login')"
      >
        <!-- 底部深蓝星海流转动态背景 -->
        <div
          class="absolute inset-0 pointer-events-none gradient-flow-bg"
          style="mask-image: linear-gradient(to right, black 40%, transparent 100%); -webkit-mask-image: linear-gradient(to right, black 40%, transparent 100%);"
        />
        
        <!-- 左侧 Logo 处散发的品牌色微光晕，带轻微呼吸感 -->
        <div class="absolute -left-4 top-1/2 -translate-y-1/2 w-[90px] h-[70px] bg-accent-primary/20 blur-[20px] rounded-full pointer-events-none mix-blend-screen animate-breathe" />
        
        <!-- 顶部极其克制的质感发光细线 (高光边缘) -->
        <div class="absolute top-0 left-0 w-[65%] h-[1px] bg-gradient-to-r from-accent-primary/30 to-transparent pointer-events-none" />

        <!-- 左侧仅仅包含产品Logo和一行纯净文案 -->
        <div class="flex items-center gap-3 relative z-10">
          <BrandLogo
            :size="24"
            class="text-white/90"
          />
          <span class="text-[13px] font-sans text-white/60 tracking-wide mt-[1px]">登录解锁全部功能</span>
        </div>

        <!-- 右侧无悬停态的纯净项目登录按钮 -->
        <div
          class="min-w-[56px] h-[28px] flex items-center justify-center rounded-md bg-accent-primary text-white text-[12px] font-medium relative z-10 font-sans tracking-wide"
        >
          登录
        </div>
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
.guest-banner {
  padding: 0;
  border: none;
  background: transparent;
  outline: none;
}

@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.gradient-flow-bg {
  background: linear-gradient(-60deg, #0d1326, #1b284c, #111a30, #0d1326);
  background-size: 300% 300%;
  animation: gradient-flow 12s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: translateY(-50%) scale(1); opacity: 0.6; }
  50% { transform: translateY(-50%) scale(1.15); opacity: 0.85; }
}

.animate-breathe {
  animation: breathe 6s ease-in-out infinite;
}
</style>
