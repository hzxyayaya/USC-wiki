# USC Wiki

> 面向南华大学学生的校园知识库，整理学业、校园生活与资源分享。

USC Wiki 基于 [Next.js](https://nextjs.org/) + [Fumadocs](https://fumadocs.dev/) 构建。内容以 Markdown 为主，并支持接近 Obsidian 的写作体验：Wiki 链接、附件链接、图片嵌入、Callout、任务列表、数学公式等。

## 内容板块

- **新生入门**（`docs/新生入门/`）：校园网、校历与入学须知。
- **学习指南**（`docs/学习指南/`）：教务指南、课程攻略、课程资料、学院与专业。
- **校园生活**（`docs/校园生活/`）：生活指南与常用软件。
- **事务办理**（`docs/事务办理/`）：报销、研学、驾照等流程。
- **竞赛与资源**（`docs/竞赛与资源/`）：竞赛、软件模板、使用教程。

想参与贡献？请阅读 [贡献指南](https://usc-wiki.netlify.app/关于本站/贡献指南/)（源码：`docs/关于本站/贡献指南.md`）。

## 技术栈

- **框架**：Next.js 16（App Router，静态导出）
- **文档**：Fumadocs MDX + UI
- **Markdown 扩展**：`remark-math`、`rehype-katex`、自定义 Wiki/Obsidian 插件（`src/remark/`、`src/rehype/`）
- **样式**：Tailwind CSS 4 + Fumadocs 主题 + Wiki 语义样式（`src/app/globals.css`）
- **搜索**：Orama 静态索引（`public/search-index.json`）
- **包管理**：pnpm

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

开发服务器默认运行在 `http://localhost:3000`。启动前会自动同步 vault 附件并构建搜索索引。

### 构建生产版本

```bash
pnpm build
```

构建产物输出到 `out/`（静态 HTML）。

### 本地预览构建结果

```bash
pnpm preview
```

## 常用命令

```bash
pnpm dev              # 启动 Next.js 开发服务器
pnpm build            # 同步附件、搜索索引并构建静态站点
pnpm preview          # 预览 out/ 构建产物
pnpm sync:vault       # 手动同步 docs 附件到 public/vault
pnpm build:search     # 重建搜索索引
pnpm sync:doc-meta    # 预览/写入 created、updated frontmatter
```

## Markdown 与 Obsidian 语法支持

项目在 Fumadocs 默认 Markdown 能力之上扩展了以下语法：

- **Wiki 链接**：`[[页面]]`、`[[页面|别名]]`、`[[页面#标题|别名]]`
- **附件链接**：`[[文件.pdf]]`、`[[文件.docx|查看文档]]`
- **图片嵌入**：`![[image.png]]`、`![[image.png|240]]`、`![[image.png|180x120]]`
- **网络图片尺寸**：`![250](https://example.com/image.png)`
- **Callout**：`> [!tip] 标题`、`> [!warning] 注意`
- **折叠 Callout**：`> [!tip]- 默认折叠`、`> [!faq]+ 默认展开`
- **数学公式**：行内 `$...$` 与块级 `$$...$$`
- **任务列表**：`- [ ]`、`- [x]`
- **图片预览**：正文图片支持 Fumadocs ImageZoom 点击放大

语法示例见 `docs/关于本站/markdown-demo.md`；Fumadocs 原生组件见 `docs/关于本站/fumadocs-demo.mdx`。

## 站内搜索

站点使用 Orama 全文搜索（`Ctrl+K` / `⌘+K`）：

- `pnpm dev` / `pnpm build` 前会自动执行 `build:search`。
- 修改文档后若搜索结果未更新，可运行 `pnpm build:search`。

## 项目结构

```text
.
├── docs/                         # 文档内容（MD/MDX）
├── source.config.ts              # Fumadocs 内容集合与 MDX 插件
├── next.config.ts                # Next.js 配置（静态导出）
├── public/
│   ├── search-index.json         # 构建时生成的搜索索引
│   └── vault/                    # sync:vault 同步的附件
├── scripts/
│   ├── build-search-index.ts
│   ├── sync-vault-assets.mjs
│   └── sync-doc-meta.mjs
└── src/
    ├── app/                      # App Router（首页、文档、sitemap/robots）
    ├── components/               # React 组件（搜索、MDX、Callout）
    ├── lib/                      # source 加载、站点配置、共享工具
    ├── remark/                   # Markdown 阶段插件
    ├── rehype/                   # HTML 阶段插件
    └── styles/                   # Wiki 与首页样式
```

## 内容编写约定

- 文档统一放在 `docs/` 下，支持 `.md` 与 `.mdx`。
- 页面标题优先读取 frontmatter 的 `title`，否则读取第一个一级标题，再否则使用文件名。
- 侧边栏由 Fumadocs 根据 `docs/` 目录与 frontmatter 自动生成。
- 可通过 `order` 控制同级排序；`draft: true` 仅在开发环境可见。
- 附件放在文档旁的 `attachments/`，构建时同步到 `/vault/...`。
- 贡献方式详见 [贡献指南](https://usc-wiki.netlify.app/关于本站/贡献指南/)。

## 开发说明

- 修改 Markdown、CSS 与普通组件时，Next.js dev server 会自动热更新。
- 修改 `source.config.ts`、`src/remark/`、`src/rehype/` 等 MDX 插件时，可能需要重启 `pnpm dev`。
- 生产站点 URL 可通过 `SITE` 或 `NEXT_PUBLIC_SITE_URL` 环境变量覆盖（默认 `https://usc-wiki.netlify.app`）。

## 许可证

本项目采用双协议许可：

- **源代码**：MIT License
- **文档内容**：CC BY-NC-SA 4.0
