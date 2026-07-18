import type { MetadataRoute } from 'next';
import { getPublishedPages } from '@/lib/source';
import { getSiteUrl } from '@/lib/site';

export const dynamic = 'force-static';

function parseLastModified(value: unknown): Date | undefined {
	if (value instanceof Date) return value;
	if (typeof value === 'string' && value) {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) return parsed;
	}
	return undefined;
}

function withTrailingSlash(path: string) {
	if (path === '/') return '/';
	return path.endsWith('/') ? path : `${path}/`;
}

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = getSiteUrl().origin;
	const pages = getPublishedPages();

	return [
		{
			url: `${baseUrl}/`,
			changeFrequency: 'weekly',
			priority: 1,
		},
		...pages.map((page) => {
			const data = page.data as { updated?: string | Date };
			return {
				url: `${baseUrl}${withTrailingSlash(page.url)}`,
				lastModified: parseLastModified(data.updated),
				changeFrequency: 'weekly' as const,
				priority: 0.8,
			};
		}),
	];
}
