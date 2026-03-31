# 市场数据源知识库

最后验证日期：2026-03-31

本文档整理项目当前使用中的基金/指数数据源、可选备源，以及顶部全局指数走马灯接入 `yfinance` 的可行性评估。

## 基金数据源对照

| 能力 | 数据源 | 典型接口 | 关键字段 | 当前可用性判断 | 主要价值 | 主要风险/限制 | 建议定位 |
|---|---|---|---|---|---|---|---|
| 场外基金盘中估值 | 东方财富 | `fundgz.1234567.com.cn/js/<code>.js` | `gsz`, `gszzl`, `gztime`, `dwjz`, `jzrq` | 可用 | 直接给估值与估值涨跌幅 | 公共第三方接口，偶发不稳定 | 主数据源 |
| 批量基金行情 | 东方财富 | `FundMNewApi/FundMNFInfo` | `GSZ`, `GSZZL`, `GZTIME`, `NAV`, `NAVCHGRT`, `NEWPRICE`, `CHANGERATIO`, `HQDATE` | 可用 | 一次拉多只基金，兼容场外基金和部分 ETF | 部分基金估值字段不完整，仍需 fallback | 主数据源 |
| 基金搜索 | 东方财富 | `FundSearchAPI.ashx` | `CODE`, `NAME`, `CATEGORY`, `CATEGORYDESC` | 可用 | 覆盖中国基金代码体系 | 搜索结果可能混入非基金标的，需过滤 | 主数据源 |
| 场外基金最新日净值兜底 | 腾讯 | `qt.gtimg.cn/q=jj<code>` | 基金名、日净值、涨跌幅、日期 | 2026-03-31 抽样可用 | 东方财富估值失败时，至少保住“最新净值 + 日期 + 涨跌幅” | 不是盘中估值，只能作为日净值级别兜底 | 强烈建议作为 fallback |
| 基金分时估值 | 腾讯 | `web.ifzq.gtimg.cn/fund/newfund/fundSsgz/getSsgz` | 时间序列估值、昨日净值 | 不稳定 | 可补充分时图 | 抽样结果出现陈旧日期与直接失败，不适合做核心链路 | 实验性补充 |
| 基金历史净值趋势/阶段收益/仓位 | 东方财富 | `fund.eastmoney.com/pingzhongdata/<code>.js` | `Data_netWorthTrend`, `Data_ACWorthTrend`, `Data_fundSharesPositions`, `stockCodesNew` 等 | 可用 | 适合未来详情页，单接口信息量大 | 返回是 JS 变量，不是标准 JSON，需要解析 | 详情页数据源 |
| 基金持仓明细 | 东方财富 | `FundArchivesDatas.aspx?type=jjcc` | 持仓代码、名称、占比 | 可用 | 可做前十持仓展示 | HTML/脚本式返回，结构不够稳定 | 详情页补充源 |
| A 股/ETF/指数行情与历史线 | Yahoo Finance / `yfinance` | `chart`, `history`, `download` | OHLCV、时间序列、指数/ETF 实时行情 | 对指数和场内 ETF 基本可用 | 可覆盖全球指数、A 股指数、部分 ETF、历史 K 线 | 对中国场外基金覆盖不足，且存在限流风险 | 指数/ETF 备源 |
| 中国场外基金搜索/直查 | Yahoo Finance / `yfinance` | `Search`, `Ticker` | symbol 基础信息 | 不适合 | 几乎没有 | 对中国公募基金代码体系覆盖明显不足 | 不建议使用 |

## 当前推荐的多源策略

| 业务能力 | 推荐顺序 |
|---|---|
| 自选页基金行情 | 东方财富 `FundMNFInfo` -> 东方财富 `fundgz` -> 腾讯 `qt.gtimg.cn/q=jj<code>` |
| 搜索联想 | 东方财富 `FundSearchAPI`，并加 `CATEGORY=700` / `CATEGORYDESC=基金` 过滤 |
| 基金详情页历史数据 | 东方财富 `pingzhongdata` |
| 基金持仓结构 | 东方财富 `FundArchivesDatas` |
| 全球指数 / A 股指数 / ETF 历史线 | 可接 `yfinance` 作为补充或备源 |

