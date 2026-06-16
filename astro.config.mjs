// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeKatex from 'rehype-katex';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import galaxy from 'starlight-theme-galaxy';
import { remarkWikiMarkdown } from './src/remark/wiki-markdown.mjs';
import { rehypeWikiImageEmbeds } from './src/rehype/wiki-image-embeds.mjs';
import { rehypeWikiLinks } from './src/rehype/wiki-links.mjs';

const docsRoot = path.resolve('docs');
const ignoredDirs = new Set(['.obsidian', '.vitepress', 'superpowers', 'public', 'static']);

/**
 * @typedef {{ label: string, link: string } | { label: string, collapsed: boolean, items: SidebarItem[] }} SidebarItem
 */

/**
 * @param {string} filePath
 */
function parseTitle(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
	const title = frontmatter?.match(/^title\s*:\s*(.+)$/m)?.[1];

	return (
		title?.trim().replace(/^['"]|['"]$/g, '') ||
		content.match(/^#\s+(.+)$/m)?.[1]?.trim() ||
		path.basename(filePath, path.extname(filePath))
	);
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
 * @param {fs.Dirent} a
 * @param {fs.Dirent} b
 */
function sortDirectoryEntries(a, b) {
	if (a.name === 'index.md' || a.name === 'index.mdx') return -1;
	if (b.name === 'index.md' || b.name === 'index.mdx') return 1;
	if (a.isDirectory() && !b.isDirectory()) return -1;
	if (!a.isDirectory() && b.isDirectory()) return 1;
	return a.name.localeCompare(b.name, 'zh-CN');
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
			return entry.isFile() && /\.mdx?$/.test(entry.name);
		})
		.sort(sortDirectoryEntries)
		.map((entry) => {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				return {
					label: entry.name,
					collapsed: true,
					items: makeDirectoryItems(fullPath),
				};
			}

			return {
				label: parseTitle(fullPath),
				link: `/${slugFromFile(fullPath).toLowerCase()}/`,
			};
		})
		.filter((item) => {
			if (!('items' in item)) return true;
			return Array.isArray(item.items) && item.items.length > 0;
		});
}

function makeSidebar() {
	return makeDirectoryItems(docsRoot);
}

// https://astro.build/config
export default defineConfig({
	site: 'http://localhost:4321',
	markdown: {
		remarkPlugins: [remarkDirective, remarkWikiMarkdown, remarkMath],
		rehypePlugins: [rehypeKatex, rehypeWikiImageEmbeds, rehypeWikiLinks],
	},
	integrations: [
		starlight({
			title: 'USC Wiki',
			description: '南华大学校园知识库',
			disable404Route: true,
			customCss: ['katex/dist/katex.min.css', './src/styles/wiki-markdown.css'],
			head: [
				{ tag: 'script', attrs: { src: '/sidebar-scroll.js?v=3', defer: true } },
				{ tag: 'script', attrs: { src: '/wiki-image-lightbox.js?v=1', defer: true } },
			],
			plugins: [galaxy()],
			sidebar: makeSidebar(),
		}),
	],
});
