import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: () => import("./pages/Home/HomePage.vue"),
  },
  {
    path: "/auth/sign-in",
    name: "AuthSignIn",
    component: () => import("./pages/auth/SignIn/SignInPage.vue"),
  },
  {
    path: "/auth/reset-password",
    name: "AuthResetPassword",
    component: () => import("./pages/auth/ResetPassword/ResetPasswordPage.vue"),
  },
  {
    path: "/auth/callback",
    name: "AuthCallback",
    component: () => import("./pages/auth/Callback/CallbackPage.vue"),
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
