import { computed, ref, watch } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { fetchBootstrap, putWatchlist, importGuestWatchlist } from "@/api/user";
import * as authApi from "@/api/auth";
import type { BootstrapResponse, WatchlistItemDTO } from "@/types/auth";
import { mapWatchlistToFundList } from "@/types/auth";
import type { FundListItem } from "@/types/fund";

const BOOTSTRAP_KEY = ["auth", "bootstrap"] as const;

/**
 * Auth composable — provides bootstrap query, auth mutations,
 * and derived auth state for the entire app.
 */
export const useAuth = () => {
  const queryClient = useQueryClient();

  // ── Bootstrap query ──────────────────────────────
  const bootstrap = useQuery<BootstrapResponse>({
    queryKey: [...BOOTSTRAP_KEY],
    queryFn: fetchBootstrap,
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 1,
  });

  // ── Derived state ────────────────────────────────
  const isAuthenticated = computed(() => bootstrap.data.value?.authenticated ?? false);

  const profile = computed(() => bootstrap.data.value?.profile ?? null);

  const cloudWatchlist = computed<FundListItem[]>(() => {
    const items = bootstrap.data.value?.watchlist;
    return items ? mapWatchlistToFundList(items) : [];
  });

  const isFirstLogin = computed(() => profile.value?.isFirstLogin ?? false);

  // ── Sign-up ──────────────────────────────────────
  const signUpMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signUp(email, password),
  });

  // ── Sign-in ──────────────────────────────────────
  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signIn(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOOTSTRAP_KEY] });
    },
  });

  // ── Sign-out ─────────────────────────────────────
  const signOutMutation = useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      queryClient.setQueryData([...BOOTSTRAP_KEY], { authenticated: false });
    },
  });

  // ── Forgot password ──────────────────────────────
  const forgotPasswordMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => authApi.forgotPassword(email),
  });

  // ── Reset password ───────────────────────────────
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

  // ── Resend verification ──────────────────────────
  const resendVerificationMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => authApi.resendVerification(email),
  });

  // ── Save watchlist to cloud ──────────────────────
  const saveWatchlistMutation = useMutation({
    mutationFn: (watchlist: WatchlistItemDTO[]) => putWatchlist(watchlist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOOTSTRAP_KEY] });
    },
  });

  // ── Import guest watchlist ───────────────────────
  const importGuestMutation = useMutation({
    mutationFn: (watchlist: WatchlistItemDTO[]) => importGuestWatchlist(watchlist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOOTSTRAP_KEY] });
    },
  });

  // ── Import dialog state ──────────────────────────
  const importPromptDismissed = ref(false);

  const shouldShowImportPrompt = computed(() => {
    if (importPromptDismissed.value) return false;
    if (!isAuthenticated.value) return false;
    if (!isFirstLogin.value) return false;
    // Cloud watchlist must be empty
    if (cloudWatchlist.value.length > 0) return false;
    return true;
  });

  const dismissImportPrompt = () => {
    importPromptDismissed.value = true;
  };

  watch(
    () => profile.value?.email ?? null,
    () => {
      importPromptDismissed.value = false;
    },
    { immediate: true },
  );

  return {
    // Bootstrap
    bootstrap,
    isAuthenticated,
    profile,
    cloudWatchlist,
    isFirstLogin,

    // Mutations
    signUp: signUpMutation,
    signIn: signInMutation,
    signOut: signOutMutation,
    forgotPassword: forgotPasswordMutation,
    resetPassword: resetPasswordMutation,
    resendVerification: resendVerificationMutation,
    saveWatchlist: saveWatchlistMutation,
    importGuest: importGuestMutation,

    // Import dialog
    shouldShowImportPrompt,
    dismissImportPrompt,
  };
};
