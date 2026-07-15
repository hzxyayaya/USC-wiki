import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: 'USC Wiki',
			url: '/',
		},
		links: [
			{
				text: '首页',
				url: '/',
				active: 'url',
			},
		],
	};
}
