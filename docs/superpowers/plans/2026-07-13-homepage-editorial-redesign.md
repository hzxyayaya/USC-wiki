# Homepage Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 USC Wiki 首页改造成与 Galaxy 蓝紫配色一致的「知性编辑」校园手册首页。

**Architecture:** 保留现有 `StarlightPage`、内容集合和 Pagefind 搜索，只重写 `src/pages/index.astro` 的首页数据、语义结构、局部样式和一个搜索触发脚本。全部样式继续使用 Starlight/Galaxy 变量，避免影响文档页。

**Tech Stack:** Astro 6、Starlight 0.39、Galaxy Theme、原生 CSS、Pagefind

**Commit policy:** 本计划不创建 Git 提交；只有用户明确要求时才提交。

---

### Task 1: 扩展首页展示数据

**Files:**
- Modify: `src/pages/index.astro:8-47`

- [ ] **Step 1: 为五个分类增加章节元数据**

将 `sections` 中的每项扩展为：

```js
{
	chapter: '01',
	kicker: '初来南华',
	title: '新生入门',
	description: '入学准备、校园网络、校历与防骗提醒。',
	href: '/新生入门/',
	accent: 'blue',
}
```

其余章节依次为：

```js
{ chapter: '02', kicker: '认真学习', title: '学习指南' }
{ chapter: '03', kicker: '好好生活', title: '校园生活' }
{ chapter: '04', kicker: '办好事情', title: '事务办理' }
{ chapter: '05', kicker: '走得更远', title: '竞赛与资源' }
```

- [ ] **Step 2: 保留现有高频入口与动态笔记数量**

继续使用 `highlights` 和 `noteCount`，不改变现有路由或统计口径。

### Task 2: 重写首页语义结构

**Files:**
- Modify: `src/pages/index.astro:50-94`

- [ ] **Step 1: 替换首页正文为编辑式结构**

在 `StarlightPage` 内按以下顺序渲染：

```astro
<div class="home-shell">
	<header class="edition-header">
		<a class="edition-brand" href="/">USC WIKI <span>/ 南华手册</span></a>
		<nav aria-label="首页快捷导航">
			<a href="/学习指南/">全部目录</a>
			<a href="/经验分享/">经验分享</a>
			<a href="/关于本站/加入社区/">参与共建</a>
		</nav>
	</header>

	<section class="cover" aria-labelledby="home-title">
		<div class="folio" aria-hidden="true">
			<strong>01</strong>
			<span>THE STUDENT<br />FIELD GUIDE</span>
		</div>
		<div class="cover-copy">
			<p class="eyebrow">由学生共同维护 · 持续更新</p>
			<h1 id="home-title">在南华，找到<br />你需要的答案。</h1>
			<p>课程、办事、校园生活与竞赛资源，整理成一本可以反复翻阅的学生手册。</p>
		</div>
		<button class="home-search" type="button" data-home-search>
			<span>搜索课程、办事流程或校园生活</span>
			<kbd>Ctrl K</kbd>
		</button>
	</section>

	<nav class="chapter-index" aria-label="内容章节">
		{sections.map((section) => (
			<a class={`chapter ${section.accent}`} href={section.href}>
				<span class="chapter-line" aria-hidden="true"></span>
				<span class="chapter-number">CHAPTER {section.chapter}</span>
				<strong>{section.kicker}</strong>
				<span class="chapter-title">{section.title}</span>
				<p>{section.description}</p>
			</a>
		))}
	</nav>

	<section class="utility-row" aria-label="常用入口">
		<div class="site-stat">当前收录 <strong>{noteCount}</strong> 篇校园笔记</div>
		<div class="quick-links">
			{highlights.map((item) => <a href={item.href}>{item.title}</a>)}
		</div>
	</section>

	<footer class="home-note">
		<p>本站内容由学生社区贡献，仅供参考，不代表南华大学官方立场。</p>
		<a href="/关于本站/">了解本站</a>
	</footer>
</div>
```

- [ ] **Step 2: 连接首页搜索按钮**

在页面底部加入：

```astro
<script>
	document.querySelector('[data-home-search]')?.addEventListener('click', () => {
		document.querySelector<HTMLButtonElement>('site-search button[data-open-modal]')?.click();
	});
</script>
```

现有 `Search.astro` 继续负责模态框、Pagefind 加载、错误提示和快捷键。

### Task 3: 实现 Galaxy 编辑式样式

**Files:**
- Modify: `src/pages/index.astro:96-309`

