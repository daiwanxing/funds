import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: () => import("./pages/Dashboard/HomePage.vue"),
  },
  {
    path: "/auth/sign-in",
    name: "AuthSignIn",
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

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
