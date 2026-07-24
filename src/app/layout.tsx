import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import WikiSearchDialog from '@/components/search';
import { getSiteUrl, siteConfig } from '@/lib/site';
import '@/app/globals.css';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
	metadataBase: getSiteUrl(),
	title: {
		default: siteConfig.title,
		template: `%s｜${siteConfig.name}`,
	},
	description: siteConfig.description,
	applicationName: siteConfig.name,
	authors: [{ name: 'USC Wiki 社区', url: '/' }],
	creator: 'USC Wiki 社区',
	publisher: 'USC Wiki 社区',
	alternates: {
		canonical: '/',
	},
	openGraph: {
		type: 'website',
		locale: siteConfig.locale,
		url: '/',
		siteName: siteConfig.name,
		title: siteConfig.title,
		description: siteConfig.description,
		images: [
			{
				url: siteConfig.ogImage,
				width: 1200,
				height: 630,
				alt: 'USC Wiki｜南华大学学生校园知识库',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: siteConfig.title,
		description: siteConfig.description,
		images: [siteConfig.ogImage],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-image-preview': 'large',
			'max-snippet': -1,
			'max-video-preview': -1,
		},
	},
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="zh-CN" suppressHydrationWarning>
			<body className="flex min-h-screen flex-col">
				<RootProvider
					i18n={{
						locale: 'zh-CN',
						translations: {
							'Search(search trigger)': '搜索',
							'Search(search dialog)': '搜索',
							'On this page(table of contents)': '本页目录',
							'No Headings(table of contents)': '本页暂无标题',
							'Edit on GitHub(edit page)': '在 GitHub 中编辑',
							'Last updated on(page footer)': '最后更新于',
							'Choose a language(language switcher)': '选择语言',
							'Toggle Theme(theme switcher)(aria-label)': '切换主题',
						},
					}}
					search={{
						SearchDialog: WikiSearchDialog,
						links: [
							['新生入门', '/新生入门/'],
							['学习指南', '/学习指南/'],
							['校园生活', '/校园生活/'],
							['事务办理', '/事务办理/'],
							['竞赛与资源', '/竞赛与资源/'],
						],
					}}
				>
					{children}
				</RootProvider>
			</body>
		</html>
	);
}
