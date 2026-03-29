<script setup lang="ts">
import { Globe as GlobeIcon, ArrowLeft } from "lucide-vue-next";
import Globe from "@/components/ui/Globe.vue";
</script>

<template>
  <div class="auth-layout">
    <!-- 顶部状态栏 -->
    <header class="auth-header">
      <div class="header-left">
        <div class="logo-group">
          <GlobeIcon
            class="logo-icon"
            :size="20"
          />
          <span class="logo-text">FundStation</span>
          <div class="sys-status">
            <span class="pulse-dot" />
            SYS: ONLINE
          </div>
        </div>
      </div>
      
      <div class="header-center">
        <span class="terminal-text">&gt;_ LATENCY: {{ Math.floor(Math.random() * 20 + 10) }}ms</span>
      </div>

      <div class="header-right">
        <router-link
          to="/"
          class="guest-link"
        >
          <ArrowLeft
            :size="16"
          />
          <span class="guest-link-text">返回大厅</span>
        </router-link>
      </div>
    </header>

    <!-- 主体两栏布局 -->
    <main class="auth-main">
      <!-- 左侧：3D 地球展示区 -->
      <section class="auth-hero hidden md:flex">
        <div class="hero-content">
          <div class="globe-wrapper">
            <Globe />
          </div>
          
          <!-- 悬浮微标数据，增加金融感 -->
          <div class="floating-stat stat-1">
            <span class="stat-name">S&P 500</span>
            <span class="stat-val up">+1.24% ⬆</span>
          </div>
          <div class="floating-stat stat-2">
            <span class="stat-name">NASDAQ</span>
            <span class="stat-val up">+0.82% ⬆</span>
          </div>
          <div class="floating-stat stat-3">
            <span class="stat-name">SH COMP</span>
            <span class="stat-val down">-0.45% ⬇</span>
          </div>
        </div>
      </section>

      <!-- 右侧：表单区 -->
      <section class="auth-form-area">
        <div class="form-container">
          <slot />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-0);
  color: var(--text-primary);
  font-family: var(--font-sans);
  overflow: hidden;
}

/* 顶部状态栏 */
.auth-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-subtle);
  background-color: var(--bg-1);
  flex-shrink: 0;
  z-index: 10;
}

.header-left, .header-center, .header-right {
  display: flex;
  align-items: center;
}

.header-left {
  flex: 1;
}

.header-center {
  flex: 1;
  justify-content: center;
  display: none;
}

@media (min-width: 768px) {
  .header-center {
    display: flex;
  }
}

.header-right {
  flex: 1;
  justify-content: flex-end;
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: var(--accent-primary);
}

.logo-text {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.5px;
}

.sys-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-tertiary);
  margin-left: 12px;
  padding: 4px 8px;
  background: var(--bg-2);
  border-radius: 4px;
  border: 1px solid var(--border-default);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); box-shadow: 0 0 12px rgba(16, 185, 129, 0.8); }
  100% { opacity: 1; transform: scale(1); }
}

.terminal-text {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-tertiary);
  opacity: 0.7;
}

.guest-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}

.guest-link:hover {
  background-color: var(--bg-2);
  color: var(--text-primary);
}

/* 主体内容区 */
.auth-main {
  flex: 1;
  display: flex;
  position: relative;
}

/* 左侧地球区 */
.auth-hero {
  flex: 6;
  position: relative;
  background: radial-gradient(circle at center, var(--bg-1) 0%, var(--bg-0) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--border-subtle);
  overflow: hidden;
}

.hero-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.globe-wrapper {
  width: 80%;
  max-width: 600px;
  aspect-ratio: 1;
  opacity: 0.9;
}

/* 浮动统计数据 */
.floating-stat {
  position: absolute;
  background: rgba(18, 18, 19, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 14px;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  animation: float 6s ease-in-out infinite;
}

.stat-name {
  color: var(--text-secondary);
}

.stat-val {
  font-weight: 600;
}

.stat-val.up { color: var(--up-color); }
.stat-val.down { color: var(--down-color); }

.stat-1 { top: 20%; left: 15%; animation-delay: 0s; }
.stat-2 { bottom: 30%; left: 10%; animation-delay: 2s; }
.stat-3 { bottom: 15%; right: 15%; animation-delay: 4s; }

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

/* 右侧表单区 */
.auth-form-area {
  flex: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: var(--bg-0);
  position: relative;
}

/* 为右侧增加一些科幻感背景光晕 */
.auth-form-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 0% 50%, rgba(47, 129, 247, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.form-container {
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
}

@media (min-width: 768px) {
  .hidden\.md\:flex {
    display: flex;
  }
}
</style>
