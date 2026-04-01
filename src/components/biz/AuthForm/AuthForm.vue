<script setup lang="ts">
import { ref, watch, useTemplateRef } from "vue";
import { LoginPanel } from "./LoginPanel";
import { RegisterPanel } from "./RegisterPanel";
import { ForgotPanel } from "./ForgotPanel";

const emit = defineEmits<{
  /** 登录成功后触发 */
  success: [];
}>();

// Mode
type AuthMode = "login" | "register" | "forgot";

const currentMode = ref<AuthMode>("login");
const slideDir = ref<"left" | "right">("left");

const goToLogin = () => {
  slideDir.value = "right";
  currentMode.value = "login";
};
const goToRegister = () => {
  slideDir.value = "left";
  currentMode.value = "register";
};
const goToForgot = () => {
  slideDir.value = "left";
  currentMode.value = "forgot";
};

// Child refs (for reset)
const registerRef = useTemplateRef<InstanceType<typeof RegisterPanel>>("registerPanel");
const forgotRef = useTemplateRef<InstanceType<typeof ForgotPanel>>("forgotPanel");

watch(currentMode, (_next, prev) => {
  if (prev === "register") registerRef.value?.reset();
  if (prev === "forgot") forgotRef.value?.reset();
});
</script>

<template>
  <div class="auth-form">
    <Transition
      :name="slideDir === 'left' ? 'slide-left' : 'slide-right'"
      mode="out-in"
    >
      <LoginPanel
        v-if="currentMode === 'login'"
        key="login"
        @success="emit('success')"
        @go-register="goToRegister"
        @go-forgot="goToForgot"
      />

      <RegisterPanel
        v-else-if="currentMode === 'register'"
        key="register"
        ref="registerPanel"
        @go-login="goToLogin"
      />

      <ForgotPanel
        v-else-if="currentMode === 'forgot'"
        key="forgot"
        ref="forgotPanel"
        @go-login="goToLogin"
      />
    </Transition>
  </div>
</template>

<style scoped>
/* Vue Transition animation classes (cannot be replaced by UnoCSS) */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.26s ease, transform 0.26s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(28px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-28px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-28px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(28px);
}
</style>
