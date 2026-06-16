import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: glob({
			base: './docs',
			pattern: [
				'**/[^_]*.{md,mdx}',
				'!index.{md,mdx}',
				'!.obsidian/**',
				'!.vitepress/**',
				'!superpowers/**',
				'!public/**',
				'!static/**',
			],
		}),
		schema: docsSchema(),
	}),
};
