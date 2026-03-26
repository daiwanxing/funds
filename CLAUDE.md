# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

"自选基金助手" — 一个 Chrome/Edge 浏览器扩展插件，用于实时查看自选基金的估值涨跌幅、收益等信息。基于 Manifest V2 构建。

## 常用命令

```bash
npm i                # 安装依赖
npm run watch:dev    # 开发调试（HMR 热重载），生成 dist/ 后在浏览器加载"已解压的扩展程序"
npm run build        # 生产构建，输出到 dist/
npm run build-zip    # 将 dist/ 打包为 dist-zip/{name}-v{version}.zip
npm run prettier:write  # 格式化 src/ 下的 js/vue 文件
```

没有测试框架和 lint 命令。

## 架构

这是一个 Vue 2 + Webpack 4 的 Chrome 扩展项目，使用 [vue-web-extension](https://github.com/Kocal/vue-web-extension/tree/v1) 模板。

### Webpack 入口（webpack.config.js）

三个入口点，构建输出到 `dist/`：

- `src/background.js` — 扩展 background script，负责角标（badge）更新、定时轮询基金数据、节假日/休市判断、右键菜单、消息监听
- `src/popup/popup.js` → `popup/App.vue` — 弹窗主界面，基金列表展示、编辑、排序、分组、搜索等核心交互
- `src/options/options.js` → `options/App.vue` — 设置页面，主题切换、角标配置、导入导出、账号同步等

### 共享组件（src/common/）

- `charts.vue` / `charts2.vue` — ECharts 图表（估值走势、净值走势等）
- `fundDetail.vue` / `fundInfo.vue` — 基金详情与基本信息
- `indDetail.vue` — 指数详情
- `market.vue` / `marketBar.vue` / `marketLine.vue` / `marketN2S.vue` / `marketS2N.vue` — 行情中心（大盘资金、行业板块、北向/南向资金）
- `positionDetail.vue` — 持仓明细
- `managerDetail.vue` — 基金经理信息
- `configBox.vue` — 配置导入导出
- `js/customed.js` / `js/dark.js` — ECharts 自定义主题（标准/暗色）

### 关键技术栈

- Vue 2 + Element UI（按需引入）
- ECharts 4 图表
- axios 请求
- chrome.storage.sync 存储用户数据
- chrome.browserAction API 控制角标

### 数据来源

基金和指数数据主要来自东方财富（eastmoney.com）API。`background.js` 中通过定时轮询获取实时数据并更新角标。

### 消息通信

popup/options 页面通过 `chrome.runtime.sendMessage` 与 background script 通信，消息类型包括：`DuringDate`（查询是否交易时间）、`refresh`（刷新数据）、`refreshBadge`（更新角标）、`refreshOption`（更新设置）等。

## 注意事项

- `src/manifest.json` 中 version 字段为 null，构建时由 webpack 从 package.json 读取版本号注入
- `holiday.json` 存放节假日数据，用于判断休市状态
- `docs/` 目录是项目文档站的构建产物，不要修改
