import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { createSearchAPI } from 'fumadocs-core/search/server';
import { structure } from 'fumadocs-core/mdx-plugins';
import { createTokenizer } from '@orama/tokenizers/mandarin';
import {
	parseDocMeta,
	slugFromFile,
	slugToUrl,
	walkMarkdownFiles,
} from '../src/lib/docs-shared.mjs';

const outputPath = path.resolve('public/search-index.json');

const files = walkMarkdownFiles();
const indexes = files.map((filePath) => {
	const raw = fs.readFileSync(filePath, 'utf8');
	const { content, data } = matter(raw);
	const slug = slugFromFile(filePath);
	const meta = parseDocMeta(filePath);
	const title = (typeof data.title === 'string' && data.title) || meta.title;

	return {
		id: slugToUrl(slug),
		url: slugToUrl(slug),
		title,
		description:
			(typeof data.description === 'string' && data.description) || meta.description,
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

console.log(
	`[search] wrote ${indexes.length} pages → ${path.relative(process.cwd(), outputPath)} (${body.length} bytes)`
);
