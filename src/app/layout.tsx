import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import WikiSearchDialog from '@/components/search';
import '@/app/globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="zh-CN" suppressHydrationWarning>
			<head>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.css"
				/>
			</head>
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
