import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getMDXComponents } from '@/components/mdx';
import { getPublishedPages, isDraftPage, source } from '@/lib/source';

type PageProps = {
	params: Promise<{ slug?: string[] }>;
};

function hasWikiLinkClass(className: unknown) {
	if (typeof className === 'string') return className.split(/\s+/).includes('wiki-link');
	if (Array.isArray(className)) return className.includes('wiki-link');
	return false;
}

export default async function DocPage({ params }: PageProps) {
	const { slug } = await params;
	const page = source.getPage(slug);

	if (!page) notFound();
	if (process.env.NODE_ENV === 'production' && isDraftPage(page)) notFound();

	const MDX = page.data.body;
	const title = page.data.title || page.url;
	const RelativeLink = createRelativeLink(source, page);

	return (
		<DocsPage
			toc={page.data.toc}
			full={page.data.full}
			tableOfContent={{
				enabled: true,
				style: 'clerk',
			}}
			tableOfContentPopover={{
				// 窄屏仍用顶部弹出目录；宽屏走右侧栏
				enabled: true,
			}}
		>
			<DocsTitle>{title}</DocsTitle>
			{page.data.description ? <DocsDescription>{page.data.description}</DocsDescription> : null}
			<DocsBody>
				<MDX
					components={getMDXComponents({
						a: ({ href = '', className, ...props }) => {
							// wiki / vault 链接已是站内绝对路径，避免再走相对解析或被 Link 改写
							if (
								hasWikiLinkClass(className) ||
								href.startsWith('/vault/') ||
								href.startsWith('http://') ||
								href.startsWith('https://')
							) {
								return <a href={href} className={className} {...props} />;
							}

							return <RelativeLink href={href} className={className} {...props} />;
						},
					})}
				/>
			</DocsBody>
		</DocsPage>
	);
}

export async function generateStaticParams() {
	return getPublishedPages().map((page) => ({
		slug: page.slugs,
	}));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const page = source.getPage(slug);
	if (!page) return {};

	return {
		title: page.data.title || 'USC Wiki',
		description: page.data.description,
	};
}
