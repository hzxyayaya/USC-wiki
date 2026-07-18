import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const githubConfig = {
	owner: 'hzxyayaya',
	repo: 'USC-wiki',
	branch: 'main',
	url: 'https://github.com/hzxyayaya/USC-wiki',
} as const;

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: 'USC Wiki',
			url: '/',
		},
		githubUrl: githubConfig.url,
		links: [
			{
				text: '首页',
				url: '/',
				active: 'url',
			},
		],
	};
}

/** GitHub 上对应 docs 文件的编辑/浏览链接 */
export function getGithubEditUrl(docPath: string) {
	const normalized = docPath.replace(/^\/+/, '');
	const path = normalized.startsWith('docs/') ? normalized : `docs/${normalized}`;
	return `${githubConfig.url}/edit/${githubConfig.branch}/${path}`;
}
