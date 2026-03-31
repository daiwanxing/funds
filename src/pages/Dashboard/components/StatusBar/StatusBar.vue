<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Ellipsis, User, LogOut } from "lucide-vue-next";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Dialog } from "@/components/ui/Dialog";
import BrandLogo from "@/components/BrandLogo.vue";

const emit = defineEmits<{
  (e: "login"): void;
}>();

const auth = useAuthStore();

// 退出登录状态控制
const showLogoutDialog = ref(false);

const handleProfileClick = () => {
  // 个人中心占位处理
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

          <!-- 昵称与收益占位 -->
          <div class="flex flex-col justify-center min-w-[80px]">
            <span class="text-[13px] font-medium text-white/90 truncate leading-tight font-sans tracking-wide">
              {{ auth.nickname || 'wanxing dai' }}
            </span>
            <span class="text-[11px] text-white/40 leading-tight font-sans mt-0.5 flex items-center gap-1">
              <span class="font-mono text-white/30 tracking-wider">¥0</span>
            </span>
          </div>
        </div>

        <!-- Dropdown 菜单接入 -->
        <Dropdown 
          placement="top-end" 
          trigger="click"
        >
          <template #trigger>
            <!-- 触发器按钮 -->
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
      
      <!-- 游客模式入口 -->
      <button
        v-else
        class="guest-badge hover:bg-white/5 px-2 py-1 w-full text-left rounded-md"
        @click="emit('login')"
      >
        游客模式入口
      </button>
    </div>

    <!-- 🟢 第二部分：主屏信息占位 (flex-1 占据剩余空间) -->
    <div class="flex-1 h-full px-4 flex items-center justify-end">
      <!-- 最右侧状态指示：网络或数据同步标志 -->
      <div class="flex items-center gap-1.5 py-1 text-white/30 cursor-default">
        <span class="w-1.5 h-1.5 bg-green-500/50 rounded-full inline-block" />
        <span>Online</span>
      </div>
    </div>
  </div>

  <!-- 定制化极简高质感退出弹窗 (参考图2风格) -->
  <Dialog
    v-model:open="showLogoutDialog"
    hide-header
    size="auto"
    panel-class="!bg-black !border !border-white/10 overflow-hidden"
  >
    <div class="w-[320px] bg-black flex flex-col items-center px-8 py-8">
      <!-- 顶端图标区 -->
      <div class="mb-6 flex items-center justify-center">
        <!-- 品牌标识 -->
        <BrandLogo 
          :size="40" 
          class="text-white" 
        />
      </div>

      <!-- 标题 -->
      <h2 class="text-[17px] font-bold text-white mb-2 text-center tracking-wide font-sans">
        登出当前账号？
      </h2>

      <!-- 描述文案 -->
      <p class="text-[14px] text-white/50 text-center mb-6 leading-relaxed font-sans mt-0">
        退出后将丢失数据云端同步
      </p>

      <!-- 纵向排列的方形按钮 (同登录框标准) -->
      <div class="w-full flex flex-col gap-5">
        <button 
          class="w-full h-10 border-none rounded-lg bg-white text-[#0a0b0d] font-sans text-sm font-600 cursor-pointer tracking-wide transition-[background,opacity] duration-[180ms] hover:bg-white/90 flex items-center justify-center"
          @click="confirmLogout"
        >
          登出
        </button>
        <button 
          class="w-full h-10 border-none rounded-lg bg-white/10 text-white font-sans text-sm font-600 cursor-pointer tracking-wide transition-[background,opacity] duration-[180ms] hover:bg-white/20 flex items-center justify-center"
          @click="showLogoutDialog = false"
        >
          取消
        </button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* 原有的 guest-badge 样式保持不变 */
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
