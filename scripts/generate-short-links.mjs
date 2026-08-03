import fs from 'node:fs';
import path from 'node:path';
import {
	filterSearchableMarkdownFiles,
	legacySlugFromFile,
	slugFromFile,
	slugToUrl,
	walkMarkdownFiles,
} from '../src/lib/docs-shared.mjs';

const outputPath = path.resolve('public/_redirects');

function encodePath(pathname) {
	return pathname
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');
}

function docUrl(slug) {
	return encodePath(slugToUrl(slug));
}

const files = filterSearchableMarkdownFiles(walkMarkdownFiles());
const rules = files
	.map((filePath) => {
		const legacyUrl = docUrl(legacySlugFromFile(filePath));
		const shortUrl = docUrl(slugFromFile(filePath));
		return legacyUrl === shortUrl ? null : `${legacyUrl} ${shortUrl} 301`;
	})
	.filter(Boolean)
	.sort();

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
	outputPath,
	`# Auto-generated from docs paths. Do not edit manually.\n${rules.join('\n')}\n`,
);

console.log(`[short-links] wrote ${rules.length} compatibility redirects → ${path.relative(process.cwd(), outputPath)}`);
