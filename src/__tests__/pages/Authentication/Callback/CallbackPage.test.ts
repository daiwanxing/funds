import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerMock = {
  push: vi.fn(),
};

vi.mock("vue-router", () => ({
  useRouter: () => routerMock,
}));

vi.mock("lucide-vue-next", () => ({
  CheckCircle: defineComponent({ name: "CheckCircleStub", template: "<span />" }),
  XCircle: defineComponent({ name: "XCircleStub", template: "<span />" }),
}));

const mountPage = async () => {
  const { default: CallbackPage } = await import("@/pages/Authentication/Callback/CallbackPage.vue");
  return mount(CallbackPage);
};

describe("CallbackPage OAuth states", () => {
  beforeEach(() => {
    routerMock.push.mockReset();
    window.location.hash = "";
  });

  it("shows an OAuth success state when the hash contains a successful OAuth callback", async () => {
    window.location.hash = "#/auth/callback?status=success&source=oauth&provider=google";

    const wrapper = await mountPage();

    expect(wrapper.text()).toContain("登录成功");
    expect(wrapper.text()).toContain("Google");
    expect(wrapper.text()).toContain("进入首页");
  });

  it("shows an OAuth failure state when the hash contains an OAuth error reason", async () => {
    window.location.hash = "#/auth/callback?status=error&reason=oauth_callback_failed";

    const wrapper = await mountPage();

    expect(wrapper.text()).toContain("登录失败");
    expect(wrapper.text()).toContain("第三方登录失败");
    expect(wrapper.text()).toContain("前往登录");
  });
});
