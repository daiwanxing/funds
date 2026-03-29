<script setup lang="ts">
defineProps<{
  size?: number | string;
  color?: string;
}>();
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    :width="size || 24"
    :height="size || 24"
    :fill="color || 'currentColor'"
    class="brand-logo"
  >
    <!-- Unified F shape to prevent sub-pixel rendering gaps -->
    <path d="M 40 64 L 104 64 L 120 96 L 72 96 L 72 116 L 90 116 L 106 148 L 72 148 L 72 192 L 40 192 Z" />
    <!-- A right leg -->
    <polygon points="120,64 152,64 216,192 184,192" />
  </svg>
</template>
