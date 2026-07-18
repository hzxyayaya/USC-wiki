import {
	defineConfig,
	defineDocs,
	frontmatterSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkResourceCards } from './src/remark/resource-cards.mjs';
import { remarkWikiMarkdown } from './src/remark/wiki-markdown.mjs';
import { remarkDocMeta } from './src/remark/doc-meta.mjs';
import { rehypeResourceCards } from './src/rehype/resource-cards.mjs';
import { rehypeWikiImageEmbeds } from './src/rehype/wiki-image-embeds.mjs';
import { rehypeWikiLinks } from './src/rehype/wiki-links.mjs';

/** 兼容 Obsidian / 原 Starlight frontmatter，不强制改 docs 内容 */
const wikiFrontmatterSchema = frontmatterSchema
	.extend({
		title: z.string().optional(),
		order: z.union([z.number(), z.string()]).optional(),
		draft: z.boolean().optional(),
		created: z.union([z.string(), z.date()]).optional(),
		updated: z.union([z.string(), z.date()]).optional(),
		sidebar: z
			.object({
				order: z.union([z.number(), z.string()]).optional(),
				label: z.string().optional(),
			})
			.optional(),
	})
	.passthrough();

export const docs = defineDocs({
	dir: 'docs',
	docs: {
		schema: wikiFrontmatterSchema,
		files: [
			'**/*.{md,mdx}',
			'!**/_templates/**',
			'!**/superpowers/**',
			'!**/public/**',
			'!**/static/**',
			'!**/attachments/**',
			'!**/404.md',
			'!**/404.mdx',
		],
	},
});

export default defineConfig({
	mdxOptions: {
		// 用函数形式合并，避免覆盖 Fumadocs 默认插件
		remarkPlugins: (plugins) => [
			// 不要用 remark-directive：会把 9:00 / 16:00 里的 :00 解析成指令，编成非法 <div>
			remarkResourceCards,
			remarkWikiMarkdown,
			remarkDocMeta,
			remarkMath,
			...plugins,
		],
		// KaTeX 必须在 rehype-code 之前，否则 ```math / $$ 会被 Shiki 当成未知语言
		rehypePlugins: (plugins) => [
			rehypeKatex,
			rehypeResourceCards,
			rehypeWikiImageEmbeds,
			rehypeWikiLinks,
			...plugins,
		],
	},
});
