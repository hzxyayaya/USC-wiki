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

export function slugFromFile(filePath: string) {
	return path
		.relative(docsRoot, filePath)
		.split(path.sep)
		.join('/')
		.replace(/\.mdx?$/, '')
		.replace(/\/index$/, '')
		.toLowerCase();
}
