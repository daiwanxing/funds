<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Mail, Lock, Eye, EyeOff, LoaderCircle } from "lucide-vue-next";
import AuthLayout from "@/layouts/AuthLayout.vue";
import { useToast } from "@/composables/useToast";
import { PASSWORD_RE } from "@/constants";

const { error: toastError } = useToast();

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const { signIn, signUp, forgotPassword, resendVerification, startOAuthSignIn } = auth;

// 兜底：bootstrap 缓存已是登录态时（守卫异步期间）立即跳回首页
watch(
  () => auth.isAuthenticated,
  (authenticated) => {
    if (authenticated) router.replace("/");
  },
  { immediate: true },
);

// ─── Mode toggle ─────────────────────────────────────────────────────────────
type AuthMode = "login" | "register" | "forgot";

const currentMode = computed<AuthMode>(() => {
  if (route.query.mode === "forgot") return "forgot";
  if (route.query.register === "1") return "register";
  return "login";
});

const slideDir = ref<"left" | "right">("left");

const goToLogin = () => {
  slideDir.value = "right";
  router.replace({ path: "/auth/sign-in" });
};
const goToRegister = () => {
  slideDir.value = "left";
  router.replace({ path: "/auth/sign-in", query: { register: "1" } });
};
const goToForgot = () => {
  slideDir.value = "left";
  router.replace({ path: "/auth/sign-in", query: { mode: "forgot" } });
};

// ─── Login state ─────────────────────────────────────────────────────────────
const loginEmail = ref("");
const loginPassword = ref("");
const showLoginPassword = ref(false);

const isLoginLoading = computed(() => signIn.isPending);
const isLoginValid = computed(
  () => loginEmail.value.trim() !== "" && loginPassword.value !== "",
);

const handleSignIn = async () => {
  try {
    await signIn.mutateAsync({
      email: loginEmail.value.trim(),
      password: loginPassword.value,
    });
    router.push("/");
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
    toastError(axiosError.response?.data?.error?.message ?? "登录失败，请稍后重试");
  }
};

// ─── Register state ───────────────────────────────────────────────────────────
const regEmail = ref("");
const regPassword = ref("");
const regConfirmPassword = ref("");
const showRegPassword = ref(false);
const regError = ref("");
const regSuccess = ref("");
const isRegistered = ref(false);

const isRegLoading = computed(() => signUp.isPending);

// 密码强度：至少 9 位，包含字母和数字
const isPasswordStrong = computed(() => PASSWORD_RE.test(regPassword.value));
const passwordWeak = computed(
  () => regPassword.value !== "" && !isPasswordStrong.value,
);

const isRegValid = computed(
  () =>
    regEmail.value.trim() !== "" &&
    isPasswordStrong.value &&
    regPassword.value === regConfirmPassword.value,
);
const passwordMismatch = computed(
  () =>
    regConfirmPassword.value !== "" &&
    regPassword.value !== regConfirmPassword.value,
);

const handleSignUp = async () => {
  regError.value = "";
  regSuccess.value = "";
  try {
    await signUp.mutateAsync({
      email: regEmail.value.trim(),
      password: regPassword.value,
    });
    regSuccess.value = "注册成功！请前往邮箱完成验证后再登录。";
    isRegistered.value = true;
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
    regError.value =
      axiosError.response?.data?.error?.message ?? "注册失败，请稍后重试";
  }
};

const handleResend = async () => {
  try {
    await resendVerification.mutateAsync({ email: regEmail.value.trim() });
    regSuccess.value = "验证邮件已重新发送，请检查您的邮箱。";
  } catch {
    regError.value = "重发失败，请稍后重试";
  }
};

// ─── Forgot password state ───────────────────────────────────────────────────
const forgotEmail = ref("");
const forgotError = ref("");
const forgotSuccess = ref("");

const isForgotLoading = computed(() => forgotPassword.isPending);
const isForgotValid = computed(() => forgotEmail.value.trim() !== "");

