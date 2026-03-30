import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { fetchFundQuotes } from "@/api/fund";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedAxiosGet = vi.mocked(axios.get);

describe("fetchFundQuotes", () => {
  beforeEach(() => {
    mockedAxiosGet.mockReset();
  });

  it("returns an empty list when no fund codes are requested", async () => {
    await expect(fetchFundQuotes([], "device-id")).resolves.toEqual([]);
    expect(mockedAxiosGet).not.toHaveBeenCalled();
  });

  it("hydrates missing realtime estimate fields from the fundgz endpoint", async () => {
    mockedAxiosGet
      .mockResolvedValueOnce({
        data: {
          Datas: [
            {
              FCODE: "000216",
              SHORTNAME: "华安黄金ETF联接A",
              PDATE: "2026-03-27",
              NAV: "3.4490",
              NAVCHGRT: "0.14",
              GSZ: null,
              GSZZL: null,
              GZTIME: null,
              NEWPRICE: null,
              CHANGERATIO: null,
              HQDATE: null,
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: 'jsonpgz({"fundcode":"000216","name":"华安黄金ETF联接A","jzrq":"2026-03-27","dwjz":"3.4490","gsz":"3.4667","gszzl":"0.51","gztime":"2026-03-30 10:00"});',
      });

    await expect(fetchFundQuotes(["000216"], "device-id")).resolves.toEqual([
      expect.objectContaining({
        FCODE: "000216",
        GSZ: "3.4667",
        GSZZL: "0.51",
        GZTIME: "2026-03-30 10:00",
      }),
    ]);

    expect(mockedAxiosGet).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/api/fund/FundMNewApi/FundMNFInfo?"),
    );
    expect(mockedAxiosGet).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/\/api\/fundgz\/js\/000216\.js\?rt=\d+/),
      { responseType: "text" },
    );
  });

  it("does not request fundgz when the primary quote already includes exchange realtime data", async () => {
    mockedAxiosGet.mockResolvedValueOnce({
      data: {
        Datas: [
          {
            FCODE: "560580",
            SHORTNAME: "电力ETF南方",
            PDATE: "2026-03-27",
            NAV: "1.2364",
            NAVCHGRT: "-0.96",
            GSZ: null,
            GSZZL: null,
            GZTIME: null,
            NEWPRICE: "1.1880",
            CHANGERATIO: "-3.81",
            HQDATE: "2026-03-30 09:55:09",
          },
        ],
      },
    });

    await fetchFundQuotes(["560580"], "device-id");

    expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
  });
});
