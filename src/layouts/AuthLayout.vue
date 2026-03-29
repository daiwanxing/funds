<script setup lang="ts">
import BrandLogo from "@/components/BrandLogo.vue";
import Globe from "@/pages/Authentication/components/Globe/Globe.vue";
import { useAuthGlobeMarkets } from "@/pages/Authentication/composables/useAuthGlobeMarkets";

const authGlobeMarkets = useAuthGlobeMarkets();
</script>

<template>
  <div class="min-h-screen flex flex-col bg-bg-0 text-p font-sans overflow-hidden">
    <!-- 极简 Logo 浮动区 -->
    <header class="absolute top-0 left-0 w-full h-20 flex items-center px-8 bg-transparent z-10 pointer-events-none">
      <div class="flex items-center gap-3 pointer-events-auto">
        <BrandLogo
          class="text-p"
          :size="34"
        />
        <span class="font-sans font-700 text-[18px] tracking-[-0.5px] text-p">Funds Assistant</span>
      </div>
    </header>

    <!-- 主体两栏布局 -->
    <main class="flex-1 flex relative">
      <!-- 左侧：3D 地球展示区 -->
      <section class="hidden md:flex flex-[6] relative bg-[radial-gradient(circle_at_center,var(--bg-1)_0%,var(--bg-0)_100%)] items-center justify-center border-r border-white/6 overflow-hidden">
        <div class="relative w-full h-full flex items-center justify-center">
          <div class="absolute top-[116px] left-[92px] z-1 w-[min(56%,420px)] text-left">
            <h2 class="m-0 text-p font-sans text-[38px] font-700 leading-[1.04] tracking-[-0.03em]">
              See Markets First
            </h2>
            <p class="mt-[18px] text-s font-sans text-sm leading-[1.6]">
              聚合全球主要市场信号，助您建立更清晰的基金决策依据。
            </p>
          </div>

          <div class="w-[min(68%,544px)] aspect-square op-96 mt-[136px] ml-6">
            <Globe :items="authGlobeMarkets.items.value" />
          </div>
        </div>
      </section>

      <!-- 右侧：表单区 -->
      <section class="flex-[4] flex items-center justify-center p-8 bg-transparent relative">
        <div class="w-full max-w-[400px] relative z-1">
          <slot />
        </div>
      </section>
    </main>
  </div>
</template>
