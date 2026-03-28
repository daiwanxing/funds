import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { VueQueryPlugin } from "@tanstack/vue-query";
import "@unocss/reset/tailwind.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "@/styles/tokens.css";
import "virtual:uno.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ElementPlus, { size: "small" });
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  },
});
app.mount("#app");