## 顶部走马灯现状

顶部走马灯当前依赖两类数据，入口分别在 `src/composables/index/useGlobalIndexSnapshots.ts` 与 `src/composables/index/useGlobalIndices.ts`：

- 快照价、涨跌幅、涨跌额，由 `src/api/index.ts` 的 `fetchIndexSnapshots()` 提供
- 分时趋势线与昨收价，由 `src/api/index.ts` 的 `fetchIndexTrends()` 提供

组件层 `src/pages/Dashboard/components/GlobalTicker/GlobalTicker.vue` 与 `src/pages/Dashboard/components/GlobalTicker/TickerCard.vue` 本身并不关心上游来自东方财富还是 Yahoo，它们只依赖当前的 `GlobalIndexItem` 结构：

- `f2`: 最新价
- `f3`: 涨跌幅
- `f4`: 涨跌额
- `f12`: 代码
- `f13`: 市场号
- `f14`: 名称
- `prePrice`: 昨收
- `trendPoints`: 分时线点集
- `trendSessionMinutes`: 单日交易分钟数

这意味着走马灯接入 `yfinance` 的关键不是 Vue 组件，而是“建立一层 Yahoo -> 东方财富风格字段”的适配层。

## 走马灯标的与 Yahoo symbol 映射

以下为 2026-03-31 抽样验证结果：

| 当前标的 | 当前 `secid` | Yahoo 候选 symbol | 结论 | 备注 |
|---|---|---|---|---|
| 上证指数 | `1.000001` | `000001.SS` | 可平移 | `chart?range=1d&interval=1m` 可返回 |
| 深证成指 | `0.399001` | `399001.SZ` | 可平移 | 可返回 |
| 沪深300 | `1.000300` | `000300.SS` | 可平移 | `399300.SZ` 也可返回，但建议统一选一个 |
| 创业板指 | `0.399006` | `399006.SZ` | 可平移 | 可返回 |
| 恒生指数 | `100.HSI` | `^HSI` | 可平移 | 需 URL 编码 `^` |
| 纳斯达克 | `100.NDX` | `^NDX` | 可平移 | 当前项目展示的是纳斯达克 100，不是综合指数 |
| 标普500 | `100.SPX` | `^GSPC` | 可平移但需改名映射 | Yahoo symbol 不是 `^SPX` |
| 道琼斯 | `100.DJIA` | `^DJI` | 可平移 | 可返回 |
| 日经225 | `100.N225` | `^N225` | 可平移 | 可返回 |
| 越南胡志明 | `100.VNINDEX` | `^VNINDEX.VN` | 可平移但需特殊处理 | `^VNINDEX.VN` 可返回，不能省略 `.VN` |
| 富时中国 A50 | `100.XIN9` | `XIN9.L` | 可平移但存在语义差异 | Yahoo 走的是伦敦上市指数代码，需确认与现有口径是否一致 |
| 恐慌指数 VIX ETF | `107.VIXY` | `VIXY` 或 `^VIX` | 不宜直接平移 | 当前项目展示的是 ETF，不是 VIX 现货指数 |

## 接入 `yfinance` 的主要难点

### 1. 标的标识体系不同

当前项目内部统一使用东方财富 `secid`，例如：

- `1.000001`
- `100.SPX`
- `107.VIXY`

如果接 `yfinance`，至少要新增一套映射，例如：

- `1.000001` -> `000001.SS`
- `100.SPX` -> `^GSPC`
- `100.VNINDEX` -> `^VNINDEX.VN`

建议不要直接把 UI 层或常量层改成 Yahoo symbol，而是新增 provider 映射表，在 API 层做转换。

### 2. 返回结构与现有类型不兼容

当前类型 `src/types/market.ts` 明显是按东方财富响应设计的：

- `GlobalIndexSnapshot` 使用 `f2/f3/f4/f12/f13/f14`
- `GlobalIndexTrendApiResponse` 使用 `prePrice/trends`

