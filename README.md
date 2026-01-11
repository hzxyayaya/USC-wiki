# USC Wiki

> 一个关于我们学校的百科全书 | A comprehensive encyclopedia and guide for the University of South China.

**USC Wiki** 旨在协助学生解决学业、校园生活及资源查找等问题。本项目是一个基于 **VitePress** 构建的静态文档站点。

## 📚 内容板块 | Features

- **学业 (Academics)**: 教务指南、选课攻略、GPA 政策、学院导航等。
- **生活 (Life)**: 吃喝出行、校园网设置、特别是时间表（校历）。
- **资源 (Resources)**: 软件推荐、常用模板、证书报名信息。
- **工具 (Tools)**: 在线 GPA 计算器、倒计时、MarkDown 编辑器等。

## 🛠️ 技术栈 | Tech Stack

- **框架**: [VitePress](https://vitepress.dev/) (基于 Vue 3 的静态站点生成器)
- **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
- **包管理**: [Bun](https://bun.sh/)
- **语言**: Markdown, TypeScript, Vue SFC

## 🚀 快速开始 | Getting Started

本项目推荐使用 **Bun** 进行包管理。

### 1. 安装依赖

```bash
bun install
```

### 2. 启动开发服务器

```bash
bun run docs:dev
```

服务通常会在 `http://localhost:5173` 启动。

### 3. 构建生产版本

```bash
bun run docs:build
```

构建产物将位于 `docs/.vitepress/dist`。

### 4. 本地预览构建

```bash
bun run docs:preview
```

## 📂 项目结构 | Project Structure

```text
.
├── docs/                   # 文档根目录 (Markdown 内容)
│   ├── .vitepress/         # VitePress 配置、主题、组件
│   ├── academics/          # 学业版块
│   ├── life/               # 生活版块
│   ├── resources/          # 资源版块
│   └── tools/              # 工具版块
├── package.json            # 项目依赖与脚本
├── GEMINI.md               # AI 助手上下文指南
└── AGENTS.md               # AI 代理指南
```

## 🤝 贡献指南 | Contributing

欢迎提交 Issue 或 Pull Request！

在开始贡献代码前，请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解开发流程与规范。
对于 AI 助手 (AI Agents)，请额外参阅 [GEMINI.md](./GEMINI.md)。

## 📄 许可证 | License


本项目采用 [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](./LICENSE) 许可。

