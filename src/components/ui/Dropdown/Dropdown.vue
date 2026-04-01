<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
} from "@floating-ui/vue";
import type { Placement } from "@floating-ui/vue";
import { AnimatePresence, motion } from "motion-v";

export interface DropdownProps {
  /**
   * 弹出位置，透传给 floating-ui
   * @default 'bottom-start'
   */
  placement?: Placement;
  /**
   * 触发方式
   * @default 'click'
   */
  trigger?: "click" | "hover";
  /** 禁用，trigger 不响应事件 */
  disabled?: boolean;
  /**
   * 选择菜单项后是否自动关闭面板
   * @default true
   */
  closeOnSelect?: boolean;
}

const props = withDefaults(defineProps<DropdownProps>(), {
  placement: "bottom-start",
  trigger: "click",
  disabled: false,
  closeOnSelect: true,
});

const open = defineModel<boolean>("open", { default: false });


const triggerRef = ref<HTMLElement | null>(null);
const floatingRef = ref<HTMLElement | null>(null);

const { x, y } = useFloating(triggerRef, floatingRef, {
  placement: props.placement,
  whileElementsMounted: autoUpdate,
  middleware: [
    // trigger 与 panel 之间 6px 间距
    offset(6),
    // 空间不足时翻转到对侧
    flip({ padding: 8 }),
    // 贴边时平移，保留屏边距
    shift({ padding: 8 }),
    // panel 最小宽度与 trigger 等宽
    size({
      apply({ rects, elements }) {
        const el = elements.floating as HTMLElement;
        el.style.minWidth = `${rects.reference.width}px`;
      },
      padding: 8,
    }),
  ],
});


let hoverCloseTimer: ReturnType<typeof setTimeout> | null = null;

const clearHoverTimer = () => {
  if (hoverCloseTimer) {
    clearTimeout(hoverCloseTimer);
    hoverCloseTimer = null;
  }
};


const onTriggerClick = () => {
  if (props.disabled || props.trigger !== "click") return;
  open.value = !open.value;
};

const onTriggerMouseEnter = () => {
  if (props.disabled || props.trigger !== "hover") return;
  clearHoverTimer();
  open.value = true;
};

const onTriggerMouseLeave = () => {
  if (props.trigger !== "hover") return;
  hoverCloseTimer = setTimeout(() => {
    open.value = false;
  }, 120);
};

// Panel hover 时取消关闭计时（让光标移入 panel 不会立即关闭）
const onPanelMouseEnter = () => {
  if (props.trigger !== "hover") return;
  clearHoverTimer();
};

const onPanelMouseLeave = () => {
  if (props.trigger !== "hover") return;
  hoverCloseTimer = setTimeout(() => {
    open.value = false;
  }, 120);
};


const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && open.value) {
    open.value = false;
  }
};


const onDocumentClick = (e: MouseEvent) => {
  if (props.trigger !== "click") return;
  const target = e.target as Node;
  if (
    triggerRef.value?.contains(target) ||
    floatingRef.value?.contains(target)
  ) {
    return;
  }
  open.value = false;
};

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  document.addEventListener("click", onDocumentClick, true);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("click", onDocumentClick, true);
  clearHoverTimer();
  if (open.value) open.value = false;
});


// 保留此注释以供扩展


const onPanelClick = (e: MouseEvent) => {
  if (!props.closeOnSelect) return;
  // 如果点击了 button（DropdownItem），则关闭
  const target = e.target as HTMLElement;
  if (target.closest("button")) {
    open.value = false;
  }
};


watch(
  () => props.disabled,
  (val) => {
    if (val) open.value = false;
  },
);
</script>

<template>
  <!-- Trigger wrapper：捕获事件，挂载 floating reference -->
  <div
    ref="triggerRef"
    class="dropdown-trigger-wrapper"
    @click="onTriggerClick"
    @mouseenter="onTriggerMouseEnter"
    @mouseleave="onTriggerMouseLeave"
  >
    <slot name="trigger" />
  </div>

  <!-- Floating panel，通过 Teleport 挂载到 body -->
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="open"
        :ref="(el: any) => { floatingRef = el ? (el.$el || el) : null }"
        key="dropdown-panel"
        class="dropdown-panel"
        role="menu"
        :style="{
          position: 'absolute',
          top: y != null ? `${y}px` : '0px',
          left: x != null ? `${x}px` : '0px',
          margin: 0
        }"
        :initial="{ opacity: 0, y: -6, scale: 0.97 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :exit="{ opacity: 0, y: -4, scale: 0.98 }"
        :transition="{
          type: 'spring',
          stiffness: 480,
          damping: 32,
          mass: 0.85,
        }"
        @mouseenter="onPanelMouseEnter"
        @mouseleave="onPanelMouseLeave"
        @click="onPanelClick"
      >
        <slot />
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>

<style scoped>

.dropdown-trigger-wrapper {
  display: inline-flex;
  /* 不添加额外样式，100% 透传给 slot 内容 */
}


.dropdown-panel {
  /* z-index 高于 Dialog(1000) */
  z-index: 1100;
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  border-radius: 10px;
  background: var(--bg-2);
  border: 1px solid var(--border-default);
  max-height: 320px;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04) inset,
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 24px 48px rgba(0, 0, 0, 0.4);
  /* 内部滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: var(--bg-4) transparent;
}

.dropdown-panel::-webkit-scrollbar {
  width: 4px;
}

.dropdown-panel::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-panel::-webkit-scrollbar-thumb {
  background: var(--bg-4);
  border-radius: 999px;
}
</style>
