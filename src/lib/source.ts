import { docs } from 'collections/server';
import { loader, type InferPageType, update } from 'fumadocs-core/source';
import { filterPublishedSourceFiles, hasDraftFlag } from '@/lib/drafts';
import { createShortSlugMap, resolveDocFilePath } from '@/lib/short-slugs.mjs';

const docsSource = docs.toFumadocsSource();
const publishedSource =
	process.env.NODE_ENV === 'production'
		? update(docsSource).files(filterPublishedSourceFiles).build()
		: docsSource;
const sourceSlugMap = createShortSlugMap(
	publishedSource.files
		.filter((file) => file.type === 'page')
		.map((file) => ({
			key: resolveDocFilePath(file.path),
			filePath: file.path,
			explicitSlug:
				typeof file.data === 'object' &&
				file.data !== null &&
				'slug' in file.data &&
				typeof file.data.slug === 'string'
					? file.data.slug
					: undefined,
		})),
);

export const source = loader({
	baseUrl: '/',
	source: publishedSource,
	slugs: (file) => (sourceSlugMap.get(resolveDocFilePath(file.path)) || '').split('/').filter(Boolean),
	// 与 next.config trailingSlash: true 对齐，避免侧栏/wiki 链接斜杠不一致
	url: (slugs) => (slugs.length === 0 ? '/' : `/${slugs.join('/')}/`),
});

export type WikiPage = InferPageType<typeof source>;

export function isDraftPage(page: WikiPage) {
	return hasDraftFlag(page.data);
}

export function getPublishedPages() {
	return source.getPages();
}
