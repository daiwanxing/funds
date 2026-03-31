<script setup lang="ts">
export interface DropdownGroupProps {
  /** 分组标题，显示在组顶部。不传则无标题。 */
  label?: string;
}

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
