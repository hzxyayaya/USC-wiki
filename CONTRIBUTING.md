# 贡献指南

感谢你愿意为 USC Wiki 添砖加瓦。本文说明如何新增或修改文档，让其他同学也能快速上手。

## 开始之前

1. Fork 本仓库并 clone 到本地。
2. 安装 [pnpm](https://pnpm.io/)，在项目根目录执行：

```bash
pnpm install
pnpm dev
```

3. 浏览器打开 `http://localhost:4321`，确认修改能正常预览。

## 文档放哪里

| 内容类型 | 目录 | 示例 |
| --- | --- | --- |
| 选课、GPA、课程安排 | `docs/academics/教务指南/` | 选课技巧、绩点说明 |
| 学院与专业资料 | `docs/academics/colleges/` | 培养方案、学院介绍 |
| 单门课程攻略 | `docs/academics/course/` | 高数、软工实训 |
| 校园生活 | `docs/life/` | 校园网、校历 |
| 竞赛信息 | `docs/resources/竞赛/` | 软件杯、服创 |
| 办事流程 | `docs/resources/流程/` | 报销、驾照 |
| 软件/账号教程 | `docs/resources/教程/` | 邮箱、WPS |
| 试卷与资料 | `docs/resources/课程资源/` | 历年试卷、笔记 |
| 通用资源 | `docs/resources/` 根目录 | 软件推荐、模板 |
| 在线工具 | `docs/tools/` | GPA 计算器 |

如果不确定放哪，可以先在 Issue 里讨论，或直接提 PR 并在描述中说明。

## 文件命名

- **优先使用中文文件名**，与页面标题一致，例如 `选课指南.md`。
- 每个目录放一篇 `index.md` 作为该分类的入口页。
- 附件（图片、PDF、Word）放在文档同目录或 `attachments/` 子目录，构建时会自动同步到 `/vault/`。

## Frontmatter 约定

每篇文档开头建议加上 YAML frontmatter：

```yaml
---
title: 页面标题
description: 一句话摘要，会用于 SEO 和目录说明
order: 10
---
```

- `title`：侧边栏和页面标题；**不要在 title 里加 emoji**，emoji 放在正文 `# 标题` 即可。
- `description`：可选，建议填写。
- `order`：可选，数字越小越靠前；同一目录内生效。

也可以复制 `docs/_templates/页面模板.md` 作为起点。

## 支持的 Markdown 语法

项目兼容 Obsidian 常用写法，完整示例见 [Markdown 语法示例](/resources/markdown-demo/)：

- Wiki 链接：`[[页面名]]`、`[[文件.pdf|下载]]`
- 图片嵌入：`![[image.png|240]]`
- Callout：`> [!tip] 提示`
- 数学公式：`$...$` 与 `$$...$$`
- 任务列表：`- [ ]` / `- [x]`

**Wiki 链接按文件名或 title 解析**，移动文件通常不会断链；但普通 Markdown 链接 `[文本](/path/)` 需要手动更新路径。

## 提交 PR

1. 新建分支，例如 `docs/add-xxx-guide`。
2. 只提交与本次文档相关的改动，避免混入无关修改。
3. 本地执行 `pnpm build` 确认能正常构建。
4. 提交 PR，简要说明：新增/修改了什么、为什么有用、是否需要后续补充。

## 内容规范

- 信息尽量准确、可验证；不确定的内容请标注「待补充」或「截至 yyyy-mm」。
- 不要提交密码、学号、身份证等隐私信息。
- 引用他人资料请注明来源。
- 文档内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可。

## 常见问题

**Q: 改了 `astro.config.mjs` 或 remark 插件后页面没更新？**  
A: 重启 `pnpm dev`，必要时硬刷新浏览器（Ctrl+Shift+R）。

**Q: 图片显示不出来？**  
A: 确认图片在 `docs/` 下，且运行过 `pnpm sync:vault`（`pnpm dev` 会自动执行）。

**Q: 侧边栏顺序不对？**  
A: 在该目录的 `index.md` 或具体页面的 frontmatter 里设置 `order` 数值。

如有其他问题，欢迎在 Issue 中提问。
