import type { Component } from "vue";
import type { Placement } from "@floating-ui/vue";

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

export interface DropdownGroupProps {
  /** 分组标题，显示在组顶部。不传则无标题。 */
  label?: string;
}
