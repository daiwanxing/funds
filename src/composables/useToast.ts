import { readonly, ref } from "vue";

export type ToastType = "default" | "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

// ── Internal timer state (not exposed) ─────────────────
interface TimerState {
  timeoutId: ReturnType<typeof setTimeout>;
  startedAt: number; // Date.now() when the timer was started or resumed
  remaining: number; // ms remaining when the timer was last paused
}

const toasts = ref<ToastItem[]>([]);
const timers = new Map<string, TimerState>();

// ── Core helpers ────────────────────────────────────────
const remove = (id: string): void => {
  timers.delete(id);
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

const startTimer = (id: string, ms: number): void => {
  const timeoutId = setTimeout(() => remove(id), ms);
  timers.set(id, { timeoutId, startedAt: Date.now(), remaining: ms });
};

const add = (type: ToastType, message: string, duration = 4000): string => {
  const id = crypto.randomUUID();
  toasts.value.unshift({ id, type, message, duration }); // newest first
  startTimer(id, duration);
  return id;
};

// ── Pause / resume (for hover-to-hold) ─────────────────
const pause = (id: string): void => {
  const state = timers.get(id);
  if (!state) return;
  clearTimeout(state.timeoutId);
  const elapsed = Date.now() - state.startedAt;
  state.remaining = Math.max(0, state.remaining - elapsed);
};

const resume = (id: string): void => {
  const state = timers.get(id);
  if (!state) return;
  // Re-use the remaining ms
  const timeoutId = setTimeout(() => remove(id), state.remaining);
  state.timeoutId = timeoutId;
  state.startedAt = Date.now();
};

// ── Public API ──────────────────────────────────────────
export const useToast = () => ({
  /** Read-only reactive list consumed by ToastContainer */
  toasts: readonly(toasts),
  /** Show a default (neutral) toast */
  default: (message: string, duration?: number) =>
    add("default", message, duration),
  /** Show a success toast */
  success: (message: string, duration?: number) =>
    add("success", message, duration),
  /** Show an error toast */
  error: (message: string, duration?: number) =>
    add("error", message, duration),
  /** Show an info toast */
  info: (message: string, duration?: number) => add("info", message, duration),
  /** Show a warning toast */
  warning: (message: string, duration?: number) =>
    add("warning", message, duration),
  /** Manually remove a toast */
  dismiss: remove,
  /** Pause the auto-dismiss timer (call on mouseenter) */
  pause,
  /** Resume the auto-dismiss timer (call on mouseleave) */
  resume,
});
