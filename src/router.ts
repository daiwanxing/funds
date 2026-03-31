import { createRouter, createWebHashHistory } from "vue-router";
import { fetchBootstrap } from "@/api/user";

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: () => import("./pages/Dashboard/HomePage.vue"),
  },
  {
    path: "/auth/sign-in",
    name: "AuthSignIn",
    meta: { guestOnly: true },
    component: () => import("./pages/Authentication/SignIn/SignInPage.vue"),
  },
  {
    path: "/auth/reset-password",
    name: "AuthResetPassword",
    component: () => import("./pages/Authentication/ResetPassword/ResetPasswordPage.vue"),
  },
  {
    path: "/auth/callback",
    name: "AuthCallback",
    component: () => import("./pages/Authentication/Callback/CallbackPage.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

/**
 * 如果已登录用户试图访问 guestOnly 页面（登录/注册），
 * 直接重定向回首页，不渲染认证组件。
 */
router.beforeEach(async (to) => {
  if (!to.meta.guestOnly) return true;

  try {
    const res = await fetchBootstrap();
    if (res.authenticated) {
      return { name: "HomePage", replace: true };
    }
  } catch {
    // 网络异常或未登录时放行，让页面本身处理
  }

  return true;
});

export default router;