- [ ] **Step 1: 建立页面网格和排版**

用 scoped CSS 完成：

```css
.home-shell {
	max-width: 76rem;
	margin-inline: auto;
	padding: clamp(1.5rem, 4vw, 3rem) 0 3rem;
}

.edition-header,
.cover,
.chapter-index,
.utility-row,
.home-note {
	border-color: var(--sl-color-hairline);
}

.cover {
	display: grid;
	grid-template-columns: 7rem minmax(0, 1fr) minmax(15rem, 19rem);
	gap: clamp(1.5rem, 3vw, 2.5rem);
	padding-block: clamp(2.5rem, 6vw, 5rem);
	border-bottom: 1px solid var(--sl-color-hairline);
}
```

标题使用中文衬线回退栈：

```css
.cover h1,
.chapter strong {
	font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", SimSun, serif;
}
```

- [ ] **Step 2: 实现章节索引**

桌面端五列、无大面积卡片背景；分类色仅赋给 `--chapter-accent`：

```css
.chapter-index {
	display: grid;
	grid-template-columns: repeat(5, minmax(0, 1fr));
	border-bottom: 1px solid var(--sl-color-hairline);
}

.chapter {
	min-width: 0;
	padding: 1.5rem 1.25rem 1.75rem;
	border-inline-end: 1px solid var(--sl-color-hairline);
	color: inherit;
	text-decoration: none;
}

.chapter-line {
	display: block;
	width: 2rem;
	height: 3px;
	margin-bottom: 1.25rem;
	background: var(--chapter-accent);
}
```

沿用五个现有色值，并在悬停时只改变文字、细线宽度和轻微位移。

- [ ] **Step 3: 实现搜索、常用入口和状态**

`home-search` 使用透明背景、蓝色顶边和现有灰度变量；`quick-links` 使用文本链接与分隔符，不恢复胶囊按钮。所有交互元素添加 `:focus-visible`。

- [ ] **Step 4: 实现明暗主题和响应式**

不硬编码页面背景，依赖主题变量自动切换。增加两个断点：

```css
@media (max-width: 64rem) {
	.cover { grid-template-columns: 6rem 1fr; }
	.home-search { grid-column: 2; }
	.chapter-index { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 40rem) {
	.edition-header { align-items: flex-start; }
	.edition-header nav { display: none; }
	.cover { grid-template-columns: 1fr; }
	.folio { display: flex; align-items: baseline; gap: 1rem; }
	.home-search { grid-column: auto; width: 100%; }
	.chapter-index { grid-template-columns: 1fr; }
}
```

加入 `prefers-reduced-motion`，关闭淡入和悬停位移。

### Task 4: 构建与视觉验证

**Files:**
- Verify: `src/pages/index.astro`

- [ ] **Step 1: 检查 IDE 诊断**

读取 `src/pages/index.astro` 的 lint/类型诊断，预期无新增错误。

- [ ] **Step 2: 运行生产构建**

Run:

```bash
pnpm build
```

Expected: Astro 构建成功，Pagefind 同步成功，退出码为 0。

- [ ] **Step 3: 启动或复用开发服务器**

Run:

```bash
pnpm dev
```

Expected: 输出本地 Astro URL，首页可访问。

- [ ] **Step 4: 浏览器检查**

检查：

- 桌面、平板、手机布局；
- 浅色和深色模式；
- 首页搜索按钮与 `Ctrl/⌘ + K`；
- 五个章节和常用入口；
- 键盘焦点；
- 文档页和 404 页面未受影响。

- [ ] **Step 5: 查看最终差异**

运行 `git diff -- src/pages/index.astro`，确认只包含本次首页实现，且未覆盖用户的其他未提交修改。
# USC Wiki 首页「知性编辑」改版实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 USC Wiki 首页改造成沿用 Galaxy 蓝紫配色、支持明暗主题的编辑式校园手册首页。

**Architecture:** 保留 `StarlightPage`、内容集合与现有搜索组件，只重写 `src/pages/index.astro` 的首页数据、语义结构和 scoped CSS。首页搜索按钮通过点击全站 `site-search button[data-open-modal]` 打开现有 Pagefind 模态框，不复制搜索逻辑。

**Tech Stack:** Astro 6、Starlight 0.39、Galaxy 主题、Pagefind、原生 CSS Grid

---

## 文件结构

