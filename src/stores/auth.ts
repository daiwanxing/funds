import { computed } from "vue";
import { defineStore } from "pinia";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { useRouter } from "vue-router";
import { fetchBootstrap } from "@/api/user";
import * as authApi from "@/api/auth";
import type { BootstrapResponse, OAuthProvider } from "@/types/auth";
import { mapWatchlistToFundList } from "@/types/auth";
import type { FundListItem } from "@/types/fund";

import { BOOTSTRAP_QUERY_KEY } from "@/constants";
export { BOOTSTRAP_QUERY_KEY };

/**
 * Auth store — 全局单例，持有登录态与用户信息。
 *
 * 服务端数据（bootstrap）通过 TanStack Query 管理缓存与失效；
 * 自选基金相关状态已迁移至 watchlist store。
 */
export const useAuthStore = defineStore("auth", () => {
  const queryClient = useQueryClient();


  const bootstrap = useQuery<BootstrapResponse>({
    queryKey: [...BOOTSTRAP_QUERY_KEY],
    queryFn: fetchBootstrap,
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 1,
  });


  /** 是否已登录 */
  const isAuthenticated = computed(() => bootstrap.data.value?.authenticated ?? false);

  /** 当前用户信息，未登录时为 null */
  const profile = computed(() => bootstrap.data.value?.profile ?? null);

  /** 当前用户邮箱，未登录时为 null */
  const email = computed(() => profile.value?.email ?? null);

  /** 是否为首次登录 */
  const isFirstLogin = computed(() => profile.value?.isFirstLogin ?? false);

  /** 用户昵称 */
  const nickname = computed(() => profile.value?.nickname ?? null);

  /** 用户头像 */
  const avatarUrl = computed(() => profile.value?.avatarUrl ?? null);

  /** 云端自选基金列表（登录态下有效，供 watchlist store 读取） */
  const cloudWatchlist = computed<FundListItem[]>(() => {
    const items = bootstrap.data.value?.watchlist;
    return items ? mapWatchlistToFundList(items) : [];
  });


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

  const router = useRouter();

  const startOAuthSignIn = (provider: OAuthProvider) => {
    const redirectUrl = router.currentRoute.value.fullPath;
    authApi.startOAuthSignIn(provider, redirectUrl);
  };

  return {

    bootstrap,


    isAuthenticated,
    profile,
    email,
    isFirstLogin,
    nickname,
    avatarUrl,
    cloudWatchlist,


    signUp: signUpMutation,
    signIn: signInMutation,
    signOut: signOutMutation,
    forgotPassword: forgotPasswordMutation,
    resetPassword: resetPasswordMutation,
    resendVerification: resendVerificationMutation,
    startOAuthSignIn,
  };
});
