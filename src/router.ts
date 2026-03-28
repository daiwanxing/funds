import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "HomePage",
    component: () => import("./pages/HomePage.vue"),
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
