<script setup lang="ts">
import { computed, onMounted, onUnmounted, useTemplateRef } from "vue";
import createGlobe, { type COBEOptions, type Globe as CobeGlobe, type Marker } from "cobe";
import type { GlobeMarketItem } from "@/types/globe";

const props = defineProps<{
  items: GlobeMarketItem[];
}>();

defineOptions({
  name: "UiGlobe",
});

const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef");
const overlayRef = useTemplateRef<HTMLDivElement>("overlayRef");

const DEVICE_PIXEL_RATIO = typeof window !== "undefined"
  ? Math.min(window.devicePixelRatio || 1, 1.5)
  : 1.5;
const INITIAL_PHI = 2.48;
const INITIAL_THETA = 0.28;
const ROTATION_SPEED = 0.0022;
const SCALE = 0.98;
const OFFSET: [number, number] = [0, 8];
const MARKER_ELEVATION = 0.04;
const ACCENT_RGB: [number, number, number] = [0.184, 0.506, 0.969];

const markers = computed<Marker[]>(() =>
  props.items.map((item) => ({
    id: item.id,
    location: item.location,
    size: item.size ?? 0.068,
  })),
);

let globe: CobeGlobe | null = null;
let observer: ResizeObserver | null = null;
let animationFrameId = 0;
let currentWidth = 0;
let currentPhi = INITIAL_PHI;
const labelElements: Record<string, HTMLDivElement | null> = {};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const locationToVector = ([latitude, longitude]: [number, number]) => {
  const lat = (latitude * Math.PI) / 180;
  const lng = (longitude * Math.PI) / 180 - Math.PI;
  const radius = Math.cos(lat);

  return [
    -radius * Math.cos(lng),
    Math.sin(lat),
    radius * Math.sin(lng),
  ] as const;
};

const projectLocation = (location: [number, number], width: number, phi: number) => {
  const [x, y, z] = locationToVector(location);
  const cosTheta = Math.cos(INITIAL_THETA);
  const cosPhi = Math.cos(phi);
  const sinTheta = Math.sin(INITIAL_THETA);
  const sinPhi = Math.sin(phi);
  const projectedX = cosPhi * x + sinPhi * z;
  const projectedY = sinPhi * sinTheta * x + cosTheta * y - cosPhi * sinTheta * z;
  const visible =
    -sinPhi * cosTheta * x + sinTheta * y + cosPhi * cosTheta * z >= 0 ||
    projectedX * projectedX + projectedY * projectedY >= 0.64;

  const normalizedX = (projectedX * SCALE + (OFFSET[0] / Math.max(width, 1)) + 1) / 2;
  const normalizedY = (-projectedY * SCALE + (OFFSET[1] / Math.max(width, 1)) + 1) / 2;

  return {
    x: clamp(normalizedX, 0.08, 0.92),
    y: clamp(normalizedY, 0.08, 0.92),
    visible,
    side: normalizedX >= 0.5 ? "right" : "left",
  } as const;
};

const updateProjectedLabels = () => {
  if (currentWidth <= 0) return;

  for (const item of props.items) {
    const element = labelElements[item.id]
      ?? overlayRef.value?.querySelector<HTMLDivElement>(`[data-market-id="${item.id}"]`)
      ?? null;

    if (element) {
      labelElements[item.id] = element;
    }

    if (!element) continue;

    const projected = projectLocation(item.location, currentWidth, currentPhi);
    element.style.left = `${(projected.x * 100).toFixed(2)}%`;
    element.style.top = `${(projected.y * 100).toFixed(2)}%`;
    element.style.opacity = projected.visible ? "1" : "0";
    element.style.visibility = projected.visible ? "visible" : "hidden";
    element.dataset.side = projected.side;
  }
};

const updateSize = () => {
  if (!canvasRef.value) return;
  currentWidth = canvasRef.value.offsetWidth;
};

onMounted(() => {
  if (!canvasRef.value) return;

  updateSize();
  updateProjectedLabels();

  const globeOptions = {
    devicePixelRatio: DEVICE_PIXEL_RATIO,
    width: currentWidth * DEVICE_PIXEL_RATIO || 1000,
    height: currentWidth * DEVICE_PIXEL_RATIO || 1000,
    phi: currentPhi,
    theta: INITIAL_THETA,
    dark: 1,
    diffuse: 1.15,
    mapSamples: 16000,
    mapBrightness: 6,
    mapBaseBrightness: 0,
    baseColor: [1, 1, 1],
    markerColor: ACCENT_RGB,
    glowColor: [0.08, 0.09, 0.11],
    markerElevation: MARKER_ELEVATION,
    scale: SCALE,
    offset: OFFSET,
    markers: markers.value,
  } satisfies COBEOptions;

  globe = createGlobe(canvasRef.value, globeOptions);

  observer = new ResizeObserver(() => {
    updateSize();
    globe?.update({
      width: currentWidth * DEVICE_PIXEL_RATIO,
      height: currentWidth * DEVICE_PIXEL_RATIO,
    });
    updateProjectedLabels();
  });
  observer.observe(canvasRef.value);

  const animate = () => {
    if (!globe) return;

    currentPhi += ROTATION_SPEED;
    globe.update({
      phi: currentPhi,
      theta: INITIAL_THETA,
    });
    updateProjectedLabels();
    animationFrameId = window.requestAnimationFrame(animate);
  };

  animationFrameId = window.requestAnimationFrame(animate);
});

onUnmounted(() => {
  window.cancelAnimationFrame(animationFrameId);
  globe?.destroy();
  observer?.disconnect();
  observer = null;
  globe = null;
});
</script>

<template>
  <div class="globe-container">
    <canvas
      ref="canvasRef"
      class="globe-canvas"
    />

    <div
      ref="overlayRef"
      class="globe-overlay"
    >
      <div
        v-for="item in items"
        :key="item.id"
        :data-market-id="item.id"
        class="market-label"
        :class="`market-label--${item.tone}`"
        :style="{
          '--badge-offset-x': `${item.labelOffset?.[0] ?? 0}px`,
          '--badge-offset-y': `${item.labelOffset?.[1] ?? 0}px`,
        }"
      >
        <div class="market-badge">
          <span class="market-badge-name">{{ item.label }}</span>
          <span class="market-badge-change">{{ item.change }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.globe-container {
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  max-width: 560px;
  margin: 0 auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.globe-canvas {
  width: 100%;
  height: 100%;
  contain: layout paint size;
  opacity: 0;
  filter: drop-shadow(0 24px 48px rgba(0, 0, 0, 0.45));
  animation: fade-in 1.4s ease 0.2s forwards;
}

.globe-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.market-label {
  position: absolute;
  display: inline-flex;
  flex-direction: column;
  transform: translate(
    calc(-50% + var(--badge-offset-x, 0px)),
    calc(-50% + var(--badge-offset-y, 0px))
  );
  transition: opacity 260ms ease, visibility 260ms ease, top 260ms ease, left 260ms ease;
  will-change: top, left, opacity;
}

.market-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  background: rgba(17, 19, 24, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.market-badge-name,
.market-badge-change {
  font-family: var(--font-mono);
  white-space: nowrap;
}

.market-badge-name {
  color: rgba(255, 255, 255, 0.94);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.market-badge-change {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.market-label--up .market-badge-change {
  color: var(--rise-primary);
}

.market-label--down .market-badge-change {
  color: var(--fall-primary);
}

.market-label--flat .market-badge-change {
  color: var(--text-secondary);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
