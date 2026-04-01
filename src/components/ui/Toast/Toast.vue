<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed } from "vue";
import { Bell, CircleCheck, CircleX, Info } from "lucide-vue-next";
import type { ToastItem } from "@/composables/useToast";

const props = defineProps<{ item: ToastItem }>();

const iconMap = {
  default: Bell,
  success: CircleCheck,
  error: CircleX,
  warning: Info,
  info: Info,
} as const;

const icon = computed(() => iconMap[props.item.type]);
</script>

<template>
  <div
    class="toast-pill"
    :class="`toast-${item.type}`"
  >
    <component
      :is="icon"
      class="toast-icon"
      :size="18"
      :stroke-width="2.5"
    />
    <span class="toast-message">{{ item.message }}</span>
  </div>
</template>

<style scoped>

.toast-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 20px 11px 14px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 4px 14px rgba(0, 0, 0, 0.12),
    0 12px 32px rgba(0, 0, 0, 0.08);
  min-width: 240px;
  max-width: 400px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}


.toast-message {
  font-family: var(--font-sans);
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
}


.toast-icon {
  flex-shrink: 0;
}


.toast-default .toast-icon,
.toast-default .toast-message {
  color: #374151;
}
.toast-success .toast-icon,
.toast-success .toast-message {
  color: #16a34a;
}
.toast-error .toast-icon,
.toast-error .toast-message {
  color: #dc2626;
}
.toast-info .toast-icon,
.toast-info .toast-message {
  color: #2563eb;
}
.toast-warning .toast-icon,
.toast-warning .toast-message {
  color: #d97706;
}
</style>
