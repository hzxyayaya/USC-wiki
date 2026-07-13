// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeKatex from 'rehype-katex';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import galaxy from 'starlight-theme-galaxy';
import { remarkResourceCards } from './src/remark/resource-cards.mjs';
import { remarkDocMeta } from './src/remark/doc-meta.mjs';
import { remarkWikiMarkdown } from './src/remark/wiki-markdown.mjs';
import { rehypeResourceCards } from './src/rehype/resource-cards.mjs';
import { rehypeWikiImageEmbeds } from './src/rehype/wiki-image-embeds.mjs';
import { rehypeWikiLinks } from './src/rehype/wiki-links.mjs';

const docsRoot = path.resolve('docs');
const ignoredDirs = new Set(['.obsidian', '.vitepress', 'superpowers', 'public', 'static', '_templates', 'attachments']);

/**
 * @typedef {{ label: string, link: string } | { label: string, collapsed: boolean, items: SidebarItem[] }} SidebarItem
 */

/**
 * @typedef {{ title: string, order: number | null, label: string | null, draft: boolean }} DocMeta
 */

const isProductionBuild =
	process.env.NODE_ENV === 'production' || process.argv.includes('build');

const isIndexFile = (name) => name === 'index.md' || name === 'index.mdx';

function stripQuotes(value) {
	return value?.trim().replace(/^['"]|['"]$/g, '');
}

/**
 * 读取文档 frontmatter，支持顶层 `order` 与 Starlight 风格的 `sidebar.order` / `sidebar.label`。
 * @param {string} filePath
 * @returns {DocMeta}
 */
function parseDocMeta(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';

	const title =
		stripQuotes(frontmatter.match(/^title\s*:\s*(.+)$/m)?.[1]) ||
		content.match(/^#\s+(.+)$/m)?.[1]?.trim() ||
		path.basename(filePath, path.extname(filePath));

	const sidebarBlock = frontmatter.match(/^sidebar\s*:\s*\r?\n((?:[ \t]+.+\r?\n?)*)/m)?.[1] ?? '';
	const orderRaw =
		frontmatter.match(/^order\s*:\s*(-?\d+(?:\.\d+)?)\s*$/m)?.[1] ??
		sidebarBlock.match(/order\s*:\s*(-?\d+(?:\.\d+)?)/)?.[1];
	const order = orderRaw === undefined ? null : Number(orderRaw);
	const label = stripQuotes(sidebarBlock.match(/label\s*:\s*(.+)/)?.[1]) || null;
	const draftRaw = frontmatter.match(/^draft\s*:\s*(true|false)\s*$/m)?.[1];
	const draft = draftRaw === 'true';

	return { title, order, label, draft };
}

/**
 * 读取目录的展示信息（取目录内 index.md 的标题/排序），无 index.md 时回退到目录名。
 * @param {string} dir
 * @returns {DocMeta}
 */
function parseDirMeta(dir) {
	for (const indexName of ['index.md', 'index.mdx']) {
		const indexPath = path.join(dir, indexName);
		if (fs.existsSync(indexPath)) return parseDocMeta(indexPath);
	}
	return { title: path.basename(dir), order: null, label: null, draft: false };
}

/**
 * @param {string} filePath
 */
function slugFromFile(filePath) {
	return path
		.relative(docsRoot, filePath)
		.split(path.sep)
		.join('/')
		.replace(/\.mdx?$/, '')
		.replace(/\/index$/, '');
}

/**
 * @param {{ name: string, isDir: boolean, order: number | null, sortLabel: string }} a
 * @param {{ name: string, isDir: boolean, order: number | null, sortLabel: string }} b
 */
function compareEntries(a, b) {
	const aIndex = isIndexFile(a.name);
	const bIndex = isIndexFile(b.name);
	if (aIndex !== bIndex) return aIndex ? -1 : 1;

	if (a.order !== null && b.order !== null && a.order !== b.order) return a.order - b.order;
	if (a.order !== null && b.order === null) return -1;
	if (a.order === null && b.order !== null) return 1;

	if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
	return a.sortLabel.localeCompare(b.sortLabel, 'zh-CN');
}

/**
 * @param {string} dir
 * @returns {SidebarItem[]}
 */
function makeDirectoryItems(dir) {
	if (!fs.existsSync(dir)) return [];

	return fs
		.readdirSync(dir, { withFileTypes: true })
		.filter((entry) => {
			if (entry.isDirectory()) return !entry.name.startsWith('.') && !ignoredDirs.has(entry.name);
			return entry.isFile() && /\.mdx?$/.test(entry.name) && entry.name !== '404.md' && entry.name !== '404.mdx';
		})
		.map((entry) => {
			const fullPath = path.join(dir, entry.name);
			const isDir = entry.isDirectory();
			const meta = isDir ? parseDirMeta(fullPath) : parseDocMeta(fullPath);

			if (!isDir && meta.draft && isProductionBuild) return null;

			const label = meta.label || meta.title;
			const displayLabel = meta.draft && !isProductionBuild ? `${label}（草稿）` : label;

			return {
				name: entry.name,
				isDir,
				order: meta.order,
				sortLabel: label,
				item: isDir
					? { label: displayLabel, collapsed: true, items: makeDirectoryItems(fullPath) }
					: { label: displayLabel, link: `/${slugFromFile(fullPath).toLowerCase()}/` },
			};
		})
		.filter(Boolean)
		.sort(compareEntries)
		.map((entry) => entry.item)
		.filter((item) => {
			if (!('items' in item)) return true;
			return Array.isArray(item.items) && item.items.length > 0;
		});
}

function makeSidebar() {
	return makeDirectoryItems(docsRoot);
}

const hideSidebarScrollbarCss = fs.readFileSync(
	path.resolve('src/styles/critical-sidebar.css'),
	'utf-8'
);

/** 正式站点地址；用于 sitemap、canonical、OG 等 SEO 元数据 */
const DEFAULT_SITE = 'https://usc-wiki.netlify.app';

const siteFromEnv = process.env.SITE?.trim();
const netlifyUrl = process.env.URL?.trim();
const site =
	siteFromEnv ||
	(process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: netlifyUrl
				? netlifyUrl.startsWith('http')
					? netlifyUrl
					: `https://${netlifyUrl}`
				: process.env.NODE_ENV === 'production'
					? DEFAULT_SITE
					: 'http://localhost:4321');

// https://astro.build/config
export default defineConfig({
	site,
	markdown: {
		remarkPlugins: [remarkDirective, remarkResourceCards, remarkWikiMarkdown, remarkDocMeta, remarkMath],
		rehypePlugins: [rehypeKatex, rehypeResourceCards, rehypeWikiImageEmbeds, rehypeWikiLinks],
	},
	integrations: [
		starlight({
			title: 'USC Wiki',
			description: '南华大学校园知识库',
			defaultLocale: 'root',
			locales: {
				root: {
					label: '简体中文',
					lang: 'zh-CN',
				},
			},
			editLink: {
				baseUrl: 'https://github.com/hzxyayaya/USC-wiki/edit/main/',
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/hzxyayaya/USC-wiki',
				},
				{
					icon: 'external',
					label: '讨论区',
					href: 'https://github.com/hzxyayaya/USC-wiki/discussions',
				},
			],
			components: {
				Hero: './src/components/Hero.astro',
				Search: './src/components/Search.astro',
			},
			customCss: [
				'katex/dist/katex.min.css',
				'./src/styles/wiki-markdown.css',
				'./src/styles/wiki-theme.css',
				'./src/styles/wiki-no-gradients.css',
			],
			head: [
				{ tag: 'style', content: hideSidebarScrollbarCss },
				{ tag: 'script', attrs: { src: '/wiki-image-lightbox.js?v=1', defer: true } },
			],
			plugins: [galaxy()],
			sidebar: makeSidebar(),
		}),
	],
});
