import { ref, type Ref } from "vue";
import axios from "axios";
import { read, utils } from "xlsx";
import { saveAs } from "file-saver";
import { storage } from "@/utils/storage";
import { ElMessage } from "element-plus";

interface FundListMItem {
  code: string;
  num: number;
  cost?: number;
}

export function useImportExport(
  fundListM: Ref<FundListMItem[]>,
  userId: Ref<string>,
  reloadSettings: () => void,
) {
  const loadingFundList = ref(false);

  function exportConfig(): void {
    storage.get(null, (res: Record<string, any>) => {
      delete res.holiday;
      const blob = new Blob([JSON.stringify(res, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, "自选基金助手配置文件.json");
    });
  }

  function importConfig(file: File): void {
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      try {
        const config = JSON.parse(
          (event.target as FileReader).result as string,
        );
        storage.set(config, () => {
          reloadSettings();
          ElMessage.success("导入配置成功！");
        });
      } catch {
        ElMessage.error("导入失败！");
      }
    });
    reader.readAsText(file);
  }

  async function exportExcel(): Promise<void> {
    loadingFundList.value = true;
    ElMessage.success("正在导出中，请稍候...");

    const fundlist = fundListM.value.map((v) => v.code).join(",");
    const url =
      "/api/fund/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=200&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=" +
      userId.value +
      "&Fcodes=" +
      fundlist;

    try {
      const res = await axios.get(url);
      const rawData = res.data.Datas ?? [];
      const rows = rawData.map((val: any) => {
        const match = fundListM.value.find((f) => f.code === val.FCODE);
        return {
          基金代码: val.FCODE,
          基金名称: val.SHORTNAME,
          持有份额: match?.num ?? 0,
          成本价: match?.cost ?? 0,
        };
      });

      const ws = utils.json_to_sheet(rows);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "基金配置");

      const buf = utils.sheet_to_csv(ws);
      const blob = new Blob(["\uFEFF" + buf], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(blob, "自选基金助手-基金配置.csv");
    } catch {
      ElMessage.error("导出失败");
    } finally {
      loadingFundList.value = false;
    }
  }

  function importExcel(file: File): void {
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      try {
        const data = (event.target as FileReader).result;
        const workbook = read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = utils.sheet_to_json<Record<string, any>>(sheet);

        const arr: FundListMItem[] = excelData.map((item) => ({
          code: String(item["基金代码"]),
          num: Number(item["持有份额"]) || 0,
          cost: Number(item["成本价"]) || 0,
        }));

        storage.set({ fundListM: arr }, () => {
          reloadSettings();
          ElMessage.success("导入基金列表成功！");
        });
      } catch {
        ElMessage.error("导入失败！");
      }
    });
    reader.readAsBinaryString(file);
  }

  return {
    loadingFundList,
    exportConfig,
    importConfig,
    exportExcel,
    importExcel,
  };
}