- 修改 `src/pages/index.astro`：首页数据、编辑式结构、响应式样式和搜索触发脚本。
- 不创建运行时代码文件，不修改全局主题与文档页样式。
- 使用现有 `src/components/Search.astro` 提供搜索能力。

### Task 1：重组首页数据和语义结构

**Files:**
- Modify: `src/pages/index.astro:8-94`

- [ ] **Step 1：记录修改前构建基线**

Run:

```powershell
pnpm build
```

Expected: 构建成功并生成首页；若仓库当前其他未提交改动导致失败，记录与 `index.astro` 无关的原始错误后再继续。

- [ ] **Step 2：扩展章节数据**

将 `sections` 中每项改为以下形状，并保留原有五个路由：

```js
const sections = [
	{
		chapter: '01',
		kicker: 'CHAPTER 01',
		title: '初来南华',
		label: '新生入门',
		description: '入学准备、校园网络、校历与防骗提醒。',
		href: '/新生入门/',
		accent: 'blue',
	},
	{
		chapter: '02',
		kicker: 'CHAPTER 02',
		title: '认真学习',
		label: '学习指南',
		description: '教务、学院专业、课程攻略与学习资料。',
		href: '/学习指南/',
		accent: 'cyan',
	},
	{
		chapter: '03',
		kicker: 'CHAPTER 03',
		title: '好好生活',
		label: '校园生活',
		description: '常用软件、校园网络与日常生活指南。',
		href: '/校园生活/',
		accent: 'green',
	},
	{
		chapter: '04',
		kicker: 'CHAPTER 04',
		title: '办好事情',
		label: '事务办理',
		description: '报销、研学、驾照等常用办事流程。',
		href: '/事务办理/',
		accent: 'amber',
	},
	{
		chapter: '05',
		kicker: 'CHAPTER 05',
		title: '走得更远',
		label: '竞赛与资源',
		description: '竞赛、教程、软件、模板与共享资源。',
		href: '/竞赛与资源/',
		accent: 'orange',
	},
];
```

- [ ] **Step 3：替换首页主体**

在 `StarlightPage` 中按以下语义层级组织：

```astro
<main class="field-guide">
	<header class="guide-masthead">
		<a class="guide-brand" href="/">USC WIKI <span>/ 南华手册</span></a>
		<nav aria-label="首页快捷导航">
			<a href="/学习指南/">全部目录</a>
			<a href="/经验分享/">经验分享</a>
			<a href="/关于本站/加入社区/">参与共建</a>
		</nav>
	</header>

	<section class="guide-cover" aria-labelledby="home-title">
		<div class="guide-folio" aria-hidden="true">
			<strong>01</strong>
			<span>THE STUDENT<br />FIELD GUIDE</span>
		</div>
		<div class="guide-intro">
			<p class="eyebrow">由学生共同维护 · 持续更新</p>
			<h1 id="home-title">在南华，找到<br />你需要的答案。</h1>
			<p>课程、办事、校园生活与竞赛资源，整理成一本可以反复翻阅的学生手册。</p>
		</div>
		<button class="home-search" type="button" data-home-search>
			<span>搜索课程、办事流程或校园生活</span>
			<kbd>Ctrl K</kbd>
		</button>
	</section>

	<nav class="chapter-index" aria-label="内容分类">
		{sections.map((section) => (
			<a class={`chapter ${section.accent}`} href={section.href}>
				<span class="chapter-mark" aria-hidden="true"></span>
				<small>{section.kicker}</small>
				<strong>{section.title}</strong>
				<span class="chapter-label">{section.label}</span>
				<p>{section.description}</p>
			</a>
		))}
	</nav>

	<section class="guide-utilities" aria-labelledby="utilities-title">
		<div>
			<p class="utility-kicker">QUICK REFERENCE</p>
			<h2 id="utilities-title">常用入口</h2>
		</div>
		<div class="utility-links">
			{highlights.map((item) => <a href={item.href}>{item.title}<span>↗</span></a>)}
		</div>
	</section>

	<footer class="guide-footer">
		<p>当前收录 <strong>{noteCount}</strong> 篇校园笔记</p>
		<p>本站内容由学生社区贡献，仅供参考，不代表南华大学官方立场。</p>
	</footer>
</main>
```

- [ ] **Step 4：接通首页搜索按钮**

在页面底部添加脚本，只转发点击，不接触 Pagefind 内部状态：

```astro
<script>
	const homeSearch = document.querySelector<HTMLButtonElement>('[data-home-search]');
	homeSearch?.addEventListener('click', () => {
		document.querySelector<HTMLButtonElement>('site-search button[data-open-modal]')?.click();
	});
</script>
```

