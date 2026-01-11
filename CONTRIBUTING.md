# 贡献指南 | Contributing Guide

感谢你对 **USC Wiki** 感兴趣！我们欢迎每一位贡献者，无论是修复错别字、补充新内容，还是改进技术架构。

为了确保项目质量与协作顺畅，请在贡献前阅读以下指南。

## 🤖 AI 智能体须知 | For AI Agents

如果你是像我们这样的 AI 助手，请 **务必** 首先阅读并遵守以下核心文档：

- **[GEMINI.md](./GEMINI.md)**: 包含项目上下文、技术栈详情、以及强制性的沟通与执行规范。
- **[AGENTS.md](./AGENTS.md)**: 更广泛的 AI 代理操作指南。

**关键规则**:
1. 必须使用 **简体中文** 进行交流和撰写 Commit Message。
2. 更改项目结构后必须同步更新 `GEMINI.md`。
3. 提交前必须运行 `bun run docs:build` 验证。

## 🛠️ 开发工作流 | Development Workflow

1. **Fork 本仓库**: 将项目 Fork 到你自己的 GitHub 账号下。
2. **克隆代码**: `git clone` 你的 Fork 仓库到本地。
3. **创建分支**: 建议基于 `main` 分支创建新分支，分支名应具有描述性（如 `feat/new-course-guide` 或 `fix/typo-in-home`）。
4. **安装依赖**:
    ```bash
    bun install
    ```
5. **本地开发**:
    ```bash
    bun run docs:dev
    ```
6. **提交更改**: 请参阅下方的 [Commit 规范](#-提交规范--commit-convention)。
7. **提交 PR**: 将分支推送到你的远程仓库，并向本仓库的 `main` 分支提交 Pull Request。

## 📝 提交规范 | Commit Convention

本项目遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

Commit Message 格式: `<type>: <description>`

**常用 Type**:
- `feat`: 新增功能或内容 (New feature or content)
- `fix`: 修复 Bug 或错误 (Bug fix)
- `docs`: 仅文档更改 (Documentation only)
- `style`: 代码格式修正，不影响逻辑 (Formatting)
- `refactor`: 代码重构 (Refactoring)
- `chore`: 构建过程或辅助工具变动 (Build process, deps)

**示例**:
- `feat: 添加计算机学院选课指南`
- `fix: 修正首页的链接错误`
- `docs: 更新 README 贡献部分`

## ✍️ 内容规范 | Content Guidelines

- **Markdown**: 请使用标准的 Markdown 语法。
- **排版**: 中英文之间建议留有空格（如 `Hello 世界`），以提升阅读体验。
- **图片**: 图片请尽量压缩后放入对应目录的 `static` 子文件夹中。
- **Frontmatter**: 页面头部请包含必要的 Frontmatter 信息（如 title, description）。

## ❓ 遇到问题？

如果你在配置环境或开发过程中遇到问题，可以查看 [README.md](./README.md) 中的“快速开始”部分，或者在 Issue 中提问。

感谢你的贡献！🚀
