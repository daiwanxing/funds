import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: () => import("./pages/HomePage.vue"),
  },
  {
    path: "/auth/sign-in",
    name: "AuthSignIn",
    component: () => import("./pages/auth/AuthSignInPage.vue"),
  },
  {
    path: "/auth/sign-up",
    name: "AuthSignUp",
    component: () => import("./pages/auth/AuthSignUpPage.vue"),
  },
  {
    path: "/auth/forgot-password",
    name: "AuthForgotPassword",
    component: () => import("./pages/auth/AuthForgotPasswordPage.vue"),
  },
  {
    path: "/auth/reset-password",
    name: "AuthResetPassword",
    component: () => import("./pages/auth/AuthResetPasswordPage.vue"),
  },
  {
    path: "/auth/callback",
    name: "AuthCallback",
    component: () => import("./pages/auth/AuthCallbackPage.vue"),
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