- [ ] **Step 5：运行构建验证语义结构**

Run:

```powershell
pnpm build
```

Expected: `astro build` 和 Pagefind 同步成功，无 Astro 模板或 TypeScript 错误。

### Task 2：实现 Galaxy 配色的编辑式视觉

**Files:**
- Modify: `src/pages/index.astro:96-end`

- [ ] **Step 1：建立首页局部设计令牌**

在 scoped `<style>` 中为 `.field-guide` 定义：

```css
.field-guide {
	--guide-rule: var(--sl-color-hairline);
	--guide-muted: var(--sl-color-gray-3);
	--guide-ink: var(--sl-color-white);
	--guide-accent: var(--sl-color-accent);
	--guide-accent-high: var(--sl-color-accent-high);
	max-width: 76rem;
	margin-inline: auto;
	padding: clamp(1.25rem, 3vw, 2.5rem) 0 3rem;
}
```

- [ ] **Step 2：实现抬头与封面网格**

样式要求：

- 抬头使用一条 `var(--guide-rule)` 分隔线；
- 桌面封面列宽为 `7rem minmax(0, 1fr) minmax(15rem, 20rem)`；
- 标题使用 `"Songti SC", "STSong", "Noto Serif SC", Georgia, serif`；
- 搜索按钮使用透明背景、蓝色上边线和可见焦点；
- 不使用大面积渐变、玻璃拟态或厚重阴影。

- [ ] **Step 3：实现五章索引**

样式要求：

- 桌面五等分；
- 每章之间使用细分隔线；
- `blue/cyan/green/amber/orange` 仅设置 `--chapter-accent`；
- `.chapter-mark` 为短色线；
- 悬停时只改变标题颜色并轻微向上移动；
- `:focus-visible` 使用 `2px solid var(--chapter-accent)`。

- [ ] **Step 4：实现常用入口和页脚**

常用入口使用横向文本链接与箭头，不恢复旧版药丸按钮。页脚左右分栏展示笔记数和免责声明，分隔线与正文主题变量保持一致。

- [ ] **Step 5：添加响应式断点**

```css
@media (max-width: 64rem) {
	.guide-cover { grid-template-columns: 5rem minmax(0, 1fr); }
	.home-search { grid-column: 2; }
	.chapter-index { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 40rem) {
	.guide-masthead,
	.guide-footer { align-items: flex-start; flex-direction: column; }
	.guide-cover { grid-template-columns: 1fr; }
	.guide-folio { display: flex; align-items: end; gap: 1rem; }
	.home-search { grid-column: 1; width: 100%; }
	.chapter-index { grid-template-columns: 1fr; }
	.chapter { border-inline-end: 0; }
}

@media (prefers-reduced-motion: reduce) {
	.chapter,
	.utility-links a { transition: none; }
}
```

- [ ] **Step 6：运行构建**

Run:

```powershell
pnpm build
```

Expected: 构建成功，CSS 无解析错误。

### Task 3：浏览器验收

**Files:**
- Verify: `src/pages/index.astro`

- [ ] **Step 1：启动或复用开发服务器**

Run:

```powershell
pnpm dev
```

Expected: Astro 输出本地访问地址并保持运行。

- [ ] **Step 2：检查桌面浅色与深色**

检查：

- 标题、搜索、五章索引首屏层级明确；
- 浅色模式为 Galaxy 冷白与蓝色；
- 深色模式为 `#17181c` 与淡蓝紫；
- 分类色只出现在短线与交互状态；
- 顶栏与文档页视觉没有被首页 scoped CSS 影响。

- [ ] **Step 3：检查响应式**

分别以约 1024 px、768 px、390 px 宽度检查：

- 无水平滚动；
- 中文标题没有孤立单字；
- 搜索按钮可见；
- 五章链接可点击且不重叠；
- 常用入口与免责声明保持可读。

- [ ] **Step 4：检查交互和键盘**

验证：

- 点击首页搜索打开现有 Pagefind 模态框；
- `Ctrl/⌘ + K` 仍可打开搜索；
- Tab 可遍历抬头导航、搜索、五章和常用入口；
- 焦点轮廓清晰；
- 开启减少动态效果后无位移动画。

- [ ] **Step 5：最终构建**

Run:

```powershell
pnpm build
```

Expected: 命令退出码为 0，首页与 Pagefind 索引生成成功。
