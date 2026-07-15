import fs from 'node:fs';
import path from 'node:path';

export const docsRoot = path.join(process.cwd(), 'docs');
export const ignoredDirs = new Set([
	'.obsidian',
	'.vitepress',
	'superpowers',
	'public',
	'static',
	'_templates',
	'attachments',
]);

export type DocMeta = {
	title: string;
	order: number | null;
	label: string | null;
	draft: boolean;
	description?: string;
};

export type SidebarLink = { label: string; link: string };
export type SidebarGroup = { label: string; collapsed: boolean; items: SidebarItem[] };
export type SidebarItem = SidebarLink | SidebarGroup;

export function isIndexFile(name: string) {
	return name === 'index.md' || name === 'index.mdx';
}

function stripQuotes(value?: string) {
	return value?.trim().replace(/^['"]|['"]$/g, '');
}

export function parseDocMeta(filePath: string): DocMeta {
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
	const description = stripQuotes(frontmatter.match(/^description\s*:\s*(.+)$/m)?.[1]);

	return { title, order, label, draft, description };
}

export function parseDirMeta(dir: string): DocMeta {
	for (const indexName of ['index.md', 'index.mdx']) {
		const indexPath = path.join(dir, indexName);
		if (fs.existsSync(indexPath)) return parseDocMeta(indexPath);
	}
	return { title: path.basename(dir), order: null, label: null, draft: false };
}

export function slugFromFile(filePath: string) {
	return path
		.relative(docsRoot, filePath)
		.split(path.sep)
		.join('/')
		.replace(/\.mdx?$/, '')
		.replace(/\/index$/, '')
		.toLowerCase();
}

export function slugToUrl(slug: string) {
	return slug ? `/${slug}/` : '/';
}

function compareEntries(
	a: { name: string; isDir: boolean; order: number | null; sortLabel: string },
	b: { name: string; isDir: boolean; order: number | null; sortLabel: string }
) {
	const aIndex = isIndexFile(a.name);
	const bIndex = isIndexFile(b.name);
	if (aIndex !== bIndex) return aIndex ? -1 : 1;

	if (a.order !== null && b.order !== null && a.order !== b.order) return a.order - b.order;
	if (a.order !== null && b.order === null) return -1;
	if (a.order === null && b.order !== null) return 1;

	if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
	return a.sortLabel.localeCompare(b.sortLabel, 'zh-CN');
}

export function makeSidebar(isProduction = process.env.NODE_ENV === 'production') {
	function makeDirectoryItems(dir: string): SidebarItem[] {
		if (!fs.existsSync(dir)) return [];

		return fs
			.readdirSync(dir, { withFileTypes: true })
			.filter((entry) => {
				if (entry.isDirectory()) return !entry.name.startsWith('.') && !ignoredDirs.has(entry.name);
				return (
					entry.isFile() &&
					/\.mdx?$/.test(entry.name) &&
					entry.name !== '404.md' &&
					entry.name !== '404.mdx'
				);
			})
			.map((entry) => {
				const fullPath = path.join(dir, entry.name);
				const isDir = entry.isDirectory();
				const meta = isDir ? parseDirMeta(fullPath) : parseDocMeta(fullPath);

				if (!isDir && meta.draft && isProduction) return null;

				const label = meta.label || meta.title;
				const displayLabel = meta.draft && !isProduction ? `${label}（草稿）` : label;

				return {
					name: entry.name,
					isDir,
					order: meta.order,
					sortLabel: label,
					item: isDir
						? { label: displayLabel, collapsed: true, items: makeDirectoryItems(fullPath) }
						: { label: displayLabel, link: slugToUrl(slugFromFile(fullPath)) },
				};
			})
			.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
			.sort(compareEntries)
			.map((entry) => entry.item)
			.filter((item) => {
				if (!('items' in item)) return true;
				return Array.isArray(item.items) && item.items.length > 0;
			});
	}

	return makeDirectoryItems(docsRoot);
}
