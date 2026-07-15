import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { createSearchAPI } from 'fumadocs-core/search/server';
import { structure } from 'fumadocs-core/mdx-plugins';
import { createTokenizer } from '@orama/tokenizers/mandarin';

const docsRoot = path.resolve('docs');
const outputPath = path.resolve('public/search-index.json');

const ignoredDirs = new Set([
	'.obsidian',
	'.vitepress',
	'superpowers',
	'public',
	'static',
	'_templates',
	'attachments',
]);

function walk(dir: string, files: string[] = []) {
	if (!fs.existsSync(dir)) return files;

	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name.startsWith('.') || ignoredDirs.has(entry.name)) continue;
			walk(fullPath, files);
			continue;
		}
		if (
			entry.isFile() &&
			/\.mdx?$/.test(entry.name) &&
			entry.name !== '404.md' &&
			entry.name !== '404.mdx'
		) {
			files.push(fullPath);
		}
	}

	return files;
}

function slugFromFile(filePath: string) {
	return path
		.relative(docsRoot, filePath)
		.split(path.sep)
		.join('/')
		.replace(/\.mdx?$/, '')
		.replace(/\/index$/, '');
}

function slugToUrl(slug: string) {
	return slug ? `/${slug}/` : '/';
}

const files = walk(docsRoot);
const indexes = files.map((filePath) => {
	const raw = fs.readFileSync(filePath, 'utf8');
	const { content, data } = matter(raw);
	const slug = slugFromFile(filePath);
	const title =
		(typeof data.title === 'string' && data.title) ||
		content.match(/^#\s+(.+)$/m)?.[1]?.trim() ||
		path.basename(filePath, path.extname(filePath));

	return {
		id: slugToUrl(slug),
		url: slugToUrl(slug),
		title,
		description: typeof data.description === 'string' ? data.description : undefined,
		structuredData: structure(content),
	};
});

const api = createSearchAPI('advanced', {
	indexes,
	components: {
		tokenizer: createTokenizer(),
	},
	search: {
		threshold: 0,
		tolerance: 0,
	},
});

const response = await api.staticGET();
const body = await response.text();

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, body);

console.log(`[search] wrote ${indexes.length} pages → ${path.relative(process.cwd(), outputPath)} (${body.length} bytes)`);
