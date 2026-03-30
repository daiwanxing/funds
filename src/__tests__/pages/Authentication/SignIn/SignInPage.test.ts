import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { defineComponent, reactive } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routeState = reactive<{ query: Record<string, string> }>({
  query: {},
});

const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
};

const authState = {
  signIn: {
    isPending: { value: false },
    mutateAsync: vi.fn(),
  },
  signUp: {
    isPending: { value: false },
    mutateAsync: vi.fn(),
  },
  forgotPassword: {
    isPending: { value: false },
    mutateAsync: vi.fn(),
  },
  resendVerification: {
    isPending: { value: false },
    mutateAsync: vi.fn(),
  },
  startOAuthSignIn: vi.fn(),
};

vi.mock("vue-router", () => ({
  useRouter: () => routerMock,
  useRoute: () => routeState,
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => authState,
}));

vi.mock("@/stores/auth.ts", () => ({
  useAuthStore: () => authState,
}));

vi.mock("/Users/daiwanxing/Desktop/市场行情/funds/src/stores/auth.ts", () => ({
  useAuthStore: () => authState,
}));

vi.mock("vue-sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("@/layouts/AuthLayout.vue", () => ({
  default: defineComponent({
    name: "AuthLayoutStub",
    template: "<div class='auth-layout-stub'><slot /></div>",
  }),
}));

vi.mock("/Users/daiwanxing/Desktop/市场行情/funds/src/layouts/AuthLayout.vue", () => ({
  default: defineComponent({
    name: "AuthLayoutStub",
    template: "<div class='auth-layout-stub'><slot /></div>",
  }),
}));

vi.mock("lucide-vue-next", () => ({
  Mail: defineComponent({ name: "MailIconStub", template: "<span />" }),
  Lock: defineComponent({ name: "LockIconStub", template: "<span />" }),
  Eye: defineComponent({ name: "EyeIconStub", template: "<span />" }),
  EyeOff: defineComponent({ name: "EyeOffIconStub", template: "<span />" }),
  LoaderCircle: defineComponent({ name: "LoaderCircleIconStub", template: "<span />" }),
}));

vi.mock("@/composables/index", () => ({
  useGlobalIndexSnapshots: () => ({
    dataList: { value: [] },
    isLoading: { value: false },
    isError: { value: false },
    refetch: vi.fn(),
  }),
}));

const mountPage = async () => {
  const { default: SignInPage } = await import("@/pages/Authentication/SignIn/SignInPage.vue");

  return mount(SignInPage, {
    global: {
      plugins: [createPinia()],
      stubs: {
        Transition: false,
        AuthLayout: {
          template: "<div class='auth-layout-stub'><slot /></div>",
        },
      },
    },
  });
};

describe("SignInPage OAuth entry points", () => {
  beforeEach(() => {
    routeState.query = {};
    routerMock.push.mockReset();
    routerMock.replace.mockReset();
    authState.signIn.mutateAsync.mockReset();
    authState.signUp.mutateAsync.mockReset();
    authState.forgotPassword.mutateAsync.mockReset();
    authState.resendVerification.mutateAsync.mockReset();
    authState.startOAuthSignIn.mockReset();
  });

  it("renders Google and GitHub OAuth buttons on the login view", async () => {
    const wrapper = await mountPage();

    expect(wrapper.find("button[data-test='oauth-google']").exists()).toBe(true);
    expect(wrapper.find("button[data-test='oauth-github']").exists()).toBe(true);
  });

  it("renders the same OAuth buttons on the register view", async () => {
    routeState.query = { register: "1" };

    const wrapper = await mountPage();

    expect(wrapper.find("button[data-test='oauth-google']").exists()).toBe(true);
    expect(wrapper.find("button[data-test='oauth-github']").exists()).toBe(true);
  });

  it("starts the Google OAuth flow when the user clicks the Google button", async () => {
    const wrapper = await mountPage();

    await wrapper.get("button[data-test='oauth-google']").trigger("click");

    expect(authState.startOAuthSignIn).toHaveBeenCalledWith("google");
  });
});
