export type DocBreadcrumbItem = {
	name: string;
	url: string;
};

type BreadcrumbPage = {
	data: {
		title?: string;
	};
	slugs: string[];
	url: string;
};

type ResolvePage = (slugs: string[]) => BreadcrumbPage | null | undefined;

function fallbackUrl(slugs: string[]) {
	return `/${slugs.join('/')}/`;
}

export function getDocBreadcrumbItems(page: BreadcrumbPage, resolvePage: ResolvePage) {
	const items: DocBreadcrumbItem[] = [{ name: '首页', url: '/' }];

	for (let index = 0; index < page.slugs.length; index += 1) {
		const slugs = page.slugs.slice(0, index + 1);
		const resolvedPage = resolvePage(slugs);

		items.push({
			name: resolvedPage?.data.title || slugs.at(-1) || '',
			url: resolvedPage?.url || fallbackUrl(slugs),
		});
	}

	return items;
}

export function getBreadcrumbJsonLd(items: DocBreadcrumbItem[], baseUrl: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: new URL(item.url, `${baseUrl}/`).toString(),
		})),
	};
}
