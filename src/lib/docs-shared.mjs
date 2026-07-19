import fs from 'node:fs';
import path from 'node:path';

export const docsRoot = path.resolve(process.cwd(), 'docs');

/** 扫描 markdown 时跳过的目录（与 source.config.ts 排除规则对齐） */
export const ignoredDocDirs = new Set([
	'.obsidian',
	'.vitepress',
	'superpowers',
	'public',
	'static',
	'attachments',
	'attachment',
	'assets',
	'_templates',
]);

/** 扫描 vault 附件时跳过；仍进入 static / attachments */
export const ignoredAssetDirs = new Set(['.obsidian', '.vitepress', 'superpowers', 'public', '_templates']);

export const markdownExtensions = new Set(['.md', '.mdx']);

export const vaultFileExtensions = new Set([
	'.png',
	'.jpg',
	'.jpeg',
	'.gif',
	'.webp',
	'.svg',
	'.pdf',
	'.doc',
	'.docx',
	'.xls',
	'.xlsx',
]);

export function toPosix(value) {
	return value.split(path.sep).join('/');
}

export function stripQuotes(value) {
	return value?.trim().replace(/^['"]|['"]$/g, '');
}

/**
 * @param {string} filePath
 * @param {{ lowercase?: boolean }} [options]
 */
export function slugFromFile(filePath, { lowercase = false } = {}) {
	let slug = toPosix(path.relative(docsRoot, filePath))
		.replace(/\.mdx?$/, '')
		.replace(/\/index$/, '');
	if (lowercase) slug = slug.toLowerCase();
	return slug;
}

export function slugToUrl(slug) {
	return slug ? `/${slug}/` : '/';
}

/**
 * @param {string} dir
 * @param {Set<string>} extensions
 * @param {Set<string>} [ignoredDirs]
 * @param {string[]} [results]
 */
export function walkFiles(dir, extensions, ignoredDirs = ignoredDocDirs, results = []) {
	if (!fs.existsSync(dir)) return results;

	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			if (entry.name.startsWith('.') || ignoredDirs.has(entry.name)) continue;
			walkFiles(fullPath, extensions, ignoredDirs, results);
			continue;
		}

		const extension = path.extname(entry.name).toLowerCase();
		if (extensions.has(extension)) results.push(fullPath);
	}

	return results;
}

/**
 * @param {string} [dir]
 * @param {string[]} [results]
 */
export function walkMarkdownFiles(dir = docsRoot, results = []) {
	for (const filePath of walkFiles(dir, markdownExtensions, ignoredDocDirs, [])) {
		const base = path.basename(filePath);
		if (base === '404.md' || base === '404.mdx') continue;
		results.push(filePath);
	}
	return results;
}

/**
 * @param {string} [dir]
 * @param {string[]} [results]
 */
export function walkVaultAssets(dir = docsRoot, results = []) {
	return walkFiles(dir, vaultFileExtensions, ignoredAssetDirs, results);
}

/**
 * @param {string} filePath
 */
export function parseDocMeta(filePath) {
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
	const created = stripQuotes(frontmatter.match(/^created\s*:\s*(.+)$/m)?.[1]);
	const updated = stripQuotes(frontmatter.match(/^updated\s*:\s*(.+)$/m)?.[1]);

	return { title, order, label, draft, description, created, updated };
}
