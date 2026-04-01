<script setup lang="ts">
import type { Component } from "vue";

export interface DropdownItemProps {
  /** 菜单项文字（也可用 default slot 覆盖） */
  label?: string;
  /** 左侧图标，传入 lucide-vue-next 等 Component */
  icon?: Component;
  /** 右侧徽章文字，如 "New" / "Live" */
  badge?: string;
  /** 右侧快捷键提示，如 "⌘K" */
  shortcut?: string;
  /** 禁用此项 */
  disabled?: boolean;
  /** 危险操作样式（红色） */
  danger?: boolean;
  /** 选中态（左侧蓝色竖线高亮） */
  active?: boolean;
}

const props = defineProps<DropdownItemProps>();

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (e: MouseEvent) => {
  if (props.disabled) return;
  emit("click", e);
};
</script>

<template>
  <button
    class="dropdown-item"
    :class="{
      'is-active': active,
      'is-danger': danger,
      'is-disabled': disabled,
    }"
    type="button"
    :disabled="disabled"
    :aria-current="active ? 'true' : undefined"
    @click="handleClick"
  >
    <!-- Leading icon -->
    <span
      v-if="icon || $slots.icon"
      class="dropdown-item__icon"
    >
      <slot name="icon">
        <component
          :is="icon"
          :size="15"
          :stroke-width="1.8"
        />
      </slot>
    </span>

    <!-- Label / default slot -->
    <span class="dropdown-item__label">
      <slot>{{ label }}</slot>
    </span>

    <!-- Suffix: badge / shortcut / custom -->
    <span
      v-if="badge || shortcut || $slots.suffix"
      class="dropdown-item__suffix"
    >
      <slot name="suffix">
        <span
          v-if="badge"
          class="dropdown-item__badge"
        >{{ badge }}</span>
        <kbd
          v-else-if="shortcut"
          class="dropdown-item__shortcut"
        >{{ shortcut }}</kbd>
      </slot>
    </span>
  </button>
</template>

<style scoped>

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 34px;
  padding: 0 12px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  user-select: none;
  transition: background 0.12s ease, color 0.12s ease;
  /* Left accent bar placeholder */
  box-shadow: inset 2px 0 0 transparent;
}

.dropdown-item:hover:not(.is-disabled) {
  background: var(--bg-3);
}


.dropdown-item.is-active {
  background: var(--bg-3);
  box-shadow: inset 2px 0 0 var(--accent-primary);
}


.dropdown-item.is-danger {
  color: var(--danger-primary);
}

.dropdown-item.is-danger:hover:not(.is-disabled) {
  background: var(--danger-soft-bg);
}


.dropdown-item.is-disabled {
  color: var(--text-disabled);
  cursor: not-allowed;
  pointer-events: none;
}


.dropdown-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: color 0.12s ease;
}

.dropdown-item.is-danger .dropdown-item__icon {
  color: var(--danger-primary);
}

.dropdown-item:hover:not(.is-disabled) .dropdown-item__icon {
  color: var(--text-secondary);
}


.dropdown-item__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.dropdown-item__suffix {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}


.dropdown-item__badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--accent-soft-bg);
  border: 1px solid var(--accent-soft-border);
  color: var(--accent-primary);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1.6;
}


.dropdown-item__shortcut {
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--bg-4);
  border: 1px solid var(--border-default);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.6;
}
</style>
