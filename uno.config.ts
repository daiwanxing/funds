import {
  defineConfig,
  presetWind3,
  presetIcons,
  transformerVariantGroup,
  transformerDirectives,
} from "unocss";

export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons({
      scale: 1.2,
      cdn: "https://esm.sh/",
    }),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
  shortcuts: {
    "text-up": "text-[#F56C6C]",
    "text-down": "text-[#4eb61b]",
    btn: "inline-block cursor-pointer px-2 py-1.5 rounded border border-gray-300 text-sm",
    "btn-primary": "btn border-blue-400 text-blue-400",
  },
});
