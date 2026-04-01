<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { AnimatePresence, motion } from "motion-v";
import { X } from "lucide-vue-next";

import type { DialogProps } from "./types";
const props = withDefaults(defineProps<DialogProps>(), {
  size: "md",
  title: undefined,
  closeOnBackdropClick: true,
  closeOnEsc: true,
  hideHeader: false,
  panelClass: "",
});

const open = defineModel<boolean>("open", { default: false });


let savedOverflow = "";

watch(open, (val) => {
  if (val) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = savedOverflow;
  }
});


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


const onBackdropClick = () => {
  if (props.closeOnBackdropClick) open.value = false;
};


const sizeMap = {
  sm: "360px",
  md: "480px",
  lg: "640px",
  auto: "auto",
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
          :class="panelClass"
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
          <div 
            v-if="!hideHeader" 
            class="dialog-header"
          >
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


          <div 
            class="dialog-content" 
            :class="{ '!p-0': hideHeader }"
          >
            <slot />
          </div>


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


.dialog-panel {
  position: relative;
  max-width: 100%;
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background: var(--bg-2);
  border: 1px solid var(--border-default);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 24px 64px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}


.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  flex-shrink: 0;
}


.dialog-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;
}

.dialog-close-btn:hover {
  opacity: 0.7;
}

.dialog-close-btn:active {
  background: var(--bg-4);
  opacity: 0.5;
}


.dialog-title {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}


.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;
}


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
