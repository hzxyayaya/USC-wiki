# Repository Guidelines

## Project Structure & Module Organization
- `docs/` holds all site content for VitePress, organized by topic (for example `docs/academics/`, `docs/life/`, `docs/resources/`, `docs/tools/`).
- `docs/.vitepress/config.mts` defines site config, nav, and sidebar; `docs/.vitepress/theme/` and `docs/.vitepress/components/` hold theme customizations.
- Static assets live in `docs/public/` (copied as-is to the site) and section-specific folders like `docs/life/static/`.
- Root config files include `package.json`, `bun.lock`, `tailwind.config.js`, and `postcss.config.js`.

## Build, Test, and Development Commands
- `bun install` installs dependencies (Bun is preferred because `bun.lock` is committed).
- `bun run docs:dev` starts the VitePress dev server for local authoring.
- `bun run docs:build` builds the static site into `docs/.vitepress/dist`.
- `bun run docs:preview` serves the built site for a quick sanity check.

## Coding Style & Naming Conventions
- Markdown files use clear H2/H3 sections, short paragraphs, and relative links from `docs/` (example: `./academics/index.md`).
- Use lowercase paths with hyphens; avoid spaces in filenames. Place images under `docs/public/` or the nearest `static/` folder.
- TS/JS config files follow 2-space indentation and single quotes, matching `docs/.vitepress/config.mts`.

## Testing Guidelines
- There is no automated test suite configured. Validate changes by running `bun run docs:build` and spot-checking pages in `bun run docs:preview`.
- For content changes, also verify navigation and sidebar links in `docs/.vitepress/config.mts` if you add or move pages.

## Commit & Pull Request Guidelines
- Recent commits often follow a conventional style prefix like `feat:`, `chore:`, or `bug:` with a short summary; keep messages concise and action-oriented.
- Pull requests should include: a summary of updated pages, any config changes (nav/sidebar), and screenshots for visual or layout changes.
- Link related issues when applicable and note how you validated the update (dev server or build).

## Configuration Tips
- Markdown extensions are enabled (MathJax, task lists, footnotes, mark), so prefer built-in syntax over custom HTML when possible.
