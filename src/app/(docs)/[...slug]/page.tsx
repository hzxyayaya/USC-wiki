import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
	DocsBody,
	DocsDescription,
	DocsPage,
	DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { DocBreadcrumb } from '@/components/doc-breadcrumb';
import { EditMenu } from '@/components/edit-menu';
import { getMDXComponents } from '@/components/mdx';
import { JsonLd } from '@/components/seo-json-ld';
import { getBreadcrumbJsonLd, getDocBreadcrumbItems } from '@/lib/breadcrumbs';
import { getGithubEditUrl, getWebEditorUrl } from '@/lib/layout.shared';
import { getPageFooterItems } from '@/lib/page-navigation.mjs';
import { siteConfig } from '@/lib/site';
import { getPublishedPages, isDraftPage, source } from '@/lib/source';

type PageProps = {
	params: Promise<{ slug?: string[] }>;
};

type SeoPageData = {
	title?: string;
	description?: string;
	created?: string | Date;
	updated?: string | Date;
};

function hasWikiLinkClass(className: unknown) {
	if (typeof className === 'string') return className.split(/\s+/).includes('wiki-link');
	if (Array.isArray(className)) return className.includes('wiki-link');
	return false;
}

function getPageDescription(page: NonNullable<ReturnType<typeof source.getPage>>) {
	const data = page.data as SeoPageData;
	const description = data.description?.trim();
	if (description) return description;

	const title = data.title || page.slugs.at(-1) || siteConfig.name;
	const section = page.slugs[0];
	const suffixBySection: Record<string, string> = {
		新生入门: '入学准备与校园适应信息',
		学习指南: '课程学习、教务与专业相关信息',
		校园生活: '校园设施与日常生活信息',
		事务办理: '校内事务办理流程与注意事项',
		竞赛与资源: '竞赛经验、软件工具与学习资源',
		关于本站: '站点使用与内容贡献说明',
	};
	const suffix = (section && suffixBySection[section]) || '校园学习与生活信息';

	return `${title}：南华大学学生整理的${suffix}，内容由 USC Wiki 社区持续更新。`;
}

function toIsoDate(value: string | Date | undefined) {
	if (!value) return undefined;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function formatDocDate(value: string | Date | undefined) {
	if (!value) return undefined;
	if (value instanceof Date) return value.toISOString().slice(0, 10);
	return value.trim();
}

export default async function DocPage({ params }: PageProps) {
	const { slug } = await params;
	const page = source.getPage(slug);

	if (!page) notFound();
	if (process.env.NODE_ENV === 'production' && isDraftPage(page)) notFound();

	const MDX = page.data.body;
	const pageDates = page.data as SeoPageData;
	const created = formatDocDate(pageDates.created);
	const updated = formatDocDate(pageDates.updated);
	const title = page.data.title || page.url;
	const RelativeLink = createRelativeLink(source, page);
	const breadcrumbItems = getDocBreadcrumbItems(page, (slugs) => source.getPage(slugs));
	const visibleBreadcrumbItems = breadcrumbItems.slice(1, -1);

	return (
		<DocsPage
			breadcrumb={{ enabled: false }}
			toc={page.data.toc}
			full={page.data.full}
			footer={{ items: getPageFooterItems(source.getPageTree(), page) }}
			tableOfContent={{
				// 暂用顶部横向弹出目录，右侧栏先关掉
				enabled: false,
			}}
			tableOfContentPopover={{
				enabled: true,
			}}
		>
			<DocBreadcrumb items={visibleBreadcrumbItems} />
			<JsonLd data={getBreadcrumbJsonLd(breadcrumbItems, siteConfig.url.origin)} />
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
			<div className="not-prose mt-8 flex flex-row flex-wrap items-center justify-between gap-4 border-t border-fd-border pt-4">
				<EditMenu
					webEditorUrl={getWebEditorUrl(page.path)}
					githubUrl={getGithubEditUrl(page.path)}
				/>
				{created || updated ? (
					<p className="text-xs text-fd-muted-foreground">
						{created ? `创建 ${created}` : null}
						{created && updated ? ' · ' : null}
						{updated ? `更新 ${updated}` : null}
					</p>
				) : null}
			</div>
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

	const data = page.data as SeoPageData;
	const title = data.title || siteConfig.name;
	const description = getPageDescription(page);
	const publishedTime = toIsoDate(data.created);
	const modifiedTime = toIsoDate(data.updated);

	return {
		title,
		description,
		alternates: {
			canonical: page.url,
		},
		openGraph: {
			type: 'article',
			locale: siteConfig.locale,
			url: page.url,
			siteName: siteConfig.name,
			title: `${title}｜${siteConfig.name}`,
			description,
			publishedTime,
			modifiedTime,
			images: [
				{
					url: siteConfig.ogImage,
					width: 1200,
					height: 630,
					alt: `${title}｜${siteConfig.name}`,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: `${title}｜${siteConfig.name}`,
			description,
			images: [siteConfig.ogImage],
		},
	};
}
