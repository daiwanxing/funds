import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "@/styles/tokens.css";
import "virtual:uno.css";

const app = createApp(App);
app.use(router);
app.use(ElementPlus, { size: "small" });
app.mount("#app");
