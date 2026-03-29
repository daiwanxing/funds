<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import createGlobe from 'cobe';

defineOptions({
  name: 'UiGlobe',
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const pointerInteracting = ref<number | null>(null);
const pointerInteractionMovement = ref(0);
let phi = 0;

type GlobeInstance = ReturnType<typeof createGlobe>;
type GlobeRenderState = {
  phi: number;
  width: number;
  height: number;
};

let globe: GlobeInstance | null = null;
let observer: ResizeObserver | null = null;

onMounted(() => {
  if (!canvasRef.value) return;

  let currentWidth = 0;
  const updateSize = () => {
    if (canvasRef.value) {
      currentWidth = canvasRef.value.offsetWidth;
    }
  };
  
  updateSize();
  // 使用 ResizeObserver 监听宽度变化
  observer = new ResizeObserver(() => updateSize());
  observer.observe(canvasRef.value);

  const globeOptions = {
    devicePixelRatio: 2,
    width: currentWidth * 2 || 1000,
    height: currentWidth * 2 || 1000,
    phi: 0,
    theta: 0.3,
    dark: 1, // 暗黑模式
    diffuse: 1.2,
    mapSamples: 24000, // 增加采样点让陆地更清晰
    mapBrightness: 3, // 稍微降低亮度防止溢出
    baseColor: [1, 1, 1], // 修改为纯白，在 dark:1 下呈现为发亮的点
    markerColor: [0.1, 0.8, 1], // 彭博蓝标记点
    glowColor: [0.1, 0.1, 0.15], // 非常微弱的蓝黑色外晕，取代原来的纯白巨大光环
    markers: [
      { location: [37.7595, -122.4367], size: 0.03 }, // San Francisco
      { location: [40.7128, -74.0060], size: 0.05 }, // New York
      { location: [51.5074, -0.1278], size: 0.05 }, // London
      { location: [31.2304, 121.4737], size: 0.05 }, // Shanghai
      { location: [35.6762, 139.6503], size: 0.05 }, // Tokyo
      { location: [22.3193, 114.1694], size: 0.05 }, // Hong Kong
    ],
    onRender: (state: GlobeRenderState) => {
      if (!pointerInteracting.value) {
        phi += 0.003;
      }
      state.phi = phi + pointerInteractionMovement.value;
      const w = currentWidth * 2 || 1000;
      state.width = w;
      state.height = w;
    },
  } as Parameters<typeof createGlobe>[1] & {
    onRender: (state: GlobeRenderState) => void;
  };

  globe = createGlobe(canvasRef.value, globeOptions);
});

onUnmounted(() => {
  globe?.destroy();
  if (canvasRef.value && observer) {
    observer.unobserve(canvasRef.value);
  }
  observer = null;
  globe = null;
});

const handlePointerDown = (e: PointerEvent) => {
  pointerInteracting.value = e.clientX;
  canvasRef.value!.style.cursor = 'grabbing';
};

const handlePointerUp = () => {
  pointerInteracting.value = null;
  canvasRef.value!.style.cursor = 'grab';
};

const handlePointerOut = () => {
  pointerInteracting.value = null;
  canvasRef.value!.style.cursor = 'grab';
};

const handlePointerMove = (e: PointerEvent) => {
  if (pointerInteracting.value !== null) {
    const delta = e.clientX - pointerInteracting.value;
    pointerInteractionMovement.value = delta * 0.01;
  }
};
</script>

<template>
  <div class="globe-container">
    <canvas
      ref="canvasRef"
      class="globe-canvas"
      @pointerdown="handlePointerDown"
      @pointerup="handlePointerUp"
      @pointerout="handlePointerOut"
      @pointermove="handlePointerMove"
    />
  </div>
</template>

<style scoped>
.globe-container {
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.globe-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
  contain: layout paint size;
  opacity: 0;
  animation: fadeIn 1.5s ease 0.5s forwards;
}

.globe-canvas:active {
  cursor: grabbing;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
