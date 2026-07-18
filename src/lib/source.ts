import { docs } from 'collections/server';
import { loader, type InferPageType } from 'fumadocs-core/source';

export const source = loader({
	baseUrl: '/',
	source: docs.toFumadocsSource(),
	// 与 next.config trailingSlash: true 对齐，避免侧栏/wiki 链接斜杠不一致
	url: (slugs) => (slugs.length === 0 ? '/' : `/${slugs.join('/')}/`),
});

export type WikiPage = InferPageType<typeof source>;

export function isDraftPage(page: WikiPage) {
	const data = page.data as { draft?: boolean };
	return data.draft === true;
}

export function getPublishedPages() {
	const isProduction = process.env.NODE_ENV === 'production';
	return source.getPages().filter((page) => !(isProduction && isDraftPage(page)));
}