const handleForgotPassword = async () => {
  forgotError.value = "";
  forgotSuccess.value = "";
  try {
    const result = await forgotPassword.mutateAsync({ email: forgotEmail.value.trim() });
    forgotSuccess.value = result.message ?? "如果该邮箱已注册，您将收到重置密码邮件";
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
    forgotError.value =
      axiosError.response?.data?.error?.message ?? "发送失败，请稍后重试";
  }
};

const handleOAuthSignIn = (provider: "google" | "github") => {
  startOAuthSignIn(provider);
};

// Reset form state when switching modes
watch(currentMode, (_newMode, oldMode) => {
  if (oldMode === "register") {
    regEmail.value = "";
    regPassword.value = "";
    regConfirmPassword.value = "";
    isRegistered.value = false;
    showRegPassword.value = false;
    regError.value = "";
    regSuccess.value = "";
  }
  if (oldMode === "forgot") {
    forgotEmail.value = "";
    forgotError.value = "";
    forgotSuccess.value = "";
  }
});
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-[400px] bg-transparent py-10">
      <!-- Transition handles enter/exit of each panel -->
      <Transition
        :name="slideDir === 'left' ? 'slide-left' : 'slide-right'"
        mode="out-in"
      >
        <!-- ── Login form ─────────────────────────────── -->
        <div
          v-if="currentMode === 'login'"
          key="login"
        >
          <div class="text-center mb-8">
            <h1 class="font-sans text-xl font-600 text-p m-0 mb-2">
              登录 Funds Assistant
            </h1>
            <p class="font-sans text-[13px] text-t m-0">
              登录以开启云端同步
            </p>
          </div>


          <form
            class="flex flex-col gap-5"
            @submit.prevent="handleSignIn"
          >
            <div class="flex flex-col gap-1.5">
              <label
                for="sign-in-email"
                class="font-sans text-[13px] font-500 text-s"
              >邮箱</label>
              <div class="relative flex items-center">
                <Mail
                  :size="16"
                  class="absolute left-3 text-t pointer-events-none"
                />
                <input
                  id="sign-in-email"
                  v-model="loginEmail"
                  type="email"
                  placeholder="name@example.com"
                  autocomplete="email"
                  class="w-full h-10 py-0 pr-3 pl-9 border border-white/6 rounded-1.5 bg-white/2 text-p font-mono text-[13px] outline-none transition-[border-color,background] duration-200 placeholder:text-d focus:border-accent focus:bg-black/40"
                >
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label
                for="sign-in-password"
                class="font-sans text-[13px] font-500 text-s"
              >密码</label>
              <div class="relative flex items-center">
                <Lock
                  :size="16"
                  class="absolute left-3 text-t pointer-events-none"
                />
                <input
                  id="sign-in-password"
                  v-model="loginPassword"
                  :type="showLoginPassword ? 'text' : 'password'"
                  placeholder="输入密码"
                  autocomplete="current-password"
                  class="w-full h-10 py-0 pr-3 pl-9 border border-white/6 rounded-1.5 bg-white/2 text-p font-mono text-[13px] outline-none transition-[border-color,background] duration-200 placeholder:text-d focus:border-accent focus:bg-black/40"
                >
                <button
                  type="button"
                  class="absolute right-2 flex items-center justify-center w-7 h-7 border-none bg-transparent text-t cursor-pointer rounded transition-colors duration-200 hover:text-s"
                  @click="showLoginPassword = !showLoginPassword"
                >
                  <Eye
                    v-if="!showLoginPassword"
                    :size="16"
                  />
                  <EyeOff
                    v-else
                    :size="16"
                  />
                </button>
              </div>
            </div>

            <div class="flex justify-end -mt-2">
              <button
                type="button"
                class="font-sans text-[13px] text-accent no-underline transition-colors duration-200 hover:text-accent-hover bg-none border-none p-0 cursor-pointer"
                @click="goToForgot"
              >
                忘记密码？
              </button>
            </div>

            <button
              type="submit"
              class="w-full h-10 border-none rounded-lg bg-white text-[#0a0b0d] font-sans text-sm font-600 cursor-pointer tracking-[0.01em] transition-[background,opacity] duration-[180ms] enabled:hover:bg-white/88 enabled:active:bg-white/76 disabled:op-50 disabled:cursor-not-allowed flex items-center justify-center"
              :disabled="!isLoginValid || isLoginLoading"
            >
              <LoaderCircle
                v-if="isLoginLoading"
                :size="18"
                class="animate-spin"
              />
              <span v-else>登录</span>
            </button>
          </form>

          <!-- ── OAuth ─────────────────────────────── -->
          <div class="flex items-center gap-3 my-6">
            <div class="flex-1 h-px bg-white/8" />
            <span class="font-sans text-[11px] text-d tracking-widest select-none">或</span>
            <div class="flex-1 h-px bg-white/8" />
          </div>
          <div
            class="flex justify-center"
            :style="{ gap: '40px' }"
          >
            <button
              data-test="oauth-google"
              type="button"
              title="使用 Google 登录"
              class="oauth-icon-btn"
              @click="handleOAuthSignIn('google')"
            >
              <img
                src="/google-svgrepo-com.svg"
                alt="Google"
                class="w-5 h-5"
              >
            </button>
            <button
              data-test="oauth-github"
              type="button"
              title="使用 GitHub 登录"
              class="oauth-icon-btn"
              @click="handleOAuthSignIn('github')"
            >
              <img
                src="/github-svgrepo-com.svg"
                alt="GitHub"
                class="w-5 h-5"
              >
            </button>
          </div>

          <div class="text-center mt-6">
            <span class="font-sans text-[13px] text-t mr-1">还没有账号？</span>
            <button
              type="button"
              class="font-sans text-[13px] text-accent no-underline transition-colors duration-200 hover:text-accent-hover bg-none border-none p-0 cursor-pointer"
              @click="goToRegister"
            >
              注册
            </button>
          </div>
        </div>

        <!-- ── Register form ──────────────────────────── -->
        <div
          v-else-if="currentMode === 'register'"
          key="register"
        >
          <div class="text-center mb-8">
            <h1 class="font-sans text-xl font-600 text-p m-0 mb-2">
              注册 Funds Assistant
            </h1>
            <p class="font-sans text-[13px] text-t m-0">
              创建账号以开启云端同步
            </p>
          </div>


          <template v-if="!isRegistered">
            <form
              class="flex flex-col gap-5"
              @submit.prevent="handleSignUp"
            >
              <div class="flex flex-col gap-1.5">
                <label
                  for="sign-up-email"
                  class="font-sans text-[13px] font-500 text-s"
                >邮箱</label>
                <div class="relative flex items-center">
                  <Mail
                    :size="16"
                    class="absolute left-3 text-t pointer-events-none"
                  />
                  <input
                    id="sign-up-email"
                    v-model="regEmail"
                    type="email"
                    placeholder="name@example.com"
                    autocomplete="email"
                    class="w-full h-10 py-0 pr-3 pl-9 border border-white/6 rounded-1.5 bg-white/2 text-p font-mono text-[13px] outline-none transition-[border-color,background] duration-200 placeholder:text-d focus:border-accent focus:bg-black/40"
                  >
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <label
                  for="sign-up-password"
                  class="font-sans text-[13px] font-500 text-s"
                >密码</label>
                <div class="relative flex items-center">
                  <Lock
                    :size="16"
                    class="absolute left-3 text-t pointer-events-none"
                  />
                  <input
                    id="sign-up-password"
                    v-model="regPassword"
                    :type="showRegPassword ? 'text' : 'password'"
                    placeholder="至少 9 位，含字母和数字"
                    autocomplete="new-password"
                    class="w-full h-10 py-0 pr-3 pl-9 border rounded-1.5 bg-white/2 text-p font-mono text-[13px] outline-none transition-[border-color,background] duration-200 placeholder:text-d focus:border-accent focus:bg-black/40"
                    :class="[passwordWeak ? '!border-danger' : 'border-white/6']"
                  >
                  <button
                    type="button"
                    class="absolute right-2 flex items-center justify-center w-7 h-7 border-none bg-transparent text-t cursor-pointer rounded transition-colors duration-200 hover:text-s"
                    @click="showRegPassword = !showRegPassword"
                  >
                    <Eye
                      v-if="!showRegPassword"
                      :size="16"
                    />
                    <EyeOff
                      v-else
                      :size="16"
                    />
                  </button>
                </div>
                <span
                  v-if="passwordWeak"
                  class="font-sans text-xs text-warning"
                >
                  密码需至少 9 位，且同时包含字母和数字
                </span>
              </div>

              <div class="flex flex-col gap-1.5">
                <label
                  for="sign-up-confirm"
                  class="font-sans text-[13px] font-500 text-s"
                >确认密码</label>
                <div class="relative flex items-center">
                  <Lock
                    :size="16"
                    class="absolute left-3 text-t pointer-events-none"
                  />
                  <input
                    id="sign-up-confirm"
                    v-model="regConfirmPassword"
                    :type="showRegPassword ? 'text' : 'password'"
                    placeholder="再次输入密码"
                    autocomplete="new-password"
                    class="w-full h-10 py-0 pr-3 pl-9 border rounded-1.5 bg-white/2 text-p font-mono text-[13px] outline-none transition-[border-color,background] duration-200 placeholder:text-d focus:border-accent focus:bg-black/40"
                    :class="[passwordMismatch ? '!border-danger' : 'border-white/6']"
                  >
                </div>
                <span
                  v-if="passwordMismatch"
                  class="font-sans text-xs text-danger"
                >
                  两次输入的密码不一致
                </span>
              </div>

              <button
                type="submit"
                class="w-full h-10 border-none rounded-lg bg-white text-[#0a0b0d] font-sans text-sm font-600 cursor-pointer tracking-[0.01em] transition-[background,opacity] duration-[180ms] enabled:hover:bg-white/88 enabled:active:bg-white/76 disabled:op-50 disabled:cursor-not-allowed flex items-center justify-center"
                :disabled="!isRegValid || isRegLoading"
              >
                <LoaderCircle
                  v-if="isRegLoading"
                  :size="18"
                  class="animate-spin"
                />
                <span v-else>注册</span>
              </button>
            </form>
          </template>

          <template v-else>
            <div class="flex flex-col gap-4">
              <div class="py-2.5 px-3.5 rounded-lg bg-fall/14 text-fall text-[13px] font-sans border border-fall/20">
                注册成功！请前往邮箱完成验证后再登录。
              </div>
              <button
                type="button"
                class="w-full h-10 border border-white/6 rounded-lg bg-bg-2 text-s font-sans text-sm font-500 cursor-pointer transition-[background,border-color] duration-200 enabled:hover:bg-bg-3 enabled:hover:border-white/10 disabled:op-50 disabled:cursor-not-allowed"
                :disabled="resendVerification.isPending"
                @click="handleResend"
              >
                {{ resendVerification.isPending ? "发送中…" : "重新发送验证邮件" }}
              </button>
              <button
                type="button"
                class="block text-center font-sans text-[13px] text-accent no-underline transition-colors duration-200 hover:text-accent-hover bg-none border-none p-0 cursor-pointer"
                @click="goToLogin"
              >
                前往登录
              </button>
            </div>
          </template>

          <!-- ── OAuth ─────────────────────────────── -->
          <div class="flex items-center gap-3 my-6">
            <div class="flex-1 h-px bg-white/8" />
            <span class="font-sans text-[11px] text-d tracking-widest select-none">或</span>
            <div class="flex-1 h-px bg-white/8" />
          </div>
          <div class="flex justify-center gap-5">
            <button
              data-test="oauth-google"
              type="button"
              title="使用 Google 注册"
              class="oauth-icon-btn"
              @click="handleOAuthSignIn('google')"
            >
              <img
                src="/google-svgrepo-com.svg"
                alt="Google"
                class="w-5 h-5"
              >
            </button>
            <button
              data-test="oauth-github"
              type="button"
              title="使用 GitHub 注册"
              class="oauth-icon-btn"
              @click="handleOAuthSignIn('github')"
            >
              <img
                src="/github-svgrepo-com.svg"
                alt="GitHub"
                class="w-5 h-5"
              >
            </button>
          </div>

          <div class="text-center mt-6">
            <span class="font-sans text-[13px] text-t mr-1">已有账号？</span>
            <button
              type="button"
              class="font-sans text-[13px] text-accent no-underline transition-colors duration-200 hover:text-accent-hover bg-none border-none p-0 cursor-pointer"
              @click="goToLogin"
            >
              登录
            </button>
          </div>
        </div>

        <!-- ── Forgot password form ───────────────────── -->
        <div
          v-else-if="currentMode === 'forgot'"
          key="forgot"
        >
          <div class="text-center mb-8">
            <h1 class="font-sans text-xl font-600 text-p m-0 mb-2">
              找回密码
            </h1>
            <p class="font-sans text-[13px] text-t m-0">
              输入注册邮箱，我们将发送重置链接
            </p>
          </div>

          <form
            class="flex flex-col gap-5"
            @submit.prevent="handleForgotPassword"
          >
            <div
              v-if="forgotError"
              class="py-2.5 px-3.5 rounded-lg bg-danger/14 text-danger text-[13px] font-sans border border-danger/20"
            >
              {{ forgotError }}
            </div>

            <div
              v-if="forgotSuccess"
              class="py-2.5 px-3.5 rounded-lg bg-fall/14 text-fall text-[13px] font-sans border border-fall/20"
            >
              {{ forgotSuccess }}
            </div>

            <div class="flex flex-col gap-1.5">
              <label
                for="forgot-email"
                class="font-sans text-[13px] font-500 text-s"
              >邮箱</label>
              <div class="relative flex items-center">
                <Mail
                  :size="16"
                  class="absolute left-3 text-t pointer-events-none"
                />
                <input
                  id="forgot-email"
                  v-model="forgotEmail"
                  type="email"
                  placeholder="name@example.com"
                  autocomplete="email"
                  class="w-full h-10 py-0 pr-3 pl-9 border border-white/6 rounded-1.5 bg-white/2 text-p font-mono text-[13px] outline-none transition-[border-color,background] duration-200 placeholder:text-d focus:border-accent focus:bg-black/40"
                >
              </div>
            </div>

            <button
              type="submit"
              class="w-full h-10 border-none rounded-lg bg-white text-[#0a0b0d] font-sans text-sm font-600 cursor-pointer tracking-[0.01em] transition-[background,opacity] duration-[180ms] enabled:hover:bg-white/88 enabled:active:bg-white/76 disabled:op-35 disabled:cursor-not-allowed flex items-center justify-center"
              :disabled="!isForgotValid || isForgotLoading"
            >
              <LoaderCircle
                v-if="isForgotLoading"
                :size="18"
                class="animate-spin"
              />
              <span v-else>发送重置链接</span>
            </button>
          </form>

          <div class="text-center mt-6 pt-5 border-t border-white/6 border-x-0 border-b-0">
            <button
              type="button"
              class="font-sans text-[13px] text-accent no-underline transition-colors duration-200 hover:text-accent-hover bg-none border-none p-0 cursor-pointer"
              @click="goToLogin"
            >
              返回登录
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </AuthLayout>
</template>

<style scoped>
/* ── Vue Transition animation classes (cannot be replaced by UnoCSS) ── */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.26s ease, transform 0.26s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(28px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-28px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-28px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(28px);
}

/* ── OAuth icon buttons ───────────────────────── */
.oauth-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
}
</style>
