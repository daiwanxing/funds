<script setup lang="ts">
import Toast from "./Toast.vue";
import { useToast } from "@/composables/useToast";

const { toasts, dismiss, pause, resume } = useToast();

// Before leave: capture position relative to viewport container.
// NOTE: viewport must have no transform — transforms shift the
// containing-block origin and break absolute child positioning.
const onBeforeLeave = (el: Element) => {
  const htmlEl = el as HTMLElement;
  const viewportEl = htmlEl.parentElement as HTMLElement;
  const vpRect = viewportEl.getBoundingClientRect();
  const elRect = htmlEl.getBoundingClientRect();
  htmlEl.style.top = `${elRect.top - vpRect.top}px`;
  htmlEl.style.left = `${elRect.left - vpRect.left}px`;
  htmlEl.style.width = `${elRect.width}px`;
};
</script>

<template>
  <Teleport to="body">
    <TransitionGroup
      tag="div"
      class="toast-viewport"
      aria-live="polite"
      aria-atomic="false"
      @before-leave="onBeforeLeave"
    >
      <div
        v-for="item in toasts"
        :key="item.id"
        class="toast-item"
        @click="dismiss(item.id)"
        @mouseenter="pause(item.id)"
        @mouseleave="resume(item.id)"
      >
        <Toast :item="item" />
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
/* ── Fixed top-center viewport — NO transform ──────────── *
 * Using left:0 right:0 + justify-content avoids transform
 * containment, which would corrupt position:absolute offsets
 * for the leaving element and break the exit animation.
 * ─────────────────────────────────────────────────────── */
.toast-viewport {
  position: fixed;
  top: 20px;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
}

.toast-item {
  pointer-events: all;
}

/* ── Enter ─────────────────────────────────────────────── */
.v-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.88);
}
.v-enter-active {
  transition:
    opacity 0.3s ease,
    transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.v-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ── Leave — absolute takes element out of flow (→ v-move) ─ */
.v-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.v-leave-active {
  position: absolute; /* safe: no transform on parent */
  transition:
    opacity 0.22s ease-in,
    transform 0.22s ease-in;
}
.v-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.94);
}

/* ── Move: siblings fill gap smoothly ─────────────────── */
.v-move {
  transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
