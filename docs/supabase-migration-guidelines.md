# Supabase Migration 规范

> 适用于本项目的 Supabase schema 变更、数据修复与 migration 历史维护。

## 目标

这份规范解决 3 个实际问题：

- 避免数据库结构变更只存在于 Supabase 控制台，repo 无法追踪
- 避免 `supabase db push` 因 migration 历史混乱而失败
- 明确什么应该写进 migration，什么只适合临时在 SQL Editor 执行

---

## 1. 什么时候新建 migration

只要是 **会长期影响数据库结构或权限模型** 的变更，就必须新建 migration。

包括但不限于：

- 建表
- 删表
- 加列 / 删列 / 改列类型
- 增加或修改索引
- 增加或修改约束
- 增加或修改 RLS policy
- 增加或修改 trigger / function
- 初始化一张新表所需的默认数据
- 为新结构执行必要的 backfill

一句话判断：

> 如果这个变更需要在未来的新环境里也自动执行一次，就应该写进 migration。

---

## 2. 一个 migration 文件的合适粒度

不要走两个极端：

- 不要细到“建表一个文件、索引一个文件、policy 一个文件”
- 也不要把多周的数据库改动都堆进一个超大文件

推荐粒度：

> 一次明确的数据库演进 = 一个 migration 文件

同一个 migration 里可以放在一起的内容：

- 建表
- 该表需要的索引
- 该表需要的约束
- 该表需要的 RLS
- 该表依赖的 trigger / function
- 与这次 schema 变更强相关的 backfill

例子：

- `create_user_profiles.sql`
  - 建 `user_profiles`
  - 开启 RLS
  - 增加 profile 读取 policy
  - 建 `updated_at` trigger

- `add_profile_metadata_and_trigger.sql`
  - 给 `user_profiles` 加 `nickname` 和 `avatar_url`
  - 给 `auth.users` 挂同步 trigger
  - 回填已有用户资料

---

## 3. 什么可以直接在 Supabase SQL Editor 执行

以下情况可以直接在 Supabase Dashboard 的 SQL Editor 中执行：

- 临时排障查询
- 一次性数据修复
- 临时 backfill
- 检查线上数据状态
- 紧急 hotfix

但是要分清两类：

### 3.1 纯临时 SQL

这类 SQL 只用于：

- 查询
- 校验
- 临时分析

这类 SQL 不要求进入 repo。

### 3.2 结构相关 SQL

如果 SQL 会影响以下内容：

- 表结构
- 索引
- 约束
- RLS
- trigger / function

那即使你先在 SQL Editor 执行了，也必须补回 migration 文件。

否则会出现：

- 本地 repo 不知道远端改了什么
- 新环境无法重放
- `db push` / `db pull` / `migration list` 容易失真

---

## 4. 绝对不要做的事

### 4.1 不要修改已经推送过的 migration 文件名

Supabase 会把 migration 文件名前缀当作 version。

例如：

- `20260329_create_user_profiles.sql`

如果这个 version 已经写入远端 `schema_migrations`，你再改文件名，本地和远端历史就会不一致。

常见报错：

- `Remote migration versions not found in local migrations directory`

规则：

> 已经 push 过远端的 migration，只追加，不改名，不重写历史。

### 4.2 不要删除已经推送过的 migration 文件

哪怕远端对象已经存在，本地 migration 文件也不能随便删。

否则后续再执行：

- `supabase db push`
- `supabase migration list`

都可能因为远端历史存在、本地文件缺失而报错。

### 4.3 不要让 migration version 重复

文件名前缀必须唯一。

错误示例：

- `20260329_create_user_profiles.sql`
- `20260329_create_user_watchlist_items.sql`

这会导致：

- `duplicate key value violates unique constraint "schema_migrations_pkey"`

推荐做法：

- 使用完整时间戳前缀
- 或至少保证版本号唯一

例如：

- `20260329120000_create_user_watchlist_items.sql`

### 4.4 不要把结构变更只做在远端控制台

如果只在 Supabase SQL Editor 执行了结构变更，却没有写回 migration：

- repo 历史会漂移
- 新环境无法初始化
- 团队协作会失真

规则：

> 远端先执行可以，但最终必须回到 migration 文件。

### 4.5 不要把 migration 写成不可重跑

真实环境里经常会遇到：

- 表已经建了一半
- policy 已存在
- trigger 已存在
- 某次 push 半成功

因此 migration 应尽量写成幂等。

优先使用：

- `create table if not exists`
- `add column if not exists`
- `drop trigger if exists`
- `create or replace function`
- 对 policy 先检查 `pg_policies` 再创建

---

## 5. 标准工作流

### 5.1 新增 schema 变更

标准顺序：

1. 新建 migration 文件
2. 把这次完整 schema 变更写进去
3. 本地 review SQL
4. 执行 `pnpm supabase:db:push`
5. 验证远端行为

### 5.2 一次性修数据

如果只是修数据，不改结构：

1. 优先在 SQL Editor 执行
2. 如果未来不需要重复执行，不必强制写 migration
3. 如果这次“修数据”依赖了新结构或需要在新环境复用，就写入 migration

### 5.3 远端已手工改过，再补 repo

如果你已经先在远端控制台做了结构修改：

1. 立即把同样的变更补进 migration 文件
2. 保证 migration 尽量幂等
3. 不要删除本地历史文件试图“对齐”
4. 必要时用 `migration repair` 修复远端历史状态

---

## 6. 常见问题与处理方式

### 6.1 `tls error (EOF)`

通常不是 migration 内容错误，而是本机到 Supabase Postgres 的连接被代理、TUN 或 fake-IP 干扰。

先检查：

- 系统代理是否还开着
- `*.supabase.co` 是否被 fake-IP 接管
- DNS 是否解析到异常地址

先修网络，再继续 `db push`。

### 6.2 `duplicate key value violates unique constraint "schema_migrations_pkey"`

通常是 migration version 重复。

处理方式：

- 确认本地 migration 文件名前缀是否重复
- 改成唯一 version
- 如果远端历史已经写入旧 version，再结合 `migration repair` 处理

### 6.3 `Remote migration versions not found in local migrations directory`

通常说明：

- 远端 migration 历史里有版本
- 本地对应 migration 文件被删了或改名了

处理方式：

1. 先确认是不是有人改过旧 migration 文件名
2. 不要继续硬改历史
3. 按 Supabase CLI 提示用 `migration repair`
4. 必要时再 `db pull`

---

## 7. 本项目的执行规则

对当前 repo，执行以下规则：

- 所有正式 schema 变更都放在 `supabase/migrations/`
- migration 文件名必须使用唯一 version
- 已经 push 成功的 migration 不再改名、不删除
- 允许先在 Supabase SQL Editor 执行紧急 SQL，但结构变更必须补回 repo
- migration 默认按“可重跑”思路编写

---

## 8. 推荐习惯

- 每次 schema 变更都写成一个完整、独立、可审阅的 migration
- 尽量避免手工维护“数据库记忆”，一切以 repo 为准
- 远端和本地不一致时，优先修 migration 历史，不要先删文件
- 先追加新 migration，少回头修改旧 migration

一句话总结：

> 数据库结构变更要版本化、可重放、可追踪；临时修数据可以手工执行，但不能代替 migration。
