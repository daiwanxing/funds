<script setup lang="ts">
import type { DropdownGroupProps } from "./types";

defineProps<DropdownGroupProps>();
</script>

<template>
  <div class="dropdown-group">
    <div
      v-if="label"
      class="dropdown-group__label"
    >
      {{ label }}
    </div>
    <slot />
  </div>
</template>

<style scoped>
.dropdown-group {
  display: flex;
  flex-direction: column;
}

.dropdown-group__label {
  padding: 6px 12px 4px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-tertiary);
  user-select: none;
}
</style>
