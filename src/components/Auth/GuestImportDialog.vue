<script setup lang="ts">
import { CloudUpload, X } from "lucide-vue-next";

defineProps<{
  open: boolean;
  guestCount: number;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="open"
        class="dialog-overlay"
        @click.self="emit('cancel')"
      >
        <div class="dialog-card">
          <button
            type="button"
            class="dialog-close"
            aria-label="关闭"
            @click="emit('cancel')"
          >
            <X :size="16" />
          </button>

          <div class="dialog-icon">
            <CloudUpload :size="28" />
          </div>

          <h2 class="dialog-title">
            导入本地自选基金
          </h2>
          <p class="dialog-message">
            检测到您当前浏览器中有
            <strong>{{ guestCount }}</strong>
            只自选基金，是否将其导入到您的账号中？
          </p>

          <div class="dialog-actions">
            <button
              type="button"
              class="dialog-btn dialog-btn--secondary"
              @click="emit('cancel')"
            >
              暂不导入
            </button>
            <button
              type="button"
              class="dialog-btn dialog-btn--primary"
              @click="emit('confirm')"
            >
              确认导入
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.dialog-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  margin: 24px;
  padding: 28px 24px 24px;
  background: var(--bg-2);
  border: 1px solid var(--border-default);
  border-radius: 14px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.dialog-close {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
}

.dialog-close:hover {
  color: var(--text-secondary);
  background: var(--bg-4);
}

.dialog-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--accent-soft-bg);
  color: var(--accent-primary);
  margin-bottom: 16px;
}

.dialog-title {
  font-family: var(--font-sans);
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 10px;
}

.dialog-message {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 24px;
}

.dialog-message strong {
  color: var(--accent-primary);
  font-weight: 600;
}

.dialog-actions {
  display: flex;
  gap: 10px;
}

.dialog-btn {
  flex: 1;
  height: 38px;
  border: none;
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}

.dialog-btn--secondary {
  background: var(--bg-4);
  color: var(--text-secondary);
}

.dialog-btn--secondary:hover {
  background: var(--bg-3);
}

.dialog-btn--primary {
  background: var(--accent-primary);
  color: #fff;
}

.dialog-btn--primary:hover {
  background: var(--accent-hover);
}

/* ── Transition ──────────────────────────────── */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-active .dialog-card,
.dialog-leave-active .dialog-card {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog-card {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}

.dialog-leave-to .dialog-card {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
</style>
