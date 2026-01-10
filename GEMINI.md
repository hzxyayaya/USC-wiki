# USC Wiki - Project Context

## Project Overview
**USC Wiki** is a comprehensive encyclopedia and guide for the University of South China (USC), built to assist students with academics, campus life, and resources. The project is a static documentation site powered by **VitePress**.

## Tech Stack
* **Framework**: [VitePress](https://vitepress.dev/) (Vue 3 based Static Site Generator)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Package Manager**: [Bun](https://bun.sh/) (Preferred, `bun.lock` is committed)
* **Languages**: Markdown, TypeScript, Vue SFC (Single File Components)

## Key Directories & Files
* `docs/`: The root directory for all content (Markdown files).
    * `index.md`: The landing page.
    * `academics/`, `life/`, `resources/`, `tools/`: Content sections.
* `docs/.vitepress/`: VitePress configuration and customization.
    * `config.mts`: Main site configuration (Title, Description, Navigation, Sidebar).
    * `theme/`: Custom theme logic (`index.ts`) and styles (`custom.css`, `tailwind.css`).
    * `components/`: Custom Vue components used in pages (e.g., `GPACalculator.vue`, `Countdown.vue`).
* `package.json`: Project metadata and scripts.
* `AGENTS.md` / `GEMINI.md`: Context and guidelines for AI agents.

## Development Workflow

### Prerequisites
* **Bun** is recommended for dependency management and running scripts.

### Commands
| Action | Command | Description |
| :--- | :--- | :--- |
| **Install** | `bun install` | Install project dependencies. |
| **Dev Server** | `bun run docs:dev` | Start the development server with hot-reload (usually at `localhost:5173`). |
| **Build** | `bun run docs:build` | Build the static site for production (output to `docs/.vitepress/dist`). |
| **Preview** | `bun run docs:preview` | Locally preview the production build. |

## Conventions & Standards

### Content (Markdown)
* Content is written in **Markdown** located in the `docs/` directory.
* **Extensions Enabled**:
    * MathJax (`$E=mc^2$`)
    * Task Lists (`- [ ] task`)
    * Footnotes (`[^1]`)
    * Mark (`==highlight==`)
* **Assets**: Place global assets (like logos) in `docs/public/`. Place section-specific assets in a `static/` subdirectory relative to the content (e.g., `docs/life/static/`).

### Configuration
* **Navigation & Sidebar**: Managed in `docs/.vitepress/config.mts`. When adding new pages, ensure they are linked in the sidebar structure within this file.
* **Components**: Interactive elements (like calculators) are Vue components stored in `docs/.vitepress/components/` and can be directly registered/imported for use in Markdown files.

### Styling
* Tailwind CSS is configured. Custom CSS overrides are in `docs/.vitepress/theme/custom.css`.
* The theme entry point is `docs/.vitepress/theme/index.ts`.

## AI Agent Guidelines (MANDATORY)

### 1. Communication Protocol
* **Language**: **All conversations, explanations, and commit messages explanations MUST be in Chinese (Simplified).** (Please use Chinese to communicate with the user).

### 2. Context Maintenance (Self-Correction)
* **Update this Document**: If your code changes affect the project structure, add new key directories, or change configuration logic, **you MUST update this `GEMINI.md` file** in the same operation to reflect the new state. Keep the context fresh.

### 3. Execution & Verification
* **Structure**: Follow the `docs/` topic organization.
* **Commits**: Use conventional commits (e.g., `feat:`, `chore:`, `bug:`).
* **Verification**: Always run `bun run docs:build` to verify changes before considering a task complete.