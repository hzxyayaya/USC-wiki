# USC Wiki

> 面向南华大学学生的校园知识库，整理学业、校园生活与资源分享。

USC Wiki 是一个基于 [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/) 构建的静态文档站点。项目内容以 Markdown 为主，同时加入了接近 Obsidian 的写作体验：Wiki 链接、附件链接、图片嵌入、Callout、任务列表、数学公式等都可以直接在文档中使用。

## 内容板块

- **新生入门**（`docs/新生入门/`）：校园网、校历与入学须知。
- **学习指南**（`docs/学习指南/`）：教务指南、课程攻略、课程资料、学院与专业。
- **校园生活**（`docs/校园生活/`）：生活指南与常用软件。
- **事务办理**（`docs/事务办理/`）：报销、研学、驾照等流程。
- **竞赛与资源**（`docs/竞赛与资源/`）：竞赛、软件模板、使用教程。

想参与贡献？请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 技术栈

- **框架**：Astro 6
- **文档主题**：Starlight + `starlight-theme-galaxy`
- **Markdown 扩展**：`remark-math`、`rehype-katex`、自定义 Wiki/Obsidian 语法插件
- **样式**：模块化 CSS，入口为 `src/styles/wiki-markdown.css`
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

开发服务器默认运行在 `http://localhost:4321`。启动前会自动执行 `pnpm run sync:vault`，把 `docs/` 中的图片、PDF、Word 等附件同步到 `public/vault/`。

### 构建生产版本

```bash
pnpm build
```

构建产物输出到 `dist/`。

### 本地预览构建结果

```bash
pnpm preview
```

## 常用命令

```bash
pnpm dev          # 启动 Astro 开发服务器
pnpm build        # 同步附件并构建静态站点
pnpm preview      # 预览 dist 构建产物
pnpm sync:vault   # 手动同步 docs 中的附件到 public/vault
pnpm search:build # 重建搜索索引（改文档后若搜索没更新可运行）
pnpm astro        # 运行 Astro CLI
```

## Markdown 与 Obsidian 语法支持

项目在 Starlight 默认 Markdown 能力之上扩展了以下语法：

- **Wiki 链接**：`[[页面]]`、`[[页面|别名]]`、`[[页面#标题|别名]]`
- **附件链接**：`[[文件.pdf]]`、`[[文件.docx|查看文档]]`
- **图片嵌入**：`![[image.png]]`、`![[image.png|240]]`、`![[image.png|180x120]]`
- **网络图片尺寸**：`![250](https://example.com/image.png)`
- **Callout**：`> [!tip] 标题`、`> [!warning] 注意`
- **折叠 Callout**：`> [!tip]- 默认折叠`、`> [!faq]+ 默认展开`
- **数学公式**：行内 `$...$` 与块级 `$$...$$`
- **任务列表**：`- [ ]`、`- [x]`
- **图片预览**：正文图片可点击放大查看

语法示例可参考 `docs/关于本站/markdown-demo.md`。

## 站内搜索

站点使用 [Pagefind](https://pagefind.app/) 全文搜索。开发模式下也可使用搜索（`Ctrl+K` / `⌘+K`）：

- 首次 `pnpm dev` 时，如本地没有索引，会自动执行一次构建来生成。
- 修改文档后若搜索结果未更新，运行 `pnpm search:build` 重建索引。
- 生产部署时，`pnpm build` 会自动生成并同步搜索索引。

## 项目结构

```text
.
├── astro.config.mjs              # Astro/Starlight 配置与自动侧边栏生成
├── CONTRIBUTING.md               # 文档贡献指南
├── docs/                         # 文档内容根目录
│   ├── _templates/               # 文档模板（不参与站点构建）
│   ├── 新生入门/
│   ├── 学习指南/
│   │   ├── 教务指南/
│   │   ├── 课程攻略/
│   │   ├── 课程资料/
│   │   └── 学院与专业/
│   ├── 校园生活/
│   ├── 事务办理/
│   ├── 竞赛与资源/
│   ├── 经验分享/
│   └── 关于本站/
├── public/
│   ├── wiki-image-lightbox.js    # 图片点击预览
│   └── vault/                    # 由 sync:vault 生成的附件目录
├── scripts/
│   └── sync-vault-assets.mjs     # 同步 docs 中的附件到 public/vault
├── src/
│   ├── content.config.ts         # Astro 内容集合配置
│   ├── pages/                    # 自定义 Astro 页面
│   ├── remark/                   # Markdown 阶段插件
│   ├── rehype/                   # HTML 阶段插件
│   └── styles/                   # Wiki 样式模块
└── package.json
```

## 内容编写约定

- 文档统一放在 `docs/` 下，支持 `.md` 与 `.mdx`。
- 页面标题优先读取 frontmatter 中的 `title`，否则读取第一个一级标题，再否则使用文件名。
- 侧边栏根据 `docs/` 目录自动生成；目录名优先读取该目录 `index.md` 的 `title` 作为中文显示名。
- 可通过 frontmatter 的 `order` 控制同级条目排序（数字越小越靠前）。
- `.obsidian/`、`.vitepress/`、`superpowers/`、`_templates/`、`public/`、`static/` 等目录不会进入文档集合。
- 图片、PDF、Word 等附件放在文档旁边的 `attachments/` 目录；课程试卷等共享附件可放在 `docs/学习指南/attachments/`，构建时会同步到 `/vault/...`。
- 贡献方式详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 开发说明

- 修改普通 Markdown、CSS 和大多数 Astro 组件时，Astro dev server 会自动热更新。
- 修改 `astro.config.mjs`、`src/content.config.ts`、`src/remark/`、`src/rehype/` 等配置或插件时，开发服务器可能会自动重启；如页面没有更新，建议手动刷新或重启 `pnpm dev`。
- 静态脚本位于 `public/`，如浏览器仍加载旧版本，可使用硬刷新（Ctrl+Shift+R）。

## 许可证

本项目采用双协议许可：

- **源代码**：MIT License
- **文档内容**：CC BY-NC-SA 4.0
