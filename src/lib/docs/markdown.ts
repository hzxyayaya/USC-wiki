import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { remarkResourceCards } from '../../remark/resource-cards.mjs';
import { remarkDocMeta } from '../../remark/doc-meta.mjs';
import { remarkWikiMarkdown } from '../../remark/wiki-markdown.mjs';
import { rehypeResourceCards } from '../../rehype/resource-cards.mjs';
import { rehypeWikiImageEmbeds } from '../../rehype/wiki-image-embeds.mjs';
import { rehypeWikiLinks } from '../../rehype/wiki-links.mjs';

export async function renderMarkdown(content: string, filePath: string) {
	const file = await unified()
		.use(remarkParse)
		.use(remarkResourceCards)
		.use(remarkWikiMarkdown)
		.use(remarkDocMeta)
		.use(remarkMath)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeKatex)
		.use(rehypeResourceCards)
		.use(rehypeWikiImageEmbeds)
		.use(rehypeWikiLinks)
		.use(rehypeRaw)
		.use(rehypeStringify)
		.process({ value: content, path: filePath });

	return String(file);
}