`yfinance` 需要转换成同样结构，尤其是：

- `f2` 需要映射到最新价
- `f3` 需要从最新价和昨收计算涨跌幅
- `f4` 需要计算涨跌额
- `f12/f13` 需要人工映射回当前内部标识体系
- `trendPoints` 需要从 Yahoo 1m 数据重新归一化到 `elapsedMinutes`

### 3. 分时线需要复用现有交易时段模型

当前 `src/constants/market.ts` 已经为不同指数维护了交易时区和交易时段。这个模型本身是可复用的，`yfinance` 接入后仍然应该复用它来做：

- 午休断点处理
- 跨午夜交易日裁剪
- 按当前市场时间过滤“当天有效点”
- 折线图的 `elapsedMinutes` 归一化

也就是说，`fetchIndexTrends()` 的“时间归一化”逻辑大概率可以保留，替换的是上游取数方式，而不是整段推倒重写。

### 4. 个别标的语义不一致

有两项需要特别注意：

- `100.XIN9`
  当前是“富时中国 A50”，Yahoo 能找到 `XIN9.L`，但这不是东方财富内部 `secid` 的等价替换，切换前要确认价格口径、交易时区和名称是否一致。
- `107.VIXY`
  当前是 `VIXY` ETF。若改成 Yahoo 的 `^VIX`，你展示的就不再是 ETF，而是波动率指数本体，含义会变。

## 接入方案评估

### 方案 A：继续以东方财富为主，只给走马灯加 Yahoo 兜底

做法：

- 保留现有 `fetchIndexSnapshots()` / `fetchIndexTrends()` 作为主链路
- 新增 `yfinance` provider，仅在东方财富某个标的失败时兜底

优点：

- 改动最小
- 不影响当前 `secid` 体系
- 走马灯和地球组件都能复用现有类型

缺点：

- 维护两套来源
- 需要解决 provider 间的时间戳和名称一致性

结论：

这是最稳的方案，也是最适合当前项目阶段的方案。

### 方案 B：走马灯整体切到 Yahoo，东方财富只保留基金数据

做法：

- 指数快照与趋势统一改走 Yahoo
- `src/api/index.ts` 内部重写为 Yahoo 适配层

优点：

- 指数源和基金源职责更清晰
- 全球指数 symbol 在 Yahoo 上整体更自然

缺点：

- 需要为全部 `GLOBAL_INDICES` 建 symbol 映射
- `100.XIN9`、`107.VIXY`、`100.VNINDEX` 这类特殊项需要专门处理
- 还要重新验证认证页地球组件 `src/pages/Authentication/components/Globe/authGlobeMarkets.ts` 的展示口径

结论：

可行，但不是低风险替换。

### 方案 C：只把美股 / 港股 / 日经等境外指数切到 Yahoo，A 股仍保留东方财富

做法：

- A 股指数继续用东方财富
- `HSI`、`NDX`、`SPX`、`DJIA`、`N225`、`VNINDEX` 等切到 Yahoo

优点：

- 能降低东方财富在境外市场上的依赖
- 保留 A 股口径一致性

缺点：

- 同一个走马灯列表里混用两套数据源，维护复杂度最高
- 时区与名称口径问题会更加分散

结论：

除非你明确观察到“东方财富的境外指数比 A 股指数更不稳定”，否则不推荐先走这条路。

## 结论

### 对知识库的结论

- `fund-baby` 暴露出的最大价值，不是 `yfinance` 替代，而是腾讯 `qt.gtimg.cn/q=jj<code>` 可以作为你现有中国基金链路的日净值 fallback。
- `yfinance` 更适合指数、A 股指数、部分 ETF 和历史线，不适合替代中国场外基金主链路。

### 对顶部走马灯的结论

- 从“数据覆盖”看，`yfinance` 覆盖当前走马灯 12 个标的大部分没有问题。
- 从“工程风险”看，组件层改动很小，真正的工作量集中在 API/provider 适配层。
- 最推荐的路径是：先保留东方财富为主，只给走马灯增加 Yahoo fallback；不要一开始整表硬切。
