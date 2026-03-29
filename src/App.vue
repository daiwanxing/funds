<script setup lang="ts">
import "vue-sonner/style.css";
import { Toaster } from "vue-sonner";
</script>

<template>
  <Toaster
    position="top-center"
    theme="dark"
    :duration="4000"
    :toast-options="{
      classes: {
        error: 'toast-error',
        success: 'toast-success',
      },
    }"
  />
  <router-view />
</template>

<style>
/* Align sonner toast colors with dashboard-colors tokens */
[data-sonner-toaster] [data-type='error'].toast-error {
  background: #1d2128 !important;
  border-color: rgba(255, 68, 58, 0.35) !important;
  color: rgba(255, 255, 255, 0.92) !important;
}
[data-sonner-toaster] [data-type='error'].toast-error [data-icon] svg {
  color: #ff443a !important;
}

[data-sonner-toaster] [data-type='success'].toast-success {
  background: #1d2128 !important;
  border-color: rgba(48, 209, 88, 0.35) !important;
  color: rgba(255, 255, 255, 0.92) !important;
}
[data-sonner-toaster] [data-type='success'].toast-success [data-icon] svg {
  color: #30d158 !important;
}
</style>
