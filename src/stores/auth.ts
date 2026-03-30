import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { fetchBootstrap, putWatchlist, importGuestWatchlist } from "@/api/user";
import * as authApi from "@/api/auth";
import type { BootstrapResponse, OAuthProvider, WatchlistItemDTO } from "@/types/auth";
import { mapWatchlistToFundList } from "@/types/auth";
import type { FundListItem } from "@/types/fund";

import { BOOTSTRAP_QUERY_KEY } from "@/constants";
export { BOOTSTRAP_QUERY_KEY };

/**
 * Auth store — 全局单例，持有登录态与用户信息。
 *
 * 服务端数据（bootstrap）通过 TanStack Query 管理缓存与失效；
 * 客户端 UI 状态（importPromptDismissed）由 Pinia 持有，保证全局唯一。
 */
export const useAuthStore = defineStore("auth", () => {
  const queryClient = useQueryClient();

  // ── Bootstrap query ────────────────────────────────────────────
  const bootstrap = useQuery<BootstrapResponse>({
    queryKey: [...BOOTSTRAP_QUERY_KEY],
    queryFn: fetchBootstrap,
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 1,
  });

  // ── Derived auth state ─────────────────────────────────────────
  /** 是否已登录 */
  const isAuthenticated = computed(() => bootstrap.data.value?.authenticated ?? false);

  /** 当前用户信息，未登录时为 null */
  const profile = computed(() => bootstrap.data.value?.profile ?? null);

  /** 当前用户邮箱，未登录时为 null */
  const email = computed(() => profile.value?.email ?? null);

  /** 是否为首次登录 */
  const isFirstLogin = computed(() => profile.value?.isFirstLogin ?? false);

  /** 云端自选基金列表（登录态下有效） */
  const cloudWatchlist = computed<FundListItem[]>(() => {
    const items = bootstrap.data.value?.watchlist;
    return items ? mapWatchlistToFundList(items) : [];
  });

  // ── Import dialog state ────────────────────────────────────────
  const importPromptDismissed = ref(false);

  /** 是否应显示「导入游客自选」提示（需配合 guestWatchlist.items.length > 0 判断） */
  const shouldShowImportPrompt = computed(() => {
    if (importPromptDismissed.value) return false;
    if (!isAuthenticated.value) return false;
    if (!isFirstLogin.value) return false;
    if (cloudWatchlist.value.length > 0) return false;
    return true;
  });

  const dismissImportPrompt = () => {
    importPromptDismissed.value = true;
  };

  // 账号切换时重置弹窗状态
  watch(email, () => {
    importPromptDismissed.value = false;
  });

  // ── Auth mutations ─────────────────────────────────────────────
  const signUpMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signUp(email, password),
  });

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signIn(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOOTSTRAP_QUERY_KEY] });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      queryClient.setQueryData([...BOOTSTRAP_QUERY_KEY], { authenticated: false });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => authApi.forgotPassword(email),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({
      password,
      accessToken,
      refreshToken,
    }: {
      password: string;
      accessToken?: string;
      refreshToken?: string;
    }) => authApi.resetPassword(password, accessToken, refreshToken),
  });

  const resendVerificationMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => authApi.resendVerification(email),
  });

  const startOAuthSignIn = (provider: OAuthProvider) => {
    authApi.startOAuthSignIn(provider);
  };

  // ── Watchlist mutations ────────────────────────────────────────
  const saveWatchlistMutation = useMutation({
    mutationFn: (watchlist: WatchlistItemDTO[]) => putWatchlist(watchlist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOOTSTRAP_QUERY_KEY] });
    },
  });

  const importGuestMutation = useMutation({
    mutationFn: (watchlist: WatchlistItemDTO[]) => importGuestWatchlist(watchlist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOOTSTRAP_QUERY_KEY] });
    },
  });

  return {
    // ── Bootstrap ──────────────────────────────────────────────
    bootstrap,

    // ── Derived state ──────────────────────────────────────────
    isAuthenticated,
    profile,
    email,
    isFirstLogin,
    cloudWatchlist,

    // ── Import dialog ──────────────────────────────────────────
    shouldShowImportPrompt,
    dismissImportPrompt,

    // ── Auth mutations ─────────────────────────────────────────
    signUp: signUpMutation,
    signIn: signInMutation,
    signOut: signOutMutation,
    forgotPassword: forgotPasswordMutation,
    resetPassword: resetPasswordMutation,
    resendVerification: resendVerificationMutation,
    startOAuthSignIn,

    // ── Watchlist mutations ────────────────────────────────────
    saveWatchlist: saveWatchlistMutation,
    importGuest: importGuestMutation,
  };
});
