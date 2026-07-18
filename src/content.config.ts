import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro:content';

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
				'!_templates/**',
				'!public/**',
				'!**/static/**',
				'!**/attachments/**',
			],
		}),
		schema: docsSchema({
			extend: z.object({
				created: z.coerce.date().optional(),
				updated: z.coerce.date().optional(),
			}),
		}),
	}),
};
