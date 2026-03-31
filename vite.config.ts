import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import { fileURLToPath, URL } from "node:url";
import { resolveViteDevServer } from "./src/dev/viteServer";

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    ...resolveViteDevServer(),
    proxy: {
      "/api/fund": {
        target: "https://fundmobapi.eastmoney.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fund/, ""),
      },
      "/api/fundgz": {
        target: "https://fundgz.1234567.com.cn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fundgz/, ""),
      },
      "/api/search": {
        target: "https://fundsuggest.eastmoney.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/search/, ""),
      },
      "/api/index": {
        target: "https://push2delay.eastmoney.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/index/, ""),
      },
      "/api/kline": {
        target: "https://push2his.eastmoney.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kline/, ""),
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
