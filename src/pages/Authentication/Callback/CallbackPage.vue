<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { CheckCircle, XCircle } from "lucide-vue-next";

const router = useRouter();

const status = ref<"loading" | "success" | "error">("loading");
const message = ref("");
const title = ref("验证中…");
const actionLabel = ref("前往登录");
const actionTarget = ref("/auth/sign-in");

onMounted(() => {
  // Parse the hash fragment for verification result
  const hash = window.location.hash;
  const [, hashQuery = ""] = hash.split("?");
  const query = new URLSearchParams(hashQuery);

  if (query.get("source") === "oauth" || query.get("reason") === "oauth_callback_failed") {
    const provider = query.get("provider");
    const redirectUrl = query.get("redirectUrl") ?? "/";
    const providerLabel =
      provider === "google" ? "Google" : provider === "github" ? "GitHub" : "第三方账号";

    if (query.get("status") === "success") {
      status.value = "success";
      title.value = "登录成功";
      message.value = `${providerLabel} 登录成功，正在为您跳转…`;
      actionLabel.value = "进入首页";
      actionTarget.value = redirectUrl;

      // 通知原 tab 刷新登录态并跳转
      try {
        const channel = new BroadcastChannel("auth-sync");
        channel.postMessage({ type: "login_success", redirectUrl });
        channel.close();
      } catch {
        // BroadcastChannel 不可用时降级
      }

      // 尝试关闭新 tab，给用户一点时间看到成功提示
      setTimeout(() => {
        window.close();
      }, 800);

      return;
    }

    status.value = "error";
    title.value = "登录失败";
    message.value = "第三方登录失败，请返回登录页后重试。";
    actionLabel.value = "前往登录";
    actionTarget.value = "/auth/sign-in";
    return;
  }

  if (hash.includes("error")) {
    status.value = "error";
    title.value = "验证失败";
    // Try to extract error description
    const params = new URLSearchParams(hash.replace(/^#\/?.*?\?/, "").replace(/^#/, ""));
    const errorDesc =
      params.get("error_description") ??
      params.get("error") ??
      "验证失败";
    message.value = decodeURIComponent(errorDesc);
  } else if (hash.includes("access_token") || hash.includes("type=signup")) {
    status.value = "success";
    title.value = "验证成功";
    message.value = "邮箱验证成功！您现在可以登录了。";
  } else {
    // Default: assume success if no error indicator
    status.value = "success";
    title.value = "验证成功";
    message.value = "邮箱验证成功！您现在可以登录了。";
  }
});

const goToSignIn = () => {
  router.push(actionTarget.value);
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div
          class="auth-icon"
          :class="{
            'auth-icon--success': status === 'success',
            'auth-icon--error': status === 'error',
          }"
        >
          <CheckCircle
            v-if="status === 'success'"
            :size="24"
          />
          <XCircle
            v-else-if="status === 'error'"
            :size="24"
          />
          <div
            v-else
            class="loader"
          />
        </div>
        <h1 class="auth-title">
          {{ title }}
        </h1>
        <p class="auth-subtitle">
          {{ message }}
        </p>
      </div>

      <button
        v-if="status !== 'loading'"
        type="button"
        class="auth-submit"
        @click="goToSignIn"
      >
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-0);
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-2);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}

.auth-header {
  margin-bottom: 24px;
}

.auth-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin-bottom: 16px;
}

.auth-icon--success {
  background: var(--success-soft-bg);
  color: var(--success-primary);
}

.auth-icon--error {
  background: var(--danger-soft-bg);
  color: var(--danger-primary);
}

.auth-title {
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.auth-subtitle {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
  line-height: 1.5;
}

.auth-submit {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: var(--accent-primary);
  color: #fff;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.auth-submit:hover {
  background: var(--accent-hover);
}

.loader {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-default);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
