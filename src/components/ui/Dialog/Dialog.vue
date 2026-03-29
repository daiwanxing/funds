<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { AnimatePresence, motion } from "motion-v";
import { X } from "lucide-vue-next";

export interface DialogProps {
  /** Dialog panel width variant */
  size?: "sm" | "md" | "lg";
  /** Optional title shown in the header */
  title?: string;
  /** Close when clicking the backdrop (default: true) */
  closeOnBackdropClick?: boolean;
  /** Close on ESC key press (default: true) */
  closeOnEsc?: boolean;
}

const props = withDefaults(defineProps<DialogProps>(), {
  size: "md",
  title: undefined,
  closeOnBackdropClick: true,
  closeOnEsc: true,
});

const open = defineModel<boolean>("open", { default: false });

// ── Scroll lock ─────────────────────────────────────────
let savedOverflow = "";

watch(open, (val) => {
  if (val) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = savedOverflow;
  }
});

// ── ESC key handler ─────────────────────────────────────
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.closeOnEsc && open.value) {
    open.value = false;
  }
};

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  // Ensure scroll is restored if component unmounts while open
  if (open.value) document.body.style.overflow = savedOverflow;
});

// ── Backdrop click ──────────────────────────────────────
const onBackdropClick = () => {
  if (props.closeOnBackdropClick) open.value = false;
};

// ── Panel size map ──────────────────────────────────────
const sizeMap = {
  sm: "360px",
  md: "480px",
  lg: "640px",
};
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="open"
        key="dialog-backdrop"
        class="dialog-backdrop"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.2 }"
        @click.self="onBackdropClick"
      >
        <motion.div
          key="dialog-panel"
          class="dialog-panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? 'dialog-title' : undefined"
          :style="{ width: sizeMap[size ?? 'md'] }"
          :initial="{ opacity: 0, y: 20, scale: 0.96 }"
          :animate="{ opacity: 1, y: 0, scale: 1 }"
          :exit="{ opacity: 0, y: 12, scale: 0.97 }"
          :transition="{
            type: 'spring',
            stiffness: 420,
            damping: 30,
            mass: 0.9,
          }"
          @click.stop
        >
          <!-- Header ─────────────────────────────────── -->
          <div class="dialog-header">
            <!-- Close button on the LEFT (user-specified) -->
            <button
              id="dialog-close-btn"
              class="dialog-close-btn"
              type="button"
              aria-label="关闭"
              @click="open = false"
            >
              <X
                :size="16"
                :stroke-width="2.5"
              />
            </button>

            <slot name="header">
              <h2
                v-if="title"
                id="dialog-title"
                class="dialog-title"
              >
                {{ title }}
              </h2>
            </slot>
          </div>

          <!-- Content ─────────────────────────────────── -->
          <div class="dialog-content">
            <slot />
          </div>

          <!-- Footer (optional) ──────────────────────── -->
          <div
            v-if="$slots.footer"
            class="dialog-footer"
          >
            <slot name="footer" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop ─────────────────────────────────────────── */
.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

/* ── Panel ────────────────────────────────────────────── */
.dialog-panel {
  position: relative;
  max-width: 100%;
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: var(--bg-2);
  border: 1px solid var(--border-default);
  /* Accent top line — terminal header feel */
  border-top: 2px solid var(--accent-primary);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 24px 64px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

/* ── Header ───────────────────────────────────────────── */
.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

/* ── Close button (top-left) ──────────────────────────── */
.dialog-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.dialog-close-btn:hover {
  background: var(--bg-3);
  border-color: var(--border-default);
  color: var(--text-primary);
}

.dialog-close-btn:active {
  background: var(--bg-4);
}

/* ── Title ────────────────────────────────────────────── */
.dialog-title {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

/* ── Content ──────────────────────────────────────────── */
.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;
}

/* ── Footer ───────────────────────────────────────────── */
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border-subtle);
  flex-shrink: 0;
}
</style>
