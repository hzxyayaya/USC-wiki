import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { docsRoot, ignoredDirs, parseDocMeta, slugFromFile } from './meta';

export type DocPage = {
	slug: string;
	filePath: string;
	title: string;
	description?: string;
	draft: boolean;
	content: string;
};

function walkDocs(dir: string, results: string[] = []) {
	if (!fs.existsSync(dir)) return results;

	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			if (entry.name.startsWith('.') || ignoredDirs.has(entry.name)) continue;
			walkDocs(fullPath, results);
			continue;
		}

		if (entry.isFile() && /\.mdx?$/.test(entry.name) && entry.name !== '404.md' && entry.name !== '404.mdx') {
			results.push(fullPath);
		}
	}

	return results;
}

export function getAllDocPages(): DocPage[] {
	const isProduction = process.env.NODE_ENV === 'production';
	const pages: DocPage[] = [];

	for (const filePath of walkDocs(docsRoot)) {
		const raw = fs.readFileSync(filePath, 'utf-8');
		const { content, data } = matter(raw);
		const meta = parseDocMeta(filePath);

		if (meta.draft && isProduction) continue;

		pages.push({
			slug: slugFromFile(filePath),
			filePath,
			title: meta.title,
			description: meta.description || (typeof data.description === 'string' ? data.description : undefined),
			draft: meta.draft,
			content,
		});
	}

	return pages;
}

export function normalizeSlug(slug: string | string[] | undefined) {
	const raw = Array.isArray(slug) ? slug.join('/') : (slug ?? '');
	return raw
		.split('/')
		.filter(Boolean)
		.map((segment) => {
			try {
				return decodeURIComponent(segment);
			} catch {
				return segment;
			}
		})
		.join('/')
		.toLowerCase()
		.replace(/^\/+|\/+$/g, '');
}

export function getDocBySlug(slug: string | string[] | undefined) {
	const normalized = normalizeSlug(slug);
	if (!normalized) return null;
	return getAllDocPages().find((page) => page.slug === normalized) ?? null;
}

export function getAllDocSlugs() {
	return getAllDocPages().map((page) => page.slug);
}
