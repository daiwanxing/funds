<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Ellipsis, User, LogOut } from "lucide-vue-next";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Dialog } from "@/components/ui/Dialog";

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
    <!-- 🟢 第一部分：个人入口 (固定 380px，对应上方自选板块) -->
    <div class="w-[380px] h-full shrink-0 flex items-center px-4 border-r border-white/5">
      <!-- 仅作为展示容器，移除 cursor-pointer 和 hover 样式 -->
      <div 
        v-if="auth.isAuthenticated"
        class="w-full h-full flex items-center justify-between"
      >
        <div class="flex items-center gap-2.5">
          <!-- 头像恢复为 w-8 h-8 (32px) -->
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

  <!-- 退出登录确认弹窗 -->
  <Dialog
    v-model:open="showLogoutDialog"
    title="退出登录"
    size="sm"
  >
    <div class="py-2">
      <p class="text-[13px] text-white/60 mb-2 leading-relaxed font-sans">
        确认要退出当前账号 <strong class="text-white/90 font-medium">{{ auth.nickname || 'wanxing dai' }}</strong> 吗？
      </p>
    </div>
    
    <template #footer>
      <button 
        class="px-4 py-1.5 rounded-md text-[13px] font-medium text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors font-sans"
        @click="showLogoutDialog = false"
      >
        取消
      </button>
      <button 
        class="px-4 py-1.5 rounded-md text-[13px] font-medium text-white shadow-sm bg-red-500/80 hover:bg-red-500 transition-colors font-sans ml-2"
        @click="confirmLogout"
      >
        确认退出
      </button>
    </template>
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
